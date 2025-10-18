import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

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
    const { specialization, minRating, acceptingCases, page = 1, limit = 12 } = req.query;
    
    // Build the query filters
    const where = {};
    
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
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Get total count
    const total = await prisma.lawyer.count({ where });
    
    // Fetch lawyers with user details
    const lawyers = await prisma.lawyer.findMany({
      where,
      skip,
      take,
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
      total,
      page: parseInt(page),
      lawyers: lawyers.map(lawyer => ({
        id: lawyer.id,
        userId: lawyer.userId,
        name: lawyer.user?.name || 'محامي',
        email: lawyer.user?.email || '',
        image: lawyer.user?.image || null,
        bio: lawyer.bio,
        specializations: lawyer.specializations || [],
        yearsExperience: lawyer.yearsExperience || 0,
        rating: lawyer.rating || 0,
        totalCases: lawyer._count?.cases || 0,
        totalReviews: lawyer._count?.reviews || 0,
        successRate: lawyer.successRate,
        officeName: lawyer.officeName,
        officeAddress: lawyer.officeAddress,
        licenseNumber: lawyer.licenseNumber,
        feesRange: lawyer.feesRange,
        languages: lawyer.languages || [],
        acceptingCases: lawyer.acceptingCases || false
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
