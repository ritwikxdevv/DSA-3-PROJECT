import React, { useState } from 'react';
import { 
  FileText, 
  Scissors, 
  Database, 
  GitMerge, 
  AlignLeft, 
  Calculator, 
  CheckCircle2, 
  ArrowRight,
  Info,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function AlgorithmPipeline({ onOpenExplainer }) {
  const [selectedStep, setSelectedStep] = useState(null);

  const steps = [
    {
      id: 1,
      name: "Product Data",
      subtitle: "Unstructured Input",
      icon: FileText,
      color: "#38bdf8",
      complexity: "O(N)",
      dataStructure: "JSON Document Store",
      description: "Heterogeneous product feeds from Amazon, Flipkart, Croma with messy titles, missing attributes, and varying formatting."
    },
    {
      id: 2,
      name: "Tokenization",
      subtitle: "Normalization",
      icon: Scissors,
      color: "#60a5fa",
      complexity: "O(L)",
      dataStructure: "Array / Hash Set",
      description: "Punctuation stripping, case-folding, storage unit canonicalization ('128 GB' → '128gb'), and stop-word filtering."
    },
    {
      id: 3,
      name: "Inverted Index",
      subtitle: "Candidate Filter",
      icon: Database,
      color: "#818cf8",
      complexity: "O(1) Lookup",
      dataStructure: "Hash Map <Token, Set<ID>>",
      description: "Bypasses naive O(N²) all-pairs quadratic explosion by quickly pruning non-overlapping listings through instant token lookup."
    },
    {
      id: 4,
      name: "Jaccard Similarity",
      subtitle: "Set Theory",
      icon: GitMerge,
      color: "#a78bfa",
      complexity: "O(|A| + |B|)",
      dataStructure: "Hash Set Intersection / Union",
      description: "Computes J(A, B) = |A ∩ B| / |A ∪ B|. Invariant to word-ordering differences across different sellers."
    },
    {
      id: 5,
      name: "Levenshtein Distance",
      subtitle: "Dynamic Programming",
      icon: AlignLeft,
      color: "#c084fc",
      complexity: "O(M · N)",
      dataStructure: "2D DP Matrix Tabulation",
      description: "Calculates minimum character edits (insertions, deletions, substitutions) to handle spelling typos and romanized variants."
    },
    {
      id: 6,
      name: "Weighted Score",
      subtitle: "Multi-Attribute",
      icon: Calculator,
      color: "#e879f9",
      complexity: "O(1)",
      dataStructure: "Weighted Linear Model",
      description: "Combines 45% Jaccard + 30% Levenshtein + 15% Brand equality + 10% Spec matching into a calibrated 0-100% confidence score."
    },
    {
      id: 7,
      name: "Product Match",
      subtitle: "Resolved Entity",
      icon: CheckCircle2,
      color: "#34d399",
      complexity: "O(K log K)",
      dataStructure: "Max Heap / Sorted List",
      description: "Identifies identical items across all merchants, clusters them into a single canonical product, and exposes price arbitrage."
    }
  ];

  return (
    <section className="algorithm-pipeline-section" id="dsa-pipeline-section">
      <div className="pipeline-header">
        <div className="section-pill">
          <Sparkles size={13} />
          <span>Core Algorithm Architecture</span>
        </div>
        <h2 className="pipeline-title">DSA Matching Pipeline</h2>
        <p className="pipeline-desc">
          High-performance Entity Resolution pipeline transforming raw, ambiguous e-commerce listings into unified product clusters.
        </p>
      </div>

      {/* Pipeline Flow Container */}
      <div className="pipeline-flow-container glass-panel">
        <div className="pipeline-steps-track">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            const isSelected = selectedStep === step.id;

            return (
              <React.Fragment key={step.id}>
                {/* Step Card */}
                <div 
                  className={`pipeline-step-node ${isSelected ? 'node-selected' : ''}`}
                  onClick={() => setSelectedStep(isSelected ? null : step.id)}
                  style={{ '--node-color': step.color }}
                >
                  <div className="node-number-badge font-mono">
                    0{step.id}
                  </div>
                  
                  <div className="node-icon-circle" style={{ borderColor: `${step.color}55`, backgroundColor: `${step.color}15` }}>
                    <Icon size={20} style={{ color: step.color }} />
                  </div>

                  <div className="node-text-content">
                    <span className="node-name">{step.name}</span>
                    <span className="node-subtitle">{step.subtitle}</span>
                  </div>

                  <div className="node-complexity-tag font-mono">
                    {step.complexity}
                  </div>
                </div>

                {/* Connecting Arrow */}
                {!isLast && (
                  <div className="pipeline-connector">
                    <div className="connector-line"></div>
                    <div className="connector-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Dynamic Detail Card if Step is Clicked */}
        {selectedStep && (
          <div className="step-expanded-details animate-fade-in">
            {(() => {
              const current = steps.find(s => s.id === selectedStep);
              const StepIcon = current.icon;
              return (
                <div className="expanded-inner-box">
                  <div className="expanded-title-bar">
                    <div className="expanded-icon" style={{ backgroundColor: `${current.color}20`, color: current.color }}>
                      <StepIcon size={20} />
                    </div>
                    <div>
                      <h4 className="expanded-name">
                        Step {current.id}: {current.name} — <span style={{ color: current.color }}>{current.subtitle}</span>
                      </h4>
                      <div className="expanded-meta-tags font-mono">
                        <span className="meta-pill">Time Complexity: {current.complexity}</span>
                        <span className="meta-pill">Primary Structure: {current.dataStructure}</span>
                      </div>
                    </div>
                  </div>
                  <p className="expanded-desc">{current.description}</p>
                </div>
              );
            })()}
          </div>
        )}

        {/* Bottom Helper Note */}
        <div className="pipeline-footer-bar">
          <div className="footer-tip">
            <Info size={15} />
            <span>Click any algorithm node above to inspect its DSA complexity and data structure.</span>
          </div>
          <button 
            type="button" 
            className="learn-more-btn"
            onClick={onOpenExplainer}
          >
            <span>Complete DSA Theory Docs</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
