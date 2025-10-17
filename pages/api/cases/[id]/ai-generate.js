import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';
import { logError, logAudit } from '../../../../lib/logger';
import { generateLawsuit, generateDefenseMemo } from '../../../../lib/aiService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;
  const { documentType } = req.body;

  if (!documentType || !['LAWSUIT_PETITION', 'DEFENSE_MEMO'].includes(documentType)) {
    return res.status(400).json({ error: 'نوع المستند غير صحيح' });
  }

  try {
    // Get case details
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        lawyer: true
      }
    });

    if (!caseData) {
      return res.status(404).json({ error: 'القضية غير موجودة' });
    }

    // Check access permissions
    const hasAccess = 
      session.user.role === 'ADMIN' ||
      (session.user.isLawyer && caseData.lawyerId === session.user.lawyerId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'غير مصرح لك بإنشاء مستندات لهذه القضية' });
    }

    // Prepare data for AI
    const aiData = {
      caseType: getCaseTypeArabic(caseData.caseType),
      subCategory: caseData.subCategory,
      plaintiffName: caseData.plaintiffName,
      defendantName: caseData.defendantName,
      claimAmount: caseData.claimAmount,
      description: caseData.description,
      court: caseData.court
    };

    // Generate document using AI
    let content;
    if (documentType === 'LAWSUIT_PETITION') {
      content = await generateLawsuit(aiData);
    } else if (documentType === 'DEFENSE_MEMO') {
      content = await generateDefenseMemo(aiData);
    }

    // Save AI document
    const aiDocument = await prisma.aIDocument.create({
      data: {
        caseId: id,
        documentType,
        content,
        version: 1,
        generatedBy: 'AI',
        approved: false
      }
    });

    logAudit('AI_DOCUMENT_GENERATE', session.user.email, {
      caseId: id,
      documentType,
      aiDocumentId: aiDocument.id
    });

    res.status(200).json({
      success: true,
      document: aiDocument
    });

  } catch (error) {
    logError('AI_GENERATE', error, session.user.email);
    
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ 
        error: 'خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى التواصل مع الدعم الفني.' 
      });
    }
    
    res.status(500).json({ error: 'فشل في إنشاء المستند' });
  }
}

function getCaseTypeArabic(caseType) {
  const mapping = {
    'SALARY': 'أجر',
    'BONUS': 'مكافأة',
    'COMPENSATION': 'تعويض',
    'PROOF': 'إثبات',
    'OTHER': 'أخرى'
  };
  return mapping[caseType] || caseType;
}
