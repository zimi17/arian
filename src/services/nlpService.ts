import type { Code, CoOccurrence, Category, Theory, Relationship } from '../types';
import { INDONESIAN_STOPWORDS, MIN_WORD_LENGTH, MIN_CODE_FREQUENCY } from '../utils/stopwords';

/**
 * Pure client-side NLP service for Grounded Theory analysis
 * No external API calls - all processing happens in the browser
 */

/**
 * Clean and normalize text
 */
export function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Tokenize text into words
 */
export function tokenize(text: string): string[] {
  return cleanText(text)
    .split(' ')
    .filter(word => 
      word.length >= MIN_WORD_LENGTH && 
      !INDONESIAN_STOPWORDS.has(word) &&
      !/^\d+$/.test(word) // Exclude pure numbers
    );
}

/**
 * Extract n-grams from tokens
 */
export function extractNGrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Extract codes from raw data using n-gram analysis
 * Open Coding step
 */
export function performOpenCoding(rawData: string[]): Code[] {
  const ngramFrequency = new Map<string, { count: number; sources: Set<number>; ngram: number }>();

  // Process each data source
  rawData.forEach((text, sourceIndex) => {
    const tokens = tokenize(text);

    // Extract unigrams, bigrams, and trigrams
    for (let n = 1; n <= 3; n++) {
      const ngrams = extractNGrams(tokens, n);
      ngrams.forEach(ngram => {
        if (!ngramFrequency.has(ngram)) {
          ngramFrequency.set(ngram, { count: 0, sources: new Set(), ngram: n });
        }
        const entry = ngramFrequency.get(ngram)!;
        entry.count++;
        entry.sources.add(sourceIndex);
      });
    }
  });

  // Convert to Code objects and filter by minimum frequency
  const codes: Code[] = [];
  ngramFrequency.forEach((value, text) => {
    if (value.count >= MIN_CODE_FREQUENCY) {
      codes.push({
        id: generateId(),
        text,
        frequency: value.count,
        sources: Array.from(value.sources),
        ngram: value.ngram
      });
    }
  });

  // Sort by frequency (descending) and return top codes
  return codes
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 200); // Limit to top 200 codes
}

/**
 * Calculate co-occurrence between codes
 */
export function calculateCoOccurrence(codes: Code[]): CoOccurrence[] {
  const coOccurrences: Map<string, CoOccurrence> = new Map();

  // For each pair of codes, check if they appear in the same sources
  for (let i = 0; i < codes.length; i++) {
    for (let j = i + 1; j < codes.length; j++) {
      const code1 = codes[i];
      const code2 = codes[j];

      // Count sources where both codes appear
      const sharedSources = code1.sources.filter(s => code2.sources.includes(s));
      const count = sharedSources.length;

      if (count > 0) {
        const key = `${code1.id}-${code2.id}`;
        coOccurrences.set(key, {
          code1: code1.id,
          code2: code2.id,
          count
        });
      }
    }
  }

  return Array.from(coOccurrences.values())
    .sort((a, b) => b.count - a.count);
}

/**
 * Perform Axial Coding: cluster codes into categories based on co-occurrence
 */
