import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import Navbar from '../components/Navbar'
import ThreeBackground from '../components/ThreeBackground'
import Card3D from '../components/Card3D'
import { sound } from '../utils/audio'
import { ChevronLeft, Check, Sparkles, Zap, Clock, ShieldAlert, ArrowRight, User, Phone } from 'lucide-react'

export default function JoinQueue() {
  const navigate = useNavigate()
  const t = useT()
  const { services, barbers, queue, joinQueue, lang } = useQueueStore()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [preferredBarberId, setPreferredBarberId] = useState('any')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [existingId, setExistingId] = useState(null)

  const activeServices = services.filter((s) => s.active)
  const dutyBarbers = barbers.filter((b) => b.onDuty)

  const totalMinutes = activeServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.minutes, 0)

  const totalPrice = activeServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0)

  // Waiting estimate
  const activeBarberCount = Math.max(barbers.filter((b) => b.onDuty && !b.onBreak).length, 1)
  const waitingTotal = queue.filter((c) => c.status === 'waiting').reduce((s, c) => s + c.totalMinutes, 0)
  const expectedWait = selectedServices.length > 0 ? Math.ceil((waitingTotal + totalMinutes) / activeBarberCount) : 0

  function toggleService(id) {
    sound.playClick()
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((s) => s !== id))
    } else if (selectedServices.length < 3) {
      setSelectedServices([...selectedServices, id])
    } else {
      setErrors((e) => ({ ...e, services: t.maxServices }))
      setTimeout(() => setErrors((e) => ({ ...e, services: null })), 2500)
    }
  }

  function validate() {
    const e = {}
    if (!name.trim()) e.name = t.nameError
    if (!/^\d{10}$/.test(phone.trim())) e.phone = t.phoneError
    if (selectedServices.length === 0) e.services = 'Please select at least 1 luxury service'
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    setSubmitting(true)

    const result = joinQueue({
      name: name.trim(),
      phone: phone.trim(),
      serviceIds: selectedServices,
      preferredBarberId,
    })

    if (result.error === 'duplicate') {
      sound.playClick()
      setExistingId(result.customerId)
      setSubmitting(false)
      return
    }

    sound.playGoldChime()
    navigate(`/status/${result.customerId}`)
  }

  // Already in queue modal
  if (existingId) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-6 relative">
        <ThreeBackground />
        <Card3D maxRotate={10} className="glass-panel-gold rounded-3xl p-8 max-w-sm w-full text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">{t.alreadyInQueue}</h2>
          <p className="text-white/60 text-sm mb-6">
            You currently have an active reservation associated with this phone number.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                sound.playClick()
                navigate(`/status/${existingId}`)
              }}
              className="btn-luxury-gold w-full text-sm font-bold"
            >
              {t.viewStatus}
            </button>
            <button
              onClick={() => {
                sound.playClick()
                setExistingId(null)
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
    <div className="min-h-screen bg-charcoal-950 flex flex-col relative pb-36">
      <ThreeBackground />
      <Navbar />

      <main className="max-w-2xl mx-auto w-full px-4 pt-4 relative z-10">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => {
            sound.playClick()
            navigate('/')
          }}
          className="inline-flex items-center gap-2 text-white/50 hover:text-gold-400 text-xs font-mono uppercase tracking-widest mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Lounge</span>
        </button>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
            Reserve Your <span className="gold-gradient-text">Salon Chair</span>
          </h1>
          <p className="text-white/50 text-xs sm:text-sm font-light">
            Select your desired treatments and preferred artisan.
          </p>
        </div>

        {/* Form Inputs Container */}
        <div className="space-y-6">
          {/* Guest Details */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>Guest Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-white/70 text-xs font-medium mb-1.5">{t.yourName}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    placeholder="e.g. Varun Bajaj"
                    autoComplete="off"
                    onChange={(e) => {
                      setName(e.target.value)
                      setErrors((er) => ({ ...er, name: null }))
                    }}
                    style={{ backgroundColor: '#131722', color: '#ffffff' }}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none transition-all border ${
                      errors.name ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-white/20 focus:border-gold-500 focus:ring-1 focus:ring-gold-500'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-white/70 text-xs font-medium mb-1.5">{t.yourPhone}</label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    placeholder="10-digit mobile"
                    autoComplete="off"
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''))
                      setErrors((er) => ({ ...er, phone: null }))
                    }}
                    style={{ backgroundColor: '#131722', color: '#ffffff' }}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-mono font-medium text-white placeholder-slate-500 focus:outline-none transition-all border ${
                      errors.phone ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-white/20 focus:border-gold-500 focus:ring-1 focus:ring-gold-500'
                    }`}
                  />
                  {phone.length === 10 && (
                    <span className="absolute right-3 top-3.5 text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </div>
                {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Luxury Services Selector */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.selectServices}</span>
              </h2>
              <span className="text-xs text-white/50 font-mono">
                {selectedServices.length}/3 Selected
              </span>
            </div>

            {errors.services && (
              <p className="text-amber-400 text-xs bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl mb-3">
                {errors.services}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeServices.map((service) => {
                const isSelected = selectedServices.includes(service.id)
                return (
                  <Card3D
                    key={service.id}
                    maxRotate={8}
                    onClick={() => toggleService(service.id)}
                    className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-gold-500/15 border-gold-400 shadow-gold-glow'
                        : 'glass-panel hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-gold-500 border-gold-400 text-charcoal-950 scale-105'
                              : 'border-white/20 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">
                            {lang === 'gu' ? service.nameGu : service.nameEn}
                          </p>
                          <p className="text-white/40 text-xs flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{service.minutes} {t.min}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-bold text-gold-300 text-base">
                          {t.rupee}{service.price}
                        </p>
                      </div>
                    </div>
                  </Card3D>
                )
              })}
            </div>
          </div>

          {/* Stylist Preference Picker */}
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold mb-3 px-1 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.selectBarber}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Any Barber (Fastest) */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  setPreferredBarberId('any')
                }}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  preferredBarberId === 'any'
                    ? 'bg-gold-500/20 border-gold-400 shadow-gold-glow text-white'
                    : 'glass-panel text-white/70 hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center mb-1.5">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="font-bold text-xs">Any Barber</p>
                <p className="text-[10px] text-gold-400 font-mono mt-0.5">⚡ Fastest Turn</p>
              </button>

              {/* Individual Barbers */}
              {dutyBarbers.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    sound.playClick()
                    setPreferredBarberId(b.id)
                  }}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    preferredBarberId === b.id
                      ? 'bg-gold-500/20 border-gold-400 shadow-gold-glow text-white'
                      : 'glass-panel text-white/70 hover:border-white/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-charcoal-900 border border-white/10 mx-auto flex items-center justify-center text-xl mb-1.5 shadow-inner">
                    {b.emoji}
                  </div>
                  <p className="font-bold text-xs truncate">{b.name}</p>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">
                    {b.onBreak ? `(${t.onBreak})` : b.currentCustomerId ? 'Busy' : 'Available'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating 3D Action Summary Bar */}
      <AnimatePresence>
        {selectedServices.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 p-4 z-40 bg-charcoal-950/90 backdrop-blur-2xl border-t border-white/10"
          >
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                <div>
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
                    {t.totalTime} & {t.totalPrice}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono font-bold text-gold-300">
                      {t.rupee}{totalPrice}
                    </span>
                    <span className="text-xs text-white/60 font-mono">
                      · {totalMinutes} {t.min}
                    </span>
                  </div>
                </div>

                <div className="text-right sm:text-left">
                  <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">
                    {t.expectedWait}
                  </p>
                  <p className="text-sm font-mono font-semibold text-emerald-400">
                    ~{expectedWait} {t.min}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-luxury-gold w-full sm:w-auto sm:min-w-[220px] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-charcoal-950" />
                <span className="font-bold">{submitting ? t.loading : t.confirm}</span>
                <ArrowRight className="w-4 h-4 text-charcoal-950" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
