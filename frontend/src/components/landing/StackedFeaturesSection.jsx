import React, { useRef, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { useLang } from '../../context/LangContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { StackCard } from './StackCard';

const VIEWPORT_ENTER = { once: true, amount: 0.35 };
const EASE_OUT = [0, 0, 0.58, 1];
const TEXT_TRANSITION = { duration: 0.4, ease: EASE_OUT };

export function getFeatureTextData(t) {
  return [
    { label: t('landing.value1Label'), title: t('landing.value1Title'), description: t('landing.value1Desc'), accent: 'accent' },
    { label: t('landing.value2Label'), title: t('landing.value2Title'), description: t('landing.value2Desc'), accent: 'red' },
    { label: t('landing.value3Label'), title: t('landing.value3Title'), description: t('landing.value3Desc'), accent: 'navy' },
  ];
}

function CardContentOrganized() {
  return (
    <>
      <div className="space-y-3 flex-1">
        <div className="h-4 w-1/2 rounded bg-brand-navy/15" />
        <div className="h-2 w-full rounded bg-brand-navy/5" />
        <div className="h-2 w-4/5 rounded bg-brand-navy/5" />
      </div>
      <div className="flex gap-2 pt-4 border-t border-brand-navy/10">
        <span className="px-2.5 py-1 text-xs font-medium rounded bg-brand-accent/15 text-brand-navy">Pass</span>
        <span className="px-2.5 py-1 text-xs font-medium rounded bg-brand-navy/10 text-brand-navy">v1.2</span>
      </div>
    </>
  );
}

function CardContentCollaboration() {
  return (
    <>
      <div className="flex gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-brand-navy/10" />
        <div className="w-8 h-8 rounded-full bg-brand-accent/20" />
        <div className="w-8 h-8 rounded-full bg-brand-navy/5" />
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full rounded bg-brand-navy/5" />
        <div className="h-2 w-3/4 rounded bg-brand-navy/5" />
        <div className="h-2 w-5/6 rounded bg-brand-navy/5" />
      </div>
    </>
  );
}

function CardContentReports() {
  return (
    <>
      <div className="flex items-baseline gap-4 mb-4">
        <div className="h-10 w-16 rounded bg-brand-navy/10" />
        <div className="h-6 w-12 rounded bg-brand-accent/20" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 rounded bg-brand-navy/5" />
        ))}
      </div>
    </>
  );
}

