import React, { useState } from 'react';
import { 
  Tag, 
  Store, 
  Layers, 
  Sparkles, 
  Check, 
  Cpu, 
  ExternalLink, 
  Star, 
  ChevronRight, 
  SlidersHorizontal,
  Code2
} from 'lucide-react';
import { tokenize } from '../utils/dsaMatching';

export default function SelectedProductCard({
  product,
  onFindSimilar,
  isAnalyzing,
  onOpenAlgorithmModal
}) {
  const [showTokens, setShowTokens] = useState(false);

  if (!product) return null;

  // Extract tokens using DSA tokenizer for transparency
  const tokens = tokenize(`${product.name} ${product.brand}`);

  // Format currency
  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="input-product-section" id="selected-product-section">
      <div className="section-header-compact">
        <div className="section-title-wrap">
          <div className="section-pill">
            <span className="pill-dot"></span>
            <span>Query Reference Entity</span>
          </div>
          <h2 className="section-title">Selected Input Product</h2>
        </div>
        <p className="section-desc">
          This product entity is tokenized and queried against the cross-seller inverted index to find canonical matches.
        </p>
      </div>

      <div className="selected-product-card glass-panel">
        <div className="card-grid">
          {/* Product Image Column */}
          <div className="product-media-col">
            <div className="image-container">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="product-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="category-overlay-badge">
                {product.category}
              </div>
            </div>

            {/* Seller Info Badge */}
            <div className="seller-box">
              <div className="seller-icon-wrap">
                <Store size={16} />
              </div>
              <div className="seller-meta">
                <span className="seller-label">Source Seller</span>
                <span className="seller-name">{product.seller}</span>
              </div>
            </div>
          </div>

          {/* Product Information Column */}
          <div className="product-details-col">
            {/* Header & Meta */}
            <div className="product-top-row">
              <div className="brand-badge-pill">
                <Tag size={13} />
                <span>{product.brand}</span>
              </div>
              <div className="rating-pill">
                <Star size={13} className="star-icon" fill="currentColor" />
                <span>{product.rating}</span>
                <span className="reviews-count">({product.reviewsCount?.toLocaleString()} ratings)</span>
              </div>
            </div>

            {/* Product Title */}
            <h3 className="product-main-title">{product.name}</h3>

            {/* Price Box */}
            <div className="product-price-row">
              <div className="price-tag">
                <span className="current-price">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="original-price">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              <div className="availability-tag">
                <Check size={14} />
                <span>Available for Matching</span>
              </div>
            </div>

            {/* Description */}
            <p className="product-description-text">
              {product.description}
            </p>

            {/* Specifications Grid */}
            {product.specs && (
              <div className="specs-grid">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-key">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tokenization Preview Toggle */}
            <div className="tokens-toggle-box">
              <button 
                type="button" 
                className="token-toggle-btn"
                onClick={() => setShowTokens(!showTokens)}
              >
                <Code2 size={15} />
                <span>{showTokens ? 'Hide Algorithmic Tokens' : 'Inspect Tokenized Entity (DSA Step 1)'}</span>
                <span className="token-counter-pill">{tokens.length} tokens</span>
              </button>

              {showTokens && (
                <div className="tokens-display animate-fade-in">
                  <div className="tokens-list">
                    {tokens.map((token, idx) => (
                      <span key={idx} className="token-chip font-mono">
                        {token}
                      </span>
                    ))}
                  </div>
                  <span className="token-note">
                    *Stop-words filtered, units normalized into canonical bag-of-words.
                  </span>
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="product-actions-bar">
              <button
                type="button"
                className="btn-primary find-similar-btn"
                onClick={onFindSimilar}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="spinner-border"></div>
                    <span>Running Entity Resolution...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Find Similar Products</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-secondary dsa-breakdown-btn"
                onClick={onOpenAlgorithmModal}
              >
                <Cpu size={16} />
                <span>How Matching Works</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
