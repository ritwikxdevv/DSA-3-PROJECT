import React from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function MatchingScore({ score, size = 'medium', showLabel = true }) {
  // Determine color theme based on score
  const getScoreTheme = (val) => {
    if (val >= 90) {
      return {
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        text: '#34d399',
        glow: 'rgba(16, 185, 129, 0.25)',
        label: 'Exact Match',
        icon: ShieldCheck
      };
    } else if (val >= 80) {
      return {
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.35)',
        text: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.25)',
        label: 'Strong Match',
        icon: CheckCircle2
      };
    } else {
      return {
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        text: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.25)',
        label: 'Probable Match',
        icon: AlertCircle
      };
    }
  };

  const theme = getScoreTheme(score);
  const IconComponent = theme.icon;

  if (size === 'compact') {
    return (
      <div 
        className="matching-score-compact"
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
          color: theme.text,
          boxShadow: `0 0 12px ${theme.glow}`
        }}
      >
        <span className="score-number">{score}%</span>
        {showLabel && <span className="score-text">Match</span>}
      </div>
    );
  }

  return (
    <div 
      className={`matching-score-badge size-${size}`}
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
        boxShadow: `0 0 16px ${theme.glow}`
      }}
    >
      <div className="score-icon-wrap" style={{ color: theme.text }}>
        <IconComponent size={size === 'large' ? 20 : 16} />
      </div>
      <div className="score-details">
        <span className="score-value" style={{ color: theme.text }}>
          {score}% <span className="score-unit">Match</span>
        </span>
        {showLabel && (
          <span className="score-sublabel" style={{ color: theme.text }}>
            {theme.label}
          </span>
        )}
      </div>
    </div>
  );
}
