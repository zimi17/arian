import { Code, Segment } from "../types";

// Interface for code comparison result
export interface CodeComparisonResult {
  similarityScore: number; // 0-100, higher means more similar
  commonSegments: string[]; // IDs of segments that appear in both codes
  uniqueToFirst: string[]; // Segment IDs unique to first code
  uniqueToSecond: string[]; // Segment IDs unique to second code
  overlapPercentage: number; // How much overlap exists
  comparisonDetails: {
    firstCode: {
      id: string;
      name: string;
      segmentCount: number;
      frequency: number;
    };
    secondCode: {
      id: string;
      name: string;
      segmentCount: number;
      frequency: number;
    };
  };
}

// Compare two codes to find similarities and differences
export const compareCodes = (
  firstCode: Code,
  secondCode: Code,
  allSegments: Segment[]
): CodeComparisonResult => {
  // Find common segments between the two codes
  const commonSegmentIds = firstCode.segmentIds.filter(id => 
    secondCode.segmentIds.includes(id)
  );

  // Find segments unique to each code
  const uniqueToFirst = firstCode.segmentIds.filter(id => 
    !secondCode.segmentIds.includes(id)
  );

  const uniqueToSecond = secondCode.segmentIds.filter(id => 
    !firstCode.segmentIds.includes(id)
  );

  // Calculate similarity score based on overlap
  // Using Jaccard similarity: |intersection| / |union|
  const unionSize = new Set([...firstCode.segmentIds, ...secondCode.segmentIds]).size;
  const intersectionSize = commonSegmentIds.length;
  const jaccardSimilarity = unionSize > 0 ? intersectionSize / unionSize : 0;
  const similarityScore = Math.round(jaccardSimilarity * 100);

  // Calculate overlap percentage relative to the smaller code
  const smallerCodeSize = Math.min(firstCode.segmentIds.length, secondCode.segmentIds.length);
  const overlapPercentage = smallerCodeSize > 0 ? (intersectionSize / smallerCodeSize) * 100 : 0;

  return {
    similarityScore,
    commonSegments: commonSegmentIds,
    uniqueToFirst,
    uniqueToSecond,
    overlapPercentage: parseFloat(overlapPercentage.toFixed(2)),
    comparisonDetails: {
      firstCode: {
        id: firstCode.id,
        name: firstCode.name,
        segmentCount: firstCode.segmentIds.length,
        frequency: firstCode.frequency
      },
      secondCode: {
        id: secondCode.id,
        name: secondCode.name,
        segmentCount: secondCode.segmentIds.length,
        frequency: secondCode.frequency
      }
    }
  };
};

// Interface for multiple code comparison
export interface MultipleCodeComparisonResult {
  mostSimilarPair: [string, string] | null; // IDs of most similar codes
  mostSimilarScore: number;
  similarityMatrix: [string, string, number][]; // [codeId1, codeId2, similarityScore][]
}

// Compare all codes in a project to find the most similar pairs
export const compareAllCodes = (codes: Code[], allSegments: Segment[]): MultipleCodeComparisonResult => {
  if (codes.length < 2) {
    return {
      mostSimilarPair: null,
      mostSimilarScore: 0,
      similarityMatrix: []
    };
  }

  const similarityMatrix: [string, string, number][] = [];
  let maxScore = 0;
  let mostSimilarPair: [string, string] | null = null;

  // Compare each code with every other code
  for (let i = 0; i < codes.length; i++) {
    for (let j = i + 1; j < codes.length; j++) {
      const comparison = compareCodes(codes[i], codes[j], allSegments);
      similarityMatrix.push([codes[i].id, codes[j].id, comparison.similarityScore]);

      if (comparison.similarityScore > maxScore) {
        maxScore = comparison.similarityScore;
        mostSimilarPair = [codes[i].id, codes[j].id];
      }
    }
  }

  return {
    mostSimilarPair,
    mostSimilarScore: maxScore,
    similarityMatrix
  };
};