import { AnalysisState } from "../types";

// Export codes as JSON
export const exportCodesAsJSON = (codes: AnalysisState['codes']): string => {
  return JSON.stringify(codes, null, 2);
};

// Export categories as JSON
export const exportCategoriesAsJSON = (categories: AnalysisState['categories']): string => {
  return JSON.stringify(categories, null, 2);
};

// Export theory as JSON
export const exportTheoryAsJSON = (theory: AnalysisState['theory']): string => {
  return JSON.stringify(theory, null, 2);
};

// Export project as JSON (complete project data)
export const exportProjectAsJSON = (state: AnalysisState): string => {
  const { isProcessing, error, lastAction, selectedCodeId, selectedCategoryId, ...projectData } = state;
  return JSON.stringify(projectData, null, 2);
};

// Export complete project as a single object with metadata
export const exportCompleteProject = (state: AnalysisState, projectName: string): string => {
  const { isProcessing, error, lastAction, selectedCodeId, selectedCategoryId, ...projectData } = state;

  const completeProject = {
    metadata: {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projectName: projectName,
      totalSegments: projectData.segments.length,
      totalCodes: projectData.codes.length,
      totalCategories: projectData.categories.length,
      analysisStep: projectData.step
    },
    data: projectData
  };

  return JSON.stringify(completeProject, null, 2);
};

// Export codes as CSV
export const exportCodesAsCSV = (codes: AnalysisState['codes']): string => {
  if (codes.length === 0) return '';
  
  const headers = ['ID', 'Name', 'Frequency', 'Segment IDs', 'Description', 'Memo', 'Tags'];
  const rows = codes.map(code => [
    `"${code.id}"`,
    `"${code.name}"`,
    code.frequency,
    `"${code.segmentIds.join(';')}"`,
    `"${code.description}"`,
    `"${code.memo || ''}"`,
    `"${(code.tags || []).join(';')}"`
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// Export categories as CSV
export const exportCategoriesAsCSV = (categories: AnalysisState['categories']): string => {
  if (categories.length === 0) return '';
  
  const headers = ['ID', 'Name', 'Code IDs', 'Description', 'Connections', 'Centrality', 'Memo', 'Tags'];
  const rows = categories.map(category => [
    `"${category.id}"`,
    `"${category.name}"`,
    `"${category.codeIds.join(';')}"`,
    `"${category.description}"`,
    `"${category.connections.join(';')}"`,
    category.centrality,
    `"${category.memo || ''}"`,
    `"${(category.tags || []).join(';')}"`
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// Download file helper
export const downloadFile = (content: string, filename: string, contentType: string = 'text/plain') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};