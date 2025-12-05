import { AnalysisState } from "../types";

// Import project from JSON
export const importProjectFromJSON = (jsonString: string): AnalysisState | null => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Check if it's a complete project export
    if (parsed.metadata && parsed.data) {
      return parsed.data as AnalysisState;
    }
    
    // Otherwise, assume it's direct state data
    return parsed as AnalysisState;
  } catch (error) {
    console.error('Error parsing project JSON:', error);
    return null;
  }
};

// Import codes from JSON
export const importCodesFromJSON = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing codes JSON:', error);
    return [];
  }
};

// Import categories from JSON
export const importCategoriesFromJSON = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing categories JSON:', error);
    return [];
  }
};

// Import segments from JSON
export const importSegmentsFromJSON = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing segments JSON:', error);
    return [];
  }
};

// Import from CSV (basic implementation - would need more sophisticated parsing in a real app)
export const importFromCSV = (csvString: string) => {
  // This would need to be more sophisticated for real CSV parsing
  console.warn('CSV import is not fully implemented in this version');
  return null;
};

// Import from TXT
export const importFromTXT = (txtString: string) => {
  // Parse plain text into segments
  const lines = txtString.split(/\n\s*\n/).filter(line => line.trim());
  return lines.map((text, index) => ({
    id: `txt-${Date.now()}-${index}`,
    text: text.trim(),
    dataset: 'TXT Import',
    platform: 'Text File'
  }));
};