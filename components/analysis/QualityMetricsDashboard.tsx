import React, { useState, useEffect } from 'react';
import { AnalysisState } from '../../types';
import { performSaturationAnalysis, SaturationResult } from '../../services/saturationAnalysisService';
import { compareAllCodes, MultipleCodeComparisonResult } from '../../services/codeComparisonService';
import { extractKeywordsFromSegments, KeywordExtractionResult } from '../../services/nlpService';
import { BarChart3, TrendingUp, TrendingDown, Activity, CheckCircle, AlertCircle, Database, Tag, Hash } from 'lucide-react';

interface QualityMetricsDashboardProps {
  state: AnalysisState;
}

interface QualityMetrics {
  saturation: SaturationResult;
  comparison: MultipleCodeComparisonResult;
  keywords: KeywordExtractionResult;
  overallScore: number;
}

export const QualityMetricsDashboard: React.FC<QualityMetricsDashboardProps> = ({ state }) => {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'saturation' | 'comparison' | 'keywords'>('overview');

  useEffect(() => {
    const calculateMetrics = async () => {
      setLoading(true);
      
      // Calculate all metrics
      const saturation = performSaturationAnalysis(state);
      const comparison = compareAllCodes(state.codes, state.segments);
      const keywords = extractKeywordsFromSegments(state.segments, 15);
      
      // Calculate overall score (averaged from different metrics)
      const overallScore = Math.round(
        (saturation.saturationScore * 0.3) + // Saturation is 30%
        (Math.min(100, comparison.mostSimilarScore * 0.5) * 0.2) + // Code similarity affects quality 20%
        (Math.min(100, keywords.uniqueWords / Math.max(1, state.segments.length) * 10) * 0.2) + // Vocabulary richness 20%
        (Math.min(100, state.codes.length / Math.max(1, state.segments.length) * 20) * 0.3) // Code density 30%
      );
      
      setMetrics({
        saturation,
        comparison,
        keywords,
        overallScore: Math.min(100, overallScore) // Cap at 100
      });
      
      setLoading(false);
    };

    calculateMetrics();
  }, [state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Analyzing project quality metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">Error loading metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Quality Metrics Dashboard
        </h2>
        <p className="text-sm text-slate-600 mt-1">Analysis of project completeness and consistency</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-slate-600 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'saturation'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-slate-600 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('saturation')}
        >
          Saturation
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'comparison'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-slate-600 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('comparison')}
        >
          Code Comparison
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'keywords'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-slate-600 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('keywords')}
        >
          Keywords
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Overall Quality Score</h3>
                  <p className="text-4xl font-bold text-blue-900 mt-2">{metrics.overallScore}/100</p>
                  <p className="text-blue-700 mt-1">
                    {metrics.overallScore >= 80 ? 'Excellent quality' :
                     metrics.overallScore >= 60 ? 'Good quality' :
                     metrics.overallScore >= 40 ? 'Fair quality' : 'Needs improvement'}
                  </p>
                </div>
                <div className="text-blue-500">
                  <Activity className="w-12 h-12" />
                </div>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Hash className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Codes</p>
                    <p className="text-xl font-bold text-slate-800">{state.codes.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Categories</p>
                    <p className="text-xl font-bold text-slate-800">{state.categories.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Segments</p>
                    <p className="text-xl font-bold text-slate-800">{state.segments.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${metrics.saturation.saturationScore >= 70 ? 'bg-green-100' : metrics.saturation.saturationScore >= 40 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                    <CheckCircle className={`w-5 h-5 ${metrics.saturation.saturationScore >= 70 ? 'text-green-600' : metrics.saturation.saturationScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Saturation</p>
                    <p className="text-xl font-bold text-slate-800">{metrics.saturation.saturationScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" />
                Recommendations
              </h3>
              <ul className="text-amber-700 text-sm space-y-1 list-disc list-inside">
                <li>{metrics.saturation.recommendation}</li>
                <li>{metrics.saturation.saturationScore < 70 ? 'Consider adding more data to reach theoretical saturation' : 'Theoretical saturation appears to be reached'}</li>
                <li>Most similar codes: {metrics.comparison.mostSimilarPair ? 
                  `${state.codes.find(c => c.id === metrics.comparison.mostSimilarPair![0])?.name} and ${state.codes.find(c => c.id === metrics.comparison.mostSimilarPair![1])?.name}` : 
                  'No similar codes found (this could indicate diverse themes or low code count)'}</li>
                <li>Top keywords: {metrics.keywords.topKeywords.slice(0, 5).join(', ')}</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'saturation' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Saturation Analysis</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  metrics.saturation.saturationScore >= 70 ? 'bg-green-100 text-green-800' : 
                  metrics.saturation.saturationScore >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {metrics.saturation.saturationScore >= 70 ? 'Saturated' : 
                   metrics.saturation.saturationScore >= 40 ? 'Moderate' : 'Not Saturated'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-600">Saturation Score</p>
                  <p className="text-2xl font-bold text-slate-800">{metrics.saturation.saturationScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">New Codes per Segment</p>
                  <p className="text-2xl font-bold text-slate-800">{metrics.saturation.details.newCodesPerSegment}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">Stability Trend: {metrics.saturation.stabilityTrend}</p>
                {metrics.saturation.stabilityTrend === 'increasing' && (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Codes are increasing - more data collection needed</span>
                  </div>
                )}
                {metrics.saturation.stabilityTrend === 'decreasing' && (
                  <div className="flex items-center text-red-600">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    <span>Codes are stabilizing - saturation approaching</span>
                  </div>
                )}
                {metrics.saturation.stabilityTrend === 'stable' && (
                  <div className="flex items-center text-blue-600">
                    <Activity className="w-4 h-4 mr-1" />
                    <span>Code frequency is stable</span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-slate-600 mb-2">Code Frequency Distribution</p>
                <div className="space-y-2">
                  {Object.entries(metrics.saturation.details.codeFrequencyDistribution).map(([range, count]) => (
                    <div key={range} className="flex items-center">
                      <span className="w-24 text-xs text-slate-600">{range} occurrences:</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / Math.max(1, Math.max(...Object.values(metrics.saturation.details.codeFrequencyDistribution))) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-xs text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2">Recommendation</h3>
              <p className="text-slate-700">{metrics.saturation.recommendation}</p>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Code Comparison Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded border">
                  <h4 className="font-medium text-slate-700 mb-2">Most Similar Codes</h4>
                  {metrics.comparison.mostSimilarPair ? (
                    <div>
                      <p className="text-lg font-bold text-blue-600">{metrics.comparison.mostSimilarScore}% similarity</p>
                      <p className="text-slate-700 mt-1">
                        "{state.codes.find(c => c.id === metrics.comparison.mostSimilarPair![0])?.name}" 
                        &nbsp;and&nbsp; 
                        "{state.codes.find(c => c.id === metrics.comparison.mostSimilarPair![1])?.name}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-600">No highly similar codes found</p>
                  )}
                </div>
                
                <div className="bg-slate-50 p-4 rounded border">
                  <h4 className="font-medium text-slate-700 mb-2">Code Density</h4>
                  <p className="text-2xl font-bold text-slate-800">{state.codes.length}</p>
                  <p className="text-slate-600">total codes</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {state.segments.length > 0 ? (state.codes.length / state.segments.length).toFixed(2) : 0} 
                    &nbsp;codes per segment
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-2">All Code Similarities (Top 10)</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {metrics.comparison.similarityMatrix
                    .sort((a, b) => b[2] - a[2])
                    .slice(0, 10)
                    .map(([id1, id2, score], index) => {
                      const code1 = state.codes.find(c => c.id === id1);
                      const code2 = state.codes.find(c => c.id === id2);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                          <div>
                            <span className="text-sm font-medium">{code1?.name}</span>
                            <span className="text-slate-400 mx-2">&amp;</span>
                            <span className="text-sm font-medium">{code2?.name}</span>
                          </div>
                          <span className="text-sm font-bold text-blue-600">{score}%</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Keyword Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded border text-center">
                  <p className="text-2xl font-bold text-slate-800">{metrics.keywords.totalWords}</p>
                  <p className="text-slate-600">Total Words</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded border text-center">
                  <p className="text-2xl font-bold text-slate-800">{metrics.keywords.uniqueWords}</p>
                  <p className="text-slate-600">Unique Words</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded border text-center">
                  <p className="text-2xl font-bold text-slate-800">
                    {metrics.keywords.totalWords > 0 ? (metrics.keywords.uniqueWords / metrics.keywords.totalWords * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-slate-600">Lexical Diversity</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-3">Top Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {metrics.keywords.keywords.map((kw, index) => (
                    <div 
                      key={index} 
                      className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      style={{ fontSize: `${0.8 + (kw.frequency / Math.max(...metrics.keywords.keywords.map(k => k.frequency)) * 0.7)}rem` }}
                    >
                      {kw.word} ({kw.frequency})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};