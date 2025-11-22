import "./ModeSelector.css";

interface ModeSelectorProps {
  mode: "earpiece" | "ui";
  setMode: (mode: "earpiece" | "ui") => void;
  style: string;
  setStyle: (style: string) => void;
}

const styles = [
  { value: "kind", label: "Kind" },
  { value: "stern", label: "Stern" },
  { value: "playful", label: "Playful" },
  { value: "trap", label: "Trap" },
  { value: "mysterious", label: "Mysterious" },
];

export default function ModeSelector({
  mode,
  setMode,
  style,
  setStyle,
}: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <div className="mode-buttons">
        <button
          className={`mode-button ${mode === "earpiece" ? "active" : ""}`}
          onClick={() => setMode("earpiece")}
        >
          🎧 Earpiece Mode
        </button>
        <button
          className={`mode-button ${mode === "ui" ? "active" : ""}`}
          onClick={() => setMode("ui")}
        >
          📱 UI Mode
        </button>
      </div>

      <div className="style-selector">
        <label>Argument Style:</label>
        <select
          className="style-select"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          {styles.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
