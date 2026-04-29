// models/PrintJob.js
const mongoose = require("mongoose");

const PrintJobSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  status: {
    type: String,
    enum: ["completed", "cancelled", "failed"],
    required: true,
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: Date.now },
  duration: { type: Number }, // seconds
  filamentUsed: { type: Number }, // grams
  layersCompleted: { type: Number },
  totalLayers: { type: Number },
  maxNozzleTemp: { type: Number },
  maxBedTemp: { type: Number },
  notes: { type: String },
});

// Auto-calculate duration before saving
PrintJobSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

module.exports = mongoose.model("PrintJob", PrintJobSchema);
