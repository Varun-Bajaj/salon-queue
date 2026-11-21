import http from 'http'
import express from 'express'
import cors from 'cors'
import { WebSocketServer, WebSocket } from 'ws'
import { db } from './database.js'

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

// Broadcast helper to all connected browsers/devices
function broadcastState() {
  const message = JSON.stringify({
    type: 'STATE_UPDATE',
    payload: db.getState(),
  })
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

wss.on('connection', (ws) => {
  // Send current state immediately on connect
  ws.send(JSON.stringify({ type: 'STATE_UPDATE', payload: db.getState() }))
})

// ─── REST API Endpoints ──────────────────────────────────────────────

// Get full system state
app.get('/api/state', (req, res) => {
  res.json(db.getState())
})

// Join Queue
app.post('/api/join', (req, res) => {
  const { name, phone, serviceIds, preferredBarberId } = req.body
  const state = db.getState()

  // Prevent duplicate active booking
  const existing = state.queue.find(
    (c) => c.phone === phone && ['waiting', 'called', 'inChair'].includes(c.status)
  )
  if (existing) {
    return res.status(409).json({ error: 'duplicate', customerId: existing.id })
  }

  const selectedServices = state.services.filter((s) => serviceIds.includes(s.id))
  const totalMinutes = selectedServices.reduce((sum, s) => sum + s.minutes, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)

  // Waiting estimate
  const activeBarbers = state.barbers.filter((b) => b.onDuty && !b.onBreak).length || 1
  const waitingTotal = state.queue
    .filter((c) => c.status === 'waiting')
    .reduce((sum, c) => sum + c.totalMinutes, 0)
  const waitMin = Math.ceil((waitingTotal + totalMinutes) / activeBarbers)

  const tokenNumber = state._tokenCounter || (state.queue.length + 1)
  const token = `S-${String(tokenNumber).padStart(2, '0')}`

  const newCustomer = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    token,
    name,
    phone,
    serviceIds,
    totalMinutes,
    totalPrice,
    preferredBarberId,
    status: 'waiting',
    joinedAt: Date.now(),
    calledAt: null,
    startedAt: null,
    doneAt: null,
    assignedBarberId: null,
    estimatedWaitMin: waitMin,
  }

  db.setState((prev) => ({
    ...prev,
    queue: [...prev.queue, newCustomer],
    _tokenCounter: (prev._tokenCounter || 1) + 1,
  }))

  broadcastState()
  res.json({ success: true, customer: newCustomer })
})

// Call Next for a Barber (respects preference rules)
app.post('/api/call-next', (req, res) => {
  const { barberId } = req.body
  const state = db.getState()
  const barber = state.barbers.find((b) => b.id === barberId)

  if (!barber || barber.currentCustomerId) {
    return res.status(400).json({ error: 'Barber is already busy or not found' })
  }

  // Find next customer: earliest customer who chose this barber or 'any'
  const waiting = state.queue
    .filter((c) => c.status === 'waiting')
    .sort((a, b) => a.joinedAt - b.joinedAt)

  const next = waiting.find(
    (c) => c.preferredBarberId === barberId || c.preferredBarberId === 'any'
  )

  if (!next) {
    return res.status(404).json({ error: 'No matching customers in queue' })
  }

  db.setState((prev) => ({
    ...prev,
    queue: prev.queue.map((c) =>
      c.id === next.id
        ? { ...c, status: 'called', calledAt: Date.now(), assignedBarberId: barberId }
        : c
    ),
    barbers: prev.barbers.map((b) =>
      b.id === barberId ? { ...b, currentCustomerId: next.id } : b
    ),
  }))

  broadcastState()
  res.json({ success: true, customer: next })
})

// Start Service
app.post('/api/start-service', (req, res) => {
  const { customerId } = req.body
  db.setState((prev) => ({
    ...prev,
    queue: prev.queue.map((c) =>
      c.id === customerId ? { ...c, status: 'inChair', startedAt: Date.now() } : c
    ),
    barbers: prev.barbers.map((b) =>
      b.currentCustomerId === customerId ? { ...b, serviceStartTime: Date.now() } : b
    ),
  }))
  broadcastState()
  res.json({ success: true })
})

