'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Аккаунт успешно создан! Выполняется вход...');

        // Auto-login after successful registration
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setError('Регистрация прошла успешно, но вход не удался. Попробуйте войти вручную.');
        }
      } else {
        setError(data.error || 'Ошибка при регистрации');
      }
    } catch (err) {
      setError('Произошла неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      className="w-full max-w-md"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Liquid Glass Card */}
      <motion.div
        className="relative p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Gradient overlay effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <motion.h1
            className="text-3xl font-bold text-white mb-2"
            variants={itemVariants}
          >
            {t('auth.register.title')}
          </motion.h1>
          <motion.p
            className="text-white/60 mb-8"
            variants={itemVariants}
          >
            Создайте свой аккаунт в PagesMi
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name Input */}
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <Label htmlFor="displayName" className="text-white text-sm font-medium">
                {t('auth.register.name')}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Ваше имя"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                    required
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Email Input */}
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <Label htmlFor="email" className="text-white text-sm font-medium">
                {t('auth.register.email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                    required
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <Label htmlFor="password" className="text-white text-sm font-medium">
                {t('auth.register.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                    required
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
                {t('auth.register.confirmPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                    required
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {success}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создание аккаунта...
                  </>
                ) : (
                  <>
                    {t('auth.register.submit')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Sign In Link */}
          <motion.div
            className="mt-6 text-center"
            variants={itemVariants}
          >
            <p className="text-white/60 text-sm">
              {t('auth.register.hasAccount')}{' '}
              <motion.button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('auth.register.login')}
              </motion.button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
