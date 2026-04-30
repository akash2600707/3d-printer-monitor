// src/components/PrintHistory.js
import React, { useEffect, useState } from "react";
import { fetchJobs, fetchStats, deleteJob } from "../historyService";
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
  const [noSupabase, setNoSupabase] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, statsData] = await Promise.all([fetchJobs(), fetchStats()]);
      if (jobsData === null && statsData === null) {
        setNoSupabase(true);
      } else {
        setJobs(jobsData || []);
        setStats(statsData);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
      setNoSupabase(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    await deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  if (loading) {
    return <div className="history-loading">Loading print history...</div>;
  }

  if (noSupabase) {
    return (
      <div className="print-history">
        <div className="no-history">
          <p>⚠️ Supabase not configured.</p>
          <p style={{ marginTop: 8, fontSize: 11 }}>
            Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-history">
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
            <div key={job.id} className="history-row">
              <span className="job-filename">📄 {job.file_name}</span>
              <span className={`job-status status-${job.status}`}>
                {job.status === "completed" ? "✅" : job.status === "cancelled" ? "❌" : "⚠️"}
                {" "}{job.status.toUpperCase()}
              </span>
              <span className="job-date">
                {new Date(job.end_time).toLocaleDateString()}
              </span>
              <span className="job-duration">{formatDuration(job.duration)}</span>
              <span className="job-filament">{Number(job.filament_used)?.toFixed(1)}g</span>
              <span className="job-layers">{job.layers_completed}/{job.total_layers}</span>
              <button className="delete-btn" onClick={() => handleDelete(job.id)} title="Delete">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
