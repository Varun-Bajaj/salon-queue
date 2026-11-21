import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import { ChevronLeft } from 'lucide-react'
import LangToggle from '../components/LangToggle'

function ElapsedTimer({ startTime }) {
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
  return <span>{mins}:{String(secs).padStart(2, '0')}</span>
}

export default function BarberView() {
  const { name } = useParams()
  const navigate = useNavigate()
  const t = useT()
  const { barbers, queue, services, toggleBarberBreak, startService, markDone, lang } = useQueueStore()

  const barber = barbers.find(b => b.name.toLowerCase() === name?.toLowerCase())

  if (!barber) {
    return (
      <div className="min-h-screen bg-charcoal-darker flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-white/60 mb-4">Barber "{name}" not found.</p>
          <button className="btn-outline" onClick={() => navigate('/')}>Home</button>
        </div>
      </div>
    )
  }

  const currentCustomer = barber.currentCustomerId
    ? queue.find(c => c.id === barber.currentCustomerId)
    : null

  // Next customer for this barber
  const nextCustomer = queue
    .filter(c => c.status === 'waiting' && (c.preferredBarberId === barber.id || c.preferredBarberId === 'any'))
    .sort((a, b) => a.joinedAt - b.joinedAt)[0] || null

  const svcNames = (c) => c.serviceIds.map(id => {
    const s = services.find(sv => sv.id === id)
    return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : ''
  }).join(', ')

  return (
    <div className="min-h-screen bg-charcoal-darker">
      {/* Header */}
      <div className="bg-charcoal border-b border-white/5 px-4 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white">{barber.emoji} {barber.name}</h1>
          <p className="text-xs text-white/40">{t.barberView}</p>
        </div>
        <LangToggle small />
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-5">
        {/* Break toggle */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{barber.onBreak ? t.onBreakToggle : t.available}</p>
            <p className="text-white/40 text-xs">{barber.onBreak ? 'Currently on break' : 'Ready for customers'}</p>
          </div>
          <button
            onClick={() => toggleBarberBreak(barber.id)}
            className={`relative w-14 h-7 rounded-full transition-colors ${barber.onBreak ? 'bg-amber-500' : 'bg-green-500'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${barber.onBreak ? 'left-0.5' : 'left-7'}`} />
          </button>
        </div>

        {/* Current customer */}
        <div className="card">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">{t.currentCustomer}</p>
          {currentCustomer ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold">
                  {currentCustomer.token}
                </div>
                <div>
                  <p className="font-semibold text-white text-lg">{currentCustomer.name}</p>
                  <p className="text-white/50 text-sm">{svcNames(currentCustomer)}</p>
                </div>
              </div>

              {currentCustomer.status === 'called' && (
                <div className="mb-4">
                  <p className="text-blue-400 text-sm text-center mb-3">Customer called — waiting to arrive</p>
                  <button
                    className="btn-gold w-full text-lg"
                    onClick={() => startService(currentCustomer.id)}
                  >
                    ✂️ {t.start}
                  </button>
                </div>
              )}

              {currentCustomer.status === 'inChair' && (
                <div>
                  <div className="bg-charcoal-light rounded-xl p-3 mb-4 text-center">
                    <p className="text-white/40 text-xs mb-1">{t.timeElapsed}</p>
                    <p className="text-2xl font-bold text-gold font-mono">
                      <ElapsedTimer startTime={currentCustomer.startedAt} />
                    </p>
                  </div>
                  <button
                    className="btn-gold w-full text-lg bg-green-600 hover:bg-green-700 shadow-green-600/20"
                    onClick={() => markDone(currentCustomer.id)}
                  >
                    ✅ {t.done}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/40 text-center py-4">{t.noCustomerYet}</p>
          )}
        </div>

        {/* Next customer */}
        {nextCustomer && (
          <div className="card border-gold/20">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{t.nextForYou}</p>
            <div className="flex items-center gap-3">
              <span className="text-gold font-mono font-bold">{nextCustomer.token}</span>
              <div>
                <p className="text-white font-medium">{nextCustomer.name}</p>
                <p className="text-white/50 text-xs">{svcNames(nextCustomer)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
