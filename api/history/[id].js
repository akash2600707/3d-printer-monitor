// api/history/[id].js — Vercel Serverless Function
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "DELETE")
    return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID required" });

  const { error } = await supabase.from("print_jobs").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
};
