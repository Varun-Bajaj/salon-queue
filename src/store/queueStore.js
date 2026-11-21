import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Initial data ─────────────────────────────────────────────────────────────
const INITIAL_SERVICES = [
  { id: 's1', nameEn: 'Haircut', nameGu: 'વાળ કાટ', minutes: 30, price: 150, active: true },
  { id: 's2', nameEn: 'Beard Trim', nameGu: 'દાઢી', minutes: 15, price: 80, active: true },
  { id: 's3', nameEn: 'Hair Spa', nameGu: 'હેર સ્પા', minutes: 45, price: 400, active: true },
  { id: 's4', nameEn: 'Head Massage', nameGu: 'માથાની મસ્સાજ', minutes: 20, price: 120, active: true },
  { id: 's5', nameEn: 'Colour', nameGu: 'રંગ', minutes: 60, price: 500, active: true },
  { id: 's6', nameEn: 'Facial', nameGu: 'ફેશિયલ', minutes: 40, price: 300, active: true },
]

const INITIAL_BARBERS = [
  { id: 'b1', name: 'Ravi', emoji: '👨‍🦱', onDuty: true, onBreak: false, currentCustomerId: null, serviceStartTime: null },
  { id: 'b2', name: 'Amit', emoji: '👨‍🦲', onDuty: true, onBreak: false, currentCustomerId: null, serviceStartTime: null },
  { id: 'b3', name: 'Imran', emoji: '🧔', onDuty: true, onBreak: false, currentCustomerId: null, serviceStartTime: null },
]

// ─── Queue logic helpers ───────────────────────────────────────────────────────
let tokenCounter = 1

function generateToken() {
  return `S-${String(tokenCounter++).padStart(2, '0')}`
}

/**
 * Estimate wait time for a new customer based on:
 * total service minutes of all 'waiting' customers ahead / active barbers
 */
function calcEstimatedWait(queue, barbers, selectedMinutes) {
  const activeBarbers = barbers.filter(b => b.onDuty && !b.onBreak && !b.currentCustomerId).length
  const busyBarbers = barbers.filter(b => b.currentCustomerId).length
  const totalBarbers = Math.max(activeBarbers + busyBarbers, 1)

  const waitingTotal = queue
    .filter(c => c.status === 'waiting')
    .reduce((sum, c) => sum + c.totalMinutes, 0)

  return Math.ceil((waitingTotal + selectedMinutes) / totalBarbers)
}

/**
 * Find the next customer for a barber, respecting preference rules.
 * Rules:
 * - barber X picks earliest customer who chose X or 'any'
 * - never give a customer who chose a different specific barber
 */
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
      queue: [],
      queueOpen: true,
      closingTime: '21:00', // 9 PM
      lang: 'en',
      todayStats: { served: 0, totalWaitMin: 0, noShows: 0 },
      _tokenCounter: 1,

      // ── Language ──────────────────────────────────────────────────────
      setLang: (lang) => set({ lang }),

      // ── Queue open/close ──────────────────────────────────────────────
      setQueueOpen: (open) => set({ queueOpen: open }),

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
      },

      // ── Cancel ────────────────────────────────────────────────────────
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
      },

      // ── Barber Break Toggle ───────────────────────────────────────────
      toggleBarberBreak: (barberId) => {
        set(state => ({
          barbers: state.barbers.map(b =>
            b.id === barberId ? { ...b, onBreak: !b.onBreak } : b
          ),
        }))
      },

      // ── Barber On Duty Toggle (admin) ─────────────────────────────────
      toggleBarberDuty: (barberId) => {
        set(state => ({
          barbers: state.barbers.map(b =>
            b.id === barberId ? { ...b, onDuty: !b.onDuty } : b
          ),
        }))
      },

      // ── Service Active Toggle (admin) ─────────────────────────────────
      toggleService: (serviceId) => {
        set(state => ({
          services: state.services.map(s =>
            s.id === serviceId ? { ...s, active: !s.active } : s
          ),
        }))
      },

      // ── Update Service (admin) ────────────────────────────────────────
      updateService: (serviceId, updates) => {
        set(state => ({
          services: state.services.map(s =>
            s.id === serviceId ? { ...s, ...updates } : s
          ),
        }))
      },

      // ── Computed helpers (not reactive — call inside components) ──────
      getCustomerById: (id) => get().queue.find(c => c.id === id),

      getActiveQueue: () =>
        get().queue
          .filter(c => ['waiting', 'called', 'inChair'].includes(c.status))
          .sort((a, b) => a.joinedAt - b.joinedAt),

      getPositionInQueue: (customerId) => {
        const active = get()
          .queue
          .filter(c => c.status === 'waiting')
          .sort((a, b) => a.joinedAt - b.joinedAt)
        const idx = active.findIndex(c => c.id === customerId)
        return idx === -1 ? null : idx + 1
      },

      getServiceById: (id) => get().services.find(s => s.id === id),

      getBarberById: (id) => get().barbers.find(b => b.id === id),

      getBarberByName: (name) =>
        get().barbers.find(b => b.name.toLowerCase() === name.toLowerCase()),

      refreshEstimates: () => {
        const { queue, barbers, services } = get()
        const updated = queue.map(c => {
          if (c.status !== 'waiting') return c
          const wait = calcEstimatedWait(
            queue.filter(q => q.id !== c.id && q.joinedAt < c.joinedAt),
            barbers,
            c.totalMinutes
          )
          return { ...c, estimatedWaitMin: wait }
        })
        set({ queue: updated })
      },

      resetStats: () => set({ todayStats: { served: 0, totalWaitMin: 0, noShows: 0 } }),
    }),
    {
      name: 'salon-queue-storage',
      version: 1,
    }
  )
)
