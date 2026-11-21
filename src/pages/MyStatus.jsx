import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import { ChevronLeft } from 'lucide-react'
import LangToggle from '../components/LangToggle'

function CircularTimer({ minutes, maxMinutes }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(minutes / Math.max(maxMinutes, 1), 1)
  const dash = circumference * (1 - pct)

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="circular-progress w-full h-full" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#374151" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke="#D4A017" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{minutes}</span>
        <span className="text-white/50 text-xs">min</span>
      </div>
    </div>
  )
}

export default function MyStatus() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = useT()
  const { queue, services, barbers, cancelCustomer, lang } = useQueueStore()

  const [showConfirm, setShowConfirm] = useState(false)
  const [tick, setTick] = useState(0)

  // Refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 3000)
    return () => clearInterval(interval)
  }, [])

  const customer = queue.find(c => c.id === id)

  if (!customer) {
    return (
      <div className="min-h-screen bg-charcoal-darker flex flex-col items-center justify-center p-6 text-center">
        <p className="text-white/60 mb-4">Session not found.</p>
        <button className="btn-gold" onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  const waitingAhead = queue
    .filter(c => c.status === 'waiting' && c.joinedAt < customer.joinedAt)
    .length

  const position = waitingAhead + (customer.status === 'waiting' ? 1 : 0)

  const selectedServiceNames = customer.serviceIds.map(id => {
    const s = services.find(sv => sv.id === id)
    return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : ''
  }).join(', ')

  const assignedBarber = customer.assignedBarberId
    ? barbers.find(b => b.id === customer.assignedBarberId)
    : null

  const isCancelled = customer.status === 'cancelled'
  const isNoShow = customer.status === 'noshow'
  const isDone = customer.status === 'done'
  const isCalled = customer.status === 'called'
  const isInChair = customer.status === 'inChair'
  const isWaiting = customer.status === 'waiting'

  // "It's your turn" full-screen
  if (isCalled) {
    return (
      <div className="min-h-screen bg-gold flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-4xl font-black text-charcoal-darker mb-3">{t.yourTurn}</h1>
        {assignedBarber && (
          <p className="text-2xl font-semibold text-charcoal-darker/80 mb-2">
            {t.goTo} {assignedBarber.emoji} {assignedBarber.name}
          </p>
        )}
        <p className="text-charcoal-darker/60 text-lg mb-2">{customer.token}</p>
        <p className="text-charcoal-darker/50">{selectedServiceNames}</p>
      </div>
    )
  }

  // In chair
  if (isInChair) {
    return (
      <div className="min-h-screen bg-charcoal-darker flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">💈</div>
        <div className="badge-gold text-sm mb-3 px-4 py-1">{t.inChair}</div>
        <h2 className="text-2xl font-bold text-white mb-1">{customer.token}</h2>
        {assignedBarber && (
          <p className="text-white/60">{t.withBarber} {assignedBarber.name}</p>
        )}
        <p className="text-gold mt-3">{selectedServiceNames}</p>
      </div>
    )
  }

  // Done
  if (isDone) {
    return (
      <div className="min-h-screen bg-charcoal-darker flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.done2}</h2>
        <p className="text-white/50 mb-6">Thank you for visiting!</p>
        <button className="btn-gold" onClick={() => navigate('/')}>{t.back}</button>
      </div>
    )
  }

  // Cancelled / No-show
  if (isCancelled || isNoShow) {
    return (
      <div className="min-h-screen bg-charcoal-darker flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.spotCancelled}</h2>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button className="btn-gold" onClick={() => navigate('/join')}>{t.rejoinQueue}</button>
          <button className="btn-outline" onClick={() => navigate('/')}>{t.back}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-darker">
      {/* Header */}
      <div className="bg-charcoal border-b border-white/5 px-4 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-white">{customer.token}</h1>
        <LangToggle small />
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5 animate-slide-up">
        {/* Token + position */}
        <div className="card text-center py-6">
          <p className="text-white/40 text-sm mb-1">{t.yourToken}</p>
          <h2 className="text-5xl font-black text-gold mb-3">{customer.token}</h2>
          <div className="flex justify-center gap-6">
            <div>
              <p className="text-2xl font-bold text-white">{position}</p>
              <p className="text-white/40 text-xs">{t.position}</p>
            </div>
            <div className="border-l border-white/10"></div>
            <div>
              <p className="text-2xl font-bold text-white">{customer.estimatedWaitMin}</p>
              <p className="text-white/40 text-xs">{t.min} wait</p>
            </div>
          </div>
        </div>

        {/* Circular timer */}
        <div className="card py-6">
          <CircularTimer minutes={customer.estimatedWaitMin} maxMinutes={customer.estimatedWaitMin + 10} />
          <p className="text-center text-white/50 text-sm mt-3">{t.estimatedWait}</p>
        </div>

        {/* "Start coming" alert */}
        {position <= 2 && position > 0 && (
          <div className="card bg-amber-500/15 border-amber-500/30">
            <p className="text-amber-400 font-semibold text-center">{t.startComing}</p>
          </div>
        )}

        {/* Services summary */}
        <div className="card">
          <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Services</p>
          <p className="text-white">{selectedServiceNames}</p>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-white/50">{customer.totalMinutes} {t.min}</span>
            <span className="text-gold font-semibold">{t.rupee}{customer.totalPrice}</span>
          </div>
          {customer.preferredBarberId !== 'any' && (() => {
            const pb = barbers.find(b => b.id === customer.preferredBarberId)
            return pb ? (
              <p className="text-white/40 text-sm mt-1">{pb.emoji} {pb.name}</p>
            ) : null
          })()}
        </div>

        {/* Cancel */}
        {isWaiting && !showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-outline w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
          >
            {t.cancelSpot}
          </button>
        )}

        {showConfirm && (
          <div className="card border-red-500/20 space-y-3">
            <p className="text-white text-center">{t.cancelConfirm}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { cancelCustomer(id); setShowConfirm(false) }}
                className="btn-gold bg-red-500 hover:bg-red-600 shadow-red-500/20"
              >
                {t.yes}
              </button>
              <button onClick={() => setShowConfirm(false)} className="btn-outline">
                {t.no}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
