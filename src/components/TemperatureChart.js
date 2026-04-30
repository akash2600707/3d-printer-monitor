// src/components/TemperatureChart.js
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#161a20", border: "1px solid #252b35",
      borderRadius: 6, padding: "10px 14px", fontFamily: "Share Tech Mono"
    }}>
      <p style={{ color: "#8892a4", fontSize: 11, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontSize: 12 }}>
          {p.name}: {p.value?.toFixed(1)}°C
        </p>
      ))}
    </div>
  );
};

export default function TemperatureChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: 220, display: "flex", alignItems: "center",
        justifyContent: "center", color: "#8892a4", fontFamily: "Share Tech Mono", fontSize: 13
      }}>
        Waiting for data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1c2028" />
        <XAxis
          dataKey="time"
          tick={{ fill: "#8892a4", fontSize: 10, fontFamily: "Share Tech Mono" }}
          tickLine={false}
          axisLine={{ stroke: "#252b35" }}
          interval={9}
        />
        <YAxis
          tick={{ fill: "#8892a4", fontSize: 10, fontFamily: "Share Tech Mono" }}
          tickLine={false}
          axisLine={{ stroke: "#252b35" }}
          domain={[0, 260]}
          tickFormatter={(v) => `${v}°`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: "Share Tech Mono", fontSize: 11, color: "#8892a4" }}
        />
        <ReferenceLine y={235} stroke="#ff174440" strokeDasharray="4 4" label="" />
        <Line
          type="monotone" dataKey="nozzle" name="Nozzle"
          stroke="#ff6b1a" strokeWidth={2} dot={false}
          activeDot={{ r: 4, fill: "#ff6b1a" }}
        />
        <Line
          type="monotone" dataKey="bed" name="Bed"
          stroke="#00b4d8" strokeWidth={2} dot={false}
          activeDot={{ r: 4, fill: "#00b4d8" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
