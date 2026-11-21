import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import Navbar from '../components/Navbar'
import ThreeBackground from '../components/ThreeBackground'
import Card3D from '../components/Card3D'
import { sound } from '../utils/audio'
import { ChevronLeft, Scissors, Check, Coffee, Clock, ArrowRight, User, AlertCircle } from 'lucide-react'

function ElapsedStopwatch({ startTime }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return
    const update = () => setElapsed(Math.round((Date.now() - startTime) / 1000))
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [startTime])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return (
    <span className="font-mono tracking-widest text-3xl font-black text-gold-300">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}

export default function BarberView() {
  const { name } = useParams()
  const navigate = useNavigate()
  const t = useT()
  const { barbers, queue, services, toggleBarberBreak, startService, markDone, lang } = useQueueStore()

  const barber = barbers.find((b) => b.name.toLowerCase() === name?.toLowerCase())

  if (!barber) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-6 text-center">
        <ThreeBackground />
        <Card3D maxRotate={10} className="glass-panel rounded-3xl p-8 max-w-sm w-full relative z-10">
          <p className="text-white/60 mb-4 text-sm">Artisan "{name}" not found.</p>
          <button
            onClick={() => {
              sound.playClick()
              navigate('/')
            }}
            className="btn-luxury-gold w-full text-sm font-bold"
          >
            Lounge
          </button>
        </Card3D>
      </div>
    )
  }

  const currentCustomer = barber.currentCustomerId
    ? queue.find((c) => c.id === barber.currentCustomerId)
    : null

  // Next customer in line for this barber
  const nextCustomer = queue
    .filter((c) => c.status === 'waiting' && (c.preferredBarberId === barber.id || c.preferredBarberId === 'any'))
    .sort((a, b) => a.joinedAt - b.joinedAt)[0] || null

  const svcNames = (c) =>
    c.serviceIds
      .map((sid) => {
        const s = services.find((sv) => sv.id === sid)
        return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : ''
      })
      .join(' · ')

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col relative pb-20">
      <ThreeBackground />
      <Navbar />

      <main className="max-w-md mx-auto w-full px-4 pt-4 relative z-10">
        <button
          onClick={() => {
            sound.playClick()
            navigate('/')
          }}
          className="inline-flex items-center gap-2 text-white/50 hover:text-gold-400 text-xs font-mono uppercase tracking-widest mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Stylist HUD</span>
        </button>

        {/* Stylist Profile Bar */}
        <div className="glass-panel-gold rounded-3xl p-5 mb-5 flex items-center justify-between border border-gold-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-charcoal-900 border border-gold-500/40 flex items-center justify-center text-3xl shadow-inner">
              {barber.emoji}
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">{barber.name}</h1>
              <p className="text-xs font-mono text-gold-400">Master Stylist Station</p>
            </div>
          </div>

          {/* Break Switch */}
          <button
            onClick={() => {
              sound.playClick()
              toggleBarberBreak(barber.id)
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              barber.onBreak
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {barber.onBreak ? <Coffee className="w-3.5 h-3.5" /> : <Scissors className="w-3.5 h-3.5" />}
            <span>{barber.onBreak ? t.onBreakToggle : t.available}</span>
          </button>
        </div>

        {/* Current Active Guest Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <Card3D maxRotate={8} className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-white/10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>{t.currentCustomer}</span>
            </h2>

            {currentCustomer ? (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div>
                    <span className="text-xs font-mono text-gold-400 font-bold">{currentCustomer.token}</span>
                    <h3 className="text-2xl font-display font-bold text-white mt-0.5">{currentCustomer.name}</h3>
                    <p className="text-xs text-white/50">{svcNames(currentCustomer)}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-emerald-400 block">{t.rupee}{currentCustomer.totalPrice}</span>
                    <span className="text-[10px] text-white/40">{currentCustomer.totalMinutes} min</span>
                  </div>
                </div>

                {/* State: Called -> Tap to Start */}
                {currentCustomer.status === 'called' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs text-center font-mono">
                      Guest has been called and is on the way to chair.
                    </div>
                    <button
                      onClick={() => {
                        sound.playGoldChime()
                        startService(currentCustomer.id)
                      }}
                      className="btn-luxury-gold w-full text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Scissors className="w-4 h-4 text-charcoal-950" />
                      <span>{t.start}</span>
                    </button>
                  </div>
                )}

                {/* State: In Chair -> Live Stopwatch & Done */}
                {currentCustomer.status === 'inChair' && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-2xl bg-charcoal-900/90 border border-gold-500/30 text-center shadow-inner">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">
                        {t.timeElapsed}
                      </p>
                      <ElapsedStopwatch startTime={currentCustomer.startedAt} />
                    </div>

                    <button
                      onClick={() => {
                        sound.playCelebration()
                        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
                        markDone(currentCustomer.id)
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-charcoal-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>{t.done}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">✂️</p>
                <p className="text-white/40 text-xs font-mono">{t.noCustomerYet}</p>
              </div>
            )}
          </Card3D>
        </motion.div>

        {/* Up Next for This Stylist */}
        {nextCustomer && (
          <div className="glass-panel rounded-2xl p-4 border border-gold-500/20">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold mb-2">
              {t.nextForYou}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-white text-sm">{nextCustomer.token} · </span>
                <span className="font-semibold text-white/90 text-sm">{nextCustomer.name}</span>
                <p className="text-white/40 text-xs mt-0.5">{svcNames(nextCustomer)}</p>
              </div>
              <span className="font-mono text-xs text-gold-400 font-semibold">~{nextCustomer.estimatedWaitMin}m</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
