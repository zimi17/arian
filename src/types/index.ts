// Core data types for the Grounded Theory analysis application

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  rawData: string[];
  openCodes: Code[];
  axialCategories: Category[];
  selectiveTheory: Theory | null;
}

export interface Code {
  id: string;
  text: string;
  frequency: number;
  sources: number[]; // indices of raw data sources
  ngram: number; // 1, 2, or 3
}

export interface Category {
  id: string;
  name: string;
  codes: string[]; // code IDs
  description?: string;
  centrality: number; // measure of how central this category is
}

export interface Theory {
  coreCategories: string[]; // category IDs
  narrative: string;
  relationships: Relationship[];
}

export interface Relationship {
  from: string; // category ID
  to: string; // category ID
  strength: number;
  description?: string;
}

export interface ImportData {
  type: 'text' | 'json' | 'csv';
  content: string | string[];
}

export interface WordCloudItem {
  text: string;
  value: number;
}

export interface CoOccurrence {
  code1: string;
  code2: string;
  count: number;
}
