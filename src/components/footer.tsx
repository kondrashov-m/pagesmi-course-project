'use client';

import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';

export function Footer() {
  const { t } = useTranslation();

  return (
    <motion.footer
      className="border-t border-white/10 bg-gradient-to-t from-slate-900/50 to-transparent py-6 mt-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span>{t('footer.author')}</span>
            <span className="text-white/20">•</span>
            <span>{t('footer.version')}</span>
          </motion.div>
          <motion.span
            className="text-white/10"
            whileHover={{ opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            {t('footer.copyright')}
          </motion.span>
        </motion.div>
      </div>
    </motion.footer>
  );
}