// Mark Done
app.post('/api/mark-done', (req, res) => {
  const { customerId } = req.body
  const state = db.getState()
  const customer = state.queue.find((c) => c.id === customerId)
  const waitMin = customer?.startedAt && customer?.joinedAt
    ? Math.round((customer.startedAt - customer.joinedAt) / 60000)
    : 0

  db.setState((prev) => ({
    ...prev,
    queue: prev.queue.map((c) =>
      c.id === customerId ? { ...c, status: 'done', doneAt: Date.now() } : c
    ),
    barbers: prev.barbers.map((b) =>
      b.currentCustomerId === customerId
        ? { ...b, currentCustomerId: null, serviceStartTime: null }
        : b
    ),
    todayStats: {
      ...prev.todayStats,
      served: (prev.todayStats.served || 0) + 1,
      totalWaitMin: (prev.todayStats.totalWaitMin || 0) + waitMin,
    },
  }))
  broadcastState()
  res.json({ success: true })
})

// Mark No-Show
app.post('/api/no-show', (req, res) => {
  const { customerId } = req.body
  db.setState((prev) => ({
    ...prev,
    queue: prev.queue.map((c) =>
      c.id === customerId ? { ...c, status: 'noshow' } : c
    ),
    barbers: prev.barbers.map((b) =>
      b.currentCustomerId === customerId
        ? { ...b, currentCustomerId: null, serviceStartTime: null }
        : b
    ),
    todayStats: {
      ...prev.todayStats,
      noShows: (prev.todayStats.noShows || 0) + 1,
    },
  }))
  broadcastState()
  res.json({ success: true })
})

// Cancel Spot
app.post('/api/cancel', (req, res) => {
  const { customerId } = req.body
  db.setState((prev) => ({
    ...prev,
    queue: prev.queue.map((c) =>
      c.id === customerId ? { ...c, status: 'cancelled' } : c
    ),
    barbers: prev.barbers.map((b) =>
      b.currentCustomerId === customerId
        ? { ...b, currentCustomerId: null, serviceStartTime: null }
        : b
    ),
  }))
  broadcastState()
  res.json({ success: true })
})

// Toggle Barber Break
app.post('/api/barber-break', (req, res) => {
  const { barberId } = req.body
  db.setState((prev) => ({
    ...prev,
    barbers: prev.barbers.map((b) =>
      b.id === barberId ? { ...b, onBreak: !b.onBreak } : b
    ),
  }))
  broadcastState()
  res.json({ success: true })
})

// Toggle Barber Duty
app.post('/api/barber-duty', (req, res) => {
  const { barberId } = req.body
  db.setState((prev) => ({
    ...prev,
    barbers: prev.barbers.map((b) =>
      b.id === barberId ? { ...b, onDuty: !b.onDuty } : b
    ),
  }))
  broadcastState()
  res.json({ success: true })
})

// Toggle Queue Open/Closed
app.post('/api/queue-toggle', (req, res) => {
  const { open } = req.body
  db.setState((prev) => ({ ...prev, queueOpen: open }))
  broadcastState()
  res.json({ success: true })
})

// Toggle Service Active
app.post('/api/service-toggle', (req, res) => {
  const { serviceId } = req.body
  db.setState((prev) => ({
    ...prev,
    services: prev.services.map((s) =>
      s.id === serviceId ? { ...s, active: !s.active } : s
    ),
  }))
  broadcastState()
  res.json({ success: true })
})

// Update Service
app.post('/api/service-update', (req, res) => {
  const { serviceId, updates } = req.body
  db.setState((prev) => ({
    ...prev,
    services: prev.services.map((s) =>
      s.id === serviceId ? { ...s, ...updates } : s
    ),
  }))
  broadcastState()
  res.json({ success: true })
})

// Reset / Seed Database
app.post('/api/seed', (req, res) => {
  db.seed()
  broadcastState()
  res.json({ success: true, message: 'Database seeded with rich demo data', state: db.getState() })
})

// Clear Queue
app.post('/api/clear', (req, res) => {
  db.setState((prev) => ({
    ...prev,
    queue: [],
    barbers: prev.barbers.map((b) => ({ ...b, currentCustomerId: null, serviceStartTime: null })),
  }))
  broadcastState()
  res.json({ success: true })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`💈 Salon Database & Realtime API Server listening on http://127.0.0.1:${PORT}`)
})
