<div align="center">

# 🖨️ 3D Printer Live Monitor Dashboard

**Real-time IoT monitoring system for FDM 3D printers**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Live Demo](#) · [GitHub](https://github.com/akash2600707/3d-printer-monitor) · [Portfolio](https://akashr.is-a.dev)

![Dashboard Preview](https://via.placeholder.com/900x500/0a0c0f/ff6b1a?text=3D+Printer+Monitor+Dashboard)

</div>

---

## 📌 Overview

A production-grade IoT dashboard that monitors 3D printer telemetry in real time. Built to simulate the [OctoPrint](https://octoprint.org/) REST API — every data point, temperature curve, and event mirrors what a real FDM printer sends. Swapping the simulator for a live printer requires changing **one line of code**.

This project demonstrates full-stack integration of **browser-based IoT simulation**, **serverless backend architecture**, **real-time data visualization**, and **secure cloud database storage** — core themes in data-intensive intelligent systems research.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🌡️ **Live Temperature Charts** | 60-second rolling nozzle + bed temperature history via Recharts |
| 📊 **Print Progress Tracker** | Progress bar with per-layer tick visualizer and time remaining |
| 🔢 **Layer Counter** | Real-time current/total layer tracking |
| 🧵 **Filament Usage** | Live grams consumed during print |
| ⚠️ **Overheat Alerts** | Auto-alerts when nozzle > 235°C or bed > 85°C |
| ▶️ **Print Controls** | Start / Pause / Resume / Cancel with state machine logic |
| 📋 **Print History** | All jobs saved to Supabase PostgreSQL with full metadata |
| 📈 **Stats Dashboard** | Success rate, total filament used, total print time |
| 🔒 **Secure Architecture** | Supabase keys stay server-side via Vercel serverless functions |
| 📱 **Mobile Responsive** | Industrial dark UI works on all screen sizes |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (React 18)                    │
│                                                         │
│  simulator.js ──── tick() every 1s ──► React State     │
│       │                                     │           │
│  OctoPrint-style                    StatusCards         │
│  data generator                     TempChart           │
│  (nozzle, bed,                      Progress            │
│   layers, fan,                      Controls            │
│   filament, alerts)                 AlertPanel          │
│                                         │               │
│  historyService.js ◄── save/fetch ──────┘               │
│       │                                                 │
└───────┼─────────────────────────────────────────────────┘
        │ fetch('/api/history')
        ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL SERVERLESS FUNCTIONS                 │
│                                                         │
│  /api/history/index.js   → GET list, POST save job      │
│  /api/history/stats.js   → GET summary stats            │
│  /api/history/[id].js    → DELETE job by id             │
│                                                         │
│  🔒 SUPABASE_URL + SERVICE_KEY live here only           │
│     Never sent to browser                               │
└───────┬─────────────────────────────────────────────────┘
        │ @supabase/supabase-js
        ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE (PostgreSQL)                   │
│                                                         │
│  print_jobs table                                       │
│  ├── id, file_name, status                              │
│  ├── start_time, end_time, duration                     │
│  ├── filament_used, layers_completed, total_layers      │
│  └── max_nozzle_temp, max_bed_temp                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🖥️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI and simulator runtime |
| **Charts** | Recharts | Live temperature visualization |
| **Backend** | Vercel Serverless Functions | Secure API proxy |
| **Database** | Supabase (PostgreSQL) | Print job history |
| **Hosting** | Vercel | Global CDN + auto-deploy |
| **Fonts** | Exo 2 + Share Tech Mono | Industrial UI design |

---

## 📁 Project Structure

```
3d-printer-monitor/
├── api/
│   └── history/
│       ├── index.js        ← GET all jobs / POST save job
│       ├── stats.js        ← GET stats summary
│       └── [id].js         ← DELETE job by id
├── src/
│   ├── App.js              ← Root: simulator loop + controls
│   ├── simulator.js        ← OctoPrint-style data engine
│   ├── historyService.js   ← API calls to serverless routes
│   └── components/
│       ├── Dashboard.js    ← Main layout + tab navigation
│       ├── StatusCard.js   ← Nozzle / Bed / Fan / Filament
│       ├── TemperatureChart.js ← Recharts 60s rolling chart
│       ├── PrintProgress.js    ← Progress + layer visualizer
│       ├── Controls.js         ← Print control buttons
│       ├── AlertPanel.js       ← Overheat alert system
│       └── PrintHistory.js     ← Supabase job history table
├── supabase_setup.sql      ← One-click DB table creation
├── vercel.json             ← Vercel routing config
└── .env.example            ← Environment variable template
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/akash2600707/3d-printer-monitor
cd 3d-printer-monitor
npm install
```

### 2. Supabase Database

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste `supabase_setup.sql` → **Run**
3. Go to **Settings → API** and copy:
   - Project URL
   - `service_role` key

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 4. Run

```bash
npm start
# Opens at http://localhost:3000
```

---

## 🚀 Deploy to Vercel

### Option A — Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import `akash2600707/3d-printer-monitor` from GitHub
3. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Click **Deploy**

Every `git push` to `main` triggers an automatic redeploy.

### Option B — CLI

```bash
npm i -g vercel
vercel
# Follow prompts — set env vars when asked
```

---

## 🔒 Security Design

The Supabase service key never reaches the browser. All database operations go through Vercel serverless API routes which act as a secure proxy:

```
❌ Insecure: Browser → Supabase (key exposed in JS bundle)
✅ Secure:   Browser → /api/history → Supabase (key server-only)
```

Environment variables without the `REACT_APP_` prefix are **never bundled** into the frontend JavaScript by Create React App.

---

## 🔌 Connecting a Real OctoPrint Printer

The simulator mimics OctoPrint's REST API exactly. When a real printer is available, replace the simulator tick in `src/App.js`:

```js
// Current (simulator):
const { state, completedJob } = simulator.tick();

// Real OctoPrint printer:
const res = await fetch('http://YOUR_PRINTER_IP/api/printer', {
  headers: { 'X-Api-Key': 'YOUR_OCTOPRINT_KEY' }
});
const state = await res.json();
```

One change. The entire dashboard, charts, history, and alerts work unchanged.

---

## 📊 Simulated Data Parameters

| Parameter | Realistic Range | Based On |
|-----------|----------------|---------|
| Nozzle Temperature | 180°C – 230°C | PLA/PETG profiles |
| Bed Temperature | 50°C – 80°C | Standard heated bed |
| Fan Speed | 0% – 100% | Layer cooling |
| Print Layers | 80 – 230 layers | 0.2mm layer height |
| Print Duration | 30 – 90 minutes | Typical desktop prints |
| Filament Used | 5g – 25g | Benchy to medium prints |

---

## 🤝 Contributing

Pull requests welcome. For major changes please open an issue first.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/real-printer-api`)
3. Commit changes (`git commit -m 'Add real OctoPrint integration'`)
4. Push to branch (`git push origin feature/real-printer-api`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built by Akash Ramesh**

Full Stack Developer · Chennai, India

[Portfolio](https://akashr.is-a.dev) · [LinkedIn](https://linkedin.com/in/akashr26) · [GitHub](https://github.com/akash2600707)

</div>
