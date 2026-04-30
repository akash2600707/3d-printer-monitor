// src/components/AlertPanel.js
import React from "react";
import "./AlertPanel.css";

export default function AlertPanel({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="alert-panel">
      {alerts.map((alert, i) => (
        <div key={i} className={`alert alert-${alert.type}`}>
          <span className="alert-icon">{alert.type === "error" ? "🚨" : "⚠️"}</span>
          <span className="alert-message">{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
