# 3D Printer Live Monitor Dashboard

> Real-time IoT monitoring dashboard for 3D printers — built with React, Node.js, Express, MongoDB, and Socket.IO.
> Simulates OctoPrint API data. Plug in a real printer later with one line change.

---

## 🏗️ Project Structure

```
3d-printer-monitor/
├── backend/
│   ├── server.js          ← Express + Socket.IO server
│   ├── simulator.js       ← OctoPrint-style data simulator
│   ├── models/
│   │   └── PrintJob.js    ← MongoDB schema
│   └── routes/
│       └── history.js     ← Print history API
└── frontend/
    └── src/
        ├── App.js
        └── components/
            ├── Dashboard.js
            ├── TemperatureChart.js
            ├── PrintProgress.js
            ├── StatusCard.js
            ├── Controls.js
            ├── AlertPanel.js
            └── PrintHistory.js
```

---

## ⚙️ Setup Instructions

### 1. MongoDB Atlas (Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Copy `backend/.env.example` → `backend/.env` and paste the connection string

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```
Server runs on: http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Dashboard opens at: http://localhost:3000

---

## 🌡️ Features

- ✅ Live nozzle + bed temperature charts (60-second history)
- ✅ Print progress bar with layer counter
- ✅ Filament usage tracking
- ✅ Print time elapsed + remaining
- ✅ Start / Pause / Resume / Cancel controls
- ✅ Overheat alerts (nozzle > 235°C, bed > 85°C)
- ✅ Print history saved to MongoDB
- ✅ Stats dashboard (total prints, success rate, total filament)
- ✅ Real-time via WebSocket (Socket.IO)
- ✅ Mobile responsive

---

## 🔌 Connecting Real OctoPrint Printer

When your real 3D printer is available, replace the simulator with OctoPrint API:

In `backend/server.js`, replace:
```js
const state = printer.tick(); // simulator
```
With:
```js
const state = await fetch('http://YOUR_PRINTER_IP/api/printer', {
  headers: { 'X-Api-Key': 'YOUR_OCTOPRINT_API_KEY' }
}).then(r => r.json());
```

That's it. One change. The entire frontend works unchanged.

---

## 🚀 Deployment

### Frontend → Vercel (Free)
```bash
cd frontend
npm run build
# Deploy /build folder to Vercel
```

### Backend → Render (Free)
1. Push backend to GitHub
2. Connect to Render.com
3. Set environment variables (MONGODB_URI, PORT)
4. Deploy

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Recharts, Socket.IO client |
| Backend | Node.js, Express.js |
| Realtime | Socket.IO (WebSocket) |
| Database | MongoDB + Mongoose |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📸 Screenshot

```
┌──────────────────────────────────────────────┐
│  ⬡ PRINTWATCH   [PRINTING]   🟢 LIVE        │
├──────────────────────────────────────────────┤
│ 🔥 215.3°C  🟧 60.1°C  💨 100%  🧵 4.2g   │
├──────────────────────────────────────────────┤
│         TEMPERATURE HISTORY (LIVE)           │
│  ───────────────────── Nozzle ── Bed ──     │
├──────────────────────────────────────────────┤
│  PROGRESS: ██████░░░░░░ 54.2%               │
│  Layer: 65/120  Remaining: 12m 30s          │
└──────────────────────────────────────────────┘
```

---

Built by Akash Ramesh | Full Stack Developer
Portfolio: https://akashr.is-a.dev
GitHub: https://github.com/akash2600707
