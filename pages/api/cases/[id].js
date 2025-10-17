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

  // GET - Get single case
  if (req.method === 'GET') {
    try {
      const caseData = await prisma.case.findUnique({
        where: { id },
        include: {
          client: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          lawyer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          },
          hearings: {
            orderBy: { hearingDate: 'desc' }
          },
          documents: {
            orderBy: { createdAt: 'desc' }
          },
          expenses: {
            orderBy: { expenseDate: 'desc' }
          },
          invoices: {
            orderBy: { createdAt: 'desc' }
          },
          notes: {
            orderBy: { createdAt: 'desc' }
          },
          aiDocuments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!caseData) {
        return res.status(404).json({ error: 'القضية غير موجودة' });
      }

      // Check access permissions
      const hasAccess = 
        session.user.role === 'ADMIN' ||
        (session.user.isLawyer && caseData.lawyerId === session.user.lawyerId) ||
        (session.user.isClient && caseData.clientId === session.user.clientId);

      if (!hasAccess) {
        return res.status(403).json({ error: 'غير مصرح لك بالوصول لهذه القضية' });
      }

      res.status(200).json({ case: caseData });

    } catch (error) {
      logError('CASE_GET', error, session.user.email);
      res.status(500).json({ error: 'فشل في جلب القضية' });
    }
  }

  // PUT - Update case
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;

      // Check if user can update this case
      const existingCase = await prisma.case.findUnique({
        where: { id },
        select: { lawyerId: true, clientId: true }
      });

      if (!existingCase) {
        return res.status(404).json({ error: 'القضية غير موجودة' });
      }

      const canUpdate = 
        session.user.role === 'ADMIN' ||
        (session.user.isLawyer && existingCase.lawyerId === session.user.lawyerId);

      if (!canUpdate) {
        return res.status(403).json({ error: 'غير مصرح لك بتعديل هذه القضية' });
      }

      // Update case
      const updatedCase = await prisma.case.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      logAudit('CASE_UPDATE', session.user.email, {
        caseId: id,
        updates: Object.keys(updates)
      });

      res.status(200).json({
        success: true,
        case: updatedCase
      });

    } catch (error) {
      logError('CASE_UPDATE', error, session.user.email);
      res.status(500).json({ error: 'فشل في تحديث القضية' });
    }
  }

  // DELETE - Delete case
  else if (req.method === 'DELETE') {
    try {
      // Only admins can delete cases
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'يتطلب صلاحيات المسؤول' });
      }

      await prisma.case.delete({
        where: { id }
      });

      logAudit('CASE_DELETE', session.user.email, {
        caseId: id
      });

      res.status(200).json({
        success: true,
        message: 'تم حذف القضية بنجاح'
      });

    } catch (error) {
      logError('CASE_DELETE', error, session.user.email);
      res.status(500).json({ error: 'فشل في حذف القضية' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
