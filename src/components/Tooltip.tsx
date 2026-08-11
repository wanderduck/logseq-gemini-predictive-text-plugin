import React from 'react';
import './Tooltip.css';

export interface TooltipProps {
  suggestions: string[];
  position: { left: number; top: number; rect?: DOMRect } | null;
  onAccept: (suggestion: string) => void;
  onReject: () => void;
  isLoading: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ suggestions, position, onAccept, isLoading }) => {
  if (!position) return null;

  // We add some offset so it appears below the cursor
  const top = position.top + (position.rect?.height || 20) + 5;
  const left = position.left;

  return (
    <div 
      className="predictive-tooltip" 
      style={{ top: `${top}px`, left: `${left}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {isLoading ? (
        <div className="tooltip-loading">Thinking...</div>
      ) : suggestions.length === 0 ? (
        <div className="tooltip-empty">No suggestions</div>
      ) : (
        <ul className="suggestion-list">
          {suggestions.map((s, idx) => (
            <li key={idx} className="suggestion-item" onClick={() => onAccept(s)}>
              <span className="suggestion-shortcut">{idx + 1}</span> {s}
            </li>
          ))}
        </ul>
      )}
      <div className="tooltip-footer">
        <small>Use <strong>TAB</strong> to accept first, or <strong>ESC</strong> to reject.</small>
      </div>
    </div>
  );
};
