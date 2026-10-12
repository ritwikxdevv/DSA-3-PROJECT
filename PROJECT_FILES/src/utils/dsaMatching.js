/**
 * DSA Matching Engine for E-Commerce Product Entity Resolution
 * 
 * Pipeline:
 * 1. Tokenization & Normalization (Regex, Stop-word removal, Unit normalization)
 * 2. Inverted Index Lookup (Hash Map: Token -> Set<DocId>) for O(1) Candidate Filtering
 * 3. Jaccard Similarity (Set Theory: |A ∩ B| / |A ∪ B|)
 * 4. Levenshtein Distance (Dynamic Programming 2D Matrix Edit Distance)
 * 5. Multi-Attribute Weighted Composite Scoring
 */

// Common e-commerce stop words to filter out noisy tokens
const STOP_WORDS = new Set([
  'and', 'with', 'the', 'for', 'in', 'of', 'a', 'an', 'at', 'by', 'from',
  'original', 'official', 'new', 'latest', 'brand', 'genuine', 'item', 'pack',
  'special', 'all', 'edition', 'smart', 'unlocked', 'cellular', 'inch', 'inches'
]);

/**
 * Tokenize and normalize input product text
 * Time Complexity: O(L) where L is text length
 */
export function tokenize(text) {
  if (!text) return [];
  
  // 1. Lowercase
  let normalized = text.toLowerCase();
  
  // 2. Normalize storage and memory units (e.g. "128 gb" -> "128gb", "8 gb" -> "8gb")
  normalized = normalized.replace(/(\d+)\s*(gb|tb|mb|ram|rom|ghz|mah)/g, '$1$2');
  
  // 3. Remove punctuation and special characters (keep alphanumeric and hyphens)
  normalized = normalized.replace(/[^a-z0-9\s-]/g, ' ');
  
  // 4. Split into words
  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  
  // 5. Filter stop words & short noise tokens
  const cleanTokens = rawTokens.filter(t => !STOP_WORDS.has(t) && t.length > 1);
  
  // Return unique tokens array
  return Array.from(new Set(cleanTokens));
}

/**
 * Build Inverted Index from product catalog
 * Data Structure: Hash Map (Dictionary) where Key = Token, Value = Set of Product IDs
 * Time Complexity to build: O(N * K) where N = products, K = avg tokens
 * Lookup Complexity: O(1) per token
 */
export function buildInvertedIndex(products) {
  const index = new Map();
  
  products.forEach(product => {
    const tokens = tokenize(`${product.name} ${product.brand} ${product.category || ''}`);
    tokens.forEach(token => {
      if (!index.has(token)) {
        index.set(token, new Set());
      }
      index.get(token).add(product.id);
    });
  });
  
  return index;
}

/**
 * Candidate Filtering using Inverted Index
 * Retrieves only products that share at least minOverlap tokens with query
 */
export function getCandidatesFromIndex(queryTokens, invertedIndex, minOverlap = 1) {
  const candidateScores = new Map(); // productId -> count of matched tokens
  
  queryTokens.forEach(token => {
    if (invertedIndex.has(token)) {
      const docIds = invertedIndex.get(token);
      docIds.forEach(id => {
        candidateScores.set(id, (candidateScores.get(id) || 0) + 1);
      });
    }
  });
  
  // Filter candidates that meet minimum token overlap
  const candidates = [];
  candidateScores.forEach((overlapCount, productId) => {
    if (overlapCount >= minOverlap) {
      candidates.push({ productId, overlapCount });
    }
  });
  
  // Sort by token overlap descending
  return candidates.sort((a, b) => b.overlapCount - a.overlapCount);
}

/**
 * Jaccard Similarity between two token sets
 * Formula: J(A, B) = |A ∩ B| / |A ∪ B|
 * Time Complexity: O(|A| + |B|)
 */
export function calculateJaccard(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  if (setA.size === 0 && setB.size === 0) return { score: 1.0, intersection: [], union: [] };
  if (setA.size === 0 || setB.size === 0) return { score: 0.0, intersection: [], union: Array.from(new Set([...setA, ...setB])) };
  
  const intersection = [];
  setA.forEach(item => {
    if (setB.has(item)) {
      intersection.push(item);
    }
  });
  
  const unionSet = new Set([...setA, ...setB]);
  const union = Array.from(unionSet);
  
  const score = union.length > 0 ? intersection.length / union.length : 0;
  
  return {
    score: Number(score.toFixed(4)),
    intersection,
    union,
    intersectionCount: intersection.length,
    unionCount: union.length
  };
}

/**
 * Levenshtein Distance using Dynamic Programming
 * Matrix DP[i][j] representing minimum edit distance (insert, delete, replace)
 * Time Complexity: O(M * N), Space Complexity: O(M * N)
 */
