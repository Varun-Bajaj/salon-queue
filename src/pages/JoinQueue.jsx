import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import { ChevronLeft, Check } from 'lucide-react'
import LangToggle from '../components/LangToggle'

export default function JoinQueue() {
  const navigate = useNavigate()
  const t = useT()
  const { services, barbers, queue, joinQueue, queueOpen, lang } = useQueueStore()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [preferredBarberId, setPreferredBarberId] = useState('any')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [existingId, setExistingId] = useState(null)

  const activeServices = services.filter(s => s.active)
  const dutyBarbers = barbers.filter(b => b.onDuty)

  const totalMinutes = activeServices
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.minutes, 0)

  const totalPrice = activeServices
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  // Estimate wait
  const activeBarberCount = Math.max(barbers.filter(b => b.onDuty && !b.onBreak).length, 1)
  const waitingTotal = queue.filter(c => c.status === 'waiting').reduce((s, c) => s + c.totalMinutes, 0)
  const expectedWait = selectedServices.length > 0
    ? Math.ceil((waitingTotal + totalMinutes) / activeBarberCount)
    : 0

  function toggleService(id) {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id))
    } else if (selectedServices.length < 3) {
      setSelectedServices([...selectedServices, id])
    } else {
      setErrors(e => ({ ...e, services: t.maxServices }))
      setTimeout(() => setErrors(e => ({ ...e, services: null })), 2000)
    }
  }

  function validate() {
    const e = {}
    if (!name.trim()) e.name = t.nameError
    if (!/^\d{10}$/.test(phone.trim())) e.phone = t.phoneError
    if (selectedServices.length === 0) e.services = 'Select at least one service'
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)

    const result = joinQueue({
      name: name.trim(),
      phone: phone.trim(),
      serviceIds: selectedServices,
      preferredBarberId,
    })

    if (result.error === 'duplicate') {
      setExistingId(result.customerId)
      setSubmitting(false)
      return
    }

    navigate(`/status/${result.customerId}`)
  }

  if (existingId) {
    return (
      <div className="min-h-screen bg-charcoal-darker flex flex-col items-center justify-center p-6">
        <div className="card max-w-sm w-full text-center space-y-4">
          <div className="text-5xl">ℹ️</div>
          <h2 className="text-xl font-bold text-white">{t.alreadyInQueue}</h2>
          <button className="btn-gold w-full" onClick={() => navigate(`/status/${existingId}`)}>
            {t.viewStatus}
          </button>
          <button className="btn-outline w-full" onClick={() => setExistingId(null)}>
            {t.back}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-darker pb-32">
      {/* Top bar */}
      <div className="bg-charcoal border-b border-white/5 px-4 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="flex-1 text-lg font-semibold text-white">{t.joinQueue}</h1>
        <LangToggle small />
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-white/60 text-sm mb-1.5">{t.yourName}</label>
          <input
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            placeholder={t.yourName}
            value={name}
            onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: null })) }}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-white/60 text-sm mb-1.5">{t.yourPhone}</label>
          <input
            className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="9876543210"
            value={phone}
            onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setErrors(er => ({ ...er, phone: null })) }}
            type="tel"
            maxLength={10}
            inputMode="numeric"
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Services */}
        <div>
          <label className="block text-white/60 text-sm mb-2">{t.selectServices}</label>
          {errors.services && <p className="text-amber-400 text-xs mb-2">{errors.services}</p>}
          <div className="grid grid-cols-1 gap-2">
            {activeServices.map(s => {
              const selected = selectedServices.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => toggleService(s.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all
                    ${selected
                      ? 'bg-gold/15 border-gold text-white'
                      : 'bg-charcoal border-white/10 text-white/80 hover:border-white/30'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${selected ? 'border-gold bg-gold' : 'border-white/30'}`}>
                      {selected && <Check size={12} className="text-charcoal-darker" />}
                    </div>
                    <span className="font-medium">{lang === 'gu' ? s.nameGu : s.nameEn}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-semibold">{t.rupee}{s.price}</p>
                    <p className="text-white/40 text-xs">{s.minutes} {t.min}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Barber picker */}
        <div>
          <label className="block text-white/60 text-sm mb-2">{t.selectBarber}</label>
          <div className="grid grid-cols-2 gap-2">
            {/* Any barber */}
            <button
              onClick={() => setPreferredBarberId('any')}
              className={`p-3 rounded-xl border text-sm transition-all
                ${preferredBarberId === 'any'
                  ? 'bg-gold/15 border-gold text-white'
                  : 'bg-charcoal border-white/10 text-white/60 hover:border-white/30'
                }`}
            >
              ⚡ {t.anyBarber}
            </button>
            {dutyBarbers.map(b => (
              <button
                key={b.id}
                onClick={() => setPreferredBarberId(b.id)}
                className={`p-3 rounded-xl border text-sm transition-all
                  ${preferredBarberId === b.id
                    ? 'bg-gold/15 border-gold text-white'
                    : 'bg-charcoal border-white/10 text-white/60 hover:border-white/30'
                  }`}
              >
                <span className="text-xl block mb-0.5">{b.emoji}</span>
                {b.name}
                {b.onBreak && <span className="block text-xs text-amber-400">({t.onBreak})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky summary + confirm */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-charcoal border-t border-white/10 p-4 space-y-3">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-white/60 mb-1">
              <span>{t.totalTime}: <strong className="text-white">{totalMinutes} {t.min}</strong></span>
              <span>{t.totalPrice}: <strong className="text-gold">{t.rupee}{totalPrice}</strong></span>
            </div>
            {expectedWait > 0 && (
              <p className="text-xs text-white/40 mb-3">{t.expectedWait}: ~{expectedWait} {t.min}</p>
            )}
            <button
              className="btn-gold w-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? t.loading : t.confirm}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
