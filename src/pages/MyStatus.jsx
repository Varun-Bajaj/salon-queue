import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import Navbar from '../components/Navbar'
import ThreeBackground from '../components/ThreeBackground'
import Card3D from '../components/Card3D'
import { sound } from '../utils/audio'
import {
  ChevronLeft, Sparkles, Clock, AlertTriangle, X, CheckCircle,
  Scissors, User, ArrowRight, Share2, Compass
} from 'lucide-react'

export default function MyStatus() {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = useT()
  const { queue, services, barbers, cancelCustomer, lang } = useQueueStore()

  const [showConfirm, setShowConfirm] = useState(false)
  const [, setTick] = useState(0)
  const celebratedRef = useRef(false)

  // Polling re-render interval
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 2500)
    return () => clearInterval(iv)
  }, [])

  const customer = queue.find((c) => c.id === id)

  // Celebration triggers when status is 'called'
  useEffect(() => {
    if (customer?.status === 'called' && !celebratedRef.current) {
      celebratedRef.current = true
      sound.playCelebration()
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4A017', '#ECC354', '#FFFFFF', '#F7E7CE'],
      })
    }
  }, [customer?.status])

  if (!customer) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-6 text-center">
        <ThreeBackground />
        <Card3D maxRotate={10} className="glass-panel rounded-3xl p-8 max-w-sm w-full relative z-10">
          <p className="text-white/60 mb-4 text-sm">Guest reservation session not found.</p>
          <button
            onClick={() => {
              sound.playClick()
              navigate('/')
            }}
            className="btn-luxury-gold w-full text-sm font-bold"
          >
            Return to Lounge
          </button>
        </Card3D>
      </div>
    )
  }

  const waitingAhead = queue
    .filter((c) => c.status === 'waiting' && c.joinedAt < customer.joinedAt)
    .length

  const position = waitingAhead + (customer.status === 'waiting' ? 1 : 0)

  const selectedServiceNames = customer.serviceIds
    .map((sid) => {
      const s = services.find((sv) => sv.id === sid)
      return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : ''
    })
    .filter(Boolean)
    .join(' · ')

  const assignedBarber = customer.assignedBarberId
    ? barbers.find((b) => b.id === customer.assignedBarberId)
    : null

  const isCancelled = customer.status === 'cancelled'
  const isNoShow = customer.status === 'noshow'
  const isDone = customer.status === 'done'
  const isCalled = customer.status === 'called'
  const isInChair = customer.status === 'inChair'
  const isWaiting = customer.status === 'waiting'

  // Full-screen / Hero 'It's Your Turn' Mode
  if (isCalled) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <ThreeBackground />
        <div className="absolute inset-0 bg-gold-500/10 backdrop-blur-3xl" />

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative z-10 max-w-md w-full"
        >
          <Card3D maxRotate={12} className="glass-panel-gold rounded-3xl p-8 text-center border-2 border-gold-400 shadow-gold-glow-lg">
            <div className="w-20 h-20 rounded-full bg-gold-metallic mx-auto flex items-center justify-center text-charcoal-950 mb-6 shadow-gold-glow animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 font-mono text-xs uppercase tracking-widest border border-gold-500/40">
              VIP Calling Now
            </span>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-4 mb-2">
              {t.yourTurn}
            </h1>

            {assignedBarber && (
              <div className="my-6 p-4 rounded-2xl bg-charcoal-900/90 border border-gold-500/30 flex items-center justify-center gap-3">
                <span className="text-3xl">{assignedBarber.emoji}</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-gold-400">{t.goTo}</p>
                  <p className="text-xl font-bold text-white font-display">{assignedBarber.name}'s Chair</p>
                </div>
              </div>
            )}

            <div className="py-2">
              <p className="text-xs font-mono text-white/50 tracking-wider">YOUR TOKEN</p>
              <p className="text-5xl font-mono font-black text-gold-300 tracking-wider my-1">
                {customer.token}
              </p>
              <p className="text-xs text-white/60 font-light">{selectedServiceNames}</p>
            </div>

            <p className="text-xs text-amber-300/80 font-mono mt-6">
              Please proceed directly to the stylist station.
            </p>
          </Card3D>
        </motion.div>
      </div>
    )
  }

  // In Chair
  if (isInChair) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-6 relative">
        <ThreeBackground />
        <Card3D maxRotate={10} className="glass-panel-gold rounded-3xl p-8 max-w-sm w-full text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center text-3xl mb-4 shadow-gold-glow">
            💈
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-widest border border-emerald-500/30">
            {t.inChair}
          </span>
          <h2 className="text-3xl font-mono font-bold text-white mt-4">{customer.token}</h2>
          {assignedBarber && (
            <p className="text-white/60 text-sm mt-1">
              With Stylist {assignedBarber.emoji} {assignedBarber.name}
            </p>
          )}
          <p className="text-gold-300 text-xs font-medium mt-4">{selectedServiceNames}</p>
        </Card3D>
      </div>
    )
  }

  // Done
  if (isDone) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-6 relative">
        <ThreeBackground />
        <Card3D maxRotate={10} className="glass-panel rounded-3xl p-8 max-w-sm w-full text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">{t.done2}</h2>
          <p className="text-white/60 text-sm mb-6">
            Thank you for visiting StyleQ Lounge. Have a brilliant day!
          </p>
          <button
            onClick={() => {
              sound.playClick()
              navigate('/')
            }}
            className="btn-luxury-gold w-full text-sm font-bold"
          >
            {t.back}
          </button>
        </Card3D>
      </div>
    )
  }

  // Cancelled or No-show
  if (isCancelled || isNoShow) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-6 relative">
        <ThreeBackground />
        <Card3D maxRotate={10} className="glass-panel rounded-3xl p-8 max-w-sm w-full text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">{t.spotCancelled}</h2>
          <p className="text-white/50 text-xs mb-6">Your queue spot has been released.</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                sound.playClick()
                navigate('/join')
              }}
              className="btn-luxury-gold w-full text-sm font-bold"
            >
              {t.rejoinQueue}
            </button>
            <button
              onClick={() => {
                sound.playClick()
                navigate('/')
              }}
              className="btn-luxury-outline w-full text-sm"
            >
              {t.back}
            </button>
          </div>
        </Card3D>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col relative pb-20">
      <ThreeBackground />
      <Navbar />

      <main className="max-w-md mx-auto w-full px-4 pt-4 relative z-10">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => {
            sound.playClick()
            navigate('/')
          }}
          className="inline-flex items-center gap-2 text-white/50 hover:text-gold-400 text-xs font-mono uppercase tracking-widest mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Lounge</span>
        </button>

        {/* 3D Holographic VIP Pass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <Card3D maxRotate={10} className="glass-panel-gold rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-gold-500/40">
            {/* Holographic light sheen background effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

            {/* Header of pass */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-gold-300 font-semibold">
                  Live Queue Ticket
                </span>
              </div>
              <span className="text-xs font-mono text-white/40">{customer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3')}</span>
            </div>

            {/* Center Token */}
            <div className="text-center py-4 border-y border-white/10 my-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">
                {t.yourToken}
              </p>
              <h2 className="text-6xl font-mono font-black text-transparent bg-clip-text bg-gold-metallic tracking-wider drop-shadow-md">
                {customer.token}
              </h2>
              <p className="text-white/80 font-medium text-sm mt-1">{customer.name}</p>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-center mt-6">
              <div className="p-3 rounded-2xl bg-charcoal-900/80 border border-white/5">
                <p className="text-3xl font-mono font-bold text-white">{position}</p>
                <p className="text-[10px] font-mono uppercase text-white/40 mt-0.5">{t.position}</p>
              </div>

              <div className="p-3 rounded-2xl bg-charcoal-900/80 border border-white/5">
                <p className="text-3xl font-mono font-bold text-gold-300">
                  {customer.estimatedWaitMin}
                  <span className="text-xs font-normal text-white/50 ml-1">m</span>
                </p>
                <p className="text-[10px] font-mono uppercase text-white/40 mt-0.5">{t.estimatedWait}</p>
              </div>
            </div>

            {/* Selected Treatments */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/50 truncate max-w-[200px]">{selectedServiceNames}</span>
              <span className="font-mono font-bold text-gold-300">{t.rupee}{customer.totalPrice}</span>
            </div>
          </Card3D>
        </motion.div>

        {/* Milestone Steps Bar */}
        <div className="glass-panel rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3">
            Queue Progression
          </p>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-3 right-3 top-3.5 h-[2px] bg-white/10 -z-0" />
            <div
              className="absolute left-3 top-3.5 h-[2px] bg-gold-500 -z-0 transition-all duration-500"
              style={{ width: position <= 2 ? '75%' : '25%' }}
            />

            {[
              { label: 'Reserved', active: true },
              { label: 'Standby', active: position > 2 },
              { label: 'Head Over', active: position <= 2 },
              { label: 'In Chair', active: false },
            ].map((step, idx) => (
              <div key={step.label} className="flex flex-col items-center gap-1.5 z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    step.active
                      ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                      : 'bg-charcoal-900 border border-white/20 text-white/40'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-[10px] font-mono text-white/60">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* "Start coming" alert banner */}
        {position <= 2 && position > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-center mb-4 flex items-center justify-center gap-2 shadow-lg"
          >
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <span className="font-semibold text-sm">{t.startComing}</span>
          </motion.div>
        )}

        {/* Cancel Spot Button */}
        {isWaiting && !showConfirm && (
          <button
            onClick={() => {
              sound.playClick()
              setShowConfirm(true)
            }}
            className="w-full text-center py-3 text-xs font-mono uppercase tracking-widest text-white/40 hover:text-rose-400 transition-colors"
          >
            {t.cancelSpot}
          </button>
        )}

        {/* Confirm Cancellation Dialog */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel border-rose-500/30 rounded-2xl p-5 text-center mt-3"
            >
              <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <p className="text-white text-sm font-medium mb-4">{t.cancelConfirm}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    sound.playClick()
                    cancelCustomer(id)
                    setShowConfirm(false)
                  }}
                  className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs transition-colors"
                >
                  {t.yes}
                </button>
                <button
                  onClick={() => {
                    sound.playClick()
                    setShowConfirm(false)
                  }}
                  className="py-2.5 rounded-xl bg-charcoal-800 text-white/70 hover:text-white font-medium text-xs transition-colors"
                >
                  {t.no}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
