import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import Navbar from '../components/Navbar'
import ThreeBackground from '../components/ThreeBackground'
import Card3D from '../components/Card3D'
import { sound } from '../utils/audio'
import { ChevronLeft, ShieldCheck, ToggleLeft, ToggleRight, Edit3, Check, DollarSign, Clock, Users, UserX, Scissors } from 'lucide-react'

export default function Admin() {
  const navigate = useNavigate()
  const t = useT()
  const {
    services, barbers, queueOpen, todayStats, lang,
    toggleService, toggleBarberDuty, setQueueOpen, updateService, resetStats
  } = useQueueStore()

  const [editingService, setEditingService] = useState(null)
  const [editForm, setEditForm] = useState({})

  const avgWait = todayStats.served > 0
    ? Math.round(todayStats.totalWaitMin / todayStats.served)
    : 0

  function startEdit(s) {
    sound.playClick()
    setEditingService(s.id)
    setEditForm({ price: s.price, minutes: s.minutes, nameEn: s.nameEn, nameGu: s.nameGu })
  }

  function saveEdit(id) {
    sound.playGoldChime()
    updateService(id, {
      price: Number(editForm.price) || 0,
      minutes: Number(editForm.minutes) || 0,
      nameEn: editForm.nameEn,
      nameGu: editForm.nameGu,
    })
    setEditingService(null)
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col relative pb-24">
      <ThreeBackground />
      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 pt-6 relative z-10 space-y-6">
        <button
          onClick={() => {
            sound.playClick()
            navigate('/')
          }}
          className="inline-flex items-center gap-2 text-white/50 hover:text-gold-400 text-xs font-mono uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Lounge</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Executive <span className="gold-gradient-text">Manager Suite</span>
            </h1>
            <p className="text-white/40 text-xs font-mono mt-0.5">
              Service catalog, live duty roster & analytics
            </p>
          </div>
        </div>

        {/* 3D KPI Metrics Cards */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold">
              {t.todayStats}
            </h2>
            <button
              onClick={() => {
                sound.playClick()
                resetStats()
              }}
              className="text-xs font-mono text-white/30 hover:text-white transition-colors"
            >
              Reset Metrics
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card3D maxRotate={8} className="glass-panel rounded-2xl p-5 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase text-white/40">{t.served}</p>
                  <p className="text-4xl font-mono font-bold text-emerald-400 mt-1">{todayStats.served}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </Card3D>

            <Card3D maxRotate={8} className="glass-panel rounded-2xl p-5 border border-gold-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase text-white/40">{t.avgWait}</p>
                  <p className="text-4xl font-mono font-bold text-gold-300 mt-1">{avgWait}m</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </Card3D>

            <Card3D maxRotate={8} className="glass-panel rounded-2xl p-5 border border-rose-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono uppercase text-white/40">{t.noShows}</p>
                  <p className="text-4xl font-mono font-bold text-rose-400 mt-1">{todayStats.noShows}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <UserX className="w-6 h-6" />
                </div>
              </div>
            </Card3D>
          </div>
        </div>

        {/* Queue Switch Bar */}
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between border border-white/10">
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">{t.queueControl}</h3>
            <p className="text-white/40 text-xs">
              {queueOpen ? 'Online customer reservations are currently OPEN' : 'Online reservations are CLOSED (Walk-in only)'}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick()
              setQueueOpen(!queueOpen)
            }}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              queueOpen
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {queueOpen ? t.openQueue : t.closeQueue}
          </button>
        </div>

        {/* Master Stylists Roster */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold mb-3 px-1">
            {t.barbersOnDuty}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {barbers.map((b) => (
              <div
                key={b.id}
                className="glass-panel rounded-2xl p-4 flex items-center justify-between border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{b.emoji}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{b.name}</p>
                    <span className="text-[10px] font-mono text-white/40">
                      {b.onDuty ? 'On Duty' : 'Off Shift'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick()
                    toggleBarberDuty(b.id)
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    b.onDuty ? 'bg-gold-500' : 'bg-charcoal-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      b.onDuty ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Services Catalog */}
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold mb-3 px-1">
            {t.services} Catalog Management
          </h2>

          <div className="space-y-3">
            {services.map((s) => (
              <div key={s.id} className="glass-panel rounded-2xl p-4 border border-white/10">
                {editingService === s.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-white/40 font-mono">Title (EN)</label>
                        <input
                          style={{ backgroundColor: '#131722', color: '#ffffff' }}
                          className="w-full border border-white/20 rounded-xl p-2 text-xs text-white"
                          value={editForm.nameEn}
                          onChange={(e) => setEditForm((f) => ({ ...f, nameEn: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 font-mono">Title (GU)</label>
                        <input
                          style={{ backgroundColor: '#131722', color: '#ffffff' }}
                          className="w-full border border-white/20 rounded-xl p-2 text-xs text-white"
                          value={editForm.nameGu}
                          onChange={(e) => setEditForm((f) => ({ ...f, nameGu: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-white/40 font-mono">Price (₹)</label>
                        <input
                          type="number"
                          style={{ backgroundColor: '#131722', color: '#ffffff' }}
                          className="w-full border border-white/20 rounded-xl p-2 text-xs text-white"
                          value={editForm.price}
                          onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 font-mono">Duration (Min)</label>
                        <input
                          type="number"
                          style={{ backgroundColor: '#131722', color: '#ffffff' }}
                          className="w-full border border-white/20 rounded-xl p-2 text-xs text-white"
                          value={editForm.minutes}
                          onChange={(e) => setEditForm((f) => ({ ...f, minutes: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEdit(s.id)}
                        className="btn-luxury-gold flex-1 text-xs font-bold py-2"
                      >
                        {t.save}
                      </button>
                      <button
                        onClick={() => setEditingService(null)}
                        className="btn-luxury-outline flex-1 text-xs py-2"
                      >
                        {t.close}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${s.active ? 'text-white' : 'text-white/40 line-through'}`}>
                          {lang === 'gu' ? s.nameGu : s.nameEn}
                        </span>
                        {!s.active && (
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-gold-400 mt-0.5">
                        {t.rupee}{s.price} · {s.minutes} {t.min}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startEdit(s)}
                        className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-white/60 hover:text-white hover:border-gold-500/40 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick()
                          toggleService(s.id)
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          s.active ? 'bg-gold-500' : 'bg-charcoal-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                            s.active ? 'left-6' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
