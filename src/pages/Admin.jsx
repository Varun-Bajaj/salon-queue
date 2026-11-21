import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import { ChevronLeft, ToggleLeft, ToggleRight } from 'lucide-react'
import LangToggle from '../components/LangToggle'

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
    setEditingService(s.id)
    setEditForm({ price: s.price, minutes: s.minutes, nameEn: s.nameEn, nameGu: s.nameGu })
  }

  function saveEdit(id) {
    updateService(id, {
      price: Number(editForm.price) || 0,
      minutes: Number(editForm.minutes) || 0,
      nameEn: editForm.nameEn,
      nameGu: editForm.nameGu,
    })
    setEditingService(null)
  }

  return (
    <div className="min-h-screen bg-charcoal-darker">
      {/* Header */}
      <div className="bg-charcoal border-b border-white/5 px-4 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-white">{t.ownerSettings}</h1>
        <LangToggle small />
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Today's Stats */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white/40 text-xs uppercase tracking-wider">{t.todayStats}</h2>
            <button onClick={resetStats} className="text-xs text-white/30 hover:text-white/60">Reset</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t.served, value: todayStats.served, color: 'text-green-400' },
              { label: t.avgWait, value: `${avgWait}m`, color: 'text-gold' },
              { label: t.noShows, value: todayStats.noShows, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="card text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-white/40 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Queue Control */}
        <div className="card">
          <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4">{t.queueControl}</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">{queueOpen ? t.openQueue : t.closeQueue}</p>
              <p className="text-white/40 text-xs">
                {queueOpen ? 'Customers can join online' : 'Online joining disabled'}
              </p>
            </div>
            <button
              onClick={() => setQueueOpen(!queueOpen)}
              className={`relative w-16 h-8 rounded-full transition-colors ${queueOpen ? 'bg-green-500' : 'bg-red-500/50'}`}
            >
              <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${queueOpen ? 'left-9' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Barbers */}
        <div>
          <h2 className="text-white/40 text-xs uppercase tracking-wider mb-3">{t.barbersOnDuty}</h2>
          <div className="space-y-2">
            {barbers.map(b => (
              <div key={b.id} className="card flex items-center gap-4">
                <span className="text-2xl">{b.emoji}</span>
                <p className="flex-1 font-medium text-white">{b.name}</p>
                <button
                  onClick={() => toggleBarberDuty(b.id)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${b.onDuty ? 'bg-green-500' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${b.onDuty ? 'left-7' : 'left-0.5'}`} />
                </button>
                <span className="text-xs w-10 text-right text-white/40">{b.onDuty ? t.free : 'Off'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-white/40 text-xs uppercase tracking-wider mb-3">{t.services}</h2>
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="card">
                {editingService === s.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input className="input-field text-sm" placeholder="Name EN"
                        value={editForm.nameEn} onChange={e => setEditForm(f => ({ ...f, nameEn: e.target.value }))} />
                      <input className="input-field text-sm" placeholder="નામ GU"
                        value={editForm.nameGu} onChange={e => setEditForm(f => ({ ...f, nameGu: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-white/40 text-xs">Price (₹)</label>
                        <input className="input-field text-sm" type="number"
                          value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-white/40 text-xs">Duration (min)</label>
                        <input className="input-field text-sm" type="number"
                          value={editForm.minutes} onChange={e => setEditForm(f => ({ ...f, minutes: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-gold flex-1 text-sm py-2" onClick={() => saveEdit(s.id)}>{t.save}</button>
                      <button className="btn-outline flex-1 text-sm py-2" onClick={() => setEditingService(null)}>{t.close}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${s.active ? 'text-white' : 'text-white/40'}`}>
                          {lang === 'gu' ? s.nameGu : s.nameEn}
                        </p>
                        {!s.active && <span className="text-xs text-red-400">Off</span>}
                      </div>
                      <p className="text-white/40 text-xs">{t.rupee}{s.price} · {s.minutes} {t.min}</p>
                    </div>
                    <button onClick={() => startEdit(s)}
                      className="text-xs text-white/40 hover:text-white px-2 py-1 border border-white/10 rounded-lg">
                      Edit
                    </button>
                    <button
                      onClick={() => toggleService(s.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${s.active ? 'bg-gold' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${s.active ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
