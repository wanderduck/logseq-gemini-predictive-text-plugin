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

  // It should appear 33px below and 13px to the right of the cursor's current location.
  const top = position.top + 33;
  const left = position.left + 13;

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
