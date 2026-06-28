export interface GoogleDocFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export interface CharacterMetric {
  char: string;
  count: number;
  percentage: number;
}

export interface AnalysisResult {
  text: string;
  totalChars: number;
  totalWords: number;
  charCounts: Record<string, number>;
  letterMetrics: CharacterMetric[];
  rCount: number;
  RCount: number;
}
