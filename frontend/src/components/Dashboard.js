// src/components/Dashboard.js
import React, { useState } from "react";
import TemperatureChart from "./TemperatureChart";
import PrintProgress from "./PrintProgress";
import StatusCard from "./StatusCard";
import PrintHistory from "./PrintHistory";
import AlertPanel from "./AlertPanel";
import Controls from "./Controls";
import "./Dashboard.css";

export default function Dashboard({ state, connected, tempHistory, controls }) {
  const [activeTab, setActiveTab] = useState("monitor");

  if (!state) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Connecting to printer...</p>
      </div>
    );
  }

  const statusColor = {
    idle: "#8892a4",
    heating: "#ffd600",
    printing: "#00e676",
    paused: "#ff9100",
    cooling: "#00b4d8",
    error: "#ff1744",
  }[state.status] || "#8892a4";

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">PRINT<span className="logo-accent">WATCH</span></span>
          </div>
          <div className="header-subtitle">3D Printer Monitor v1.0</div>
        </div>

        <div className="header-center">
          <div className="status-badge" style={{ "--status-color": statusColor }}>
            <span className="status-dot" />
            <span className="status-text">{state.status.toUpperCase()}</span>
          </div>
          {state.fileName && (
            <div className="file-name">📄 {state.fileName}</div>
          )}
        </div>

        <div className="header-right">
          <div className={`connection-indicator ${connected ? "online" : "offline"}`}>
            <span className="conn-dot" />
            {connected ? "LIVE" : "OFFLINE"}
          </div>
          <div className="header-time">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Alerts */}
      {state.alerts?.length > 0 && <AlertPanel alerts={state.alerts} />}

      {/* Tab Navigation */}
      <nav className="tab-nav">
        {["monitor", "history"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "monitor" ? "📊 Monitor" : "📋 Print History"}
          </button>
        ))}
      </nav>

      {/* Monitor Tab */}
      {activeTab === "monitor" && (
        <div className="monitor-grid">
          {/* Status Cards Row */}
          <div className="status-row">
            <StatusCard
              label="Nozzle Temp"
              value={state.nozzleTemp}
              target={state.nozzleTempTarget}
              unit="°C"
              icon="🔥"
              accentColor="#ff6b1a"
              danger={state.nozzleTemp > 235}
            />
            <StatusCard
              label="Bed Temp"
              value={state.bedTemp}
              target={state.bedTempTarget}
              unit="°C"
              icon="🟧"
              accentColor="#00b4d8"
              danger={state.bedTemp > 85}
            />
            <StatusCard
              label="Fan Speed"
              value={state.fanSpeed}
              unit="%"
              icon="💨"
              accentColor="#00e676"
            />
            <StatusCard
              label="Filament Used"
              value={state.filamentUsed}
              unit="g"
              icon="🧵"
              accentColor="#ffd600"
            />
          </div>

          {/* Temperature Chart */}
          <div className="chart-section">
            <div className="section-title">
              <span>TEMPERATURE HISTORY</span>
              <span className="section-badge">LIVE</span>
            </div>
            <TemperatureChart data={tempHistory} />
          </div>

          {/* Print Progress + Controls side by side */}
          <div className="bottom-row">
            <div className="progress-section">
              <div className="section-title">PRINT PROGRESS</div>
              <PrintProgress state={state} />
            </div>
            <div className="controls-section">
              <div className="section-title">CONTROLS</div>
              <Controls state={state} controls={controls} />
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && <PrintHistory />}
    </div>
  );
}
