import "./BoundaryWarning.css";

interface BoundaryWarningProps {
  message: string | null;
  onDismiss: () => void;
}

export default function BoundaryWarning({
  message,
  onDismiss,
}: BoundaryWarningProps) {
  if (!message) return null;

  return (
    <div className="boundary-warning">
      <div className="warning-content">
        <div className="warning-header">
          <span className="warning-icon">⚠️</span>
          <h3>Boundary Violation</h3>
        </div>
        <p className="warning-message">{message}</p>
        <button className="warning-dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
