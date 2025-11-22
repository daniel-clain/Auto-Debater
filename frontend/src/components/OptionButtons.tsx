import { ArgumentStyle, Rebuttal } from "../../../shared/types";
import "./OptionButtons.css";

interface OptionButtonsProps {
  rebuttals: Rebuttal[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  style: ArgumentStyle;
}

export default function OptionButtons({
  rebuttals,
  selectedId,
  onSelect,
  style,
}: OptionButtonsProps) {
  // Pad to 6 buttons
  const displayRebuttals: (Rebuttal | null)[] = [...rebuttals];
  while (displayRebuttals.length < 6) {
    displayRebuttals.push(null);
  }

  return (
    <div className="option-buttons-container">
      <h3 className="options-title">Top Arguments</h3>
      <div className="options-grid">
        {displayRebuttals.slice(0, 6).map((rebuttal, index) => (
          <button
            key={rebuttal?.id || `empty-${index}`}
            className={`option-button ${
              selectedId === rebuttal?.id ? "selected" : ""
            } ${!rebuttal ? "empty" : ""}`}
            onClick={() => rebuttal && onSelect(rebuttal.id)}
            disabled={!rebuttal}
          >
            {rebuttal ? (
              <>
                <span className="option-priority">#{index + 1}</span>
                <span className="option-text">{rebuttal.text}</span>
                <span className="option-score">
                  Impact: {(rebuttal.impactScore * 100).toFixed(0)}%
                </span>
              </>
            ) : (
              <span className="option-placeholder">
                Waiting for argument...
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
