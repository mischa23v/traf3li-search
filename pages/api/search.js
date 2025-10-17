import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';
import { logError } from '../../lib/logger';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!session.user.authorized) {
    return res.status(403).json({ error: 'Account not authorized' });
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
    // Access control based on role
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
      const searchTerms = query.trim();
      and.push({
        OR: [
          { mainTitle: { contains: searchTerms, mode: 'insensitive' } },
          { subTitle: { contains: searchTerms, mode: 'insensitive' } },
          { extractedText: { contains: searchTerms, mode: 'insensitive' } },
          { redactedText: { contains: searchTerms, mode: 'insensitive' } },
          { plaintiff: { contains: searchTerms, mode: 'insensitive' } },
          { court: { contains: searchTerms, mode: 'insensitive' } },
          { summary: { contains: searchTerms, mode: 'insensitive' } },
          { judgmentFor: { contains: searchTerms, mode: 'insensitive' } },
          { keywords: { has: searchTerms.toLowerCase() } }
        ]
      });
    }

    // Filters
    if (court) {
      and.push({ court: { equals: court } });
    }

    if (judgmentFor) {
      and.push({ judgmentFor: { equals: judgmentFor } });
    }

    // Main Title filter
    if (mainTitle) {
      and.push({ mainTitle: { equals: mainTitle } });
    }

    // Sub Title filter
    if (subTitle) {
      and.push({ subTitle: { equals: subTitle } });
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.lte = endDate;
      }
      and.push({ caseDate: dateFilter });
    }

    const where = { AND: and };

    // Execute search with parallel queries for performance
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

    // Log search only if there's a query
    if (query && query.trim()) {
      await prisma.searchLog.create({
        data: {
          userId: session.user.email,
          query: query.trim(),
          action: 'SEARCH',
          results: total
        }
      }).catch(err => logError('SEARCH_LOG', err, session.user.email));
    }

    // Get aggregations for filters
    const [courts, judgmentFors, mainTitles] = await Promise.all([
      prisma.document.groupBy({
        by: ['court'],
        where: { 
          ...where,
          court: { not: null } 
        },
        _count: { court: true },
        orderBy: { _count: { court: 'desc' } },
        take: 20
      }),
      prisma.document.groupBy({
        by: ['judgmentFor'],
        where: { 
          ...where,
          judgmentFor: { not: null } 
        },
        _count: { judgmentFor: true },
        orderBy: { _count: { judgmentFor: 'desc' } },
        take: 20
      }),
      prisma.document.groupBy({
        by: ['mainTitle'],
        where: { 
          ...where,
          mainTitle: { not: null } 
        },
        _count: { mainTitle: true },
        orderBy: { _count: { mainTitle: 'desc' } },
        take: 10
      })
    ]);

    res.status(200).json({
      documents,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      aggregations: { 
        courts, 
        judgmentFors,
        mainTitles
      }
    });

  } catch (error) {
    logError('SEARCH_API', error, session.user.email);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى'
    });
  }
}
