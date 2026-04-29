// server.js — Main server entry point
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const PrinterSimulator = require("./simulator");
const historyRoutes = require("./routes/history");
const PrintJob = require("./models/PrintJob");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err.message));

// Routes
app.use("/api/history", historyRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Printer Simulator ---
const printer = new PrinterSimulator();
let tickInterval = null;
let printStartTime = null;
let maxNozzleTemp = 0;
let maxBedTemp = 0;

// Emit printer state every second
tickInterval = setInterval(() => {
  const state = printer.tick();
  io.emit("printer:state", state);

  // Track max temps for history
  if (state.nozzleTemp > maxNozzleTemp) maxNozzleTemp = state.nozzleTemp;
  if (state.bedTemp > maxBedTemp) maxBedTemp = state.bedTemp;
}, 1000);

// --- Socket.IO Events ---
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send current state immediately on connect
  socket.emit("printer:state", printer.getState());

  // Start print
  socket.on("printer:start", async (data) => {
    const fileName = data?.fileName || "print_job.gcode";
    printer.startPrint(fileName);
    printStartTime = new Date();
    maxNozzleTemp = 0;
    maxBedTemp = 0;
    io.emit("printer:started", { fileName });
    console.log(`🖨️  Print started: ${fileName}`);
  });

  // Pause print
  socket.on("printer:pause", () => {
    printer.pausePrint();
    io.emit("printer:paused");
  });

  // Resume print
  socket.on("printer:resume", () => {
    printer.resumePrint();
    io.emit("printer:resumed");
  });

  // Cancel print + save to MongoDB
  socket.on("printer:cancel", async () => {
    const currentState = printer.getState();
    printer.cancelPrint();

    // Save cancelled job to history
    if (printStartTime && currentState.fileName) {
      try {
        const job = new PrintJob({
          fileName: currentState.fileName,
          status: "cancelled",
          startTime: printStartTime,
          endTime: new Date(),
          filamentUsed: currentState.filamentUsed,
          layersCompleted: currentState.currentLayer,
          totalLayers: currentState.totalLayers,
          maxNozzleTemp: parseFloat(maxNozzleTemp.toFixed(1)),
          maxBedTemp: parseFloat(maxBedTemp.toFixed(1)),
        });
        await job.save();
        io.emit("history:updated");
      } catch (err) {
        console.error("Failed to save job history:", err.message);
      }
    }
    io.emit("printer:cancelled");
    printStartTime = null;
  });

  // Auto-save when print completes (detected via state polling)
  socket.on("printer:completed", async (data) => {
    if (printStartTime) {
      try {
        const job = new PrintJob({
          fileName: data.fileName,
          status: "completed",
          startTime: printStartTime,
          endTime: new Date(),
          filamentUsed: data.filamentUsed,
          layersCompleted: data.totalLayers,
          totalLayers: data.totalLayers,
          maxNozzleTemp: parseFloat(maxNozzleTemp.toFixed(1)),
          maxBedTemp: parseFloat(maxBedTemp.toFixed(1)),
        });
        await job.save();
        io.emit("history:updated");
      } catch (err) {
        console.error("Failed to save completed job:", err.message);
      }
      printStartTime = null;
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready`);
});
