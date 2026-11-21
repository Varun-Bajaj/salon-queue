# Salon Queue Management System

**Live demo:** https://salon-queue-yourname.vercel.app
**Hosted on:** Vercel (frontend)

> Replace the demo URL above with your actual Vercel deployment link.

**Staff access:**
- Reception: `/reception` (no PIN required for demo)
- Barber view: `/barber/ravi`, `/barber/amit`, `/barber/imran`
- TV Display: `/display`
- Admin: `/admin`

---

## About

A real-time salon queue management system built with React + Vite + Tailwind CSS.

Customers join from their phone, track their position live, and get notified when it's their turn. Staff manage the queue through a reception dashboard. A TV display shows the current state.

## Features

- 📱 Customer queue joining with service selection (up to 3)
- ⚡ Barber preference or "Any Barber" option
- 🔢 Live token system (S-01, S-02, …)
- 📍 Real-time position & estimated wait time
- 🎉 "It's your turn!" full-screen notification
- 🧾 Reception dashboard: call next, add walk-ins, mark no-shows
- 💈 Barber view: start/done, break toggle
- 📺 TV display with auto-flash on new calls
- ⚙️ Admin: manage services, barbers on duty, open/close queue
- 🇮🇳 English + Gujarati language toggle
- 💾 Persists via localStorage (works across browser tabs)

## Tech Stack

- React 18 + Vite
- Tailwind CSS (charcoal + gold theme)
- Zustand (state + localStorage persistence)
- React Router v6
- Lucide React icons

## Running locally

```bash
npm install
npm run dev
```

Then open: http://localhost:5173

## Project structure

```
salon-queue/
├── AGENTS.md
├── docs/
│   ├── 01-brief.md
│   ├── 02-screens.md
│   └── 03-flows-rules.md
├── src/
│   ├── App.jsx           ← Router + language helper
│   ├── main.jsx
│   ├── index.css         ← Tailwind + custom styles
│   ├── lang/
│   │   └── strings.js    ← All UI text (EN + Gujarati)
│   ├── store/
│   │   └── queueStore.js ← All queue logic (Zustand)
│   ├── components/
│   │   └── LangToggle.jsx
│   └── pages/
│       ├── Home.jsx
│       ├── JoinQueue.jsx
│       ├── MyStatus.jsx
│       ├── Reception.jsx
│       ├── BarberView.jsx
│       ├── Display.jsx
│       └── Admin.jsx
└── prompts.md
```
