import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const prisma = new PrismaClient();

  try {
    const { specialization, rating, acceptingCases } = req.query;

    // Build the query filters
    const where = {};

    if (specialization) {
      where.specializations = {
        has: specialization
      };
    }

    if (rating) {
      where.rating = {
        gte: parseFloat(rating)
      };
    }

    if (acceptingCases === 'true') {
      where.acceptingCases = true;
    }

    // Fetch lawyers with user details
    const lawyers = await prisma.lawyer.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            cases: true,
            reviews: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { yearsExperience: 'desc' }
      ]
    });

    return res.status(200).json({
      success: true,
      lawyers: lawyers.map(lawyer => ({
        id: lawyer.id,
        userId: lawyer.userId,
        name: lawyer.user.name,
        email: lawyer.user.email,
        image: lawyer.user.image,
        bio: lawyer.bio,
        specializations: lawyer.specializations,
        yearsExperience: lawyer.yearsExperience,
        rating: lawyer.rating,
        totalCases: lawyer._count.cases,
        totalReviews: lawyer._count.reviews,
        successRate: lawyer.successRate,
        officeName: lawyer.officeName,
        officeAddress: lawyer.officeAddress,
        licenseNumber: lawyer.licenseNumber,
        feesRange: lawyer.feesRange,
        languages: lawyer.languages,
        acceptingCases: lawyer.acceptingCases
      }))
    });

  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch lawyers',
      message: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}
