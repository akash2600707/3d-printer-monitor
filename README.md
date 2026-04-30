# 🖨️ 3D Printer Live Monitor Dashboard

> Real-time IoT monitoring dashboard for 3D printers — React + Supabase + Vercel.
> Simulates OctoPrint API data in-browser. Connect a real printer with one line change.

---

## 🏗️ Architecture

```
Browser (React)
  ├── simulator.js        ← OctoPrint-style data generator (runs in browser)
  ├── historyService.js   ← Supabase DB operations
  └── components/
        ├── Dashboard, StatusCard, TemperatureChart
        ├── PrintProgress, Controls, AlertPanel
        └── PrintHistory  ← Supabase-backed job history

Supabase (PostgreSQL)  ← print_jobs table
Vercel                 ← Hosts React app on global CDN
```

---

## ⚙️ Setup

### 1. Supabase
1. [supabase.com](https://supabase.com) → New Project
2. SQL Editor → paste `supabase_setup.sql` → Run
3. Settings → API → copy Project URL + Anon key

### 2. Local
```bash
git clone https://github.com/akash2600707/3d-printer-monitor
cd 3d-printer-monitor && npm install
cp .env.example .env   # add your Supabase keys
npm start
```

### 3. Vercel Deploy
Connect GitHub repo at [vercel.com](https://vercel.com) → add env variables → Deploy.

---

## 🌡️ Features
- Live temperature charts (60s rolling)
- Print progress with layer visualizer
- Overheat alerts (nozzle > 235°C, bed > 85°C)
- Print history saved to Supabase
- Stats: success rate, filament used, total print time
- Mobile responsive

## 🔌 Real Printer
Swap one line in App.js — replace `simulator.tick()` with OctoPrint API call.

---

**Stack:** React 18 · Recharts · Supabase · Vercel

Built by **Akash Ramesh** | [akashr.is-a.dev](https://akashr.is-a.dev)
