import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import { X, Plus } from 'lucide-react'
import LangToggle from '../components/LangToggle'

function WalkInModal({ onClose, t }) {
  const { services, barbers, joinQueue, lang } = useQueueStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [preferredBarberId, setPreferredBarberId] = useState('any')
  const [err, setErr] = useState('')

  const activeServices = services.filter(s => s.active)

  function toggle(id) {
    if (selectedServices.includes(id)) setSelectedServices(s => s.filter(x => x !== id))
    else if (selectedServices.length < 3) setSelectedServices(s => [...s, id])
  }

  function submit() {
    if (!name.trim()) { setErr('Name required'); return }
    if (!/^\d{10}$/.test(phone.trim())) { setErr('Valid 10-digit phone required'); return }
    if (!selectedServices.length) { setErr('Select a service'); return }
    joinQueue({ name: name.trim(), phone: phone.trim(), serviceIds: selectedServices, preferredBarberId })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-charcoal rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">{t.addWalkIn}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3">
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <input className="input-field" placeholder={t.yourName} value={name} onChange={e => setName(e.target.value)} />
          <input className="input-field" placeholder="Phone (10 digits)" value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} inputMode="numeric" />
          <p className="text-white/40 text-xs">{t.selectServices}</p>
          <div className="grid grid-cols-1 gap-1.5">
            {activeServices.map(s => (
              <button key={s.id} onClick={() => toggle(s.id)}
                className={`text-left p-2.5 rounded-xl border text-sm transition-all
                  ${selectedServices.includes(s.id) ? 'border-gold bg-gold/10 text-white' : 'border-white/10 text-white/70'}`}>
                {lang === 'gu' ? s.nameGu : s.nameEn} — {t.rupee}{s.price} · {s.minutes}m
              </button>
            ))}
          </div>
          <select className="input-field"
            value={preferredBarberId} onChange={e => setPreferredBarberId(e.target.value)}>
            <option value="any">{t.anyBarber}</option>
            {useQueueStore.getState().barbers.filter(b => b.onDuty).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button className="btn-gold w-full" onClick={submit}>{t.confirm}</button>
        </div>
      </div>
    </div>
  )
}

function BarberCard({ barber, t, lang }) {
  const { queue, services, callNext } = useQueueStore()
  const current = barber.currentCustomerId
    ? queue.find(c => c.id === barber.currentCustomerId)
    : null

  const timeInChair = current?.startedAt
    ? Math.round((Date.now() - current.startedAt) / 60000)
    : current?.calledAt
      ? Math.round((Date.now() - current.calledAt) / 60000)
      : 0

  const hasNext = !!queue.filter(c => c.status === 'waiting')
    .find(c => c.preferredBarberId === barber.id || c.preferredBarberId === 'any')

  return (
    <div className={`card ${barber.onBreak ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{barber.emoji}</span>
        <div>
          <p className="font-semibold text-white">{barber.name}</p>
          <span className={`text-xs ${barber.onBreak ? 'text-amber-400' : barber.currentCustomerId ? 'text-red-400' : 'text-green-400'}`}>
            {barber.onBreak ? t.onBreak : barber.currentCustomerId ? t.busy : t.free}
          </span>
        </div>
      </div>

      {current ? (
        <div className="bg-charcoal-light rounded-xl p-3 mb-3">
          <p className="text-white/40 text-xs mb-0.5">{t.currentCustomer}</p>
          <p className="font-medium text-white">{current.name}</p>
          <p className="text-white/50 text-xs">{current.token} · {timeInChair} min</p>
        </div>
      ) : (
        <div className="bg-charcoal-light rounded-xl p-3 mb-3">
          <p className="text-white/30 text-sm">{t.noCurrentCustomer}</p>
        </div>
      )}

      {!barber.onBreak && (
        <button
          onClick={() => callNext(barber.id)}
          disabled={!!barber.currentCustomerId || !hasNext}
          className={`btn-gold w-full text-sm ${(barber.currentCustomerId || !hasNext) ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {t.callNext}
        </button>
      )}
    </div>
  )
}

export default function Reception() {
  const navigate = useNavigate()
  const t = useT()
  const { queue, services, barbers, markNoShow, cancelCustomer, lang } = useQueueStore()
  const [showModal, setShowModal] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 5000)
    return () => clearInterval(iv)
  }, [])

  const activeQueue = queue
    .filter(c => ['waiting', 'called'].includes(c.status))
    .sort((a, b) => a.joinedAt - b.joinedAt)

  const now = Date.now()

  return (
    <div className="min-h-screen bg-charcoal-darker">
      {showModal && <WalkInModal onClose={() => setShowModal(false)} t={t} />}

      {/* Header */}
      <div className="bg-charcoal border-b border-white/5 px-4 pt-10 pb-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-white">{t.receptionDashboard}</h1>
          <div className="flex items-center gap-3">
            <LangToggle small />
            <button
              onClick={() => setShowModal(true)}
              className="btn-gold flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> {t.addWalkIn}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Barber cards */}
          <div>
            <h2 className="text-white/40 text-xs uppercase tracking-wider mb-3">{t.barbers}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {barbers.filter(b => b.onDuty).map(b => (
                <BarberCard key={b.id} barber={b} t={t} lang={lang} />
              ))}
            </div>
          </div>

          {/* Right: Waiting list */}
          <div>
            <h2 className="text-white/40 text-xs uppercase tracking-wider mb-3">
              {t.waitingList} · {activeQueue.length}
            </h2>
            {activeQueue.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-white/40">{t.noCustomers}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeQueue.map((c, idx) => {
                  const waitMin = Math.round((now - c.joinedAt) / 60000)
                  const isLong = waitMin > 60
                  const svcNames = c.serviceIds.map(id => {
                    const s = services.find(sv => sv.id === id)
                    return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : ''
                  }).join(', ')
                  const prefBarber = c.preferredBarberId !== 'any'
                    ? barbers.find(b => b.id === c.preferredBarberId)
                    : null

                  return (
                    <div key={c.id} className={`card flex items-start gap-3 ${isLong ? 'border-amber-500/40' : ''}`}>
                      <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gold font-mono text-sm">{c.token}</span>
                          <span className="font-medium text-white">{c.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            c.status === 'called' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                          }`}>{c.status === 'called' ? t.called : t.waiting}</span>
                        </div>
                        <p className="text-white/50 text-xs mt-0.5 truncate">{svcNames}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {prefBarber && <span className="text-xs text-white/40">{prefBarber.emoji} {prefBarber.name}</span>}
                          <span className={`text-xs ${isLong ? 'text-amber-400' : 'text-white/30'}`}>
                            {waitMin}m {isLong ? '⚠️' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {c.status === 'called' && (
                          <button
                            onClick={() => markNoShow(c.id)}
                            className="text-xs border border-red-500/40 text-red-400 rounded-lg px-2 py-1 hover:bg-red-500/10 min-h-[32px]"
                          >
                            {t.noShow}
                          </button>
                        )}
                        <button
                          onClick={() => cancelCustomer(c.id)}
                          className="text-xs border border-white/20 text-white/50 rounded-lg px-2 py-1 hover:bg-white/5 min-h-[32px]"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
