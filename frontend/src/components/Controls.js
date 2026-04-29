// src/components/Controls.js
import React, { useState } from "react";
import "./Controls.css";

const FILES = [
  "benchy.gcode",
  "calibration_cube.gcode",
  "phone_stand.gcode",
  "cable_clip.gcode",
  "vase_mode.gcode",
];

export default function Controls({ state, controls }) {
  const [selectedFile, setSelectedFile] = useState(FILES[0]);
  const { status } = state;

  const isIdle = status === "idle";
  const isPrinting = status === "printing";
  const isPaused = status === "paused";
  const isActive = ["printing", "heating", "paused"].includes(status);

  return (
    <div className="controls">
      {/* File selector */}
      <div className="file-selector">
        <label className="ctrl-label">SELECT FILE</label>
        <select
          value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.value)}
          disabled={!isIdle}
          className="file-select"
        >
          {FILES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Control Buttons */}
      <div className="ctrl-buttons">
        {/* Start */}
        <button
          className="ctrl-btn start"
          onClick={() => controls.startPrint(selectedFile)}
          disabled={!isIdle}
        >
          <span className="btn-icon">▶</span>
          START PRINT
        </button>

        {/* Pause / Resume */}
        {isPrinting && (
          <button className="ctrl-btn pause" onClick={controls.pausePrint}>
            <span className="btn-icon">⏸</span>
            PAUSE
          </button>
        )}
        {isPaused && (
          <button className="ctrl-btn resume" onClick={controls.resumePrint}>
            <span className="btn-icon">▶</span>
            RESUME
          </button>
        )}

        {/* Cancel */}
        <button
          className="ctrl-btn cancel"
          onClick={controls.cancelPrint}
          disabled={!isActive}
        >
          <span className="btn-icon">■</span>
          CANCEL
        </button>
      </div>

      {/* Status Info */}
      <div className="ctrl-status">
        {status === "heating" && (
          <p className="status-msg heating">🔥 Heating to target temperature...</p>
        )}
        {status === "cooling" && (
          <p className="status-msg cooling">❄️ Cooling down...</p>
        )}
        {status === "paused" && (
          <p className="status-msg paused">⏸ Print paused</p>
        )}
        {status === "idle" && (
          <p className="status-msg idle">✅ Ready to print</p>
        )}
      </div>
    </div>
  );
}
