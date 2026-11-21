import { useNavigate } from 'react-router-dom'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import LangToggle from '../components/LangToggle'

function BarberChip({ barber, t }) {
  const statusColor = barber.onBreak
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : barber.currentCustomerId
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-green-500/20 text-green-400 border-green-500/30'

  const statusLabel = barber.onBreak
    ? t.onBreak
    : barber.currentCustomerId
      ? t.busy
      : t.free

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${statusColor}`}>
      <span>{barber.emoji}</span>
      <span className="font-medium">{barber.name}</span>
      <span className="text-xs opacity-70">· {statusLabel}</span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const t = useT()
  const { barbers, queue, queueOpen, services } = useQueueStore()

  const activeQueue = queue.filter(c => ['waiting', 'called', 'inChair'].includes(c.status))
  const waitingCount = queue.filter(c => c.status === 'waiting').length
  const activeBarbers = Math.max(barbers.filter(b => b.onDuty && !b.onBreak).length, 1)
  const totalWaitMin = activeQueue.reduce((s, c) => s + c.totalMinutes, 0)
  const estimatedWait = Math.ceil(totalWaitMin / activeBarbers)

  const dutyBarbers = barbers.filter(b => b.onDuty)

  return (
    <div className="min-h-screen bg-charcoal-darker flex flex-col">
      {/* Header */}
      <div className="relative bg-charcoal border-b border-white/5 px-4 pt-10 pb-6">
        <div className="absolute top-4 right-4">
          <LangToggle />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center text-2xl">✂️</div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t.appName}</h1>
            <p className="text-gold text-sm">{t.tagline}</p>
          </div>
        </div>

        {/* Open badge */}
        <div className="mt-3">
          {queueOpen ? (
            <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-400 border border-green-500/30 text-sm font-medium px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {t.open} · {t.closesAt}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-red-500/15 text-red-400 border border-red-500/30 text-sm font-medium px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              {t.closed} · {t.walkInOnly}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Queue status card */}
        <div className="card">
          {waitingCount === 0 ? (
            <p className="text-center text-green-400 font-medium py-2">{t.noOneWaiting}</p>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-white">{waitingCount}</p>
                <p className="text-white/60 text-sm">{t.peopleWaiting}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gold">{estimatedWait}</p>
                <p className="text-white/60 text-sm">{t.min} {t.minWait}</p>
              </div>
            </div>
          )}
        </div>

        {/* Barber chips */}
        {dutyBarbers.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{t.barbers}</p>
            <div className="flex flex-wrap gap-2">
              {dutyBarbers.map(b => (
                <BarberChip key={b.id} barber={b} t={t} />
              ))}
            </div>
          </div>
        )}

        {/* Join button */}
        <div className="pt-4">
          {queueOpen ? (
            <button
              onClick={() => navigate('/join')}
              className="btn-gold w-full text-lg animate-pulse-gold"
            >
              {t.joinQueue}
            </button>
          ) : (
            <div className="text-center">
              <div className="card bg-red-900/20 border-red-500/20 mb-3">
                <p className="text-red-400">{t.queueClosedMsg}</p>
              </div>
              <button disabled className="btn-gold w-full opacity-40 cursor-not-allowed">
                {t.queueClosed}
              </button>
            </div>
          )}
        </div>

        {/* Staff quick links */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Staff</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🧾 Reception', path: '/reception' },
              { label: '📺 TV Display', path: '/display' },
              ...barbers.filter(b => b.onDuty).map(b => ({
                label: `${b.emoji} ${b.name}`,
                path: `/barber/${b.name.toLowerCase()}`,
              })),
              { label: '⚙️ Admin', path: '/admin' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-white/50 hover:text-white/80 text-sm border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-3 transition-colors text-left"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
