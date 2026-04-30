// src/historyService.js
// Calls Vercel API routes — Supabase keys never reach the browser

const BASE = "/api/history";

export async function saveJob(job) {
  try {
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
  } catch (err) {
    console.error("Failed to save job:", err.message);
  }
}

export async function fetchJobs() {
  try {
    const res = await fetch(BASE);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Failed to fetch jobs:", err.message);
    return [];
  }
}

export async function deleteJob(id) {
  try {
    await fetch(`${BASE}/${id}`, { method: "DELETE" });
  } catch (err) {
    console.error("Failed to delete job:", err.message);
  }
}

export async function fetchStats() {
  try {
    const res = await fetch(`${BASE}/stats`);
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error("Failed to fetch stats:", err.message);
    return null;
  }
}
