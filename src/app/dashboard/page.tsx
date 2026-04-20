
'use client';

import { signOut, useSession, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LogOut, Plus, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function DashboardPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  const handleCreateProject = () => {
    alert('Редактор откроется скоро!');
  };

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
      transition: { duration: 0.6 }
    }
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-white text-lg"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Загрузка...
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>

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
            <motion.span
              className="text-white/60 text-sm"
              variants={itemVariants}
            >
              Добро пожаловать, {session?.user?.email}
            </motion.span>
            <motion.div variants={itemVariants}>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white/80 hover:text-white hover:bg-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.logout')}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            className="text-center space-y-8"
            variants={containerVariants}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white"
              variants={itemVariants}
            >
              Ваш {t('nav.dashboard')}
            </motion.h2>
            <motion.p
              className="text-xl text-white/60 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Создавайте и управляйте своими проектами визуального редактора страниц
            </motion.p>

            {/* Create Project Button */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Создать новый проект
              </Button>
            </motion.div>

            {/* Projects Grid */}
            <motion.div
              className="mt-16"
              variants={containerVariants}
            >
              <motion.div
                className="text-center py-16"
                variants={itemVariants}
              >
                <motion.div
                  className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Zap className="w-12 h-12 text-white/40" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-white mb-2">Нет проектов</h3>
                <p className="text-white/60">Начните с создания вашего первого проекта</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardPageContent />
    </SessionProvider>
  );
}
