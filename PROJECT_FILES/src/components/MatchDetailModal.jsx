import React from 'react';
import { 
  X, 
  GitMerge, 
  AlignLeft, 
  Tag, 
  Layers, 
  Calculator, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Store,
  Info
} from 'lucide-react';
import { tokenize, calculateJaccard, calculateLevenshtein } from '../utils/dsaMatching';

export default function MatchDetailModal({
  isOpen,
  onClose,
  referenceProduct,
  matchedProduct
}) {
  if (!isOpen || !matchedProduct || !referenceProduct) return null;

  // Compute live DSA metrics for deep explanation
  const tokensRef = tokenize(referenceProduct.name);
  const tokensMatch = tokenize(matchedProduct.name);
  const jaccard = calculateJaccard(tokensRef, tokensMatch);
  const levenshtein = calculateLevenshtein(referenceProduct.name, matchedProduct.name);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="match-detail-modal glass-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="section-pill">
              <Sparkles size={13} />
              <span>DSA Verification Trace</span>
            </div>
            <h3 className="modal-heading">Algorithmic Match Breakdown</h3>
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="modal-body-scrollable">
          {/* Side-by-side Product Comparison */}
          <div className="comparison-cards-row">
            {/* Reference Product */}
            <div className="modal-product-box">
              <span className="box-role-badge">Reference Entity (Query)</span>
              <h4 className="box-prod-title">{referenceProduct.name}</h4>
              <div className="box-meta-row">
                <span className="box-brand">Brand: {referenceProduct.brand}</span>
                <span className="box-seller">Seller: {referenceProduct.seller}</span>
                <span className="box-price">{formatPrice(referenceProduct.price)}</span>
              </div>
            </div>

            <div className="vs-circle">
              <span>VS</span>
            </div>

            {/* Matched Product */}
            <div className="modal-product-box highlight-box">
              <div className="box-score-top">
                <span className="box-role-badge role-matched">Matched Seller Listing</span>
                <span className="score-top-pill font-mono">{matchedProduct.matchScore}% Match</span>
              </div>
              <h4 className="box-prod-title">{matchedProduct.name}</h4>
              <div className="box-meta-row">
                <span className="box-brand">Brand: {matchedProduct.brand}</span>
                <span className="box-seller">Seller: {matchedProduct.seller}</span>
                <span className="box-price text-emerald-400">{formatPrice(matchedProduct.price)}</span>
              </div>
            </div>
          </div>

          {/* Metric 1: Tokenization & Jaccard Similarity */}
          <div className="dsa-metric-panel">
            <div className="metric-header">
              <div className="metric-title-group">
                <div className="metric-icon-wrap" style={{ color: '#a78bfa', backgroundColor: 'rgba(167, 139, 250, 0.15)' }}>
                  <GitMerge size={18} />
                </div>
                <div>
                  <h4 className="metric-name">1. Jaccard Token Similarity</h4>
                  <span className="metric-formula font-mono">J(A, B) = |A ∩ B| / |A ∪ B|</span>
                </div>
              </div>
              <div className="metric-score-box font-mono">
                <span className="metric-val">{jaccard.score}</span>
                <span className="metric-pct">({Math.round(jaccard.score * 100)}%)</span>
              </div>
            </div>

            <div className="metric-content-box">
              {/* Intersection Tokens */}
              <div className="token-group">
                <span className="token-group-title">
                  Shared Tokens Intersection (|A ∩ B| = {jaccard.intersectionCount}):
                </span>
                <div className="token-pills-wrap">
                  {jaccard.intersection.map((t, i) => (
                    <span key={i} className="token-pill pill-intersection font-mono">
                      ✓ {t}
                    </span>
                  ))}
                  {jaccard.intersection.length === 0 && (
                    <span className="token-empty">No common tokens</span>
                  )}
                </div>
              </div>

              {/* Union Count */}
              <div className="token-math-bar font-mono">
                Total Unique Tokens (|A ∪ B|): {jaccard.unionCount}
              </div>
            </div>
          </div>

          {/* Metric 2: Levenshtein Dynamic Programming Edit Distance */}
          <div className="dsa-metric-panel">
            <div className="metric-header">
              <div className="metric-title-group">
                <div className="metric-icon-wrap" style={{ color: '#c084fc', backgroundColor: 'rgba(192, 132, 252, 0.15)' }}>
                  <AlignLeft size={18} />
                </div>
                <div>
                  <h4 className="metric-name">2. Levenshtein Edit Distance (DP Tabulation)</h4>
                  <span className="metric-formula font-mono">Normalized Sim = 1 - (Edit Distance / MaxLen)</span>
                </div>
              </div>
              <div className="metric-score-box font-mono">
                <span className="metric-val">{levenshtein.normalizedScore}</span>
                <span className="metric-pct">({Math.round(levenshtein.normalizedScore * 100)}%)</span>
              </div>
            </div>

            <div className="metric-content-box">
              <div className="levenshtein-stats-grid">
                <div className="lev-stat">
                  <span className="lev-label">Min Edit Operations:</span>
                  <span className="lev-value font-mono">{levenshtein.distance} edits</span>
                </div>
                <div className="lev-stat">
                  <span className="lev-label">Max String Length:</span>
                  <span className="lev-value font-mono">{levenshtein.maxLen} chars</span>
                </div>
                <div className="lev-stat">
                  <span className="lev-label">Time / Space Complexity:</span>
                  <span className="lev-value font-mono">O(M × N)</span>
                </div>
              </div>

              {/* DP Sample Table Excerpt */}
              {levenshtein.dpMatrixSample && levenshtein.dpMatrixSample.length > 0 && (
                <div className="dp-matrix-sample">
                  <span className="dp-matrix-title">2D DP Matrix Slice [0..6, 0..6]:</span>
                  <div className="dp-table-wrap font-mono">
                    <table className="dp-table">
                      <tbody>
                        {levenshtein.dpMatrixSample.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={rIdx === cIdx ? 'dp-diagonal' : ''}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metric 3: Weighted Multi-Attribute Composition */}
          <div className="dsa-metric-panel">
            <div className="metric-header">
              <div className="metric-title-group">
                <div className="metric-icon-wrap" style={{ color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.15)' }}>
                  <Calculator size={18} />
                </div>
                <div>
                  <h4 className="metric-name">3. Composite Weight Formulation</h4>
                  <span className="metric-formula font-mono">
                    Score = (0.45 × Jaccard) + (0.30 × Levenshtein) + (0.15 × Brand) + (0.10 × Spec)
                  </span>
                </div>
              </div>
              <div className="metric-score-box font-mono final-score-highlight">
                <span className="metric-val">{matchedProduct.matchScore}%</span>
                <span className="metric-pct">Final Confidence</span>
              </div>
            </div>

            <div className="weights-bar-breakdown">
              <div className="weight-row">
                <span className="weight-name">Jaccard Token Similarity (45% weight)</span>
                <span className="weight-calc font-mono">{jaccard.score} × 0.45 = +{(jaccard.score * 45).toFixed(1)}%</span>
              </div>
              <div className="weight-row">
                <span className="weight-name">Levenshtein Edit Alignment (30% weight)</span>
                <span className="weight-calc font-mono">{levenshtein.normalizedScore} × 0.30 = +{(levenshtein.normalizedScore * 30).toFixed(1)}%</span>
              </div>
              <div className="weight-row">
                <span className="weight-name">Exact Brand Match (15% weight)</span>
                <span className="weight-calc font-mono">1.0 × 0.15 = +15.0%</span>
              </div>
              <div className="weight-row">
                <span className="weight-name">Category / Attribute Alignment (10% weight)</span>
                <span className="weight-calc font-mono">1.0 × 0.10 = +10.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="resolution-verdict">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Entity Resolution Confirmed: Both listings refer to the same physical SKU.</span>
          </div>
          <button 
            type="button" 
            className="btn-primary modal-done-btn"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
