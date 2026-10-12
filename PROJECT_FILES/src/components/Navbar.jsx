import React from 'react';
import { Layers, Sparkles, Cpu, BookOpen, ExternalLink } from 'lucide-react';

export default function Navbar({ onNavigate, activeTab }) {
  return (
    <header className="navbar-wrapper">
      <div className="app-container">
        <nav className="navbar">
          {/* Logo & Project Title */}
          <div className="navbar-brand" onClick={() => onNavigate('home')}>
            <div className="brand-icon-box">
              <Layers className="brand-icon" />
              <div className="icon-glow"></div>
            </div>
            <div className="brand-text">
              <div className="brand-title-row">
                <span className="brand-title">Product<span className="brand-title-accent">Match</span></span>
                <span className="brand-tag">DSA Engine</span>
              </div>
              <span className="brand-subtitle">Entity Resolution & Deduplication</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            <button 
              className={`nav-link-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              Home
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'product' ? 'active' : ''}`}
              onClick={() => onNavigate('product')}
            >
              Products
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'matching' ? 'active' : ''}`}
              onClick={() => onNavigate('matching')}
            >
              Matching Results
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
              onClick={() => onNavigate('pipeline')}
            >
              <Cpu size={15} />
              Algorithm Pipeline
            </button>
            <button 
              className={`nav-link-btn ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => onNavigate('comparison')}
            >
              Price Comparison
            </button>
          </div>

          {/* Navigation Actions */}
        </nav>
      </div>
    </header>
  );
}
