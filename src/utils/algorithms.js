// Open Coding: Extract codes using N-gram analysis
export const extractCodes = (text, minNgram = 1, maxNgram = 3, minFrequency = 2) => {
  if (!text || typeof text !== 'string') return [];

  // Tokenize and clean text
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2); // Remove short words

  const ngramFrequency = new Map();

  // Generate n-grams
  for (let n = minNgram; n <= maxNgram; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join(' ');
      ngramFrequency.set(ngram, (ngramFrequency.get(ngram) || 0) + 1);
    }
  }

  // Filter by minimum frequency and sort
  const codes = Array.from(ngramFrequency.entries())
    .filter(([, freq]) => freq >= minFrequency)
    .map(([code, frequency]) => ({ code, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  return codes;
};

// Axial Coding: Cluster codes based on co-occurrence
export const clusterCodes = (text, codes, windowSize = 50) => {
  if (!text || !codes || codes.length === 0) return [];

  const words = text.toLowerCase().split(/\s+/);
  const cooccurrenceMatrix = new Map();

  // Initialize matrix
  codes.forEach(({ code: code1 }) => {
    cooccurrenceMatrix.set(code1, new Map());
    codes.forEach(({ code: code2 }) => {
      if (code1 !== code2) {
        cooccurrenceMatrix.get(code1).set(code2, 0);
      }
    });
  });

  // Calculate co-occurrence within windows
  for (let i = 0; i < words.length; i++) {
    const window = words.slice(i, i + windowSize).join(' ');
    
    codes.forEach(({ code: code1 }) => {
      if (window.includes(code1)) {
        codes.forEach(({ code: code2 }) => {
          if (code1 !== code2 && window.includes(code2)) {
            const current = cooccurrenceMatrix.get(code1).get(code2);
            cooccurrenceMatrix.get(code1).set(code2, current + 1);
          }
        });
      }
    });
  }

  // Cluster codes based on co-occurrence strength
  const clusters = [];
  const visited = new Set();

  codes.forEach(({ code }) => {
    if (visited.has(code)) return;

    const cluster = {
      category: code,
      codes: [code],
      strength: 0,
    };

    visited.add(code);
    const relatedCodes = cooccurrenceMatrix.get(code);

    // Find strongly related codes
    const sortedRelations = Array.from(relatedCodes.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([, count]) => count > 0);

    sortedRelations.forEach(([relatedCode, count]) => {
      if (!visited.has(relatedCode) && count >= 2) {
        cluster.codes.push(relatedCode);
        cluster.strength += count;
        visited.add(relatedCode);
      }
    });

    if (cluster.codes.length > 0) {
      clusters.push(cluster);
    }
  });

  return clusters.sort((a, b) => b.strength - a.strength);
};

// Selective Coding: Identify core categories
export const identifyCoreCategories = (clusters, text, topN = 5) => {
  if (!clusters || clusters.length === 0) return [];

  // Calculate importance scores for each cluster
  const scoredClusters = clusters.map(cluster => {
    // Coverage: how much of the text relates to this cluster
    let coverage = 0;
    cluster.codes.forEach(code => {
      const regex = new RegExp(code.replace(/\s+/g, '\\s+'), 'gi');
      const matches = text.match(regex);
      coverage += matches ? matches.length : 0;
    });

    // Centrality: how connected this cluster is to other clusters
    let centrality = cluster.strength / cluster.codes.length;

    // Diversity: variety of codes in the cluster
    const diversity = cluster.codes.length;

    const score = coverage * 0.5 + centrality * 0.3 + diversity * 0.2;

    return {
      ...cluster,
      coverage,
      centrality,
      diversity,
      score,
    };
  });

  // Select top N core categories
  const coreCategories = scoredClusters
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((cluster, index) => ({
      rank: index + 1,
      category: cluster.category,
      codes: cluster.codes,
      coverage: cluster.coverage,
      centrality: cluster.centrality.toFixed(2),
      diversity: cluster.diversity,
      score: cluster.score.toFixed(2),
    }));

  // Generate theory statement
  const theory = generateTheory(coreCategories);

  return { coreCategories, theory };
};

const generateTheory = (coreCategories) => {
  if (coreCategories.length === 0) return '';

  const topCategories = coreCategories.slice(0, 3).map(c => c.category);
  
  let theory = `Based on the analysis, the core phenomenon centers around "${topCategories[0]}". `;
  
  if (topCategories.length > 1) {
    theory += `This is closely related to "${topCategories[1]}"`;
    if (topCategories.length > 2) {
      theory += ` and "${topCategories[2]}"`;
    }
    theory += '. ';
  }

  theory += 'These categories represent the most significant patterns in the data, ';
  theory += 'suggesting a theoretical framework where these concepts interact to explain the phenomenon under study.';

  return theory;
};

// Word frequency for word cloud
export const calculateWordFrequency = (text, minLength = 3, topN = 50) => {
  if (!text || typeof text !== 'string') return [];

  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= minLength && !stopWords.has(word));

  const frequency = new Map();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
};
