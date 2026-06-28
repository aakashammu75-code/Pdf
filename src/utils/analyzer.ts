import { AnalysisResult, CharacterMetric } from '../types';

/**
 * Traverses Google Docs content structure to extract raw text content.
 */
export function extractTextFromDoc(doc: any): string {
  let text = "";
  if (!doc || !doc.body || !doc.body.content) return text;
  
  function traverse(element: any) {
    if (element.textRun && element.textRun.content) {
      text += element.textRun.content;
    }
    if (element.paragraph && element.paragraph.elements) {
      element.paragraph.elements.forEach(traverse);
    }
    if (element.table && element.table.tableRows) {
      element.table.tableRows.forEach((row: any) => {
        if (row.tableCells) {
          row.tableCells.forEach((cell: any) => {
            if (cell.content) {
              cell.content.forEach(traverse);
            }
          });
        }
      });
    }
    if (element.tableOfContents && element.tableOfContents.content) {
      element.tableOfContents.content.forEach(traverse);
    }
  }
  
  doc.body.content.forEach(traverse);
  return text;
}

/**
 * Analyzes string content for key metrics and character frequencies.
 */
export function analyzeText(text: string): AnalysisResult {
  const totalChars = text.length;
  
  // Clean word count: filter out empty tokens
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  // Let's count characters
  const charCounts: Record<string, number> = {};
  let rCount = 0;
  let RCount = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === 'r') rCount++;
    if (char === 'R') RCount++;

    // For distribution, focus on standard letters A-Z (case-insensitive)
    if (/[a-zA-Z]/.test(char)) {
      const lowerChar = char.toLowerCase();
      charCounts[lowerChar] = (charCounts[lowerChar] || 0) + 1;
    }
  }

  // Calculate percentages for letters
  const totalLetters = Object.values(charCounts).reduce((a, b) => a + b, 0);
  const letterMetrics: CharacterMetric[] = Object.entries(charCounts)
    .map(([char, count]) => ({
      char: char.toUpperCase(),
      count,
      percentage: totalLetters > 0 ? Number(((count / totalLetters) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count); // sort descending by count

  return {
    text,
    totalChars,
    totalWords,
    charCounts,
    letterMetrics,
    rCount,
    RCount
  };
}
export function getLetterStatistics(text: string) {
  let stats = {
    R: 0,
    r: 0,
    T: 0,
    t: 0
  };
  for(let i=0; i<text.length; i++) {
    const char = text[i];
    if(char === 'R') stats.R++;
    else if(char === 'r') stats.r++;
    else if(char === 'T') stats.T++;
    else if(char === 't') stats.t++;
  }
  return stats;
}
