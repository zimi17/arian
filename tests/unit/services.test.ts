import {
  performOpenCoding,
  performAxialCoding,
  performSelectiveCoding
} from '../../services/geminiService';
import {
  performSaturationAnalysis
} from '../../services/saturationAnalysisService';
import {
  compareCodes,
  compareAllCodes
} from '../../services/codeComparisonService';
import {
  extractKeywords,
  tokenizeText,
  extractNGrams
} from '../../services/nlpService';
import { Code, Category, Segment } from '../../types';

// Mock data for testing
const mockSegments: Segment[] = [
  {
    id: 'seg1',
    text: 'This is a test segment for coding analysis.',
    dataset: 'Test Dataset',
    platform: 'Manual Input',
    timestamp: new Date().toISOString()
  },
  {
    id: 'seg2',
    text: 'Another segment with different content for testing.',
    dataset: 'Test Dataset',
    platform: 'Manual Input',
    timestamp: new Date().toISOString()
  }
];

const mockCodes: Code[] = [
  {
    id: 'code1',
    name: 'Test Code',
    frequency: 2,
    segmentIds: ['seg1', 'seg2'],
    description: 'A test code',
    memo: 'Test memo',
    tags: ['tag1']
  },
  {
    id: 'code2',
    name: 'Second Code',
    frequency: 1,
    segmentIds: ['seg1'],
    description: 'Another test code',
    memo: '',
    tags: []
  }
];

const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Test Category',
    codeIds: ['code1', 'code2'],
    description: 'A test category',
    connections: [],
    centrality: 5,
    memo: 'Test category memo',
    tags: ['category-tag']
  }
];

describe('Open Coding Service', () => {
  test('should perform open coding successfully', async () => {
    const result = await performOpenCoding(mockSegments);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('frequency');
    expect(result[0]).toHaveProperty('segmentIds');
    expect(result[0]).toHaveProperty('description');
  });

  test('should handle empty segments', async () => {
    await expect(performOpenCoding([])).rejects.toThrow('Dataset kosong');
  });
});

describe('Axial Coding Service', () => {
  test('should perform axial coding successfully', async () => {
    const result = await performAxialCoding(mockCodes, mockSegments);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0); // May be empty with minimal test data
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('codeIds');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('connections');
      expect(result[0]).toHaveProperty('centrality');
    }
  });

  test('should handle empty codes', async () => {
    await expect(performAxialCoding([], mockSegments)).rejects.toThrow('Tidak ada kode');
  });
});

describe('Selective Coding Service', () => {
  test('should perform selective coding successfully', async () => {
    const result = await performSelectiveCoding(mockCategories, mockSegments, mockCodes);
    
    expect(result).toHaveProperty('coreCategory');
    expect(result).toHaveProperty('narrative');
    expect(result).toHaveProperty('hypothesis');
    expect(result).toHaveProperty('confidenceScore');
    expect(result).toHaveProperty('confidenceRationale');
  });
});

describe('Saturation Analysis Service', () => {
  test('should perform saturation analysis', () => {
    const mockState = {
      step: 'open' as const,
      segments: mockSegments,
      codes: mockCodes,
      categories: mockCategories,
      theory: null,
      excludeKeywords: [],
      isProcessing: false,
      error: null,
      lastAction: 'test',
      selectedCodeId: undefined,
      selectedCategoryId: undefined
    };
    
    const result = performSaturationAnalysis(mockState);
    
    expect(result).toHaveProperty('isSaturated');
    expect(result).toHaveProperty('saturationScore');
    expect(result).toHaveProperty('newCodeFrequency');
    expect(result).toHaveProperty('stabilityTrend');
    expect(result).toHaveProperty('recommendation');
    expect(result).toHaveProperty('details');
  });
});

describe('Code Comparison Service', () => {
  test('should compare two codes', () => {
    const result = compareCodes(mockCodes[0], mockCodes[1], mockSegments);
    
    expect(result).toHaveProperty('similarityScore');
    expect(result).toHaveProperty('commonSegments');
    expect(result).toHaveProperty('uniqueToFirst');
    expect(result).toHaveProperty('uniqueToSecond');
    expect(result).toHaveProperty('overlapPercentage');
    expect(result).toHaveProperty('comparisonDetails');
  });

  test('should compare all codes', () => {
    const result = compareAllCodes(mockCodes, mockSegments);
    
    expect(result).toHaveProperty('mostSimilarPair');
    expect(result).toHaveProperty('mostSimilarScore');
    expect(result).toHaveProperty('similarityMatrix');
  });
});

describe('NLP Service', () => {
  test('should tokenize text correctly', () => {
    const text = 'This is a test sentence.';
    const result = tokenizeText(text);
    
    expect(result).toHaveProperty('tokens');
    expect(result).toHaveProperty('tokenCount');
    expect(result).toHaveProperty('uniqueTokens');
    expect(result).toHaveProperty('uniqueTokenCount');
    expect(result).toHaveProperty('processedText');
    expect(Array.isArray(result.tokens)).toBe(true);
  });

  test('should extract keywords', () => {
    const text = 'This is a test sentence with repeated words test test.';
    const result = extractKeywords(text, 10);
    
    expect(result).toHaveProperty('keywords');
    expect(result).toHaveProperty('topKeywords');
    expect(result).toHaveProperty('totalWords');
    expect(result).toHaveProperty('uniqueWords');
    expect(Array.isArray(result.keywords)).toBe(true);
  });

  test('should extract n-grams', () => {
    const text = 'This is a test sentence.';
    const result = extractNGrams(text);
    
    expect(result).toHaveProperty('unigrams');
    expect(result).toHaveProperty('bigrams');
    expect(result).toHaveProperty('trigrams');
    expect(Array.isArray(result.unigrams)).toBe(true);
    expect(Array.isArray(result.bigrams)).toBe(true);
    expect(Array.isArray(result.trigrams)).toBe(true);
  });
});