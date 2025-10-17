import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { logError } from '../../../lib/logger';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List lawyers
  if (req.method === 'GET') {
    try {
      const { 
        specialization, 
        minRating,
        acceptingCases,
        page = 1, 
        limit = 12 
      } = req.query;

      const where = {
        user: {
          active: true
        }
      };

      if (specialization) {
        where.specializations = {
          has: specialization
        };
      }

      if (minRating) {
        where.rating = {
          gte: parseFloat(minRating)
        };
      }

      if (acceptingCases === 'true') {
        where.acceptingCases = true;
      }

      const [lawyers, total] = await Promise.all([
        prisma.lawyer.findMany({
          where,
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            },
            reviews: {
              select: {
                rating: true,
                comment: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            }
          },
          orderBy: [
            { rating: 'desc' },
            { totalCases: 'desc' }
          ],
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit)
        }),
        prisma.lawyer.count({ where })
      ]);

      res.status(200).json({
        lawyers,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      logError('LAWYERS_LIST', error, session.user.email);
      res.status(500).json({ error: 'فشل في جلب قائمة المحامين' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
