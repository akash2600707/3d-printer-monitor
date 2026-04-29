// src/components/StatusCard.js
import React from "react";
import "./StatusCard.css";

export default function StatusCard({ label, value, target, unit, icon, accentColor, danger }) {
  return (
    <div className={`status-card ${danger ? "danger" : ""}`} style={{ "--accent": accentColor }}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <div className="card-label">{label}</div>
        <div className="card-value">
          <span className="value-number">{typeof value === "number" ? value.toFixed(1) : "--"}</span>
          <span className="value-unit">{unit}</span>
        </div>
        {target !== undefined && target > 0 && (
          <div className="card-target">TARGET: {target.toFixed(0)}{unit}</div>
        )}
        {target !== undefined && target === 0 && (
          <div className="card-target">TARGET: OFF</div>
        )}
      </div>
      <div className="card-glow" />
    </div>
  );
}
