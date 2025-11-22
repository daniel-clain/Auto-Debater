import { DebateSummary as DebateSummaryType } from "../../../shared/types";
import "./DebateSummary.css";

interface DebateSummaryProps {
  summary: DebateSummaryType | null;
}

export default function DebateSummary({ summary }: DebateSummaryProps) {
  if (!summary) {
    return (
      <div className="debate-summary">
        <h3>Debate Summary</h3>
        <p className="summary-placeholder">Waiting for arguments...</p>
      </div>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "good":
        return "#4ade80";
      case "deteriorating":
        return "#fbbf24";
      case "critical":
        return "#f87171";
      default:
        return "#9ca3af";
    }
  };

  const getToneEmoji = (score: number) => {
    if (score > 0.3) return "😊";
    if (score > 0) return "🙂";
    if (score > -0.3) return "😐";
    if (score > -0.7) return "😠";
    return "😡";
  };

  return (
    <div className="debate-summary">
      <h3>Debate Summary</h3>
      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">Total Arguments</span>
          <span className="stat-value">{summary.totalArguments}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Your Arguments</span>
          <span className="stat-value">{summary.userArguments}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Opponent Arguments</span>
          <span className="stat-value">{summary.opponentArguments}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Opponent Tone</span>
          <span className="stat-value">
            {getToneEmoji(summary.opponentToneScore)}{" "}
            {(summary.opponentToneScore * 100).toFixed(0)}%
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Debate Health</span>
          <span
            className="stat-value health-indicator"
            style={{ color: getHealthColor(summary.debateHealth) }}
          >
            {summary.debateHealth.toUpperCase()}
          </span>
        </div>

        {summary.boundaryViolations > 0 && (
          <div className="stat-item warning">
            <span className="stat-label">⚠️ Boundary Violations</span>
            <span className="stat-value">{summary.boundaryViolations}</span>
          </div>
        )}
      </div>
    </div>
  );
}
