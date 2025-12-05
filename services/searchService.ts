import { AnalysisState, Code, Category, Segment } from "../types";

export interface SearchResult {
  type: 'code' | 'category' | 'segment';
  id: string;
  content: string;
  relevance: number; // 0-100, higher is more relevant
  parent?: string; // ID of parent category for codes, or dataset name for segments
}

export const searchInAnalysisState = (state: AnalysisState, query: string): SearchResult[] => {
  if (!query.trim()) return [];
  
  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];
  
  // Search in codes
  state.codes.forEach(code => {
    let relevance = 0;
    
    // Check name match
    if (code.name.toLowerCase().includes(queryLower)) {
      relevance += 50;
    }
    
    // Check description match
    if (code.description.toLowerCase().includes(queryLower)) {
      relevance += 30;
    }
    
    // Check memo match
    if (code.memo && code.memo.toLowerCase().includes(queryLower)) {
      relevance += 40;
    }
    
    // Check tags match
    if (code.tags && code.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
      relevance += 20;
    }
    
    if (relevance > 0) {
      results.push({
        type: 'code',
        id: code.id,
        content: `${code.name} (${code.frequency} mentions)`,
        relevance,
        parent: 'Open Coding'
      });
    }
  });
  
  // Search in categories
  state.categories.forEach(category => {
    let relevance = 0;
    
    // Check name match
    if (category.name.toLowerCase().includes(queryLower)) {
      relevance += 50;
    }
    
    // Check description match
    if (category.description.toLowerCase().includes(queryLower)) {
      relevance += 30;
    }
    
    // Check memo match
    if (category.memo && category.memo.toLowerCase().includes(queryLower)) {
      relevance += 40;
    }
    
    // Check tags match
    if (category.tags && category.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
      relevance += 20;
    }
    
    if (relevance > 0) {
      results.push({
        type: 'category',
        id: category.id,
        content: `${category.name} (${category.codeIds.length} codes)`,
        relevance,
        parent: 'Axial Coding'
      });
    }
  });
  
  // Search in segments
  state.segments.forEach(segment => {
    let relevance = 0;
    
    // Check text match
    if (segment.text.toLowerCase().includes(queryLower)) {
      relevance += 60;
    }
    
    // Check dataset name match
    if (segment.dataset && segment.dataset.toLowerCase().includes(queryLower)) {
      relevance += 20;
    }
    
    // Check platform match
    if (segment.platform && segment.platform.toLowerCase().includes(queryLower)) {
      relevance += 10;
    }
    
    if (relevance > 0) {
      results.push({
        type: 'segment',
        id: segment.id,
        content: `${segment.text.substring(0, 100)}${segment.text.length > 100 ? '...' : ''}`,
        relevance,
        parent: segment.dataset || 'Unknown Dataset'
      });
    }
  });
  
  // Sort by relevance (highest first)
  return results.sort((a, b) => b.relevance - a.relevance);
};