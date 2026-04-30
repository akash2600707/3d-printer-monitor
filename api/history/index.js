// api/history/index.js — Vercel Serverless Function
// Keys live here (server only) — never exposed to browser

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,        // No REACT_APP_ prefix = server only
  process.env.SUPABASE_SERVICE_KEY // Service key — full access, stays secret
);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET — fetch all jobs
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("print_jobs")
      .select("*")
      .order("end_time", { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }

  // POST — save a new job
  if (req.method === "POST") {
    const job = req.body;
    const { data, error } = await supabase.from("print_jobs").insert([{
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
    }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ data });
  }

  return res.status(405).json({ error: "Method not allowed" });
};
