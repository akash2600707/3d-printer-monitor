// api/history/stats.js — Vercel Serverless Function
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { data, error } = await supabase.from("print_jobs").select("*");
  if (error) return res.status(500).json({ error: error.message });

  const total = data.length;
  const completed = data.filter((j) => j.status === "completed").length;
  const totalFilament = data.reduce((sum, j) => sum + (j.filament_used || 0), 0);
  const totalTime = data.reduce((sum, j) => sum + (j.duration || 0), 0);

  return res.status(200).json({
    data: {
      totalJobs: total,
      completedJobs: completed,
      successRate: total ? ((completed / total) * 100).toFixed(1) : 0,
      totalFilamentUsed: totalFilament.toFixed(1),
      totalPrintTime: totalTime,
    },
  });
};
