// src/App.js
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Dashboard from "./components/Dashboard";
import "./App.css";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

function App() {
  const [printerState, setPrinterState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [tempHistory, setTempHistory] = useState([]);
  const socketRef = useRef(null);
  const prevStatusRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => setConnected(true));
    socketRef.current.on("disconnect", () => setConnected(false));

    socketRef.current.on("printer:state", (state) => {
      setPrinterState(state);

      // Build temperature history (last 60 seconds)
      setTempHistory((prev) => {
        const newEntry = {
          time: new Date(state.timestamp).toLocaleTimeString(),
          nozzle: parseFloat(state.nozzleTemp),
          bed: parseFloat(state.bedTemp),
          nozzleTarget: state.nozzleTempTarget,
          bedTarget: state.bedTempTarget,
        };
        const updated = [...prev, newEntry];
        return updated.slice(-60); // keep last 60 data points
      });

      // Auto-notify completed job
      if (
        prevStatusRef.current === "printing" &&
        state.status === "cooling" &&
        state.progress >= 100
      ) {
        socketRef.current.emit("printer:completed", {
          fileName: state.fileName,
          filamentUsed: state.filamentUsed,
          totalLayers: state.totalLayers,
        });
      }
      prevStatusRef.current = state.status;
    });

    return () => socketRef.current.disconnect();
  }, []);

  const controls = {
    startPrint: (fileName) =>
      socketRef.current.emit("printer:start", { fileName }),
    pausePrint: () => socketRef.current.emit("printer:pause"),
    resumePrint: () => socketRef.current.emit("printer:resume"),
    cancelPrint: () => socketRef.current.emit("printer:cancel"),
  };

  return (
    <div className="App">
      <Dashboard
        state={printerState}
        connected={connected}
        tempHistory={tempHistory}
        controls={controls}
      />
    </div>
  );
}

export default App;
