import { TrieMatch } from '../keyword-trie';
import { ExtractedText } from '../text-extractor';
import { DimensionConfig } from '../types';

const DENSITY_WINDOW = 200;
const DENSITY_THRESHOLD = 3;
const DENSITY_BONUS = 1.5;

function hasDensityCluster(matches: TrieMatch[], windowSize: number): boolean {
  if (matches.length < DENSITY_THRESHOLD) return false;

  const positions = matches.map((m) => m.position).sort((a, b) => a - b);
  for (let i = 0; i <= positions.length - DENSITY_THRESHOLD; i++) {
    if (positions[i + DENSITY_THRESHOLD - 1] - positions[i] <= windowSize) {
      return true;
    }
  }
  return false;
}

export function scoreKeywordDimension(
  dimensionName: string,
  allMatches: TrieMatch[],
  extractedTexts: ExtractedText[],
  direction: DimensionConfig['direction'],
): { rawScore: number; matchedKeywords: string[] } {
  const dimMatches = allMatches.filter((m) => m.dimension === dimensionName);
  if (dimMatches.length === 0) {
    return { rawScore: 0, matchedKeywords: [] };
  }

  const uniqueKeywords = [...new Set(dimMatches.map((m) => m.keyword))];
  const densityActive = hasDensityCluster(dimMatches, DENSITY_WINDOW);

  // Pre-calculate message character offsets in the combined text
  let currentOffset = 0;
  const messageCounts = new Map<number, number>(); // message index -> match count
  const messageBoundaries = extractedTexts.map((ext, idx) => {
    const start = currentOffset;
    const end = currentOffset + ext.text.length;
    currentOffset += ext.text.length + 1; // +1 for the '\n' separator
    messageCounts.set(idx, 0);
    return { start, end, idx };
  });

  // Map each TrieMatch to its containing message boundary
  for (const match of dimMatches) {
    const boundary = messageBoundaries.find(
      (b) => match.position >= b.start && match.position <= b.end,
    );
    if (boundary) {
      messageCounts.set(boundary.idx, messageCounts.get(boundary.idx)! + 1);
    }
  }

  let weightedSum = 0;
  for (let idx = 0; idx < extractedTexts.length; idx++) {
    const count = messageCounts.get(idx) ?? 0;
    if (count > 0) {
      let contribution = count * extractedTexts[idx].positionWeight;
      if (densityActive) contribution *= DENSITY_BONUS;
      weightedSum += contribution;
    }
  }

  const normalizer = Math.max(1, dimMatches.length);
  let rawScore = Math.min(1, Math.max(-1, weightedSum / normalizer));

  if (direction === 'down') rawScore = -rawScore;

  return { rawScore, matchedKeywords: uniqueKeywords };
}
