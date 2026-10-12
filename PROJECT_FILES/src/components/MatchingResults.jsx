import React, { useState } from 'react';
import { 
  Grid3X3, 
  ArrowUpDown, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Store
} from 'lucide-react';
import ProductCard from './ProductCard';

export default function MatchingResults({
  matches = [],
  referenceProduct,
  onViewDetails,
  isAnalyzing
}) {
  const [sortBy, setSortBy] = useState('score'); // 'score', 'price_asc', 'price_desc'
  const [selectedSeller, setSelectedSeller] = useState('ALL');

  // Extract unique sellers from matches
  const sellers = ['ALL', ...Array.from(new Set(matches.map(m => m.seller)))];

  // Find lowest price
  const lowestPrice = matches.length > 0 
    ? Math.min(...matches.map(m => m.price))
    : 0;

  // Filter matches
  let filtered = matches.filter(item => {
    if (selectedSeller !== 'ALL' && item.seller !== selectedSeller) return false;
    return true;
  });

  // Sort matches
  filtered.sort((a, b) => {
    if (sortBy === 'score') return (b.matchScore || 0) - (a.matchScore || 0);
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <section className="matching-results-section" id="matching-results-section">
      {/* Section Header */}
      <div className="results-header-bar">
        <div className="results-title-group">
          <div className="section-pill">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Entity Cluster Resolved</span>
          </div>
          <h2 className="results-heading">Matching Products</h2>
          <p className="results-subheading">
            Cross-seller product listings identified as identical entities via weighted Jaccard & Levenshtein scores.
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="results-controls">
          {/* Seller Filter */}
          <div className="control-box">
            <Store size={14} className="control-icon" />
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="control-select"
            >
              {sellers.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Sellers' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="control-box">
            <ArrowUpDown size={14} className="control-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="score">Sort by Match Score (Highest)</option>
              <option value="price_asc">Sort by Price (Lowest First)</option>
              <option value="price_desc">Sort by Price (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State during algorithmic resolution */}
      {isAnalyzing && (
        <div className="analyzing-state-box glass-panel">
          <div className="analyzing-spinner"></div>
          <h3 className="analyzing-title">Computing DSA Entity Resolution...</h3>
          <p className="analyzing-text">
            Filtering candidates via Inverted Index Hash Map → Calculating Jaccard similarity → Running 2D Levenshtein Dynamic Programming matrix.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isAnalyzing && filtered.length > 0 && (
        <>
          <div className="results-stats-bar">
            <span className="stats-count">
              Showing <strong>{filtered.length}</strong> matching products across <strong>{new Set(filtered.map(f => f.seller)).size}</strong> sellers
            </span>
            <span className="best-price-indicator">
              Lowest Price: <strong>₹{lowestPrice.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <div className="products-grid">
            {filtered.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                isBestPrice={item.price === lowestPrice}
                onViewDetails={onViewDetails}
                referencePrice={referenceProduct?.price}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!isAnalyzing && filtered.length === 0 && (
        <div className="empty-results-box glass-panel">
          <AlertTriangle size={36} className="empty-icon text-amber-400" />
          <h3 className="empty-title">No matching products found</h3>
          <p className="empty-desc">
            Try selecting a different product from the top sample list or modifying your search query to loosen candidate tokens.
          </p>
        </div>
      )}
    </section>
  );
}