export function calculateLevenshtein(str1, str2) {
  const s1 = (str1 || '').toLowerCase().trim();
  const s2 = (str2 || '').toLowerCase().trim();
  
  const m = s1.length;
  const n = s2.length;
  
  if (m === 0) return { distance: n, normalizedScore: n === 0 ? 1 : 0, matrix: [] };
  if (n === 0) return { distance: m, normalizedScore: 0, matrix: [] };
  
  // DP matrix initialization
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  
  const distance = dp[m][n];
  const maxLen = Math.max(m, n);
  const normalizedScore = maxLen === 0 ? 1.0 : Number((1 - distance / maxLen).toFixed(4));
  
  return {
    distance,
    maxLen,
    normalizedScore: Math.max(0, normalizedScore),
    dpMatrixSample: dp.slice(0, 7).map(row => row.slice(0, 7)) // small sample for UI display
  };
}

/**
 * Multi-Attribute Weighted Resolution Score
 * Weights:
 * - Jaccard Token Overlap: 45% (Semantic content & attributes)
 * - Levenshtein String Similarity: 30% (Title character alignment)
 * - Brand Equality: 15% (Hard constraint bonus)
 * - Category / Spec Alignment: 10%
 */
export function calculateWeightedMatch(queryProduct, candidateProduct) {
  const queryTokens = tokenize(queryProduct.name);
  const candTokens = tokenize(candidateProduct.name);
  
  // 1. Jaccard Similarity
  const jaccard = calculateJaccard(queryTokens, candTokens);
  
  // 2. Levenshtein String Edit Distance
  const levenshtein = calculateLevenshtein(queryProduct.name, candidateProduct.name);
  
  // 3. Brand Matching
  const queryBrand = (queryProduct.brand || '').toLowerCase().trim();
  const candBrand = (candidateProduct.brand || '').toLowerCase().trim();
  const brandMatch = queryBrand && candBrand && queryBrand === candBrand;
  const brandScore = brandMatch ? 1.0 : 0.0;
  
  // 4. Category & Key specs match
  let specScore = 0.5; // baseline
  if (queryProduct.category && candidateProduct.category) {
    if (queryProduct.category.toLowerCase() === candidateProduct.category.toLowerCase()) {
      specScore = 1.0;
    }
  }
  
  // Weighted sum
  const weights = {
    jaccard: 0.45,
    levenshtein: 0.30,
    brand: 0.15,
    spec: 0.10
  };
  
  const rawScore = 
    (jaccard.score * weights.jaccard) +
    (levenshtein.normalizedScore * weights.levenshtein) +
    (brandScore * weights.brand) +
    (specScore * weights.spec);
    
  // Convert to 0 - 100 percentage
  const matchPercentage = Math.min(99, Math.max(0, Math.round(rawScore * 100)));
  
  const isMatch = matchPercentage >= 75;
  
  return {
    matchPercentage,
    isMatch,
    status: matchPercentage >= 90 ? 'Exact Match' : matchPercentage >= 75 ? 'Matched' : 'Uncertain',
    breakdown: {
      jaccard,
      levenshtein,
      brandMatch,
      brandScore,
      weights,
      rawScore
    }
  };
}

/**
 * Perform full Entity Resolution pipeline for a given reference product
 * Returns sorted list of matches with full algorithmic trace
 */
export function resolveEntities(referenceProduct, allCatalogProducts) {
  // Exclude the exact reference product itself if in catalog
  const targetProducts = allCatalogProducts.filter(p => p.id !== referenceProduct.id);
  
  // 1. Tokenization of query
  const queryTokens = tokenize(`${referenceProduct.name} ${referenceProduct.brand}`);
  
  // 2. Build Inverted Index
  const invertedIndex = buildInvertedIndex(targetProducts);
  
  // 3. Retrieve candidates
  const candidateList = getCandidatesFromIndex(queryTokens, invertedIndex, 1);
  const candidateIds = new Set(candidateList.map(c => c.productId));
  
  // 4. Calculate weighted score for each candidate
  const evaluated = [];
  
  targetProducts.forEach(candidate => {
    // We compute for candidate matches
    const isCandidate = candidateIds.has(candidate.id);
    const result = calculateWeightedMatch(referenceProduct, candidate);
    
    // Check if matched
    if (result.matchPercentage >= 60 || isCandidate) {
      evaluated.push({
        ...candidate,
        matchScore: result.matchPercentage,
        matchStatus: result.status,
        isMatch: result.isMatch,
        dsaTrace: result.breakdown
      });
    }
  });
  
  // Sort by highest match score
  return evaluated.sort((a, b) => b.matchScore - a.matchScore);
}
