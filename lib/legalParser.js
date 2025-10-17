// Enhanced Arabic legal document parser - SINGLE SOURCE OF TRUTH
export function extractLegalMetadata(text) {
  const metadata = {
    court: null,
    plaintiff: null,
    judgmentFor: null,
    mainTitle: null,
    subTitle: null,
    summary: null,
    caseDate: null,
    keywords: []
  };

  if (!text) return metadata;

  // Extract from structured TAGS section
  const tagsMatch = text.match(/---TAGS_START---([\s\S]*?)---TAGS_END---/);
  
  if (tagsMatch) {
    const tagsContent = tagsMatch[1];
    
    // Extract المحكمة (Court)
    const courtMatch = tagsContent.match(/المحكمة:\s*([^\n]+)/);
    if (courtMatch) {
      metadata.court = courtMatch[1].trim();
    }
    
    // Extract المدعي (Plaintiff)
    const plaintiffMatch = tagsContent.match(/المدعي:\s*([^\n]+)/);
    if (plaintiffMatch) {
      metadata.plaintiff = plaintiffMatch[1].trim();
    }
    
    // Extract الحكم_لصالح (Judgment For)
    const judgmentMatch = tagsContent.match(/الحكم_لصالح:\s*([^\n]+)/);
    if (judgmentMatch) {
      metadata.judgmentFor = judgmentMatch[1].trim();
    }
    
    // Extract العنوان_الرئيسي (Main Title)
    const mainTitleMatch = tagsContent.match(/العنوان_الرئيسي:\s*([^\n]+)/);
    if (mainTitleMatch) {
      metadata.mainTitle = mainTitleMatch[1].trim();
    }
    
    // Extract العنوان_الفرعي (Sub Title)
    const subTitleMatch = tagsContent.match(/العنوان_الفرعي:\s*([^\n]+)/);
    if (subTitleMatch) {
      metadata.subTitle = subTitleMatch[1].trim();
    }
    
    // Extract ملخص (Summary)
    const summaryMatch = tagsContent.match(/ملخص:\s*([^\n]+)/);
    if (summaryMatch) {
      metadata.summary = summaryMatch[1].trim();
    }
    
    // Extract تاريخ_الدعوى (Case Date)
    const caseDateMatch = tagsContent.match(/تاريخ_الدعوى:\s*([^\n]+)/);
    if (caseDateMatch) {
      metadata.caseDate = parseDate(caseDateMatch[1].trim());
    }
    
    // Extract all keywords from various tag types
    const keywordPatterns = [
      /موضوع:\s*([^\n]+)/g,
      /مادة:\s*([^\n]+)/g,
      /قضية_رئيسية:\s*([^\n]+)/g,
      /المجال:\s*([^\n]+)/g
    ];
    
    for (const pattern of keywordPatterns) {
      const matches = tagsContent.matchAll(pattern);
      for (const match of matches) {
        const keyword = match[1].split('|')[0].trim();
        if (keyword && keyword.length > 0) {
          metadata.keywords.push(keyword);
        }
      }
    }
  }

  // Remove duplicates from keywords
  metadata.keywords = [...new Set(metadata.keywords)];
  
  return metadata;
}

function parseDate(dateStr) {
  try {
    // Handle formats like "22 /1/ 2024" or "22/1/2024"
    const cleaned = dateStr.replace(/\s+/g, '').trim();
    
    // Try DD/MM/YYYY format
    const match = cleaned.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return new Date(`${year}-${month}-${day}`).toISOString();
    }
    
    return null;
  } catch {
    return null;
  }
}

// NEW: Function to map case types from Arabic to enum
export function mapCaseType(arabicType) {
  const mapping = {
    'أجر': 'SALARY',
    'أجور': 'SALARY',
    'مكافأة': 'BONUS',
    'تعويض': 'COMPENSATION',
    'إثبات': 'PROOF'
  };
  
  return mapping[arabicType] || 'OTHER';
}

// NEW: Function to map court types from Arabic to enum
export function mapCourtType(arabicCourt) {
  if (!arabicCourt) return 'LABOR';
  
  const court = arabicCourt.toLowerCase();
  
  if (court.includes('عمالية') || court.includes('عمل')) return 'LABOR';
  if (court.includes('تجارية') || court.includes('تجاري')) return 'COMMERCIAL';
  if (court.includes('استئناف')) return 'APPEAL';
  if (court.includes('عليا') || court.includes('عُليا')) return 'SUPREME';
  if (court.includes('تسوية') || court.includes('ودية')) return 'FRIENDLY_SETTLEMENT';
  
  return 'LABOR'; // Default
}

// NEW: Generate case number
export function generateCaseNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${year}-${random}`;
}

// NEW: Validate Saudi National ID
export function validateNationalId(nationalId) {
  if (!nationalId) return false;
  
  // Remove spaces and dashes
  const cleaned = nationalId.replace(/[\s-]/g, '');
  
  // Must be 10 digits
  if (!/^\d{10}$/.test(cleaned)) return false;
  
  // Must start with 1 or 2
  if (!['1', '2'].includes(cleaned[0])) return false;
  
  return true;
}

// NEW: Format Saudi phone number
export function formatSaudiPhone(phone) {
  if (!phone) return null;
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing
  if (cleaned.length === 9 && cleaned.startsWith('5')) {
    return `966${cleaned}`;
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return `966${cleaned.substring(1)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('966')) {
    return cleaned;
  }
  
  return cleaned;
}

// NEW: Extract case topics/keywords for filtering
export function extractCaseTopics(caseType, subCategory) {
  const topics = {
    SALARY: {
      main: 'أجر',
      subs: ['أجر فعلي', 'أجر إجازات', 'أجور متأخرة', 'أجر إجازات سنوية']
    },
    BONUS: {
      main: 'مكافأة',
      subs: ['مكافأة نهاية الخدمة']
    },
    COMPENSATION: {
      main: 'التعويض',
      subs: ['تعويض عن إنهاء عقد', 'التعويض عن الإنهاء الغير مشروع']
    },
    PROOF: {
      main: 'إثبات',
      subs: ['إثبات سبب الإنهاء الصحيح']
    }
  };
  
  return topics[caseType] || { main: 'أخرى', subs: [] };
}
