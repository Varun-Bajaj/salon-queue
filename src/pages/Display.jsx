import { useState, useEffect, useRef } from 'react'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'

export default function Display() {
  const t = useT()
  const { barbers, queue, services, lang } = useQueueStore()
  const [tick, setTick] = useState(0)
  const [flashId, setFlashId] = useState(null)
  const prevCalled = useRef(new Set())

  // Refresh every 2 seconds
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(iv)
  }, [])

  // Flash newly called tokens
  useEffect(() => {
    const currentCalled = new Set(
      queue.filter(c => c.status === 'called').map(c => c.id)
    )
    for (const id of currentCalled) {
      if (!prevCalled.current.has(id)) {
        setFlashId(id)
        setTimeout(() => setFlashId(null), 4000)
        // Play chime
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(880, ctx.currentTime)
          osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
          gain.gain.setValueAtTime(0.3, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
          osc.start(); osc.stop(ctx.currentTime + 0.6)
        } catch {}
      }
    }
    prevCalled.current = currentCalled
  }, [queue])

  const dutyBarbers = barbers.filter(b => b.onDuty)

  const upNext = queue
    .filter(c => c.status === 'waiting')
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .slice(0, 5)

  const svcNames = (c) => c.serviceIds.map(id => {
    const s = services.find(sv => sv.id === id)
    return s ? (lang === 'gu' ? s.nameGu : s.nameEn) : ''
  }).join(', ')

  return (
    <div className="min-h-screen bg-charcoal-darker p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="text-4xl">✂️</span>
          <div>
            <h1 className="text-4xl font-black text-white">StyleQ</h1>
            <p className="text-gold text-lg">{t.tagline}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-sm">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-6">
        {/* Barber stations */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-white/40 uppercase tracking-widest text-sm">{t.nowServing}</h2>
          {dutyBarbers.map(barber => {
            const current = barber.currentCustomerId
              ? queue.find(c => c.id === barber.currentCustomerId)
              : null
            const isFlash = current && flashId === current.id

            return (
              <div
                key={barber.id}
                className={`card flex items-center gap-5 py-5 transition-all duration-500 ${isFlash ? 'flash-gold border-gold' : ''}`}
              >
                <div className="text-5xl">{barber.emoji}</div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{barber.name}</p>
                  <span className={`text-sm ${
                    barber.onBreak ? 'text-amber-400' :
                    current ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {barber.onBreak ? t.onBreak : current ? t.busy : t.free}
                  </span>
                </div>
                {current ? (
                  <div className="text-right">
                    <p className="text-3xl font-black text-gold">{current.token}</p>
                    <p className="text-white/60 text-sm">{current.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{svcNames(current)}</p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-white/20 text-xl">—</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Up Next */}
        <div>
          <h2 className="text-white/40 uppercase tracking-widest text-sm mb-4">{t.upNext}</h2>
          {upNext.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-3xl mb-2">😊</p>
              <p className="text-white/40">{t.noOneWaiting}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upNext.map((c, idx) => {
                const prefBarber = c.preferredBarberId !== 'any'
                  ? barbers.find(b => b.id === c.preferredBarberId)
                  : null
                return (
                  <div key={c.id} className="card flex items-center gap-3">
                    <div className="text-xl font-bold text-gold/50">{idx + 1}</div>
                    <div className="flex-1">
                      <p className="font-mono font-bold text-gold text-lg">{c.token}</p>
                      <p className="text-white/70 text-sm">{c.name}</p>
                      {prefBarber && (
                        <p className="text-white/40 text-xs">{prefBarber.emoji} {prefBarber.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-xs">~{c.estimatedWaitMin}m</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-white/20 text-sm">
        Auto-refreshes every 2s · Join queue at the reception or on your phone
      </div>
    </div>
  )
}
