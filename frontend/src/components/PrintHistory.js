// src/components/PrintHistory.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PrintHistory.css";

function formatDuration(seconds) {
  if (!seconds) return "--";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function PrintHistory() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([
        axios.get("/api/history"),
        axios.get("/api/history/stats"),
      ]);
      setJobs(jobsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/history/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (loading) {
    return (
      <div className="history-loading">
        Loading print history...
      </div>
    );
  }

  return (
    <div className="print-history">
      {/* Stats Summary */}
      {stats && (
        <div className="history-stats">
          <div className="hist-stat">
            <span className="hist-stat-value">{stats.totalJobs}</span>
            <span className="hist-stat-label">TOTAL PRINTS</span>
          </div>
          <div className="hist-stat">
            <span className="hist-stat-value">{stats.successRate}%</span>
            <span className="hist-stat-label">SUCCESS RATE</span>
          </div>
          <div className="hist-stat">
            <span className="hist-stat-value">{stats.totalFilamentUsed}g</span>
            <span className="hist-stat-label">FILAMENT USED</span>
          </div>
          <div className="hist-stat">
            <span className="hist-stat-value">{formatDuration(stats.totalPrintTime)}</span>
            <span className="hist-stat-label">TOTAL PRINT TIME</span>
          </div>
        </div>
      )}

      {/* Job List */}
      {jobs.length === 0 ? (
        <div className="no-history">
          <p>No print history yet. Start your first print!</p>
        </div>
      ) : (
        <div className="history-table">
          <div className="history-header">
            <span>FILE NAME</span>
            <span>STATUS</span>
            <span>DATE</span>
            <span>DURATION</span>
            <span>FILAMENT</span>
            <span>LAYERS</span>
            <span></span>
          </div>
          {jobs.map((job) => (
            <div key={job._id} className="history-row">
              <span className="job-filename">📄 {job.fileName}</span>
              <span className={`job-status status-${job.status}`}>
                {job.status === "completed" ? "✅" : job.status === "cancelled" ? "❌" : "⚠️"}
                {" "}{job.status.toUpperCase()}
              </span>
              <span className="job-date">
                {new Date(job.endTime).toLocaleDateString()}
              </span>
              <span className="job-duration">{formatDuration(job.duration)}</span>
              <span className="job-filament">{job.filamentUsed?.toFixed(1)}g</span>
              <span className="job-layers">
                {job.layersCompleted}/{job.totalLayers}
              </span>
              <button
                className="delete-btn"
                onClick={() => handleDelete(job._id)}
                title="Delete"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
