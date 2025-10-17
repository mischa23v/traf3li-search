import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { logError } from '../../../lib/logger';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  // GET - Get lawyer profile
  if (req.method === 'GET') {
    try {
      const lawyer = await prisma.lawyer.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          },
          reviews: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 20
          },
          cases: {
            where: {
              status: {
                in: ['JUDGMENT', 'SETTLED', 'CLOSED']
              }
            },
            select: {
              id: true,
              caseNumber: true,
              status: true,
              caseType: true
            }
          }
        }
      });

      if (!lawyer) {
        return res.status(404).json({ error: 'المحامي غير موجود' });
      }

      // Calculate average rating
      const avgRating = lawyer.reviews.length > 0
        ? lawyer.reviews.reduce((sum, r) => sum + r.rating, 0) / lawyer.reviews.length
        : 0;

      res.status(200).json({
        lawyer: {
          ...lawyer,
          averageRating: avgRating.toFixed(1),
          reviewCount: lawyer.reviews.length,
          completedCases: lawyer.cases.length
        }
      });

    } catch (error) {
      logError('LAWYER_GET', error, session.user.email);
      res.status(500).json({ error: 'فشل في جلب معلومات المحامي' });
    }
  }

  // PUT - Update lawyer profile (lawyer or admin only)
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;

      // Check if user can update this profile
      const existingLawyer = await prisma.lawyer.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!existingLawyer) {
        return res.status(404).json({ error: 'المحامي غير موجود' });
      }

      const canUpdate = 
        session.user.role === 'ADMIN' ||
        existingLawyer.userId === session.user.id;

      if (!canUpdate) {
        return res.status(403).json({ error: 'غير مصرح لك بتعديل هذا الملف الشخصي' });
      }

      // Update lawyer profile
      const updatedLawyer = await prisma.lawyer.update({
        where: { id },
        data: {
          bio: updates.bio,
          specializations: updates.specializations,
          yearsExperience: updates.yearsExperience ? parseInt(updates.yearsExperience) : undefined,
          officeName: updates.officeName,
          officeAddress: updates.officeAddress,
          feesRange: updates.feesRange,
          languages: updates.languages,
          acceptingCases: updates.acceptingCases,
          updatedAt: new Date()
        }
      });

      res.status(200).json({
        success: true,
        lawyer: updatedLawyer
      });

    } catch (error) {
      logError('LAWYER_UPDATE', error, session.user.email);
      res.status(500).json({ error: 'فشل في تحديث الملف الشخصي' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
