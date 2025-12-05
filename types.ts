import React from 'react';

export type AnalysisStep = 'input' | 'open' | 'axial' | 'selective';

export type ViewMode = 'list' | 'cloud' | 'network' | 'kanban' | 'report' | 'model' | 'visualization';

export interface Segment {
  id: string;
  text: string;
  dataset: string; // Source Name (e.g., "Interview 1", "Observation A")
  platform?: string; // Optional (e.g., "TikTok", "Transcript")
  timestamp?: string;
}

export interface Code {
  id: string;
  name: string;
  frequency: number;
  segmentIds: string[]; // Referensi ke ID Segment untuk Audit Trail
  description: string;
  memo?: string; // Memo field for user notes
  tags?: string[]; // Tags for organization
}

export interface Category {
  id: string;
  name: string;
  codeIds: string[];
  description: string;
  connections: string[]; // IDs of connected categories
  centrality: number; // 1-10 Score
  memo?: string; // Memo field for user notes
  tags?: string[]; // Tags for organization
}

export interface CoreTheory {
  coreCategory: string;
  narrative: string;
  hypothesis: string;
  confidenceScore: 'High' | 'Medium' | 'Low';
  confidenceRationale: string;
}

export interface AnalysisState {
  step: AnalysisStep;
  segments: Segment[];
  codes: Code[];
  categories: Category[];
  theory: CoreTheory | null;
  excludeKeywords: string[];
  isProcessing: boolean;
  error: string | null;
  lastAction: string; // For Status Bar
  selectedCodeId?: string; // Currently selected code ID for navigation
  selectedCategoryId?: string; // Currently selected category ID for navigation
}

export interface StepProps {
  state: AnalysisState;
  setState: React.Dispatch<React.SetStateAction<AnalysisState>>;
  onNext: (data?: any) => void;
  onBack: () => void;
  onRegenerate?: (newCoreCategoryId: string) => Promise<void>;
  viewMode?: ViewMode; // UI State passed down
  setViewMode?: (mode: ViewMode) => void;
}