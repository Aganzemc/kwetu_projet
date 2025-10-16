import { useI18n } from '../contexts/I18nContext';
import { Globe2 } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const label = lang === 'en' ? 'English' : 'Français';
  const next = lang === 'en' ? 'fr' : 'en';
  return (
    <button
      onClick={() => setLang(next as any)}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black shadow hover:opacity-90 transition-opacity"
      title={label}
    >
      <Globe2 className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}


