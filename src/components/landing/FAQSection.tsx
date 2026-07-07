'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;

export function FAQSection() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | null>(FAQ_KEYS[0]);

  return (
    <section id="faq" className="border-y border-border bg-surface py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            {t('landing.faq.title')}
          </h2>
          <p className="mt-3 text-muted-secondary">{t('landing.faq.subtitle')}</p>
        </motion.div>

        <div className="space-y-3">
          {FAQ_KEYS.map((key) => {
            const isOpen = open === key;
            return (
              <div
                key={key}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-white">
                    {t(`landing.faq.items.${key}.q`)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-gold transition',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-secondary">
                        {t(`landing.faq.items.${key}.a`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
