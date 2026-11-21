import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { INITIAL_SERVICES, INITIAL_BARBERS, generateSeedQueue, INITIAL_TODAY_STATS } from '../../server/seedData.js'

// ─── Queue logic helpers ───────────────────────────────────────────────────────
function calcEstimatedWait(queue, barbers, selectedMinutes) {
  const activeBarbers = barbers.filter(b => b.onDuty && !b.onBreak && !b.currentCustomerId).length
  const busyBarbers = barbers.filter(b => b.currentCustomerId).length
  const totalBarbers = Math.max(activeBarbers + busyBarbers, 1)

  const waitingTotal = queue
    .filter(c => c.status === 'waiting')
    .reduce((sum, c) => sum + c.totalMinutes, 0)

  return Math.ceil((waitingTotal + selectedMinutes) / totalBarbers)
}

function findNextForBarber(queue, barberId) {
  const waiting = queue
    .filter(c => c.status === 'waiting')
    .sort((a, b) => a.joinedAt - b.joinedAt)

  return waiting.find(c => c.preferredBarberId === barberId || c.preferredBarberId === 'any') || null
}

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useQueueStore = create(
  persist(
    (set, get) => ({
      // State
      services: INITIAL_SERVICES,
      barbers: INITIAL_BARBERS,
      queue: generateSeedQueue(),
      queueOpen: true,
      closingTime: '21:00',
      lang: 'en',
      isStaffMode: false,
      todayStats: INITIAL_TODAY_STATS,
      _tokenCounter: 8,
      isConnectedToBackend: false,

      // ── Staff Mode ────────────────────────────────────────────────────
      setStaffMode: (enabled) => set({ isStaffMode: enabled }),

      // ── Language ──────────────────────────────────────────────────────
      setLang: (lang) => set({ lang }),

      // ── Queue open/close ──────────────────────────────────────────────
      setQueueOpen: (open) => {
        set({ queueOpen: open })
        fetch('/api/queue-toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ open }),
        }).catch(() => {})
      },

      // ── Join Queue ────────────────────────────────────────────────────
      joinQueue: ({ name, phone, serviceIds, preferredBarberId }) => {
        const { queue, services, barbers, _tokenCounter } = get()

        // Check one active spot per phone
        const existing = queue.find(c =>
          c.phone === phone && ['waiting', 'called', 'inChair'].includes(c.status)
        )
        if (existing) return { error: 'duplicate', customerId: existing.id }

        const selectedServices = services.filter(s => serviceIds.includes(s.id))
        const totalMinutes = selectedServices.reduce((sum, s) => sum + s.minutes, 0)
        const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
        const waitMin = calcEstimatedWait(queue, barbers, totalMinutes)

        const customer = {
          id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          token: `S-${String(_tokenCounter).padStart(2, '0')}`,
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

        set(state => ({
          queue: [...state.queue, customer],
          _tokenCounter: state._tokenCounter + 1,
        }))

        // Sync with backend API
        fetch('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, serviceIds, preferredBarberId }),
        }).catch(() => {})

        return { success: true, customerId: customer.id }
      },

      // ── Call Next ─────────────────────────────────────────────────────
      callNext: (barberId) => {
        const { queue, barbers } = get()
        const barber = barbers.find(b => b.id === barberId)
        if (!barber || barber.currentCustomerId) return null

        const next = findNextForBarber(queue, barberId)
        if (!next) return null

        set(state => ({
          queue: state.queue.map(c =>
            c.id === next.id
              ? { ...c, status: 'called', calledAt: Date.now(), assignedBarberId: barberId }
              : c
          ),
          barbers: state.barbers.map(b =>
            b.id === barberId ? { ...b, currentCustomerId: next.id } : b
          ),
        }))

        fetch('/api/call-next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barberId }),
        }).catch(() => {})

        return next
      },

      // ── Start Service ─────────────────────────────────────────────────
      startService: (customerId) => {
        set(state => ({
          queue: state.queue.map(c =>
            c.id === customerId
              ? { ...c, status: 'inChair', startedAt: Date.now() }
              : c
          ),
          barbers: state.barbers.map(b =>
            b.currentCustomerId === customerId
              ? { ...b, serviceStartTime: Date.now() }
              : b
          ),
        }))

        fetch('/api/start-service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId }),
        }).catch(() => {})
      },

      // ── Mark Done ─────────────────────────────────────────────────────
      markDone: (customerId) => {
        const { queue, todayStats } = get()
        const customer = queue.find(c => c.id === customerId)
        const waitMin = customer?.startedAt && customer?.joinedAt
          ? Math.round((customer.startedAt - customer.joinedAt) / 60000)
          : 0

        set(state => ({
          queue: state.queue.map(c =>
            c.id === customerId ? { ...c, status: 'done', doneAt: Date.now() } : c
          ),
          barbers: state.barbers.map(b =>
            b.currentCustomerId === customerId
              ? { ...b, currentCustomerId: null, serviceStartTime: null }
              : b
          ),
          todayStats: {
            ...todayStats,
            served: todayStats.served + 1,
            totalWaitMin: todayStats.totalWaitMin + waitMin,
          },
        }))

        fetch('/api/mark-done', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId }),
        }).catch(() => {})
      },

      // ── Mark No-show ──────────────────────────────────────────────────
      markNoShow: (customerId) => {
        set(state => ({
          queue: state.queue.map(c =>
            c.id === customerId ? { ...c, status: 'noshow' } : c
          ),
          barbers: state.barbers.map(b =>
            b.currentCustomerId === customerId
              ? { ...b, currentCustomerId: null, serviceStartTime: null }
              : b
          ),
          todayStats: {
            ...state.todayStats,
            noShows: state.todayStats.noShows + 1,
          },
        }))

        fetch('/api/no-show', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId }),
        }).catch(() => {})
      },

      // ── Cancel Spot ───────────────────────────────────────────────────
      cancelCustomer: (customerId) => {
        set(state => ({
          queue: state.queue.map(c =>
            c.id === customerId ? { ...c, status: 'cancelled' } : c
          ),
          barbers: state.barbers.map(b =>
            b.currentCustomerId === customerId
              ? { ...b, currentCustomerId: null, serviceStartTime: null }
              : b
          ),
        }))

        fetch('/api/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId }),
        }).catch(() => {})
      },

      // ── Barber Break Toggle ───────────────────────────────────────────
      toggleBarberBreak: (barberId) => {
        set(state => ({
          barbers: state.barbers.map(b =>
            b.id === barberId ? { ...b, onBreak: !b.onBreak } : b
          ),
        }))

        fetch('/api/barber-break', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barberId }),
        }).catch(() => {})
      },

      // ── Barber Duty Toggle ────────────────────────────────────────────
      toggleBarberDuty: (barberId) => {
        set(state => ({
          barbers: state.barbers.map(b =>
            b.id === barberId ? { ...b, onDuty: !b.onDuty } : b
          ),
        }))

        fetch('/api/barber-duty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barberId }),
        }).catch(() => {})
      },

      // ── Service Active Toggle ─────────────────────────────────────────
      toggleService: (serviceId) => {
        set(state => ({
          services: state.services.map(s =>
            s.id === serviceId ? { ...s, active: !s.active } : s
          ),
        }))

        fetch('/api/service-toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId }),
        }).catch(() => {})
      },

      // ── Update Service ────────────────────────────────────────────────
      updateService: (serviceId, updates) => {
        set(state => ({
          services: state.services.map(s =>
            s.id === serviceId ? { ...s, ...updates } : s
          ),
        }))

        fetch('/api/service-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId, updates }),
        }).catch(() => {})
      },

      // ── Re-seed Realistic Test Data ───────────────────────────────────
      seedDatabase: async () => {
        try {
          const res = await fetch('/api/seed', { method: 'POST' })
          const data = await res.json()
          if (data?.state) {
            set({
              services: data.state.services,
              barbers: data.state.barbers,
              queue: data.state.queue,
              queueOpen: data.state.queueOpen,
              todayStats: data.state.todayStats,
              _tokenCounter: data.state._tokenCounter || 8,
            })
          }
        } catch {
          // Fallback local seed
          set({
            services: INITIAL_SERVICES,
            barbers: INITIAL_BARBERS,
            queue: generateSeedQueue(),
            todayStats: INITIAL_TODAY_STATS,
            _tokenCounter: 8,
          })
        }
      },

      // ── Clear Queue ───────────────────────────────────────────────────
      clearQueue: async () => {
        try {
          await fetch('/api/clear', { method: 'POST' })
        } catch {}
        set(state => ({
          queue: [],
          barbers: state.barbers.map(b => ({ ...b, currentCustomerId: null, serviceStartTime: null })),
        }))
      },

      resetStats: () => set({ todayStats: { served: 0, totalWaitMin: 0, noShows: 0 } }),
    }),
    {
      name: 'salon-queue-storage-v2',
      version: 2,
    }
  )
)

