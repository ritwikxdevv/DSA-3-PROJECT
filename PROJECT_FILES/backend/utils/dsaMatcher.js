/**
 * DSA Matching Engine for E-Commerce Product Entity-Resolution
 * 
 * Algorithms implemented:
 * 1. Tokenization & Canonicalization (O(L))
 * 2. Jaccard Similarity (Set Theory: |A ∩ B| / |A ∪ B|) (O(|A| + |B|))
 * 3. Levenshtein Distance (2D Dynamic Programming Tabulation) (O(M × N))
 * 4. Multi-Attribute Weighted Resolution Scoring
 */

// Common e-commerce stop words to exclude from token bag
const STOP_WORDS = new Set([
  'and', 'with', 'the', 'for', 'in', 'of', 'a', 'an', 'at', 'by', 'from',
  'original', 'official', 'new', 'latest', 'brand', 'genuine', 'item', 'pack',
  'special', 'all', 'edition', 'smart', 'unlocked', 'cellular', 'inch', 'inches',
  'buy', 'online', 'store', 'shop'
]);

/**
 * 1. Tokenization & Normalization
 * Time Complexity: O(L) where L is text length
 */
export function tokenize(text) {
  if (!text) return [];

  // Lowercase
  let normalized = String(text).toLowerCase();

  // Normalize storage and memory units (e.g. "128 gb" -> "128gb", "8 gb" -> "8gb")
  normalized = normalized.replace(/(\d+)\s*(gb|tb|mb|ram|rom|ghz|mah)/g, '$1$2');

  // Replace special characters and punctuation with whitespace
  normalized = normalized.replace(/[^a-z0-9\s-]/g, ' ');

  // Split into tokens
  const rawTokens = normalized.split(/\s+/).filter(Boolean);

  // Filter stop-words and 1-char noise tokens
  const cleanTokens = rawTokens.filter(t => !STOP_WORDS.has(t) && t.length > 1);

  // Return unique bag-of-words array
  return Array.from(new Set(cleanTokens));
}

/**
 * 2. Jaccard Similarity
 * Formula: J(A, B) = |A ∩ B| / |A ∪ B|
 * Invariant to token ordering
 * Time Complexity: O(|A| + |B|)
 */
export function calculateJaccard(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  if (setA.size === 0 && setB.size === 0) {
    return { score: 1.0, intersection: [], union: [] };
  }
  if (setA.size === 0 || setB.size === 0) {
    return { score: 0.0, intersection: [], union: Array.from(new Set([...setA, ...setB])) };
  }

  const intersection = [];
  setA.forEach((item) => {
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
 * 3. Levenshtein Distance (2D Dynamic Programming Tabulation)
 * Matrix DP[i][j] = minimum edit operations (insert, delete, substitute)
 * Time Complexity: O(M × N), Space Complexity: O(M × N)
 */
export function calculateLevenshtein(str1, str2) {
  const s1 = String(str1 || '').toLowerCase().trim();
  const s2 = String(str2 || '').toLowerCase().trim();

  const m = s1.length;
  const n = s2.length;

  if (m === 0) return { distance: n, maxLen: n, normalizedScore: n === 0 ? 1 : 0 };
  if (n === 0) return { distance: m, maxLen: m, normalizedScore: 0 };

  // DP table
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
    dpMatrixSample: dp.slice(0, 7).map(row => row.slice(0, 7)) // sample slice for frontend UI
  };
}

/**
 * 4. Multi-Attribute Weighted Resolution Scoring
 * Combines token set theory and character-level edit distance
 */
export function calculateMatchScore(queryProduct, candidateProduct) {
  const queryTokens = tokenize(`${queryProduct.name} ${queryProduct.brand || ''}`);
  const candTokens = tokenize(`${candidateProduct.name} ${candidateProduct.brand || ''}`);

  // Jaccard Token Overlap
  const jaccard = calculateJaccard(queryTokens, candTokens);

  // Levenshtein String Alignment
  const levenshtein = calculateLevenshtein(queryProduct.name, candidateProduct.name);

  // Brand Equality
  const qBrand = String(queryProduct.brand || '').toLowerCase().trim();
  const cBrand = String(candidateProduct.brand || '').toLowerCase().trim();
  const brandMatch = qBrand && cBrand && (qBrand === cBrand || qBrand.includes(cBrand) || cBrand.includes(qBrand));
  const brandScore = brandMatch ? 1.0 : 0.0;

  // Category / Spec Alignment
  let categoryScore = 0.5;
  if (queryProduct.category && candidateProduct.category) {
    if (queryProduct.category.toLowerCase().trim() === candidateProduct.category.toLowerCase().trim()) {
      categoryScore = 1.0;
    }
  }

  // Weights
  const weights = {
    jaccard: 0.45,
    levenshtein: 0.30,
    brand: 0.15,
    category: 0.10
  };

  const rawScore =
    (jaccard.score * weights.jaccard) +
    (levenshtein.normalizedScore * weights.levenshtein) +
    (brandScore * weights.brand) +
    (categoryScore * weights.category);

  // Convert to 0 - 100 percentage
  const matchingScore = Math.min(99, Math.max(0, Math.round(rawScore * 100)));

  // Determine Match Status
  let matchStatus = 'Uncertain';
  let isMatch = false;

  if (matchingScore >= 90) {
    matchStatus = 'Exact Match';
    isMatch = true;
  } else if (matchingScore >= 75) {
    matchStatus = 'Matched';
    isMatch = true;
  } else if (matchingScore >= 60) {
    matchStatus = 'Probable Match';
  }

  return {
    matchingScore,
    matchStatus,
    isMatch,
    breakdown: {
      jaccard,
      levenshtein,
      brandMatch,
      brandScore,
      categoryScore,
      weights,
      rawScore
    }
  };
}

/**
 * Match an input product against a candidate collection
 * Sorts results by highest matchingScore descending
 */
export function matchProducts(queryProduct, candidatesList, minThreshold = 55) {
  const results = [];

  for (const candidate of candidatesList) {
    // Avoid matching candidate with its exact database self if IDs match
    const candId = candidate._id ? String(candidate._id) : candidate.id;
    const queryId = queryProduct._id ? String(queryProduct._id) : queryProduct.id;
    if (candId && queryId && candId === queryId) {
      continue;
    }

    const { matchingScore, matchStatus, isMatch, breakdown } = calculateMatchScore(queryProduct, candidate);

    if (matchingScore >= minThreshold) {
      results.push({
        id: candId || `PROD-${results.length + 1}`,
        _id: candidate._id,
        name: candidate.name,
        brand: candidate.brand,
        category: candidate.category,
        description: candidate.description,
        seller: candidate.seller,
        price: candidate.price,
        image: candidate.image || candidate.imageUrl,
        imageUrl: candidate.image || candidate.imageUrl,
        createdAt: candidate.createdAt,
        // Match specifics required by prompt
        matchingScore,
        matchScore: matchingScore,
        matchStatus,
        isMatch,
        // Additional e-commerce fields
        originalPrice: candidate.originalPrice,
        rating: candidate.rating,
        reviewsCount: candidate.reviewsCount,
        specs: candidate.specs,
        warranty: candidate.warranty,
        deliveryDays: candidate.deliveryDays,
        freeDelivery: candidate.freeDelivery,
        dsaTrace: breakdown
      });
    }
  }

  // Sort by highest matching score descending
  return results.sort((a, b) => b.matchingScore - a.matchingScore);
}
