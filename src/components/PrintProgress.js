// src/components/PrintProgress.js
import React from "react";
import "./PrintProgress.css";

function formatTime(seconds) {
  if (!seconds) return "--:--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}h ${m}m`
    : `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function PrintProgress({ state }) {
  const {
    status, progress, currentLayer, totalLayers,
    printTimeElapsed, printTimeRemaining, filamentUsed
  } = state;

  const isPrinting = ["printing", "heating", "paused"].includes(status);

  return (
    <div className="print-progress">
      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
          <div className="progress-bar-glow" style={{ left: `${progress}%` }} />
        </div>
        <div className="progress-percentage">{progress.toFixed(1)}%</div>
      </div>

      {/* Stats Grid */}
      <div className="progress-stats">
        <div className="progress-stat">
          <span className="stat-label">LAYER</span>
          <span className="stat-value">
            {isPrinting ? `${currentLayer} / ${totalLayers}` : "-- / --"}
          </span>
        </div>
        <div className="progress-stat">
          <span className="stat-label">ELAPSED</span>
          <span className="stat-value">{formatTime(printTimeElapsed)}</span>
        </div>
        <div className="progress-stat">
          <span className="stat-label">REMAINING</span>
          <span className="stat-value">{formatTime(printTimeRemaining)}</span>
        </div>
        <div className="progress-stat">
          <span className="stat-label">FILAMENT</span>
          <span className="stat-value">{filamentUsed.toFixed(2)}g</span>
        </div>
      </div>

      {/* Layer progress bar */}
      {totalLayers > 0 && (
        <div className="layer-progress">
          <span className="layer-label">LAYERS</span>
          <div className="layer-track">
            {Array.from({ length: Math.min(totalLayers, 60) }).map((_, i) => (
              <div
                key={i}
                className={`layer-tick ${
                  i < Math.floor((currentLayer / totalLayers) * Math.min(totalLayers, 60))
                    ? "done"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