// ─── Real-Time WebSocket & Initial Data Hydration ─────────────────────────
if (typeof window !== 'undefined') {
  // 1. Initial State Fetch from Database
  fetch('/api/state')
    .then(res => res.json())
    .then(serverState => {
      if (serverState && serverState.queue) {
        useQueueStore.setState({
          services: serverState.services,
          barbers: serverState.barbers,
          queue: serverState.queue,
          queueOpen: serverState.queueOpen,
          todayStats: serverState.todayStats,
          _tokenCounter: serverState._tokenCounter || 8,
          isConnectedToBackend: true,
        })
      }
    })
    .catch(() => {})

  // 2. Real-time WebSocket connection
  const setupWebSocket = () => {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${wsProtocol}//${window.location.host}/ws`
      const socket = new WebSocket(wsUrl)

      socket.onerror = () => {
        // Suppress browser console noise if server is cycling
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'STATE_UPDATE' && message.payload) {
            useQueueStore.setState({
              services: message.payload.services,
              barbers: message.payload.barbers,
              queue: message.payload.queue,
              queueOpen: message.payload.queueOpen,
              todayStats: message.payload.todayStats,
              _tokenCounter: message.payload._tokenCounter || 8,
              isConnectedToBackend: true,
            })
          }
        } catch {}
      }

      socket.onclose = () => {
        setTimeout(setupWebSocket, 4000)
      }
    } catch {}
  }

  setupWebSocket()

  // 3. Instant Cross-Tab Sync via Storage Event (ensures real-time sync on Vercel)
  window.addEventListener('storage', (e) => {
    if (e.key === 'salon-queue-storage-v2' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue)
        if (parsed?.state) {
          useQueueStore.setState(parsed.state)
        }
      } catch {}
    }
  })
}
