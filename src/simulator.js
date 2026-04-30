// src/simulator.js — OctoPrint-style 3D Printer Simulator
// Runs entirely in the browser. Swap tick() for real OctoPrint API when printer is available.

export class PrinterSimulator {
  constructor() {
    this.state = {
      status: "idle",
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
    this.maxNozzleTemp = 0;
    this.maxBedTemp = 0;
    this.printStartTime = null;
  }

  _rampTemp(current, target, rate = 3) {
    if (Math.abs(current - target) < rate) return target;
    return current + (target > current ? rate : -rate) + (Math.random() - 0.5);
  }

  startPrint(fileName = "benchy.gcode") {
    if (this.state.status === "printing" || this.state.status === "heating") return;
    this.currentJob = {
      fileName,
      totalLayers: Math.floor(Math.random() * 150) + 80,
      totalTime: Math.floor(Math.random() * 3600) + 1800,
      filamentTotal: parseFloat((Math.random() * 20 + 5).toFixed(2)),
    };
    this.printStartTime = new Date();
    this.maxNozzleTemp = 0;
    this.maxBedTemp = 0;
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

  pausePrint() {
    if (this.state.status === "printing") this.state.status = "paused";
  }

  resumePrint() {
    if (this.state.status === "paused") this.state.status = "printing";
  }

  cancelPrint() {
    const job = this.currentJob
      ? {
          fileName: this.state.fileName,
          status: "cancelled",
          startTime: this.printStartTime,
          endTime: new Date(),
          filamentUsed: this.state.filamentUsed,
          layersCompleted: this.state.currentLayer,
          totalLayers: this.state.totalLayers,
          maxNozzleTemp: parseFloat(this.maxNozzleTemp.toFixed(1)),
          maxBedTemp: parseFloat(this.maxBedTemp.toFixed(1)),
        }
      : null;

    this.state.status = "cooling";
    this.state.nozzleTempTarget = 0;
    this.state.bedTempTarget = 0;
    this.state.fanSpeed = 100;

    setTimeout(() => {
      this.state.status = "idle";
      this.state.fanSpeed = 0;
      this.state.fileName = "";
      this.currentJob = null;
      this.printStartTime = null;
    }, 10000);

    return job; // return for saving to Supabase
  }

  tick() {
    const s = this.state;

    // Temperature ramp
    s.nozzleTemp = parseFloat(this._rampTemp(s.nozzleTemp, s.nozzleTempTarget).toFixed(1));
    s.bedTemp = parseFloat(this._rampTemp(s.bedTemp, s.bedTempTarget, 1.5).toFixed(1));

    // Track max temps
    if (s.nozzleTemp > this.maxNozzleTemp) this.maxNozzleTemp = s.nozzleTemp;
    if (s.bedTemp > this.maxBedTemp) this.maxBedTemp = s.bedTemp;

    // Heating → Printing
    if (s.status === "heating" && s.nozzleTemp >= s.nozzleTempTarget - 5 && s.bedTemp >= s.bedTempTarget - 5) {
      s.status = "printing";
      s.fanSpeed = 100;
    }

    // Printing
    if (s.status === "printing" && this.currentJob) {
      s.printTimeElapsed += 1;
      s.printTimeRemaining = Math.max(0, this.currentJob.totalTime - s.printTimeElapsed);
      s.progress = parseFloat(Math.min(100, (s.printTimeElapsed / this.currentJob.totalTime) * 100).toFixed(1));
      s.currentLayer = Math.floor((s.progress / 100) * this.currentJob.totalLayers);
      s.filamentUsed = parseFloat(((s.progress / 100) * this.currentJob.filamentTotal).toFixed(2));
      s.nozzleTempTarget = 215 + (Math.random() - 0.5) * 2;
      s.bedTempTarget = 60 + (Math.random() - 0.5) * 1;

      // Completed
      if (s.progress >= 100) {
        s.status = "cooling";
        s.nozzleTempTarget = 0;
        s.bedTempTarget = 0;
        s.fanSpeed = 100;

        const completedJob = {
          fileName: this.state.fileName,
          status: "completed",
          startTime: this.printStartTime,
          endTime: new Date(),
          filamentUsed: s.filamentUsed,
          layersCompleted: s.totalLayers,
          totalLayers: s.totalLayers,
          maxNozzleTemp: parseFloat(this.maxNozzleTemp.toFixed(1)),
          maxBedTemp: parseFloat(this.maxBedTemp.toFixed(1)),
        };

        setTimeout(() => {
          this.state.status = "idle";
          this.state.fanSpeed = 0;
          this.currentJob = null;
          this.printStartTime = null;
        }, 15000);

        return { state: { ...s, timestamp: new Date().toISOString() }, completedJob };
      }
    }

    // Alert system
    s.alerts = [];
    if (s.nozzleTemp > 235) s.alerts.push({ type: "error", message: "⚠️ Nozzle overheating!" });
    if (s.bedTemp > 85) s.alerts.push({ type: "error", message: "⚠️ Bed overheating!" });
    if (s.status === "printing" && s.fanSpeed === 0) s.alerts.push({ type: "warn", message: "Fan not running during print" });

    return { state: { ...s, timestamp: new Date().toISOString() }, completedJob: null };
  }

  getState() {
    return { ...this.state, timestamp: new Date().toISOString() };
  }
}
