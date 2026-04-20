
'use client';

import { LoginForm } from '@/components/login-form';
import { Footer } from '@/components/footer';
import { LanguageSwitcher } from '@/components/language-switcher';
import { SessionProvider } from 'next-auth/react';
import { motion } from 'framer-motion';

function LoginPageContent() {
  return (
    <motion.div
      className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated background elements */}
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

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <LoginForm />
      </div>

      <Footer />
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginPageContent />
    </SessionProvider>
  );
}
