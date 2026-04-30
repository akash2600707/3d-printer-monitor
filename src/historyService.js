// src/historyService.js — All Supabase DB operations
import { supabase } from "./supabaseClient";

// Save a completed or cancelled job
export async function saveJob(job) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("print_jobs").insert([
    {
      file_name: job.fileName,
      status: job.status,
      start_time: job.startTime,
      end_time: job.endTime,
      duration: job.endTime && job.startTime
        ? Math.floor((new Date(job.endTime) - new Date(job.startTime)) / 1000)
        : null,
      filament_used: job.filamentUsed,
      layers_completed: job.layersCompleted,
      total_layers: job.totalLayers,
      max_nozzle_temp: job.maxNozzleTemp,
      max_bed_temp: job.maxBedTemp,
    },
  ]);
  if (error) console.error("Failed to save job:", error.message);
  return data;
}

// Fetch all jobs (latest first)
export async function fetchJobs() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("print_jobs")
    .select("*")
    .order("end_time", { ascending: false })
    .limit(50);
  if (error) console.error("Failed to fetch jobs:", error.message);
  return data || [];
}

// Delete a job by ID
export async function deleteJob(id) {
  if (!supabase) return;
  const { error } = await supabase.from("print_jobs").delete().eq("id", id);
  if (error) console.error("Failed to delete job:", error.message);
}

// Fetch summary stats
export async function fetchStats() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("print_jobs").select("*");
  if (error || !data) return null;

  const total = data.length;
  const completed = data.filter((j) => j.status === "completed").length;
  const totalFilament = data.reduce((sum, j) => sum + (j.filament_used || 0), 0);
  const totalTime = data.reduce((sum, j) => sum + (j.duration || 0), 0);

  return {
    totalJobs: total,
    completedJobs: completed,
    successRate: total ? ((completed / total) * 100).toFixed(1) : 0,
    totalFilamentUsed: totalFilament.toFixed(1),
    totalPrintTime: totalTime,
  };
}
