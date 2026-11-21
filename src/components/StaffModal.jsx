import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueueStore } from '../store/queueStore'
import { sound } from '../utils/audio'
import { KeyRound, X, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function StaffModal({ onClose }) {
  const navigate = useNavigate()
  const { setStaffMode } = useQueueStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  // Default demo pin is 1234
  const handleVerify = (enteredPin = pin) => {
    if (enteredPin === '1234') {
      sound.playGoldChime()
      setStaffMode(true)
      onClose()
      navigate('/reception')
    } else {
      sound.playClick()
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  const handleQuickDemo = () => {
    handleVerify('1234')
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-panel-gold rounded-3xl w-full max-w-sm p-6 relative border border-gold-500/40"
      >
        <button
          onClick={() => {
            sound.playClick()
            onClose()
          }}
          className="absolute top-5 right-5 text-white/50 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gold-500/20 text-gold-400 mx-auto flex items-center justify-center mb-3 shadow-gold-glow">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-display font-bold text-white">Staff & Admin Access</h2>
          <p className="text-white/50 text-xs mt-1">
            Enter authorized salon PIN or use Instant Demo Login.
          </p>
        </div>

        {error && (
          <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl mb-4 text-center">
            Invalid PIN. Default test PIN is <strong>1234</strong>
          </p>
        )}

        <div className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={4}
              value={pin}
              placeholder="Enter 4-digit PIN (1234)"
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify()
              }}
              style={{ backgroundColor: '#11151f', color: '#ffffff' }}
              className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-2xl py-3 border border-white/20 focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            onClick={() => handleVerify()}
            className="btn-luxury-gold w-full text-sm font-bold flex items-center justify-center gap-2"
          >
            <span>Unlock Staff Console</span>
            <ArrowRight className="w-4 h-4 text-charcoal-950" />
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-white/30 text-[10px] font-mono uppercase">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Quick Demo Access */}
          <button
            onClick={handleQuickDemo}
            className="w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-gold-500/10 border border-gold-500/30 text-gold-300 font-mono text-xs flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
            <span>Quick Demo Staff Login (PIN: 1234)</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
