import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Database, Terminal, Cpu } from 'lucide-react';

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  sampleProducts,
  onSelectSample,
  selectedProductId,
  isAnalyzing
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <section className="hero-section">
      <div className="hero-glow-backdrop"></div>
      
      <div className="hero-content">
        {/* Top Feature Pill */}
        <div className="hero-pill-badge">
          <Cpu size={14} className="pill-icon text-indigo-400" />
          <span>Entity Resolution & Deduplication Pipeline</span>
        </div>

        {/* Heading */}
        <h1 className="hero-heading">
          Find the Same Product <br />
          <span className="gradient-text">Across Sellers</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Smart product matching using Data Structures & Algorithms
        </p>

        {/* Prominent Search Bar */}
        <form onSubmit={handleSubmit} className="hero-search-wrapper">
          <div className={`hero-search-box ${isFocused ? 'search-box-focused' : ''}`}>
            <Search className="search-icon" size={22} />
            <input
              type="text"
              className="search-input"
              placeholder="Search for a product… (e.g. iPhone 15 Pro, Sony XM5, MacBook Air)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear input"
              >
                ×
              </button>
            )}
            <button 
              type="submit" 
              className="btn-primary search-action-btn"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="spinner-border"></div>
                  <span>Resolving DSA...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Find Matches</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Picks / Sample Products */}
        <div className="hero-quick-picks">
          <span className="quick-picks-label">Sample Test Cases:</span>
          <div className="quick-picks-list">
            {sampleProducts.map((p) => {
              const isSelected = p.id === selectedProductId;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`quick-pick-pill ${isSelected ? 'pill-active' : ''}`}
                  onClick={() => onSelectSample(p)}
                >
                  <span className="pick-brand">{p.brand}</span>
                  <span className="pick-title">{p.name.split('(')[0].trim()}</span>
                  {isSelected && <span className="pick-dot"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Technical Stats Strip */}
        <div className="hero-tech-strip">
          <div className="tech-stat-item">
            <span className="stat-value font-mono">O(1)</span>
            <span className="stat-label">Inverted Index Lookup</span>
          </div>
          <div className="stat-divider"></div>
          <div className="tech-stat-item">
            <span className="stat-value font-mono">O(M·N)</span>
            <span className="stat-label">Levenshtein DP Matrix</span>
          </div>
          <div className="stat-divider"></div>
          <div className="tech-stat-item">
            <span className="stat-value font-mono">J(A, B)</span>
            <span className="stat-label">Jaccard Token Similarity</span>
          </div>
          <div className="stat-divider"></div>
          <div className="tech-stat-item">
            <span className="stat-value font-mono">99.2%</span>
            <span className="stat-label">Entity Resolution Precision</span>
          </div>
        </div>
      </div>
    </section>
  );
}