export function performAxialCoding(codes: Code[]): Category[] {
  if (codes.length === 0) return [];

  const coOccurrences = calculateCoOccurrence(codes);
  const categories: Category[] = [];
  const assignedCodes = new Set<string>();

  // Build adjacency map
  const adjacency = new Map<string, Map<string, number>>();
  codes.forEach(code => {
    adjacency.set(code.id, new Map());
  });

  coOccurrences.forEach(co => {
    adjacency.get(co.code1)!.set(co.code2, co.count);
    adjacency.get(co.code2)!.set(co.code1, co.count);
  });

  // Use a simple clustering approach: start with high-frequency codes
  const sortedCodes = [...codes].sort((a, b) => b.frequency - a.frequency);

  for (const seedCode of sortedCodes) {
    if (assignedCodes.has(seedCode.id)) continue;

    // Find related codes (high co-occurrence)
    const relatedCodes = new Set<string>([seedCode.id]);
    const neighbors = adjacency.get(seedCode.id)!;

    // Get top co-occurring codes
    const sortedNeighbors = Array.from(neighbors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 related codes

    sortedNeighbors.forEach(([codeId]) => {
      if (!assignedCodes.has(codeId)) {
        relatedCodes.add(codeId);
      }
    });

    // Create category
    const categoryName = generateCategoryName(
      Array.from(relatedCodes).map(id => codes.find(c => c.id === id)!.text)
    );

    // Calculate centrality (average co-occurrence strength)
    const centralityScore = calculateCentrality(relatedCodes, adjacency);

    categories.push({
      id: generateId(),
      name: categoryName,
      codes: Array.from(relatedCodes),
      centrality: centralityScore
    });

    // Mark codes as assigned
    relatedCodes.forEach(id => assignedCodes.add(id));

    // Limit number of categories
    if (categories.length >= 20) break;
  }

  return categories.sort((a, b) => b.centrality - a.centrality);
}

/**
 * Calculate centrality score for a group of codes
 */
function calculateCentrality(
  codeIds: Set<string>,
  adjacency: Map<string, Map<string, number>>
): number {
  let totalStrength = 0;
  let connections = 0;

  codeIds.forEach(id1 => {
    codeIds.forEach(id2 => {
      if (id1 !== id2) {
        const strength = adjacency.get(id1)?.get(id2) || 0;
        totalStrength += strength;
        if (strength > 0) connections++;
      }
    });
  });

  return connections > 0 ? totalStrength / connections : 0;
}

/**
 * Generate a descriptive category name from codes
 */
function generateCategoryName(codeTexts: string[]): string {
  // Use the most frequent/representative code as the category name
  // Take the first few codes and create a descriptive label
  const topCodes = codeTexts.slice(0, 3);
  return topCodes.join(', ').substring(0, 50);
}

/**
 * Perform Selective Coding: identify core categories and generate theory
 */
export function performSelectiveCoding(categories: Category[], codes: Code[]): Theory {
  if (categories.length === 0) {
    return {
      coreCategories: [],
      narrative: 'No categories available for theory generation.',
      relationships: []
    };
  }

  // Select core categories (top N by centrality)
  const coreCategories = categories
    .slice(0, Math.min(5, categories.length))
    .map(c => c.id);

  // Identify relationships between core categories
  const relationships: Relationship[] = [];
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  for (let i = 0; i < coreCategories.length; i++) {
    for (let j = i + 1; j < coreCategories.length; j++) {
      const cat1 = categoryMap.get(coreCategories[i])!;
      const cat2 = categoryMap.get(coreCategories[j])!;

      // Check for shared codes or co-occurrence
      const sharedCodes = cat1.codes.filter(c => cat2.codes.includes(c));
      const strength = sharedCodes.length;

      if (strength > 0) {
        relationships.push({
          from: cat1.id,
          to: cat2.id,
          strength,
          description: `Shared ${strength} code(s)`
        });
      }
    }
  }

  // Generate narrative
  const narrative = generateTheoryNarrative(
    coreCategories.map(id => categoryMap.get(id)!),
    relationships,
    codes
  );

  return {
    coreCategories,
    narrative,
    relationships
  };
}

/**
 * Generate a theory narrative from core categories
 */
function generateTheoryNarrative(
  categories: Category[],
  relationships: Relationship[],
  codes: Code[]
): string {
  
  let narrative = `Based on the grounded theory analysis, ${categories.length} core categories emerged:\n\n`;

  categories.forEach((cat, idx) => {
    const categoryCodeTexts = cat.codes
      .map(codeId => codes.find(c => c.id === codeId)?.text)
      .filter(Boolean)
      .slice(0, 5);
    
    narrative += `${idx + 1}. ${cat.name}\n`;
    narrative += `   Key themes: ${categoryCodeTexts.join(', ')}\n`;
    narrative += `   (Centrality: ${cat.centrality.toFixed(2)})\n\n`;
  });

  if (relationships.length > 0) {
    narrative += '\nKey Relationships:\n';
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    relationships.slice(0, 5).forEach(rel => {
      const from = categoryMap.get(rel.from);
      const to = categoryMap.get(rel.to);
      if (from && to) {
        narrative += `- "${from.name}" connects to "${to.name}" (strength: ${rel.strength})\n`;
      }
    });
  }

  narrative += '\nThis analysis reveals the interconnected patterns and themes within the research data, ';
  narrative += 'providing a foundation for theoretical development.';

  return narrative;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse CSV content
 */
export function parseCSV(content: string): string[] {
  const lines = content.split('\n');
  const data: string[] = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed) {
      // Simple CSV parsing - assumes single column or takes first meaningful column
      const values = trimmed.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const text = values.find(v => v.length > 10) || values[0]; // Take first substantial value
      if (text) {
        data.push(text);
      }
    }
  });

  return data;
}

/**
 * Parse JSON content
 */
export function parseJSON(content: string): string[] {
  try {
    const parsed = JSON.parse(content);
    
    if (Array.isArray(parsed)) {
      return parsed.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          // Extract text from common fields
          return item.text || item.content || item.data || JSON.stringify(item);
        }
        return String(item);
      });
    } else if (typeof parsed === 'object') {
      // Single object - extract text fields
      const text = parsed.text || parsed.content || parsed.data;
      return text ? [String(text)] : [JSON.stringify(parsed)];
    }
    
    return [String(parsed)];
  } catch {
    throw new Error('Invalid JSON format');
  }
}
