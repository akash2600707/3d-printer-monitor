// simulator.js — Mimics OctoPrint API data exactly
// When real printer is available, replace this with actual OctoPrint API calls

class PrinterSimulator {
  constructor() {
    this.state = {
      status: "idle", // idle | printing | paused | error | cooling
      nozzleTemp: 25,
      nozzleTempTarget: 0,
      bedTemp: 25,
      bedTempTarget: 0,
      fanSpeed: 0,
      progress: 0,
      currentLayer: 0,
      totalLayers: 0,
      filamentUsed: 0,
      printTimeElapsed: 0,
      printTimeRemaining: 0,
      fileName: "",
      alerts: [],
    };

    this.currentJob = null;
    this.interval = null;
  }

  // --- Simulate temperature ramp ---
  _rampTemp(current, target, rate = 3) {
    if (Math.abs(current - target) < rate) return target;
    return current + (target > current ? rate : -rate) + (Math.random() - 0.5);
  }

  // --- Start a new print job ---
  startPrint(fileName = "benchy.gcode") {
    if (this.state.status === "printing") return;

    this.currentJob = {
      fileName,
      totalLayers: Math.floor(Math.random() * 150) + 80, // 80–230 layers
      totalTime: Math.floor(Math.random() * 3600) + 1800, // 30–90 min
      filamentTotal: parseFloat((Math.random() * 20 + 5).toFixed(2)), // 5–25g
    };

    this.state = {
      ...this.state,
      status: "heating",
      fileName: this.currentJob.fileName,
      nozzleTempTarget: 215,
      bedTempTarget: 60,
      progress: 0,
      currentLayer: 0,
      totalLayers: this.currentJob.totalLayers,
      filamentUsed: 0,
      printTimeElapsed: 0,
      printTimeRemaining: this.currentJob.totalTime,
      alerts: [],
    };
  }

  // --- Pause print ---
  pausePrint() {
    if (this.state.status === "printing") {
      this.state.status = "paused";
    }
  }

  // --- Resume print ---
  resumePrint() {
    if (this.state.status === "paused") {
      this.state.status = "printing";
    }
  }

  // --- Cancel print ---
  cancelPrint() {
    this.state.status = "cooling";
    this.state.nozzleTempTarget = 0;
    this.state.bedTempTarget = 0;
    this.state.fanSpeed = 100;
    setTimeout(() => {
      this.state.status = "idle";
      this.state.fanSpeed = 0;
      this.state.fileName = "";
      this.currentJob = null;
    }, 10000);
  }

  // --- Tick — called every second ---
  tick() {
    const s = this.state;

    // Temperature simulation
    s.nozzleTemp = parseFloat(
      this._rampTemp(s.nozzleTemp, s.nozzleTempTarget).toFixed(1)
    );
    s.bedTemp = parseFloat(
      this._rampTemp(s.bedTemp, s.bedTempTarget, 1.5).toFixed(1)
    );

    // Heating phase → start printing once hot enough
    if (
      s.status === "heating" &&
      s.nozzleTemp >= s.nozzleTempTarget - 5 &&
      s.bedTemp >= s.bedTempTarget - 5
    ) {
      s.status = "printing";
      s.fanSpeed = 100;
    }

    // Printing phase
    if (s.status === "printing" && this.currentJob) {
      s.printTimeElapsed += 1;
      s.printTimeRemaining = Math.max(
        0,
        this.currentJob.totalTime - s.printTimeElapsed
      );
      s.progress = parseFloat(
        Math.min(
          100,
          (s.printTimeElapsed / this.currentJob.totalTime) * 100
        ).toFixed(1)
      );
      s.currentLayer = Math.floor(
        (s.progress / 100) * this.currentJob.totalLayers
      );
      s.filamentUsed = parseFloat(
        ((s.progress / 100) * this.currentJob.filamentTotal).toFixed(2)
      );

      // Small temp fluctuations during print
      s.nozzleTempTarget = 215 + (Math.random() - 0.5) * 2;
      s.bedTempTarget = 60 + (Math.random() - 0.5) * 1;

      // Print done
      if (s.progress >= 100) {
        s.status = "cooling";
        s.nozzleTempTarget = 0;
        s.bedTempTarget = 0;
        s.fanSpeed = 100;
        setTimeout(() => {
          s.status = "idle";
          s.fanSpeed = 0;
        }, 15000);
      }
    }

    // Alert system
    s.alerts = [];
    if (s.nozzleTemp > 235) {
      s.alerts.push({ type: "error", message: "⚠️ Nozzle overheating!" });
    }
    if (s.bedTemp > 85) {
      s.alerts.push({ type: "error", message: "⚠️ Bed overheating!" });
    }
    if (s.status === "printing" && s.fanSpeed === 0) {
      s.alerts.push({ type: "warn", message: "Fan not running during print" });
    }

    return this.getState();
  }

  getState() {
    return { ...this.state, timestamp: new Date().toISOString() };
  }
}

module.exports = PrinterSimulator;
