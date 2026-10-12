import React from 'react';
import { 
  Zap, 
  TrendingDown, 
  ExternalLink, 
  Check, 
  ArrowUpDown, 
  Sparkles, 
  Store,
  ShieldCheck
} from 'lucide-react';
import MatchingScore from './MatchingScore';

export default function PriceComparison({ 
  matches = [], 
  referenceProduct,
  onViewDetails 
}) {
  if (!matches || matches.length === 0) return null;

  // Combine reference product with matches for complete cross-market comparison
  const allListings = [
    {
      id: referenceProduct.id,
      name: referenceProduct.name,
      seller: referenceProduct.seller,
      price: referenceProduct.price,
      matchScore: 100,
      isReference: true,
      deliveryDays: 1,
      warranty: "Official Brand Warranty"
    },
    ...matches.map(m => ({
      ...m,
      isReference: false
    }))
  ];

  // Find lowest and highest prices
  const prices = allListings.map(l => l.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const maxSavings = maxPrice - minPrice;

  // Format currency
  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="price-comparison-section" id="price-comparison-section">
      <div className="comparison-header">
        <div className="section-pill">
          <TrendingDown size={13} className="text-emerald-400" />
          <span>Cross-Merchant Price Arbitrage</span>
        </div>
        <div className="comparison-headline-row">
          <div>
            <h2 className="comparison-title">Seller Price Comparison</h2>
            <p className="comparison-subtitle">
              Comparing identical entity pricing across multi-channel retail sellers.
            </p>
          </div>

          {maxSavings > 0 && (
            <div className="savings-highlight-card glass-panel">
              <div className="savings-badge">
                <Zap size={14} fill="currentColor" />
                <span>Arbitrage Opportunity</span>
              </div>
              <div className="savings-amount">
                Save up to <span className="highlight-text">{formatPrice(maxSavings)}</span>
              </div>
              <span className="savings-caption">between lowest and highest retailer</span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table Container */}
      <div className="table-responsive-container glass-panel">
        <table className="comparison-table">
          <thead>
            <tr>
              <th className="th-product">Product</th>
              <th className="th-seller">Seller</th>
              <th className="th-price">Price</th>
              <th className="th-score">Match Score</th>
              <th className="th-delivery">Fulfillment</th>
              <th className="th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {allListings.map((item) => {
              const isBest = item.price === minPrice;
              const isRef = item.isReference;

              return (
                <tr 
                  key={item.id} 
                  className={`table-row ${isBest ? 'best-price-row' : ''} ${isRef ? 'reference-row' : ''}`}
                >
                  {/* Product Title */}
                  <td className="td-product">
                    <div className="table-product-title-wrap">
                      <span className="table-product-name" title={item.name}>
                        {item.name}
                      </span>
                      {isRef && (
                        <span className="reference-tag font-mono">Reference Entity</span>
                      )}
                    </div>
                  </td>

                  {/* Seller */}
                  <td className="td-seller">
                    <div className="table-seller-box">
                      <Store size={14} className="text-indigo-400" />
                      <span className="table-seller-name">{item.seller}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="td-price">
                    <div className="table-price-box">
                      <span className={`table-price-val ${isBest ? 'best-price-color' : ''}`}>
                        {formatPrice(item.price)}
                      </span>
                      {isBest && (
                        <span className="best-price-pill">
                          <Zap size={11} fill="currentColor" />
                          Best Price
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Match Score */}
                  <td className="td-score">
                    {isRef ? (
                      <div className="ref-score-badge">
                        <Check size={13} />
                        <span>100% (Base)</span>
                      </div>
                    ) : (
                      <MatchingScore score={item.matchScore || 90} size="compact" showLabel={false} />
                    )}
                  </td>

                  {/* Fulfillment */}
                  <td className="td-delivery">
                    <div className="table-delivery-info">
                      <span className="delivery-speed">⚡ {item.deliveryDays || 2} Days</span>
                      <span className="delivery-type">Free Shipping</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="td-action">
                    {isRef ? (
                      <span className="source-label">Source Item</span>
                    ) : (
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => onViewDetails(item)}
                      >
                        Inspect Match
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom helper info */}
      <div className="comparison-table-footer">
        <span className="footer-note">
          *Entity resolution verified using composite Jaccard-Levenshtein threshold. Prices retrieved from mock seller catalog.
        </span>
      </div>
    </section>
  );
}
