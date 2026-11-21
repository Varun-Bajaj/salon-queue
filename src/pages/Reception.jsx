import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import Navbar from '../components/Navbar'
import ThreeBackground from '../components/ThreeBackground'
import Card3D from '../components/Card3D'
import { sound } from '../utils/audio'
import {
  X, Plus, UserCheck, Clock, Scissors, AlertCircle, Phone, Check,
  UserX, Trash2, Sparkles, ChevronRight
} from 'lucide-react'

function WalkInModal({ onClose, t }) {
  const { services, barbers, joinQueue, lang } = useQueueStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [preferredBarberId, setPreferredBarberId] = useState('any')
  const [err, setErr] = useState('')

  const activeServices = services.filter((s) => s.active)

  function toggle(id) {
    sound.playClick()
    if (selectedServices.includes(id)) setSelectedServices((s) => s.filter((x) => x !== id))
    else if (selectedServices.length < 3) setSelectedServices((s) => [...s, id])
  }

  function submit() {
    if (!name.trim()) { setErr('Guest name required'); return }
    if (!/^\d{10}$/.test(phone.trim())) { setErr('Valid 10-digit phone required'); return }
    if (!selectedServices.length) { setErr('Select at least 1 service'); return }

    sound.playGoldChime()
    joinQueue({ name: name.trim(), phone: phone.trim(), serviceIds: selectedServices, preferredBarberId })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel-gold rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-gold-400" />
            <h3 className="font-display font-bold text-lg text-white">{t.addWalkIn}</h3>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose() }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {err && (
          <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl mb-4">
            {err}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-xs mb-1 font-medium">{t.yourName}</label>
            <input
              className="w-full bg-charcoal-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1 font-medium">{t.yourPhone}</label>
            <input
              className="w-full bg-charcoal-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-gold-500"
              placeholder="10-digit mobile number"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-2 font-medium">{t.selectServices} (max 3)</label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
              {activeServices.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={`text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    selectedServices.includes(s.id)
                      ? 'border-gold-400 bg-gold-500/20 text-white'
                      : 'border-white/10 bg-charcoal-900/60 text-white/70 hover:border-white/20'
                  }`}
                >
                  <span className="font-semibold">{lang === 'gu' ? s.nameGu : s.nameEn}</span>
                  <span className="font-mono text-gold-300 font-bold">{t.rupee}{s.price} · {s.minutes}m</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1 font-medium">{t.selectBarber}</label>
            <select
              className="w-full bg-charcoal-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              value={preferredBarberId}
              onChange={(e) => setPreferredBarberId(e.target.value)}
            >
              <option value="any">⚡ Any Available Stylist (Fastest)</option>
              {useQueueStore.getState().barbers.filter((b) => b.onDuty).map((b) => (
                <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={submit}
            className="btn-luxury-gold w-full text-sm font-bold mt-2"
          >
            {t.confirm}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function BarberStationCard({ barber, t, lang }) {
  const { queue, callNext } = useQueueStore()
  const current = barber.currentCustomerId
    ? queue.find((c) => c.id === barber.currentCustomerId)
    : null

  const timeInChair = current?.startedAt
    ? Math.round((Date.now() - current.startedAt) / 60000)
    : current?.calledAt
    ? Math.round((Date.now() - current.calledAt) / 60000)
    : 0

  const hasNext = !!queue
    .filter((c) => c.status === 'waiting')
    .find((c) => c.preferredBarberId === barber.id || c.preferredBarberId === 'any')

  return (
    <Card3D maxRotate={6} className={`glass-panel rounded-2xl p-5 border ${barber.onBreak ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-charcoal-900 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
            {barber.emoji}
          </div>
          <div>
            <p className="font-bold text-white text-base">{barber.name}</p>
            <span className={`text-[10px] font-mono tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full ${
              barber.onBreak
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : barber.currentCustomerId
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {barber.onBreak ? t.onBreak : barber.currentCustomerId ? t.busy : t.free}
            </span>
          </div>
        </div>
      </div>

      {current ? (
        <div className="bg-charcoal-900/90 rounded-xl p-3.5 border border-white/5 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">{t.currentCustomer}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-sm">{current.name}</p>
              <span className="text-gold-400 font-mono font-bold text-xs">{current.token}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400">{timeInChair} min</span>
              <p className="text-[10px] text-white/40">{current.status === 'inChair' ? 'In Chair' : 'Called'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-charcoal-900/40 rounded-xl p-4 border border-dashed border-white/10 text-center mb-4">
          <p className="text-white/30 text-xs font-mono">Chair Vacant</p>
        </div>
      )}

      {!barber.onBreak && (
        <button
          onClick={() => {
            sound.playGoldChime()
            callNext(barber.id)
          }}
          disabled={!!barber.currentCustomerId || !hasNext}
          className={`w-full py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all ${
            barber.currentCustomerId || !hasNext
              ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
              : 'bg-gold-metallic text-charcoal-950 shadow-gold-glow hover:shadow-gold-glow-lg font-bold'
          }`}
        >
          {t.callNext}
        </button>
      )}
    </Card3D>
  )
}

export default function Reception() {
  const t = useT()
  const { queue, services, barbers, markNoShow, cancelCustomer, lang } = useQueueStore()
  const [showModal, setShowModal] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 3000)
    return () => clearInterval(iv)
  }, [])

  const activeQueue = queue
    .filter((c) => ['waiting', 'called'].includes(c.status))
    .sort((a, b) => a.joinedAt - b.joinedAt)

  const now = Date.now()

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col relative pb-20">
      <ThreeBackground />
      <Navbar />

      <AnimatePresence>
        {showModal && <WalkInModal onClose={() => setShowModal(false)} t={t} />}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto w-full px-4 pt-6 relative z-10">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Reception <span className="gold-gradient-text">Command Center</span>
            </h1>
            <p className="text-white/40 text-xs font-mono mt-0.5">
              Live floor management & guest dispatching
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick()
              setShowModal(true)
            }}
            className="btn-luxury-gold text-xs font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-charcoal-950 stroke-[3]" />
            <span>{t.addWalkIn}</span>
          </button>
        </div>

        {/* 2-Column Split: Stylist Pods + Live Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stylist Pods Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5" />
                <span>Active Stylist Pods</span>
              </h2>
              <span className="text-xs font-mono text-white/40">
                {barbers.filter((b) => b.onDuty && !b.onBreak).length} Online
              </span>
            </div>

            <div className="space-y-3">
              {barbers.filter((b) => b.onDuty).map((b) => (
                <BarberStationCard key={b.id} barber={b} t={t} lang={lang} />
              ))}
            </div>
          </div>

          {/* Waiting List Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between px-1 mb-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{t.waitingList} ({activeQueue.length})</span>
              </h2>
              <span className="text-xs font-mono text-white/40">First-Come, First-Served</span>
            </div>

            {activeQueue.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 text-gold-400 mx-auto flex items-center justify-center text-2xl mb-3">
                  ✨
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-1">Queue Clear</h3>
                <p className="text-white/40 text-xs">{t.noCustomers}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeQueue.map((c, idx) => {
                  const waitMin = Math.round((now - c.joinedAt) / 60000)
                  const isLong = waitMin > 60
                  const svcNames = c.serviceIds
                    .map((sid) => {
                      const s = services.find((sv) => sv.id === sid)
                      return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : ''
                    })
                    .join(' · ')
                  const prefBarber = c.preferredBarberId !== 'any'
                    ? barbers.find((b) => b.id === c.preferredBarberId)
                    : null

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass-panel rounded-2xl p-4 flex items-center gap-4 transition-all border ${
                        isLong ? 'border-amber-500/50 bg-amber-500/5' : 'hover:border-white/20'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-charcoal-900 border border-gold-500/30 flex items-center justify-center font-mono font-bold text-gold-300 text-sm shadow-inner flex-shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-gold-400 text-sm">{c.token}</span>
                          <span className="font-semibold text-white text-sm truncate">{c.name}</span>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                            c.status === 'called'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {c.status === 'called' ? t.called : t.waiting}
                          </span>
                        </div>

                        <p className="text-white/40 text-xs mt-0.5 truncate">{svcNames}</p>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-white/50">
                          {prefBarber && (
                            <span className="text-gold-300/80">Stylist: {prefBarber.name}</span>
                          )}
                          <span className={isLong ? 'text-amber-400 font-bold' : ''}>
                            Waited: {waitMin}m {isLong ? '⚠️ >60m' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {c.status === 'called' && (
                          <button
                            onClick={() => {
                              sound.playClick()
                              markNoShow(c.id)
                            }}
                            title="Mark No-Show"
                            className="px-2.5 py-1.5 rounded-xl border border-rose-500/40 text-rose-400 text-xs hover:bg-rose-500/10 transition-colors flex items-center gap-1 font-mono"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t.noShow}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            sound.playClick()
                            cancelCustomer(c.id)
                          }}
                          title="Cancel reservation"
                          className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
