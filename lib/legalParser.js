// Enhanced Arabic legal document parser
export function extractLegalMetadata(text) {
  const metadata = {
    title: null,
    court: null,
    judge: null,
    caseNumber: null,
    parties: null,
    dateDecided: null,
    keywords: [],
    summary: null,
    winningParty: null,
    victoryType: null,
    field: null,
    outcome: null
  };

  if (!text) return metadata;

  // Extract from structured TAGS section
  const tagsMatch = text.match(/---TAGS_START---([\s\S]*?)---TAGS_END---/);
  
  if (tagsMatch) {
    const tagsContent = tagsMatch[1];
    
    // Extract summary
    const summaryMatch = tagsContent.match(/ملخص:\s*([^\n]+)/);
    if (summaryMatch) {
      metadata.summary = summaryMatch[1].trim();
    }
    
    // Extract winning party
    const winnerMatch = tagsContent.match(/الطرف_الفائز:\s*([^\n]+)/);
    if (winnerMatch) {
      metadata.winningParty = winnerMatch[1].trim();
      metadata.parties = winnerMatch[1].trim();
    }
    
    // Extract victory type
    const victoryMatch = tagsContent.match(/نوع_الفوز:\s*([^\n]+)/);
    if (victoryMatch) {
      metadata.victoryType = victoryMatch[1].trim();
    }
    
    // Extract field/sector
    const fieldMatch = tagsContent.match(/المجال:\s*([^\n]+)/);
    if (fieldMatch) {
      metadata.field = fieldMatch[1].trim();
    }
    
    // Extract outcome
    const outcomeMatch = tagsContent.match(/النتيجة:\s*([^\n]+)/);
    if (outcomeMatch) {
      metadata.outcome = outcomeMatch[1].trim();
    }
    
    // Extract court
    const courtMatch = tagsContent.match(/المجال:\s*([^\n]+)/);
    if (courtMatch) {
      metadata.court = courtMatch[1].split('-')[0].trim();
    }
    
    // Extract all keywords from various tag types
    const keywordPatterns = [
      /موضوع:\s*([^\n]+)/g,
      /مادة:\s*([^\n]+)/g,
      /قضية_رئيسية:\s*([^\n]+)/g,
      /سبب_الفوز:\s*([^\n]+)/g,
      /سبب_الخسارة:\s*([^\n]+)/g
    ];
    
    for (const pattern of keywordPatterns) {
      const matches = tagsContent.matchAll(pattern);
      for (const match of matches) {
        const keyword = match[1].split('|')[0].trim();
        if (keyword) metadata.keywords.push(keyword);
      }
    }
  }

  // Extract case number from main text
  const caseNumMatch = text.match(/رقم الحكم\s+(\d+)/);
  if (caseNumMatch) {
    metadata.caseNumber = caseNumMatch[1];
    metadata.title = `حكم رقم ${caseNumMatch[1]}`;
  }

  // Extract court from main text if not found in tags
  if (!metadata.court) {
    const courtPatterns = [
      /المحكمة\s+العمالية/,
      /محكمة\s+الاستئناف/,
      /المحكمة\s+العليا/
    ];
    
    for (const pattern of courtPatterns) {
      const courtMatch = text.match(pattern);
      if (courtMatch) {
        metadata.court = courtMatch[0];
        break;
      }
    }
  }

  // Extract Hijri dates
  const hijriMatch = text.match(/(\d{4})\/(\d{2})\/(\d{2})هـ/);
  if (hijriMatch) {
    // For now, store as current date - you can add Hijri conversion library
    metadata.dateDecided = new Date().toISOString();
  }

  // Remove duplicates from keywords
  metadata.keywords = [...new Set(metadata.keywords)];

  return metadata;
}