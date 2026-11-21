# Salon Queue Management System

**Live demo:** https://salon-queue-sandy.vercel.app  
**Hosted on:** Vercel (frontend) + Node/Express (backend)  
**Staff Test PIN:** `1234` (or click "Quick Demo Staff Login")

---

## About

**StyleQ** is a high-performance, real-time salon queue management system designed for high-end boutique barber lounges and salons. It eliminates chaotic weekend waiting lines by empowering guests to join the virtual line from their mobile devices, track their exact queue position with real-time countdowns, and receive instant celebratory notifications when their stylist is ready.

Staff manage guest throughput via a dedicated **Reception Command Dashboard**, barbers control seat sessions on mobile **Stylist HUDs**, and waiting areas are synchronized via a **3D Digital TV Billboard**.

---

## 🌟 Key Features

1. **📱 Remote Mobile Queue Joining (`/join`)**
   - Multi-treatment selection (up to 3 services with live duration & pricing calculations).
   - Stylist preference selection (choose *Ravi*, *Amit*, *Imran*, or *Any Barber (Fastest)*).
   - Input validation (strict 10-digit phone number check and duplicate reservation protection).

2. **🎫 3D Holographic VIP Ticket Pass (`/status/:id`)**
   - Live token display (e.g. `S-01`, `S-02`, ...) with real-time wait estimation.
   - Dynamic 4-stage progression indicator (*Reserved* → *Standby* → *Head Over* → *In Chair*).
   - "Start coming to the salon" alert banner when 2nd in line.
   - Celebratory full-screen notification with **confetti burst** and chime when called.
   - Self-service spot cancellation with confirmation safety pop-up.

3. **🧾 Reception Command Center (`/reception`)**
   - Real-time station monitoring with active timers.
   - Fair First-Come, First-Served queue dispatching with strict barber preference enforcement.
   - `+ Add Walk-in` quick registration modal.
   - Waiting > 60 minutes highlighted with **amber warning badge**.
   - One-click `No-Show` and `Cancel` controls.

4. **✂️ Barber Stylist HUD (`/barber/:name`)**
   - Personalized stylist station view with live elapsed stopwatch timer.
   - `Start Service` → `Mark Done` one-tap workflow.
   - Next-in-line preview for this specific artisan.
   - `On Break` / `Available` toggle that updates the entire salon floor in real-time.

5. **📺 3D Waiting Lounge TV Billboard (`/display`)**
   - Live digital clock and active stylist podiums.
   - Next 5 tokens preview.
   - Newly called guest flash gold animation with auditory chime.

6. **⚙️ Executive Manager Suite (`/admin`)**
   - Service catalog management (edit names in English & Gujarati, prices, and durations).
   - Stylist shift roster (toggle on-duty/off-shift).
   - Emergency queue switch (Open/Closed for online booking).
   - Live KPI analytics (guests served, average wait time, no-shows).
   - **Database Control Panel**: 1-click demo data population and queue clear.

7. **🌐 Bilingual & Multi-Device Sync**
   - Instant toggle between **English** and **Gujarati (ગુજરાતી)** across all screens.
   - Cross-tab `storage` event sync + WebSocket broadcast.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3
- **State & Persistence**: Zustand with `localStorage` cross-tab sync
- **3D & Animation**: Three.js (interactive particle field & torus), Framer Motion, Canvas Confetti
- **Audio Synthesizer**: Web Audio API (tactile clicks, golden chimes, fanfare chords)
- **Backend**: Node.js, Express, WebSocket (`ws`)
- **Icons**: Lucide React

---

## 🚀 Running Locally

```bash
# Clone the repository
cd salon-queue

# Install dependencies
npm install

# Start both backend database server and frontend Vite app
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📦 Project Submission Structure

```
salon-queue/
├── AGENTS.md                  # Autonomous agent instructions & rules
├── README.md                  # Overview, live link & credentials
├── prompts.md                 # Complete history of vibe coding prompts
├── reflection.md              # Engineering reflection & troubleshooting
├── docs/
│   ├── 01-brief.md            # Problem, target personas & scope
│   ├── 02-screens.md          # Comprehensive UI specifications for all 7 screens
│   └── 03-flows-rules.md      # Queue logic, business rules & test checklist
├── server/
│   ├── database.js            # Persistent JSON database engine
│   ├── salon_data.json        # Database storage file
│   ├── seedData.js            # Realistic pre-seeded test data
│   └── server.js              # Express REST API & WebSocket server
├── src/
│   ├── components/            # 3D Canvas, Card3D, Navbar, StaffModal
│   ├── pages/                 # Home, Join, Status, Reception, Barber, Display, Admin
│   ├── store/queueStore.js    # Queue logic & real-time synchronization
│   ├── utils/audio.js         # Web Audio API sound synthesizer
│   └── lang/strings.js        # English & Gujarati bilingual dictionary
└── vercel.json                # Single Page App rewrite rules for Vercel
```
