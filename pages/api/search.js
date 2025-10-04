import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { 
    q: query = '', 
    court, 
    judgmentFor,
    mainTitle,
    subTitle,
    dateFrom, 
    dateTo, 
    page = 1, 
    limit = 10 
  } = req.query;

  try {
    // Access control
    const accessFilters = session.user.role === 'ADMIN'
      ? [
          { accessLevel: 'PUBLIC' }, 
          { accessLevel: 'USER_ONLY' }, 
          { accessLevel: 'ADMIN_ONLY' }
        ]
      : [
          { accessLevel: 'PUBLIC' }, 
          { accessLevel: 'USER_ONLY' }
        ];

    const and = [{ OR: accessFilters }];

    // Text search across multiple fields
    if (query && query.trim()) {
      and.push({
        OR: [
          { mainTitle: { contains: query, mode: 'insensitive' } },
          { subTitle: { contains: query, mode: 'insensitive' } },
          { extractedText: { contains: query, mode: 'insensitive' } },
          { redactedText: { contains: query, mode: 'insensitive' } },
          { plaintiff: { contains: query, mode: 'insensitive' } },
          { court: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { judgmentFor: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query.toLowerCase() } }
        ]
      });
    }

    // Filters
    if (court) {
      and.push({ court: { contains: court, mode: 'insensitive' } });
    }

    if (judgmentFor) {
      and.push({ judgmentFor: { contains: judgmentFor, mode: 'insensitive' } });
    }

    // NEW: Main Title filter
    if (mainTitle) {
      and.push({ mainTitle: { contains: mainTitle, mode: 'insensitive' } });
    }

    // NEW: Sub Title filter
    if (subTitle) {
      and.push({ subTitle: { contains: subTitle, mode: 'insensitive' } });
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      and.push({ caseDate: dateFilter });
    }

    const where = { AND: and };

    // Execute search
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          mainTitle: true,
          subTitle: true,
          originalName: true,
          court: true,
          plaintiff: true,
          caseDate: true,
          keywords: true,
          summary: true,
          judgmentFor: true,
          fileSize: true,
          createdAt: true
        },
        orderBy: [
          { caseDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.document.count({ where })
    ]);

    // Log search
    if (query && query.trim()) {
      await prisma.searchLog.create({
        data: {
          userId: session.user.email,
          query,
          action: 'SEARCH',
          results: total
        }
      });
    }

    // Get aggregations for filters (including NEW mainTitles and subTitles)
    const [courts, judgmentFors, mainTitles, subTitles] = await Promise.all([
      prisma.document.groupBy({
        by: ['court'],
        where: { court: { not: null } },
        _count: { court: true },
        orderBy: { _count: { court: 'desc' } },
        take: 10
      }),
      prisma.document.groupBy({
        by: ['judgmentFor'],
        where: { judgmentFor: { not: null } },
        _count: { judgmentFor: true },
        orderBy: { _count: { judgmentFor: 'desc' } },
        take: 10
      }),
      prisma.document.groupBy({
        by: ['mainTitle'],
        where: { mainTitle: { not: null } },
        _count: { mainTitle: true },
        orderBy: { _count: { mainTitle: 'desc' } }
      }),
      prisma.document.groupBy({
        by: ['mainTitle', 'subTitle'],
        where: { 
          mainTitle: { not: null },
          subTitle: { not: null }
        },
        _count: { subTitle: true },
        orderBy: { _count: { subTitle: 'desc' } }
      })
    ]);

    res.json({
      documents,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      aggregations: { 
        courts, 
        judgmentFors,
        mainTitles,
        subTitles
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed: ' + (error.message || error) 
    });
  }
}
