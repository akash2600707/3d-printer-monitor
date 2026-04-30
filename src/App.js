// src/App.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import { PrinterSimulator } from "./simulator";
import { saveJob } from "./historyService";
import Dashboard from "./components/Dashboard";
import "./App.css";

const simulator = new PrinterSimulator();

function App() {
  const [printerState, setPrinterState] = useState(simulator.getState());
  const [tempHistory, setTempHistory] = useState([]);
  const tickRef = useRef(null);

  // Tick every second
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const { state, completedJob } = simulator.tick();
      setPrinterState({ ...state });

      setTempHistory((prev) => {
        const entry = {
          time: new Date(state.timestamp).toLocaleTimeString(),
          nozzle: parseFloat(state.nozzleTemp),
          bed: parseFloat(state.bedTemp),
        };
        return [...prev, entry].slice(-60);
      });

      // Auto-save completed job to Supabase
      if (completedJob) {
        saveJob(completedJob);
      }
    }, 1000);

    return () => clearInterval(tickRef.current);
  }, []);

  const controls = {
    startPrint: useCallback((fileName) => {
      simulator.startPrint(fileName);
    }, []),

    pausePrint: useCallback(() => {
      simulator.pausePrint();
    }, []),

    resumePrint: useCallback(() => {
      simulator.resumePrint();
    }, []),

    cancelPrint: useCallback(async () => {
      const cancelledJob = simulator.cancelPrint();
      if (cancelledJob) {
        await saveJob(cancelledJob);
      }
    }, []),
  };

  return (
    <div className="App">
      <Dashboard
        state={printerState}
        connected={true}
        tempHistory={tempHistory}
        controls={controls}
      />
    </div>
  );
}

export default App;
