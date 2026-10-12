import React from 'react';
import { 
  X, 
  Cpu, 
  Database, 
  GitMerge, 
  AlignLeft, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  BookOpen,
  Code2
} from 'lucide-react';

export default function AlgorithmExplainerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="explainer-modal glass-panel" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="section-pill">
              <BookOpen size={13} />
              <span>DSA Academic Reference</span>
            </div>
            <h3 className="modal-heading">Data Structures & Algorithms Architecture</h3>
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-scrollable">
          {/* Section: Problem Statement */}
          <div className="explainer-card">
            <h4 className="explainer-section-title">
              <Layers size={17} className="text-blue-400" />
              1. The Entity Resolution Problem in E-Commerce
            </h4>
            <p className="explainer-text">
              In modern e-commerce, multiple distinct sellers list the exact same physical product under non-standardized titles.
              For instance:
            </p>
            <div className="example-quote-box font-mono">
              Seller A: "Apple iPhone 15 Pro (128 GB) - Natural Titanium"<br />
              Seller B: "Apple iPhone 15 Pro (128GB ROM, Natural Titanium)"<br />
              Seller C: "iPhone 15 Pro Apple 128GB - Titanium Natural Finish"
            </div>
            <p className="explainer-text">
              A naive string equality check (<code className="font-mono">string1 === string2</code>) fails 100% of the time. 
              Entity Resolution leverages Data Structures & Algorithms to determine if two records refer to the same real-world entity.
            </p>
          </div>

          {/* Section: DSA 1 - Inverted Index */}
          <div className="explainer-card">
            <h4 className="explainer-section-title">
              <Database size={17} className="text-indigo-400" />
              2. Candidate Pruning: Inverted Index (Hash Map)
            </h4>
            <p className="explainer-text">
              Comparing every incoming product against an entire catalog of <code className="font-mono">N</code> items takes <code className="font-mono">O(N)</code> per query, or <code className="font-mono">O(N²)</code> for all-pairs clustering. In a catalog with 1,000,000 items, <code className="font-mono">N² = 10¹²</code> operations, which is computationally intractable.
            </p>
            <div className="explainer-concept-box">
              <div className="concept-stat">
                <span className="concept-label">Data Structure</span>
                <span className="concept-val font-mono">Hash Map &lt;Token, Set&lt;DocID&gt;&gt;</span>
              </div>
              <div className="concept-stat">
                <span className="concept-label">Lookup Complexity</span>
                <span className="concept-val font-mono">O(1) average</span>
              </div>
              <div className="concept-stat">
                <span className="concept-label">Space Complexity</span>
                <span className="concept-val font-mono">O(T × K) unique tokens</span>
              </div>
            </div>
            <p className="explainer-text">
              The Inverted Index performs instant candidate retrieval, cutting down candidate items from millions to just 5-10 potential matches for intensive similarity computation.
            </p>
          </div>

          {/* Section: DSA 2 - Jaccard Token Similarity */}
          <div className="explainer-card">
            <h4 className="explainer-section-title">
              <GitMerge size={17} className="text-purple-400" />
              3. Bag-of-Words: Jaccard Set Similarity
            </h4>
            <p className="explainer-text">
              Different sellers write tokens in arbitrary sequence ("Apple iPhone" vs "iPhone Apple"). Jaccard Similarity operates on mathematical Sets and is inherently order-invariant:
            </p>
            <div className="math-formula-box font-mono">
              Jaccard Index J(A, B) = |A ∩ B| / |A ∪ B|
            </div>
            <p className="explainer-text">
              Set intersection and union are computed in <code className="font-mono">O(|A| + |B|)</code> time using Hash Sets.
            </p>
          </div>

          {/* Section: DSA 3 - Levenshtein Distance DP */}
          <div className="explainer-card">
            <h4 className="explainer-section-title">
              <AlignLeft size={17} className="text-pink-400" />
              4. Dynamic Programming: Levenshtein Distance
            </h4>
            <p className="explainer-text">
              To account for typos, abbreviations, and small formatting variances, we apply 2D Dynamic Programming matrix tabulation:
            </p>
            <div className="math-formula-box font-mono">
              DP[i][j] = min(DP[i-1][j] + 1, DP[i][j-1] + 1, DP[i-1][j-1] + cost)
            </div>
            <p className="explainer-text">
              Time Complexity: <code className="font-mono">O(M × N)</code>, where M and N are the lengths of the string titles.
            </p>
          </div>

          {/* Section: Backend & Database Connection */}
          <div className="explainer-card">
            <h4 className="explainer-section-title">
              <Code2 size={17} className="text-emerald-400" />
              5. Production Backend & Database Integration
            </h4>
            <p className="explainer-text">
              This frontend has been architected with clean decoupled modules (<code className="font-mono">src/utils/dsaMatching.js</code>). In production, this can seamlessly connect to:
            </p>
            <ul className="explainer-bullets font-mono">
              <li>• Node.js / Express microservice exposing <code className="font-mono">POST /api/match</code></li>
              <li>• MongoDB Atlas with compound text indexes or Lucene vector search</li>
              <li>• Redis in-memory cache for the Inverted Index token map</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-primary modal-done-btn"
            onClick={onClose}
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
