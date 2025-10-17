import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { logError, logAudit } from '../../../lib/logger';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  // GET - Get client profile
  if (req.method === 'GET') {
    try {
      const client = await prisma.client.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              active: true
            }
          },
          cases: {
            include: {
              lawyer: {
                select: {
                  id: true,
                  user: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          invoices: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          }
        }
      });

      if (!client) {
        return res.status(404).json({ error: 'العميل غير موجود' });
      }

      // Check access permissions
      const hasAccess = 
        session.user.role === 'ADMIN' ||
        (session.user.isLawyer && client.cases.some(c => c.lawyerId === session.user.lawyerId)) ||
        (session.user.isClient && client.userId === session.user.id);

      if (!hasAccess) {
        return res.status(403).json({ error: 'غير مصرح لك بالوصول لبيانات هذا العميل' });
      }

      res.status(200).json({ client });

    } catch (error) {
      logError('CLIENT_GET', error, session.user.email);
      res.status(500).json({ error: 'فشل في جلب بيانات العميل' });
    }
  }

  // PUT - Update client profile
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;

      // Check if user can update this profile
      const existingClient = await prisma.client.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!existingClient) {
        return res.status(404).json({ error: 'العميل غير موجود' });
      }

      const canUpdate = 
        session.user.role === 'ADMIN' ||
        existingClient.userId === session.user.id;

      if (!canUpdate) {
        return res.status(403).json({ error: 'غير مصرح لك بتعديل بيانات هذا العميل' });
      }

      // Update client profile
      const updatedClient = await prisma.client.update({
        where: { id },
        data: {
          fullName: updates.fullName,
          phone: updates.phone,
          email: updates.email,
          address: updates.address,
          occupation: updates.occupation,
          updatedAt: new Date()
        }
      });

      logAudit('CLIENT_UPDATE', session.user.email, {
        clientId: id
      });

      res.status(200).json({
        success: true,
        client: updatedClient
      });

    } catch (error) {
      logError('CLIENT_UPDATE', error, session.user.email);
      res.status(500).json({ error: 'فشل في تحديث بيانات العميل' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
