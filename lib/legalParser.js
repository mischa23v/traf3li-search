// Enhanced Arabic legal document parser
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
    
    // Extract المحكمة
    const courtMatch = tagsContent.match(/المحكمة:\s*([^\n]+)/);
    if (courtMatch) {
      metadata.court = courtMatch[1].trim();
    }
    
    // Extract المدعي
    const plaintiffMatch = tagsContent.match(/المدعي:\s*([^\n]+)/);
    if (plaintiffMatch) {
      metadata.plaintiff = plaintiffMatch[1].trim();
    }
    
    // Extract الحكم_لصالح
    const judgmentMatch = tagsContent.match(/الحكم_لصالح:\s*([^\n]+)/);
    if (judgmentMatch) {
      metadata.judgmentFor = judgmentMatch[1].trim();
    }
    
    // Extract العنوان_الرئيسي
    const mainTitleMatch = tagsContent.match(/العنوان_الرئيسي:\s*([^\n]+)/);
    if (mainTitleMatch) {
      metadata.mainTitle = mainTitleMatch[1].trim();
    }
    
    // Extract العنوان_الفرعي
    const subTitleMatch = tagsContent.match(/العنوان_الفرعي:\s*([^\n]+)/);
    if (subTitleMatch) {
      metadata.subTitle = subTitleMatch[1].trim();
    }
    
    // Extract ملخص (full summary)
    const summaryMatch = tagsContent.match(/ملخص:\s*([^\n]+)/);
    if (summaryMatch) {
      metadata.summary = summaryMatch[1].trim();
    }
    
    // Extract تاريخ_الدعوى
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
        if (keyword) metadata.keywords.push(keyword);
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
