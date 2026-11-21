import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import Navbar from '../components/Navbar'
import ThreeBackground from '../components/ThreeBackground'
import Card3D from '../components/Card3D'
import { sound } from '../utils/audio'
import { Clock, Users, ArrowRight, ShieldCheck, Sparkles, Scissors, Coffee, CheckCircle2 } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const t = useT()
  const { barbers, queue, queueOpen } = useQueueStore()

  const activeQueue = queue.filter(c => ['waiting', 'called', 'inChair'].includes(c.status))
  const waitingCount = queue.filter(c => c.status === 'waiting').length
  const activeBarbers = Math.max(barbers.filter(b => b.onDuty && !b.onBreak).length, 1)
  const totalWaitMin = activeQueue.reduce((s, c) => s + c.totalMinutes, 0)
  const estimatedWait = Math.ceil(totalWaitMin / activeBarbers)

  const dutyBarbers = barbers.filter(b => b.onDuty)

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col relative overflow-hidden">
      {/* 3D Interactive Three.js Background */}
      <ThreeBackground />

      {/* Floating Glass Navigation */}
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-20 relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal-900/90 border border-gold-500/30 shadow-inner-gold mb-4 backdrop-blur-md">
            <span className={`w-2.5 h-2.5 rounded-full ${queueOpen ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'}`} />
            <span className="text-xs font-semibold tracking-wider uppercase text-gold-300">
              {queueOpen ? `${t.open} · ${t.closesAt}` : `${t.closed} · ${t.walkInOnly}`}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight mb-3">
            <span className="text-white">Experience </span>
            <span className="gold-gradient-text drop-shadow-sm">The Art of Style</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto font-light leading-relaxed">
            Skip the physical line. Book your chair in seconds, relax wherever you are, and step in when it's your turn.
          </p>
        </motion.div>

        {/* 3D Main Interactive Holographic Status Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-xl mb-8"
        >
          <Card3D maxRotate={7} className="glass-panel-gold rounded-3xl p-6 sm:p-8 relative overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gold-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Left Counter */}
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-charcoal-900/90 border border-gold-500/40 flex items-center justify-center text-gold-400 shadow-gold-glow">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
                      {waitingCount}
                    </span>
                    <span className="text-xs font-mono uppercase text-gold-400 font-semibold tracking-wider">
                      Guests
                    </span>
                  </div>
                  <p className="text-white/50 text-xs sm:text-sm font-medium">
                    {waitingCount === 0 ? t.noOneWaiting : t.peopleWaiting}
                  </p>
                </div>
              </div>

              {/* Center Divider on Mobile */}
              <div className="w-full sm:w-[1px] h-[1px] sm:h-16 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-gold-500/40 to-transparent" />

              {/* Right Counter */}
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-charcoal-900/90 border border-gold-500/40 flex items-center justify-center text-gold-400 shadow-gold-glow">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-gold-400 tracking-tight">
                      {waitingCount === 0 ? '0' : estimatedWait}
                    </span>
                    <span className="text-xs font-mono uppercase text-gold-400 font-semibold tracking-wider">
                      {t.min}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs sm:text-sm font-medium">
                    {t.expectedWait}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Bar inside Card */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              {queueOpen ? (
                <button
                  onClick={() => {
                    sound.playGoldChime()
                    navigate('/join')
                  }}
                  className="btn-luxury-gold w-full text-base flex items-center justify-center gap-2 group"
                >
                  <Sparkles className="w-5 h-5 text-charcoal-950 transition-transform group-hover:rotate-12" />
                  <span className="font-bold tracking-wide">{t.joinQueue}</span>
                  <ArrowRight className="w-5 h-5 text-charcoal-950 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <div className="w-full p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center">
                  <p className="text-rose-400 text-sm font-medium">{t.queueClosedMsg}</p>
                </div>
              )}
            </div>
          </Card3D>
        </motion.div>

        {/* 3D Master Stylists Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-xl"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5" />
              <span>Master Artisans on Duty</span>
            </h2>
            <span className="text-xs text-white/40 font-mono">Live Stations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dutyBarbers.map((barber) => {
              const isBreak = barber.onBreak
              const isBusy = !!barber.currentCustomerId
              const isFree = !isBreak && !isBusy

              return (
                <Card3D
                  key={barber.id}
                  maxRotate={12}
                  onClick={() => {
                    sound.playClick()
                    navigate(`/barber/${barber.name.toLowerCase()}`)
                  }}
                  className="glass-panel rounded-2xl p-4 cursor-pointer hover:border-gold-500/50 transition-all group"
                >
                  <div className="flex sm:flex-col items-center sm:text-center gap-3">
                    {/* 3D Avatar Pod */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-lg ${
                        isFree
                          ? 'bg-emerald-500/10 border-2 border-emerald-500/40 text-white'
                          : isBusy
                          ? 'bg-rose-500/10 border-2 border-rose-500/40 text-white'
                          : 'bg-amber-500/10 border-2 border-amber-500/40 text-white'
                      }`}>
                        {barber.emoji}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-charcoal-900 flex items-center justify-center ${
                        isFree ? 'bg-emerald-400' : isBusy ? 'bg-rose-500' : 'bg-amber-400'
                      }`}>
                        {isFree ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-charcoal-950" />
                        ) : isBusy ? (
                          <Scissors className="w-2.5 h-2.5 text-white" />
                        ) : (
                          <Coffee className="w-2.5 h-2.5 text-charcoal-950" />
                        )}
                      </span>
                    </div>

                    <div className="flex-1 sm:w-full">
                      <p className="font-semibold text-white group-hover:text-gold-300 transition-colors">
                        {barber.name}
                      </p>
                      <p className={`text-xs font-mono font-medium ${
                        isFree ? 'text-emerald-400' : isBusy ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {isBreak ? t.onBreak : isBusy ? t.busy : t.free}
                      </p>
                    </div>
                  </div>
                </Card3D>
              )
            })}
          </div>
        </motion.div>

        {/* Bottom Feature Badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-white/40 font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-gold-500" /> Real-time Sync
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gold-500" /> Fair FCFS Allocation
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold-500" /> VIP Lounge Experience
          </span>
        </div>
      </main>
    </div>
  )
}
