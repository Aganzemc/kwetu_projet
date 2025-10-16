import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type Lang = 'en' | 'fr';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    app_name: 'KwetuCode',
    welcome_back: 'Welcome Back',
    sign_in_to_account: 'Sign in to your account',
    email_address: 'Email Address',
    password: 'Password',
    sign_in: 'Sign In',
    signing_in: 'Signing in...',
    dont_have_account: "Don't have an account?",
    sign_up: 'Sign up',
    create_account: 'Create Account',
    join_today: 'Join KwetuCode today',
    confirm_password: 'Confirm Password',
    creating_account: 'Creating account...',
    already_have_account: 'Already have an account?',
  },
  fr: {
    app_name: 'KwetuCode',
    welcome_back: 'Content de vous revoir',
    sign_in_to_account: 'Connectez-vous à votre compte',
    email_address: 'Adresse e-mail',
    password: 'Mot de passe',
    sign_in: 'Se connecter',
    signing_in: 'Connexion...',
    dont_have_account: "Vous n'avez pas de compte ?",
    sign_up: 'Créer un compte',
    create_account: 'Créer un compte',
    join_today: 'Rejoignez KwetuCode dès aujourd’hui',
    confirm_password: 'Confirmez le mot de passe',
    creating_account: 'Création du compte...',
    already_have_account: 'Vous avez déjà un compte ?',
  }
};

type I18nContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const value = useMemo<I18nContextType>(() => ({
    lang,
    setLang,
    t: (key: string) => translations[lang][key] ?? key,
  }), [lang]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}


