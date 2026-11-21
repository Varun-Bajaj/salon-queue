import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import Navbar from '../components/Navbar'
import ThreeBackground from '../components/ThreeBackground'
import Card3D from '../components/Card3D'
import { sound } from '../utils/audio'
import { Scissors, Sparkles, Clock, Users, Tv, CheckCircle2 } from 'lucide-react'

export default function Display() {
  const t = useT()
  const { barbers, queue, services, lang } = useQueueStore()
  const [, setTick] = useState(0)
  const [flashId, setFlashId] = useState(null)
  const prevCalled = useRef(new Set())
  const [currentTime, setCurrentTime] = useState('')

  // Digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const iv = setInterval(updateTime, 1000)
    return () => clearInterval(iv)
  }, [])

  // Auto-refresh queue state every 2 seconds
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(iv)
  }, [])

  // Flash & chime whenever a customer is called
  useEffect(() => {
    const currentCalled = new Set(queue.filter((c) => c.status === 'called').map((c) => c.id))
    for (const id of currentCalled) {
      if (!prevCalled.current.has(id)) {
        setFlashId(id)
        sound.playCelebration()
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#D4A017', '#ECC354', '#FFFFFF'],
        })
        setTimeout(() => setFlashId(null), 5000)
      }
    }
    prevCalled.current = currentCalled
  }, [queue])

  const dutyBarbers = barbers.filter((b) => b.onDuty)

  const upNext = queue
    .filter((c) => c.status === 'waiting')
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .slice(0, 5)

  const svcNames = (c) =>
    c.serviceIds
      .map((sid) => {
        const s = services.find((sv) => sv.id === sid)
        return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : ''
      })
      .join(' · ')

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col relative overflow-hidden select-none">
      <ThreeBackground />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 flex flex-col justify-between relative z-10">
        {/* Luxury Billboard Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-metallic p-[1px] flex items-center justify-center shadow-gold-glow">
              <div className="w-full h-full bg-charcoal-950 rounded-[15px] flex items-center justify-center">
                <Tv className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-extrabold text-white tracking-wider">
                STYLE<span className="text-gold-400">Q</span> BILLBOARD
              </h1>
              <p className="text-xs font-mono tracking-widest text-white/40 uppercase">
                Haute Coiffure Live Queue Status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-2xl bg-charcoal-900/80 border border-gold-500/30 shadow-inner font-mono text-xl font-bold text-gold-300">
              {currentTime}
            </div>
          </div>
        </div>

        {/* Main TV Screen: 2 Pod Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
          {/* Left Column: Now In Service Stations (7 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                <span>Now Serving at Stations</span>
              </h2>
              <span className="text-xs font-mono text-white/40">Real-time floor dispatch</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {dutyBarbers.map((barber) => {
                const current = barber.currentCustomerId
                  ? queue.find((c) => c.id === barber.currentCustomerId)
                  : null
                const isFlash = current && flashId === current.id

                return (
                  <motion.div
                    key={barber.id}
                    animate={isFlash ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ repeat: isFlash ? 3 : 0, duration: 0.8 }}
                    className={`rounded-3xl p-6 transition-all duration-500 border ${
                      isFlash
                        ? 'bg-gold-500/25 border-gold-400 shadow-gold-glow-lg'
                        : 'glass-panel border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      {/* Barber Avatar & Info */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-charcoal-900 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                          {barber.emoji}
                        </div>
                        <div>
                          <p className="text-xl font-display font-bold text-white">{barber.name}</p>
                          <span className={`text-xs font-mono uppercase font-semibold tracking-wider ${
                            barber.onBreak
                              ? 'text-amber-400'
                              : current
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}>
                            {barber.onBreak ? t.onBreak : current ? t.busy : t.free}
                          </span>
                        </div>
                      </div>

                      {/* Guest in Chair Info */}
                      {current ? (
                        <div className="text-right">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 mb-1">
                            <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
                            <span className="text-xs font-mono font-bold text-gold-300">
                              {current.status === 'inChair' ? 'In Chair' : 'Calling Now'}
                            </span>
                          </div>
                          <p className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gold-metallic">
                            {current.token}
                          </p>
                          <p className="text-sm font-semibold text-white/90">{current.name}</p>
                          <p className="text-xs text-white/40">{svcNames(current)}</p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-sm font-mono text-white/20">— Empty Chair —</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Up Next Billboard (5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Next 5 Tokens Up</span>
              </h2>
            </div>

            <div className="glass-panel-gold rounded-3xl p-6 border border-gold-500/30 space-y-3">
              {upNext.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-3xl mb-2">✨</p>
                  <p className="text-white/60 font-medium text-sm">{t.noOneWaiting}</p>
                </div>
              ) : (
                upNext.map((c, idx) => {
                  const prefBarber = c.preferredBarberId !== 'any'
                    ? barbers.find((b) => b.id === c.preferredBarberId)
                    : null

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-charcoal-900/90 border border-white/5 flex items-center justify-between gap-3 shadow-inner"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-gold-500/20 text-gold-300 font-mono font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-mono font-black text-gold-400 text-lg">{c.token}</p>
                          <p className="text-white/70 text-xs font-semibold">{c.name}</p>
                          {prefBarber && (
                            <p className="text-[10px] text-white/40">Prefers {prefBarber.name}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs text-emerald-400 font-bold">
                        ~{c.estimatedWaitMin}m
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Ticker */}
        <div className="py-4 border-t border-white/10 flex items-center justify-between text-xs text-white/30 font-mono">
          <span>✨ Auto-updating in real-time</span>
          <span>Please watch for your token on this screen</span>
        </div>
      </main>
    </div>
  )
}
