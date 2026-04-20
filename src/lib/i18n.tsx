'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

export type Locale = 'ru' | 'en';
export const locales: Locale[] = ['ru', 'en'];
export const defaultLocale: Locale = 'ru';

const translations: Record<Locale, Record<string, any>> = {
  ru: {
    nav: {
      login: 'Войти',
      signup: 'Регистрация',
      logout: 'Выйти',
      dashboard: 'Панель управления',
      welcome: 'Добро пожаловать'
    },
    landing: {
      title: 'Создавайте страницы без кода',
      subtitle: 'Визуальный конструктор страниц с ИИ-помощью',
      features: {
        dragdrop: 'Перетаскивание элементов',
        templates: 'Готовые шаблоны',
        export: 'Экспорт в HTML/CSS'
      },
      cta: 'Начать создание'
    },
    auth: {
      login: {
        title: 'Вход в аккаунт',
        email: 'Электронная почта',
        password: 'Пароль',
        submit: 'Войти',
        noAccount: 'Нет аккаунта?',
        signup: 'Зарегистрироваться'
      },
      register: {
        title: 'Создание аккаунта',
        name: 'Полное имя',
        email: 'Электронная почта',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        submit: 'Создать аккаунт',
        hasAccount: 'Уже есть аккаунт?',
        login: 'Войти'
      }
    },
    footer: {
      author: 'Автор: kondrashov-m',
      version: 'Версия: 2.1',
      copyright: '© 2026 PagesMi. Все права защищены.'
    }
  },
  en: {
    nav: {
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      dashboard: 'Dashboard',
      welcome: 'Welcome'
    },
    landing: {
      title: 'Create pages without code',
      subtitle: 'Visual page builder with AI assistance',
      features: {
        dragdrop: 'Drag & drop elements',
        templates: 'Ready-made templates',
        export: 'Export to HTML/CSS'
      },
      cta: 'Start creating'
    },
    auth: {
      login: {
        title: 'Sign in to your account',
        email: 'Email',
        password: 'Password',
        submit: 'Sign in',
        noAccount: "Don't have an account?",
        signup: 'Sign up'
      },
      register: {
        title: 'Create your account',
        name: 'Full name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        submit: 'Create account',
        hasAccount: 'Already have an account?',
        login: 'Sign in'
      }
    },
    footer: {
      author: 'Author: kondrashov-m',
      version: 'Version: 2.1',
      copyright: '© 2026 PagesMi. All rights reserved.'
    }
  }
};

export function getLocaleFromPath(pathname?: string): Locale {
  if (!pathname) return defaultLocale;
  const matched = pathname.split('/')[1];
  if (matched && locales.includes(matched as Locale)) {
    return matched as Locale;
  }
  return defaultLocale;
}

export function useLocale(): Locale {
  const pathname = usePathname();
  return useMemo(() => getLocaleFromPath(pathname ?? '/'), [pathname]);
}

export function useTranslation() {
  const locale = useLocale();

  return {
    locale,
    t: (key: string) => getTranslation(locale, key)
  };
}

export function getTranslation(locale: Locale, key: string) {
  const keys = key.split('.');
  let current: any = translations[locale];

  for (const segment of keys) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      return key;
    }
  }

  return typeof current === 'string' ? current : key;
}

export function buildLocalizedPath(pathname: string, locale: Locale) {
  const basePath = pathname.replace(/^\/(ru|en)/, '');
  return `/${locale}${basePath}`;
}
