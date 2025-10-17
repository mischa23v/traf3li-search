import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { logError, logAudit } from '../../../lib/logger';
import { generateCaseNumber, mapCaseType, mapCourtType } from '../../../lib/legalParser';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List cases
  if (req.method === 'GET') {
    try {
      const { 
        status, 
        courtType, 
        lawyerId, 
        clientId,
        caseType,
        dateFrom,
        dateTo,
        page = 1, 
        limit = 10 
      } = req.query;

      const where = {};

      // Filter by lawyer (if lawyer is viewing their cases)
      if (session.user.isLawyer && !lawyerId) {
        where.lawyerId = session.user.lawyerId;
      } else if (lawyerId) {
        where.lawyerId = lawyerId;
      }

      // Filter by client (if client is viewing their cases)
      if (session.user.isClient && !clientId) {
        where.clientId = session.user.clientId;
      } else if (clientId) {
        where.clientId = clientId;
      }

      if (status) {
        where.status = status;
      }

      if (courtType) {
        where.courtType = courtType;
      }

      if (caseType) {
        where.caseType = caseType;
      }

      if (dateFrom || dateTo) {
        where.nextHearing = {};
        if (dateFrom) {
          where.nextHearing.gte = new Date(dateFrom);
        }
        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          where.nextHearing.lte = endDate;
        }
      }

      const [cases, total] = await Promise.all([
        prisma.case.findMany({
          where,
          include: {
            client: {
              select: {
                fullName: true,
                email: true,
                phone: true
              }
            },
            lawyer: {
              select: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            hearings: {
              orderBy: { hearingDate: 'desc' },
              take: 1
            }
          },
          orderBy: [
            { nextHearing: 'asc' },
            { createdAt: 'desc' }
          ],
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit)
        }),
        prisma.case.count({ where })
      ]);

      res.status(200).json({
        cases,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      logError('CASES_LIST', error, session.user.email);
      res.status(500).json({ error: 'فشل في جلب القضايا' });
    }
  }

  // POST - Create new case
  else if (req.method === 'POST') {
    try {
      const caseData = req.body;

      // Validate required fields
      if (!caseData.plaintiffName || !caseData.defendantName || !caseData.caseType) {
        return res.status(400).json({ error: 'بيانات غير مكتملة' });
      }

      // Generate case number
      const caseNumber = generateCaseNumber();

      // Map case type and court type
      const caseTypeEnum = mapCaseType(caseData.caseType);
      const courtTypeEnum = mapCourtType(caseData.court);

      // Determine client ID
      let clientId = caseData.clientId;
      if (!clientId && session.user.isClient) {
        clientId = session.user.clientId;
      }

      if (!clientId) {
        return res.status(400).json({ error: 'معرف العميل مطلوب' });
      }

      // Create case
      const newCase = await prisma.case.create({
        data: {
          caseNumber,
          clientId,
          lawyerId: caseData.lawyerId || null,
          
          // Plaintiff info
          plaintiffName: caseData.plaintiffName,
          plaintiffAddress: caseData.plaintiffAddress || null,
          plaintiffPhone: caseData.plaintiffPhone || null,
          plaintiffEmail: caseData.plaintiffEmail || null,
          plaintiffId: caseData.plaintiffId || null,
          
          // Defendant info
          defendantName: caseData.defendantName,
          defendantAddress: caseData.defendantAddress || null,
          defendantType: caseData.defendantType || 'Company',
          defendantCR: caseData.defendantCR || null,
          
          // Case details
          caseType: caseTypeEnum,
          subCategory: caseData.subCategory,
          court: caseData.court || 'المحكمة العمالية',
          courtType: courtTypeEnum,
          status: 'PENDING',
          stage: 'INTAKE',
          
          // Dates
          issueDate: new Date(),
          
          // Financial
          claimAmount: caseData.claimAmount ? parseFloat(caseData.claimAmount) : null,
          
          // Content
          description: caseData.description,
          
          // Service type
          serviceType: caseData.serviceType || 'CONSULTATION'
        },
        include: {
          client: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      });

      logAudit('CASE_CREATE', session.user.email, {
        caseId: newCase.id,
        caseNumber: newCase.caseNumber
      });

      res.status(201).json({
        success: true,
        case: newCase
      });

    } catch (error) {
      logError('CASE_CREATE', error, session.user.email);
      res.status(500).json({ error: 'فشل في إنشاء القضية' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
