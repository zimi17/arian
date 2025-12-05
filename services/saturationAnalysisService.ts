import { AnalysisState } from "../types";

// Interface for saturation analysis result
export interface SaturationResult {
  isSaturated: boolean;
  saturationScore: number; // 0-100, higher means more saturated
  newCodeFrequency: number; // How often new codes appear
  stabilityTrend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
  details: {
    codeDensity: number;
    codeFrequencyDistribution: { [frequencyRange: string]: number };
    newCodesPerSegment: number;
  };
}

// Calculate saturation analysis for the current data
export const performSaturationAnalysis = (state: AnalysisState): SaturationResult => {
  const { codes, segments } = state;
  
  if (segments.length === 0) {
    return {
      isSaturated: false,
      saturationScore: 0,
      newCodeFrequency: 0,
      stabilityTrend: 'increasing',
      recommendation: 'No data available for analysis',
      details: {
        codeDensity: 0,
        codeFrequencyDistribution: {},
        newCodesPerSegment: 0
      }
    };
  }

  // Calculate code density (how many codes per segment on average)
  const totalCodeAssignments = codes.reduce((sum, code) => sum + code.segmentIds.length, 0);
  const codeDensity = segments.length > 0 ? totalCodeAssignments / segments.length : 0;

  // Calculate code frequency distribution
  const frequencyDistribution: { [frequencyRange: string]: number } = {
    '1-2': 0,
    '3-5': 0,
    '6-10': 0,
    '11+': 0
  };

  codes.forEach(code => {
    if (code.frequency <= 2) frequencyDistribution['1-2']++;
    else if (code.frequency <= 5) frequencyDistribution['3-5']++;
    else if (code.frequency <= 10) frequencyDistribution['6-10']++;
    else frequencyDistribution['11+']++;
  });

  // Calculate new codes per segment (heuristic for saturation)
  const newCodesPerSegment = codes.length / segments.length;

  // Saturation heuristic: lower newCodesPerSegment indicates higher saturation
  // We'll use an inverse relationship: 100 - (newCodesPerSegment * 20), clamped to 0-100
  const baseSaturationScore = Math.max(0, Math.min(100, 100 - (newCodesPerSegment * 20)));

  // Stability trend - based on frequency distribution (more high-frequency codes = more stable)
  const highFreqCodes = frequencyDistribution['11+'] || 0;
  const lowFreqCodes = frequencyDistribution['1-2'] || 0;
  const stabilityRatio = highFreqCodes / (lowFreqCodes + 1); // +1 to avoid division by zero

  // Adjust saturation score based on stability
  const stabilityAdjustment = Math.min(20, stabilityRatio * 10); // Max 20 point adjustment
  const adjustedSaturationScore = Math.min(100, baseSaturationScore + stabilityAdjustment);

  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (newCodesPerSegment > 0.5) trend = 'increasing'; // Many new codes appearing
  else if (newCodesPerSegment < 0.2) trend = 'decreasing'; // Few new codes appearing

  // Recommendation based on saturation score
  let recommendation = '';
  if (adjustedSaturationScore < 30) {
    recommendation = 'Data collection should continue - low saturation detected';
  } else if (adjustedSaturationScore < 60) {
    recommendation = 'Continue data collection with focus on emerging themes';
  } else if (adjustedSaturationScore < 80) {
    recommendation = 'Consider data collection completion, but review for emerging themes';
  } else {
    recommendation = 'Theoretical saturation likely reached - consider completing data collection';
  }

  return {
    isSaturated: adjustedSaturationScore >= 70,
    saturationScore: Math.round(adjustedSaturationScore),
    newCodeFrequency: parseFloat(newCodesPerSegment.toFixed(2)),
    stabilityTrend: trend,
    recommendation,
    details: {
      codeDensity: parseFloat(codeDensity.toFixed(2)),
      codeFrequencyDistribution: frequencyDistribution,
      newCodesPerSegment: parseFloat(newCodesPerSegment.toFixed(2))
    }
  };
};