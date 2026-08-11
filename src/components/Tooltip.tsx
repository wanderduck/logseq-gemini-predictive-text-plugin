import React from 'react';
import './Tooltip.css';

export interface TooltipProps {
  suggestions: string[];
  position: { left: number; top: number; rect?: DOMRect } | null;
  onAccept: (suggestion: string) => void;
  onReject: () => void;
  isLoading: boolean;
  selectedIndex: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ suggestions, position, onAccept, isLoading, selectedIndex }) => {
  if (!position) return null;

  // Calculate absolute screen position using rect
  const baseTop = position.rect ? position.rect.top + position.top : position.top;
  const baseLeft = position.rect ? position.rect.left + position.left : position.left;

  // It should appear 33px below and 13px to the right of the cursor's current location.
  const top = baseTop + 33;
  const left = baseLeft + 13;

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
            <li 
              key={idx} 
              className={`suggestion-item ${idx === selectedIndex ? 'selected' : ''}`} 
              onClick={() => onAccept(s)}
            >
              <span className="suggestion-shortcut">{idx + 1}</span> {s}
            </li>
          ))}
        </ul>
      )}
      <div className="tooltip-footer">
        <small>Use <strong>Arrows/Enter</strong> or numbers <strong>1-9</strong> to select. <strong>ESC</strong> to dismiss.</small>
      </div>
    </div>
  );
};
