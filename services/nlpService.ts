import { Segment } from "../types";

// Interface for tokenization result
export interface TokenizationResult {
  tokens: string[]; // Individual tokens (words)
  tokenCount: number;
  uniqueTokens: string[]; // Unique tokens only
  uniqueTokenCount: number;
  processedText: string; // Text after basic cleaning
}

// Interface for keyword extraction result
export interface KeywordExtractionResult {
  keywords: Array<{ word: string; frequency: number; weight: number }>;
  topKeywords: string[]; // Just the words
  totalWords: number;
  uniqueWords: number;
}

// Basic stop words for Indonesian and English
const STOP_WORDS = new Set([
  // Indonesian
  "dan", "yang", "di", "itu", "dengan", "untuk", "adalah", "dari", "ini", "dalam",
  "akan", "pada", "juga", "saya", "ke", "karena", "tersebut", "bisa", "ada", "mereka",
  "kata", "atau", "saat", "oleh", "sudah", "sebagai", "tapi", "namun", "kita", "anda",
  "dia", "kami", "apa", "tidak", "bukan", "jika", "kalau", "maka", "seperti", "tentang",
  "secara", "menjadi", "sangat", "hal", "ketika", "para", "itu", "banyak", "sedang",
  "apakah", "yaitu", "bagaimana", "mana", "masih", "lagi", "hanya", "kepada", "mengapa",
  "setiap", "bagi", "ia", "lalu", "dapat", "saja", "telah", "agar", "perlu", "pun",
  "harus", "ingin", "masalah", "terjadi", "melakukan", "memiliki", "satu", "dua", "tiga",
  "aku", "gue", "gw", "lu", "lo", "sama", "kok", "sih", "dong", "deh", "kan", "ni", "tu",
  "buat", "bikin", "biar", "kayak", "gitu", "gini", "banget", "cuma", "pas", "emang", "nya",
  // English
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these", "those"
]);

// Basic tokenization function
export const tokenizeText = (text: string): TokenizationResult => {
  // Basic text cleaning
  const cleanedText = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ") // Replace punctuation with spaces
    .replace(/\s{2,}/g, " ") // Replace multiple spaces with single space
    .trim();

  // Split into tokens
  const tokens = cleanedText.split(/\s+/).filter(token => token.length > 0);

  // Get unique tokens
  const uniqueTokens = Array.from(new Set(tokens));

  return {
    tokens,
    tokenCount: tokens.length,
    uniqueTokens,
    uniqueTokenCount: uniqueTokens.length,
    processedText: cleanedText
  };
};

// Basic keyword extraction using frequency
export const extractKeywords = (text: string, maxKeywords: number = 10): KeywordExtractionResult => {
  const { tokens, uniqueTokens } = tokenizeText(text);

  // Count frequency of each token
  const frequencyMap: { [word: string]: number } = {};
  tokens.forEach(token => {
    if (token.length > 2 && !STOP_WORDS.has(token)) { // Filter short words and stop words
      frequencyMap[token] = (frequencyMap[token] || 0) + 1;
    }
  });

  // Convert to array and sort by frequency
  const keywordArray = Object.entries(frequencyMap)
    .map(([word, frequency]) => ({ word, frequency, weight: frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  // Calculate weights (TF-IDF like, but simplified)
  const totalWords = tokens.length;
  const weightedKeywords = keywordArray.map(item => ({
    ...item,
    weight: item.frequency / totalWords
  }));

  // Get top keywords
  const topKeywords = weightedKeywords.slice(0, maxKeywords).map(kw => kw.word);

  return {
    keywords: weightedKeywords.slice(0, maxKeywords),
    topKeywords,
    totalWords: totalWords,
    uniqueWords: uniqueTokens.length
  };
};

// Extract keywords from all segments in a project
export const extractKeywordsFromSegments = (
  segments: Segment[], 
  maxKeywords: number = 20
): KeywordExtractionResult => {
  // Combine all text from segments
  const combinedText = segments.map(segment => segment.text).join(' ');

  // Extract keywords from the combined text
  return extractKeywords(combinedText, maxKeywords);
};

// Interface for n-gram extraction
export interface NgramResult {
  unigrams: Array<{ word: string; count: number }>;
  bigrams: Array<{ phrase: string; count: number }>;
  trigrams: Array<{ phrase: string; count: number }>;
}

// Extract n-grams (unigrams, bigrams, trigrams) from text
export const extractNGrams = (text: string): NgramResult => {
  const { tokens } = tokenizeText(text);

  // Extract unigrams (single words)
  const unigramMap: { [word: string]: number } = {};
  tokens.filter(token => token.length > 2 && !STOP_WORDS.has(token)).forEach(token => {
    unigramMap[token] = (unigramMap[token] || 0) + 1;
  });

  // Extract bigrams (two-word phrases)
  const bigramMap: { [phrase: string]: number } = {};
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    if (!STOP_WORDS.has(tokens[i]) && !STOP_WORDS.has(tokens[i + 1])) {
      bigramMap[bigram] = (bigramMap[bigram] || 0) + 1;
    }
  }

  // Extract trigrams (three-word phrases)
  const trigramMap: { [phrase: string]: number } = {};
  for (let i = 0; i < tokens.length - 2; i++) {
    const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
    if (!STOP_WORDS.has(tokens[i]) && !STOP_WORDS.has(tokens[i + 1]) && !STOP_WORDS.has(tokens[i + 2])) {
      trigramMap[trigram] = (trigramMap[trigram] || 0) + 1;
    }
  }

  // Convert to sorted arrays
  const unigrams = Object.entries(unigramMap)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const bigrams = Object.entries(bigramMap)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);

  const trigrams = Object.entries(trigramMap)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);

  return {
    unigrams,
    bigrams,
    trigrams
  };
};