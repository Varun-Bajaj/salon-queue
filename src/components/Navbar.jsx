import { useNavigate, useLocation } from 'react-router-dom'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import { Sparkles, Tv, Scissors, ShieldAlert, UserCheck, Volume2, VolumeX } from 'lucide-react'
import { sound } from '../utils/audio'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const t = useT()
  const { lang, setLang, queue } = useQueueStore()
  const [muted, setMuted] = useState(false)

  const waitingCount = queue.filter(c => c.status === 'waiting').length

  const toggleSound = () => {
    sound.enabled = muted
    setMuted(!muted)
    if (muted) sound.playClick()
  }

  const navLinks = [
    { path: '/', label: 'Lounge', icon: Scissors },
    { path: '/reception', label: 'Reception', icon: UserCheck },
    { path: '/display', label: 'TV Billboard', icon: Tv },
    { path: '/admin', label: 'Manager', icon: ShieldAlert },
  ]

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-charcoal-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => { sound.playClick(); navigate('/') }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gold-gradient p-[1px] shadow-gold-glow flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-charcoal-900 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg tracking-wider gold-gradient-text">
                STYLE<span className="text-white">Q</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20 uppercase">
                VIP
              </span>
            </div>
            <p className="text-[10px] text-white/40 tracking-widest uppercase font-mono hidden sm:block">
              Haute Coiffure & Lounge
            </p>
          </div>
        </div>

        {/* Live Counter Pill */}
        {waitingCount > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-850 border border-gold-500/30 text-xs shadow-inner-gold">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
            <span className="text-white/80 font-medium">{waitingCount} VIPs Waiting</span>
          </div>
        )}

        {/* Navigation Quick Links */}
        <nav className="flex items-center gap-1.5">
          <div className="hidden lg:flex items-center gap-1 bg-charcoal-900/90 p-1 rounded-xl border border-white/5">
            {navLinks.map((item) => {
              const active = location.pathname === item.path
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => { sound.playClick(); navigate(item.path) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 shadow-inner'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={muted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="w-9 h-9 rounded-xl bg-charcoal-850 border border-white/10 flex items-center justify-center text-white/60 hover:text-gold-400 hover:border-gold-500/30 transition-all active:scale-95"
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-gold-400" />}
          </button>

          {/* Gujarati / English Toggle */}
          <button
            onClick={() => {
              sound.playClick()
              setLang(lang === 'en' ? 'gu' : 'en')
            }}
            className="px-3 py-1.5 rounded-xl bg-charcoal-850 border border-gold-500/20 text-xs font-semibold text-gold-300 hover:bg-gold-500/10 hover:border-gold-500/50 transition-all flex items-center gap-1.5 active:scale-95 shadow-inner"
          >
            <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
            <span className="font-mono">{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