export function StackedFeaturesSection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressDebug, setProgressDebug] = useState(0);
  const { t } = useLang();
  const prefersReducedMotion = useReducedMotion();
  const featureData = useMemo(() => getFeatureTextData(t), [t]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setProgressDebug(v);
    const idx = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
    setActiveIndex(idx);
  });

  // Card transforms driven by scroll progress
  const cardAY = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, -4, -8, -8]);
  const cardAOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);
  const cardAScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 1]);
  const cardARotate = useTransform(scrollYProgress, [0, 1], [0, 0]);

  const cardBY = useTransform(scrollYProgress, [0, 0.33, 0.5, 0.66, 1], [80, 80, 24, 12, 12]);
  const cardBOpacity = useTransform(scrollYProgress, [0, 0.33, 0.45, 0.66, 1], [0, 0, 1, 1, 1]);
  const cardBScale = useTransform(scrollYProgress, [0, 0.33, 0.5, 0.66, 1], [0.985, 0.985, 1, 1, 1]);
  const cardBRotate = useTransform(scrollYProgress, [0, 0.33, 0.5, 0.66, 1], [0, 0, -2, -2, -2]);

  const cardCY = useTransform(scrollYProgress, [0, 0.66, 0.8, 1], [120, 120, 36, 24]);
  const cardCOpacity = useTransform(scrollYProgress, [0, 0.66, 0.78, 1], [0, 0, 1, 1]);
  const cardCScale = useTransform(scrollYProgress, [0, 0.66, 0.8, 1], [0.985, 0.985, 1, 1]);
  const cardCRotate = useTransform(scrollYProgress, [0, 0.66, 0.8, 1], [0, 0, 2, 2]);

  if (prefersReducedMotion) {
    return (
      <section className="py-16 md:py-20" aria-label="Features">
        <div className="max-w-6xl mx-auto px-6 md:px-8 space-y-12 md:space-y-16">
          {featureData.map((feature, i) => {
            const fLabelClass = feature.accent === 'accent' ? 'text-brand-accent' : feature.accent === 'red' ? 'text-brand-red' : 'text-brand-navy';
            const fBorderClass = feature.accent === 'accent' ? 'border-l-brand-accent' : feature.accent === 'red' ? 'border-l-brand-red' : 'border-l-brand-navy';
            const CardContent = i === 0 ? CardContentOrganized : i === 1 ? CardContentCollaboration : CardContentReports;
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT_ENTER}
                transition={{ duration: 0.8, ease: EASE_OUT }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-center"
              >
                <div className={`pl-6 border-l-4 ${fBorderClass}`}>
                  <p className={`text-sm font-medium uppercase tracking-wider mb-3 ${fLabelClass}`}>{feature.label}</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy tracking-tight">{feature.title}</h2>
                  <p className="mt-4 text-lg text-brand-navy/70 max-w-lg">{feature.description}</p>
                </div>
                <StackCard isReducedMotion className="aspect-[4/3]">
                  <CardContent />
                </StackCard>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  }

  const activeFeature = featureData[activeIndex];
  const labelClass = activeFeature.accent === 'accent' ? 'text-brand-accent' : activeFeature.accent === 'red' ? 'text-brand-red' : 'text-brand-navy';
  const borderClass = activeFeature.accent === 'accent' ? 'border-l-brand-accent' : activeFeature.accent === 'red' ? 'border-l-brand-red' : 'border-l-brand-navy';

  return (
    <section
      ref={sectionRef}
      className="relative h-[160vh] md:h-[200vh] lg:h-[220vh]"
      aria-label="Stacked features"
    >
      {/* Dev-only: scroll progress debug — remove after confirming */}
      {typeof import.meta !== 'undefined' && import.meta.env?.DEV && (
        <div
          className="fixed bottom-4 left-4 z-50 rounded bg-black/80 px-2 py-1 font-mono text-xs text-white pointer-events-none"
          aria-hidden
        >
          progress: <span data-scroll-progress>{progressDebug.toFixed(2)}</span> · step: {activeIndex}
        </div>
      )}

      <div className="sticky top-0 h-screen min-h-[600px] flex items-center justify-center py-12 md:py-16">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="relative min-h-[140px] lg:min-h-[160px] flex flex-col justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIndex}
                className={`absolute inset-0 flex flex-col justify-center pl-6 border-l-4 ${borderClass}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={TEXT_TRANSITION}
              >
                <p className={`text-sm font-medium uppercase tracking-wider mb-3 ${labelClass}`}>
                  {activeFeature.label}
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy tracking-tight leading-tight">
                  {activeFeature.title}
                </h2>
                <p className="mt-4 text-lg text-brand-navy/70 max-w-lg">
                  {activeFeature.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative flex justify-center items-center min-h-[280px] md:min-h-[320px]">
            <div className="w-full max-w-md relative group mx-auto">
              <div className="absolute inset-0 rounded-2xl -bottom-3 -right-2 bg-white/70 backdrop-blur-sm border border-brand-navy/10 shadow-sm pointer-events-none" aria-hidden />
              <div className="absolute -top-2 left-8 w-16 h-3 rounded-t bg-brand-navy/[0.08] border border-b-0 border-brand-navy/10 pointer-events-none" aria-hidden />
              <div className="relative w-full aspect-[4/3] max-h-[320px] overflow-visible flex justify-center items-center">
                <div className="relative w-full max-w-md aspect-[4/3] flex justify-center items-center">
                  <div className="relative w-full aspect-[4/3] max-w-md">
                    <StackCard
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 3,
                        y: cardAY,
                        opacity: cardAOpacity,
                        scale: cardAScale,
                        rotate: cardARotate,
                      }}
                      isReducedMotion={false}
                    >
                      <CardContentOrganized />
                    </StackCard>
                    <StackCard
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 2,
                        y: cardBY,
                        opacity: cardBOpacity,
                        scale: cardBScale,
                        rotate: cardBRotate,
                      }}
                      isReducedMotion={false}
                    >
                      <CardContentCollaboration />
                    </StackCard>
                    <StackCard
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        y: cardCY,
                        opacity: cardCOpacity,
                        scale: cardCScale,
                        rotate: cardCRotate,
                      }}
                      isReducedMotion={false}
                    >
                      <CardContentReports />
                    </StackCard>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
