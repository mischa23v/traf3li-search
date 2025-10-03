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
    winningParty,
    field,
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
          { title: { contains: query, mode: 'insensitive' } },
          { extractedText: { contains: query, mode: 'insensitive' } },
          { redactedText: { contains: query, mode: 'insensitive' } },
          { parties: { contains: query, mode: 'insensitive' } },
          { court: { contains: query, mode: 'insensitive' } },
          { judge: { contains: query, mode: 'insensitive' } },
          { caseNumber: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { winningParty: { contains: query, mode: 'insensitive' } },
          { victoryType: { contains: query, mode: 'insensitive' } },
          { field: { contains: query, mode: 'insensitive' } },
          { outcome: { contains: query, mode: 'insensitive' } },
          { keywords: { has: query.toLowerCase() } }
        ]
      });
    }

    // Filters
    if (court) {
      and.push({ court: { contains: court, mode: 'insensitive' } });
    }

    if (winningParty) {
      and.push({ winningParty: { contains: winningParty, mode: 'insensitive' } });
    }

    if (field) {
      and.push({ field: { contains: field, mode: 'insensitive' } });
    }

    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      and.push({ dateDecided: dateFilter });
    }

    const where = { AND: and };

    // Execute search
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          title: true,
          originalName: true,
          court: true,
          judge: true,
          parties: true,
          dateDecided: true,
          caseNumber: true,
          keywords: true,
          summary: true,
          redactedText: true,
          winningParty: true,
          victoryType: true,
          field: true,
          outcome: true,
          fileSize: true,
          createdAt: true
        },
        orderBy: [
          { dateDecided: 'desc' },
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

    // Get aggregations for filters
    const [courts, winningParties, fields] = await Promise.all([
      prisma.document.groupBy({
        by: ['court'],
        where: { court: { not: null } },
        _count: { court: true },
        orderBy: { _count: { court: 'desc' } },
        take: 10
      }),
      prisma.document.groupBy({
        by: ['winningParty'],
        where: { winningParty: { not: null } },
        _count: { winningParty: true },
        orderBy: { _count: { winningParty: 'desc' } },
        take: 10
      }),
      prisma.document.groupBy({
        by: ['field'],
        where: { field: { not: null } },
        _count: { field: true },
        orderBy: { _count: { field: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      documents,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      aggregations: { courts, winningParties, fields }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed: ' + (error.message || error) 
    });
  }
}