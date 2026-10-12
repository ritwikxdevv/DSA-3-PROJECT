import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SelectedProductCard from './components/SelectedProductCard';
import AlgorithmPipeline from './components/AlgorithmPipeline';
import MatchingResults from './components/MatchingResults';
import PriceComparison from './components/PriceComparison';
import MatchDetailModal from './components/MatchDetailModal';
import AlgorithmExplainerModal from './components/AlgorithmExplainerModal';

import { SAMPLE_PRODUCTS, SELLER_CATALOG } from './data/mockProducts';
import { resolveEntities } from './utils/dsaMatching';
import { findMatchesAPI, searchProducts, fetchProducts, checkBackendHealth } from './services/api';
import './App.css';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('home');

  // Currently selected reference product (defaults to iPhone 15 Pro)
  const [selectedProduct, setSelectedProduct] = useState(SAMPLE_PRODUCTS[0]);
  
  // Search query string
  const [searchQuery, setSearchQuery] = useState('');

  // Resolved matches across sellers
  const [matches, setMatches] = useState([]);

  // Simulation loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState('connected');

  // Modal states
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  // Function to run the DSA entity resolution pipeline via Backend REST API
  const runResolutionPipeline = async (targetProduct) => {
    const productToMatch = targetProduct || selectedProduct;
    if (!productToMatch) return;

    setIsAnalyzing(true);

    try {
      // Call Node.js + Express backend REST API: POST /api/match
      const response = await findMatchesAPI(productToMatch);
      if (response && response.matches && response.matches.length > 0) {
        setMatches(response.matches);
        setBackendStatus('connected');
      } else {
        // Fallback to local DSA resolver if backend returned empty
        const fallbackResults = resolveEntities(productToMatch, SELLER_CATALOG);
        setMatches(fallbackResults);
      }
    } catch (apiError) {
      console.warn('[Backend Notice] /api/match call returned error or offline, using client DSA fallback:', apiError.message);
      setBackendStatus('offline');
      // Resilient fallback to local DSA matching engine
      const fallbackResults = resolveEntities(productToMatch, SELLER_CATALOG);
      setMatches(fallbackResults);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial resolution on component mount
  useEffect(() => {
    // Check backend health
    checkBackendHealth().then((health) => {
      if (health.status === 'online') {
        setBackendStatus('connected');
      }
    });

    runResolutionPipeline(SAMPLE_PRODUCTS[0]);
  }, []);

  // Handle sample selection from hero pills
  const handleSelectSample = (product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name.split('(')[0].trim());
    runResolutionPipeline(product);

    // Smooth scroll to product card
    const elem = document.getElementById('selected-product-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;

    // Check if query matches any sample product
    const queryLower = searchQuery.toLowerCase();
    const matchedSample = SAMPLE_PRODUCTS.find(p => 
      p.name.toLowerCase().includes(queryLower) ||
      p.brand.toLowerCase().includes(queryLower) ||
      p.category.toLowerCase().includes(queryLower)
    );

    if (matchedSample) {
      setSelectedProduct(matchedSample);
      runResolutionPipeline(matchedSample);
    } else {
      // Create on-the-fly dynamic query entity if user entered custom text
      const customEntity = {
        id: `CUSTOM-${Date.now()}`,
        name: searchQuery,
        brand: searchQuery.split(' ')[0] || 'Unknown',
        category: 'Electronics',
        description: `Custom query product searching across multi-merchant inverted indexes for: "${searchQuery}"`,
        price: 89999,
        seller: 'Direct Search Query',
        rating: 4.5,
        reviewsCount: 100,
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
        specs: {
          query: searchQuery,
          status: 'Dynamic DSA Search Entity'
        }
      };
      setSelectedProduct(customEntity);
      runResolutionPipeline(customEntity);
    }

    // Scroll to results
    const resultsElem = document.getElementById('matching-results-section');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle header navigation clicks
  const handleNavigate = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'product') {
      document.getElementById('selected-product-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'matching') {
      document.getElementById('matching-results-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'pipeline') {
      document.getElementById('dsa-pipeline-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'comparison') {
      document.getElementById('price-comparison-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-root">
      {/* 1. Header / Navbar */}
      <Navbar onNavigate={handleNavigate} activeTab={activeTab} />

      <main className="app-container">
        {/* 2. Hero Section */}
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          sampleProducts={SAMPLE_PRODUCTS}
          onSelectSample={handleSelectSample}
          selectedProductId={selectedProduct?.id}
          isAnalyzing={isAnalyzing}
        />

        {/* 3. Search / Input Product Section */}
        <SelectedProductCard
          product={selectedProduct}
          onFindSimilar={() => runResolutionPipeline(selectedProduct)}
          isAnalyzing={isAnalyzing}
          onOpenAlgorithmModal={() => setIsExplainerOpen(true)}
        />

        {/* 5. DSA Matching Explanation Pipeline */}
        <AlgorithmPipeline 
          onOpenExplainer={() => setIsExplainerOpen(true)}
        />

        {/* 4. Matching Results Section */}
        <MatchingResults
          matches={matches}
          referenceProduct={selectedProduct}
          onViewDetails={(item) => setDetailModalItem(item)}
          isAnalyzing={isAnalyzing}
        />

        {/* 6. Price Comparison Section */}
        <PriceComparison
          matches={matches}
          referenceProduct={selectedProduct}
          onViewDetails={(item) => setDetailModalItem(item)}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-container footer-content">
          <div className="footer-brand">
            <span className="footer-title">ProductMatch</span>
            <span className="footer-desc">
              E-Commerce Product Entity-Resolution & Matching Platform
            </span>
          </div>
          <div className="footer-links">
            <span className="footer-badge">Inverted Index + Jaccard + Levenshtein DP</span>
            <button 
              type="button" 
              className="learn-more-btn"
              onClick={() => setIsExplainerOpen(true)}
            >
              DSA Architecture Docs
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Detailed Algorithmic Trace Modal */}
      <MatchDetailModal
        isOpen={Boolean(detailModalItem)}
        onClose={() => setDetailModalItem(null)}
        referenceProduct={selectedProduct}
        matchedProduct={detailModalItem}
      />

      {/* 2. Academic DSA Theory Reference Modal */}
      <AlgorithmExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />
    </div>
  );
}
