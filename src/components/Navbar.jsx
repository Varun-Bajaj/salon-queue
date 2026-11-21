import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useQueueStore } from '../store/queueStore'
import { useT } from '../App'
import { Sparkles, Tv, Scissors, ShieldAlert, UserCheck, Volume2, VolumeX, KeyRound, LogOut } from 'lucide-react'
import { sound } from '../utils/audio'
import StaffModal from './StaffModal'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const t = useT()
  const { lang, setLang, queue, isStaffMode, setStaffMode } = useQueueStore()
  const [muted, setMuted] = useState(false)
  const [showStaffModal, setShowStaffModal] = useState(false)

  const waitingCount = queue.filter((c) => c.status === 'waiting').length

  const toggleSound = () => {
    sound.enabled = muted
    setMuted(!muted)
    if (muted) sound.playClick()
  }

  // Staff links when in staff mode
  const staffLinks = [
    { path: '/reception', label: 'Reception', icon: UserCheck },
    { path: '/display', label: 'TV Billboard', icon: Tv },
    { path: '/barber/ravi', label: 'Stylist HUD', icon: Scissors },
    { path: '/admin', label: 'Manager', icon: ShieldAlert },
  ]

  // Detect if current path is a staff path
  const isStaffRoute = ['/reception', '/admin', '/display'].includes(location.pathname) || location.pathname.startsWith('/barber')
  const inStaffPerspective = isStaffMode || isStaffRoute

  return (
    <>
      <AnimatePresence>
        {showStaffModal && <StaffModal onClose={() => setShowStaffModal(false)} />}
      </AnimatePresence>

      <header className="sticky top-0 z-50 px-4 py-2.5 bg-charcoal-950/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div
            onClick={() => {
              sound.playClick()
              navigate('/')
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative w-9 h-9 rounded-xl bg-gold-gradient p-[1px] shadow-gold-glow flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-charcoal-900 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base tracking-wider gold-gradient-text">
                  STYLE<span className="text-white">Q</span>
                </span>
                <span className={`text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded font-bold uppercase ${
                  inStaffPerspective
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                }`}>
                  {inStaffPerspective ? 'STAFF HUD' : 'GUEST LOUNGE'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls: Context-aware */}
          <div className="flex items-center gap-2">
            {/* If in Staff Mode: Show Staff Navigation Links */}
            {inStaffPerspective ? (
              <div className="flex items-center gap-1 bg-charcoal-900/90 p-1 rounded-xl border border-gold-500/20">
                {staffLinks.map((item) => {
                  const active = location.pathname === item.path
                  const Icon = item.icon
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        sound.playClick()
                        navigate(item.path)
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        active
                          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 shadow-inner'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </button>
                  )
                })}

                <button
                  onClick={() => {
                    sound.playClick()
                    setStaffMode(false)
                    navigate('/')
                  }}
                  title="Switch to Customer Mode"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Exit Staff</span>
                </button>
              </div>
            ) : (
              /* If in Customer Mode: Clean Customer Controls + Staff Portal Login */
              <div className="flex items-center gap-2">
                {waitingCount > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-900 border border-gold-500/30 text-xs font-mono shadow-inner-gold">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping" />
                    <span className="text-white/80">{waitingCount} Waiting</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    sound.playClick()
                    setShowStaffModal(true)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/40 text-xs text-white/70 hover:text-gold-300 transition-all flex items-center gap-1.5 font-mono shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5 text-gold-400" />
                  <span>Staff Portal</span>
                </button>
              </div>
            )}

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={muted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              className="w-8 h-8 rounded-xl bg-charcoal-850 border border-white/10 flex items-center justify-center text-white/60 hover:text-gold-400 hover:border-gold-500/30 transition-all active:scale-95"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-gold-400" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => {
                sound.playClick()
                setLang(lang === 'en' ? 'gu' : 'en')
              }}
              className="px-2.5 py-1.5 rounded-xl bg-charcoal-850 border border-gold-500/20 text-xs font-semibold text-gold-300 hover:bg-gold-500/10 transition-all flex items-center gap-1 font-mono active:scale-95"
            >
              <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
              <span>{lang === 'en' ? 'ગુ' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
