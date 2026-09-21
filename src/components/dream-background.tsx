import type { CSSProperties } from "react";

const ribbons = ["mint", "sky", "lilac", "peach"] as const;

export function DreamBackground() {
  return (
    <div className="dream-background" aria-hidden="true">
      {ribbons.map((color, index) => (
        <div
          key={color}
          className={`dream-ribbon dream-ribbon--${color}`}
          style={{ "--ribbon-index": index } as CSSProperties}
        >
          <div className="dream-ribbon__shape" />
        </div>
      ))}
    </div>
  );
}
