import { useQueueStore } from '../store/queueStore'

export default function LangToggle({ small }) {
  const { lang, setLang } = useQueueStore()

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'gu' : 'en')}
      className={`flex items-center gap-1.5 border border-white/10 rounded-full transition-colors hover:border-gold/40 hover:text-gold
        ${small ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'} text-white/50`}
      title="Toggle language"
    >
      <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
      <span>{lang === 'en' ? 'ગુ' : 'EN'}</span>
    </button>
  )
}
