import React from 'react';
import { Store, ShieldCheck, Tag, ExternalLink, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import MatchingScore from './MatchingScore';

export default function ProductCard({
  product,
  isBestPrice,
  onViewDetails,
  referencePrice
}) {
  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Price difference vs reference
  const priceDiff = referencePrice ? product.price - referencePrice : 0;

  return (
    <div className={`matched-product-card glass-panel ${isBestPrice ? 'best-price-highlight' : ''}`}>
      {/* Best Price Ribbon */}
      {isBestPrice && (
        <div className="best-price-badge-banner">
          <Zap size={13} fill="currentColor" />
          <span>Best Price Option</span>
        </div>
      )}

      {/* Card Header & Media */}
      <div className="card-media-wrapper">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="card-product-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
          }}
        />
        
        {/* Floating Matching Score Badge */}
        <div className="card-score-overlay">
          <MatchingScore score={product.matchScore || 90} size="compact" />
        </div>

        {/* Brand Tag */}
        <div className="card-brand-overlay">
          <Tag size={11} />
          <span>{product.brand}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body-content">
        {/* Seller Info & Match Status */}
        <div className="card-seller-row">
          <div className="seller-pill">
            <Store size={13} />
            <span className="seller-name-text">{product.seller}</span>
          </div>

          <div className="match-status-tag">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span>Matched</span>
          </div>
        </div>

        {/* Product Title */}
        <h4 className="card-product-name" title={product.name}>
          {product.name}
        </h4>

        {/* Price & Savings Row */}
        <div className="card-pricing-row">
          <div>
            <div className="card-current-price">{formatPrice(product.price)}</div>
            {priceDiff < 0 ? (
              <span className="price-savings-text">
                Save {formatPrice(Math.abs(priceDiff))}
              </span>
            ) : priceDiff > 0 ? (
              <span className="price-extra-text">
                +{formatPrice(priceDiff)} vs query
              </span>
            ) : (
              <span className="price-neutral-text">Same as query</span>
            )}
          </div>

          {product.freeDelivery && (
            <span className="delivery-perk-badge">Free Delivery</span>
          )}
        </div>

        {/* Delivery / Warranty mini meta */}
        <div className="card-mini-meta">
          <span className="meta-item">⚡ {product.deliveryDays || 2} Day Delivery</span>
          <span className="meta-dot">•</span>
          <span className="meta-item">🛡️ {product.warranty || 'Brand Warranty'}</span>
        </div>

        {/* Action Button */}
        <div className="card-actions-wrapper">
          <button
            type="button"
            className="view-details-btn"
            onClick={() => onViewDetails(product)}
          >
            <span>View Details</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
