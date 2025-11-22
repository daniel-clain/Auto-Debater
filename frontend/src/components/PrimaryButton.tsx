import "./PrimaryButton.css";

interface PrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function PrimaryButton({
  onPress,
  disabled,
}: PrimaryButtonProps) {
  return (
    <button
      className={`primary-button ${disabled ? "disabled" : ""}`}
      onClick={onPress}
      disabled={disabled}
      aria-label="Get next argument advice"
    >
      <div className="button-content">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
            fill="currentColor"
          />
        </svg>
        <span className="button-text">
          {disabled ? "Processing..." : "Next Argument"}
        </span>
      </div>
    </button>
  );
}
