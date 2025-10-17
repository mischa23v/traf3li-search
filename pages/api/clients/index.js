import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { logError } from '../../../lib/logger';
import { validateNationalId, formatSaudiPhone } from '../../../lib/legalParser';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List clients (lawyers and admins only)
  if (req.method === 'GET') {
    try {
      if (!session.user.isLawyer && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'يتطلب حساب محامي' });
      }

      const { 
        search,
        page = 1, 
        limit = 20 
      } = req.query;

      const where = {};

      // Lawyers can only see their clients
      if (session.user.isLawyer && session.user.role !== 'ADMIN') {
        where.cases = {
          some: {
            lawyerId: session.user.lawyerId
          }
        };
      }

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { nationalId: { contains: search } }
        ];
      }

      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            },
            cases: {
              select: {
                id: true,
                caseNumber: true,
                status: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit)
        }),
        prisma.client.count({ where })
      ]);

      res.status(200).json({
        clients,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      logError('CLIENTS_LIST', error, session.user.email);
      res.status(500).json({ error: 'فشل في جلب قائمة العملاء' });
    }
  }

  // POST - Create client (public for registration)
  else if (req.method === 'POST') {
    try {
      const { 
        fullName, 
        nationalId, 
        phone, 
        email, 
        address, 
        occupation 
      } = req.body;

      // Validate required fields
      if (!fullName || !nationalId || !phone || !email) {
        return res.status(400).json({ error: 'بيانات غير مكتملة' });
      }

      // Validate national ID
      if (!validateNationalId(nationalId)) {
        return res.status(400).json({ error: 'رقم الهوية الوطنية غير صحيح' });
      }

      // Format phone number
      const formattedPhone = formatSaudiPhone(phone);

      // Check if client already exists
      const existingClient = await prisma.client.findUnique({
        where: { nationalId }
      });

      if (existingClient) {
        return res.status(400).json({ error: 'هذا الرقم الوطني مسجل مسبقاً' });
      }

      // Create user first
      const user = await prisma.user.create({
        data: {
          email,
          name: fullName,
          role: 'CLIENT',
          active: true
        }
      });

      // Create client profile
      const client = await prisma.client.create({
        data: {
          userId: user.id,
          fullName,
          nationalId,
          phone: formattedPhone,
          email,
          address,
          occupation
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        client
      });

    } catch (error) {
      logError('CLIENT_CREATE', error, session.user.email);
      
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'البريد الإلكتروني أو رقم الهوية مسجل مسبقاً' });
      }
      
      res.status(500).json({ error: 'فشل في إنشاء حساب العميل' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
