// routes/history.js
const express = require("express");
const router = express.Router();
const PrintJob = require("../models/PrintJob");

// GET all print history
router.get("/", async (req, res) => {
  try {
    const jobs = await PrintJob.find().sort({ endTime: -1 }).limit(50);
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST save a completed/cancelled job
router.post("/", async (req, res) => {
  try {
    const job = new PrintJob(req.body);
    await job.save();
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE a specific job
router.delete("/:id", async (req, res) => {
  try {
    await PrintJob.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET stats summary
router.get("/stats", async (req, res) => {
  try {
    const total = await PrintJob.countDocuments();
    const completed = await PrintJob.countDocuments({ status: "completed" });
    const totalFilament = await PrintJob.aggregate([
      { $group: { _id: null, total: { $sum: "$filamentUsed" } } },
    ]);
    const totalTime = await PrintJob.aggregate([
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalJobs: total,
        completedJobs: completed,
        successRate: total ? ((completed / total) * 100).toFixed(1) : 0,
        totalFilamentUsed: totalFilament[0]?.total?.toFixed(1) || 0,
        totalPrintTime: totalTime[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
