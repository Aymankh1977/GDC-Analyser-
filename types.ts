
export interface AnalysisResult {
  bestPractices: string;
  areasForImprovement: string;
}

export interface SpecificGuidelineResult {
  programName: string;
  executiveSummary: string;
  strengths: string;
  areasForImprovement: string;
  recommendations: string;
}

export enum TtsStatus {
  IDLE,
  LOADING,
  PLAYING,
  ERROR,
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
