'use client';

import { useSession, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Footer } from '@/components/footer';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, Palette, Zap as ZapIcon, Download } from 'lucide-react';
import { motion } from 'framer-motion';

function LandingPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: Palette,
      title: t('landing.features.dragdrop'),
      description: 'Перетаскивайте элементы для создания уникального дизайна'
    },
    {
      icon: ZapIcon,
      title: t('landing.features.templates'),
      description: 'Используйте готовые шаблоны для быстрого старта'
    },
    {
      icon: Download,
      title: t('landing.features.export'),
      description: 'Экспортируйте готовые страницы в HTML и CSS'
    }
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Language Switcher */}
      <motion.div
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <LanguageSwitcher />
      </motion.div>

      {/* Header */}
      <motion.header
        className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Zap className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">PagesMi</h1>
          </motion.div>
          <div className="flex items-center gap-4">
            {status === 'authenticated' ? (
              <motion.span
                className="text-white/60 text-sm"
                variants={itemVariants}
              >
                {t('nav.welcome')}, {session?.user?.email}
              </motion.span>
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <Button variant="ghost" onClick={() => router.push('/auth/login')} className="text-white/80">
                    {t('nav.login')}
                  </Button>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button onClick={() => router.push('/auth/register')} className="bg-blue-600 hover:bg-blue-700">
                    {t('nav.signup')}
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <motion.div
            className="text-center space-y-8"
            variants={containerVariants}
          >
            <motion.h2
              className="text-5xl md:text-6xl font-bold text-white leading-tight"
              variants={itemVariants}
            >
              {t('landing.title')}
              <br />
              <motion.span
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: '200% 200%' }}
              >
                {t('landing.subtitle')}
              </motion.span>
            </motion.h2>

            <motion.p
              className="text-xl text-white/60 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              PagesMi — это визуальный конструктор страниц, который позволяет создавать потрясающие веб-сайты с интуитивным интерфейсом перетаскивания. Технические навыки не требуются.
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-4 pt-8"
              variants={itemVariants}
            >
              {status === 'authenticated' ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {t('nav.dashboard')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      onClick={() => router.push('/auth/register')}
                    >
                      {t('landing.cta')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => router.push('/auth/login')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {t('nav.login')}
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="mt-32 grid md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <SessionProvider>
      <LandingPageContent />
    </SessionProvider>
  );
}
