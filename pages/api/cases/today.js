import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { logError } from '../../../lib/logger';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!session.user.isLawyer) {
    return res.status(403).json({ error: 'يتطلب حساب محامي' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's cases
    const todayCases = await prisma.case.findMany({
      where: {
        lawyerId: session.user.lawyerId,
        nextHearing: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        client: {
          select: {
            fullName: true,
            phone: true
          }
        },
        hearings: {
          where: {
            hearingDate: {
              gte: today,
              lt: tomorrow
            }
          },
          orderBy: {
            hearingDate: 'asc'
          }
        }
      },
      orderBy: {
        nextHearing: 'asc'
      }
    });

    // Get upcoming cases (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingCases = await prisma.case.findMany({
      where: {
        lawyerId: session.user.lawyerId,
        nextHearing: {
          gte: tomorrow,
          lt: nextWeek
        }
      },
      include: {
        client: {
          select: {
            fullName: true,
            phone: true
          }
        }
      },
      orderBy: {
        nextHearing: 'asc'
      }
    });

    // Get case statistics
    const stats = await prisma.case.groupBy({
      by: ['status'],
      where: {
        lawyerId: session.user.lawyerId
      },
      _count: {
        id: true
      }
    });

    res.status(200).json({
      todayCases,
      upcomingCases,
      stats: stats.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      }, {})
    });

  } catch (error) {
    logError('TODAY_CASES', error, session.user.email);
    res.status(500).json({ error: 'فشل في جلب قضايا اليوم' });
  }
}
