import React, { useRef, useMemo, useState } from 'react';
import { motion, useScroll, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { useLang } from '../../context/LangContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
const VIEWPORT_ENTER = { once: true, amount: 0.35 };
const EASE_OUT = [0, 0, 0.58, 1];
// Shared stack-up animation: left copy and right card use the same motion so they feel in sync.
const STACK_UP_TRANSITION = { duration: 0.45, ease: EASE_OUT };
const stackUpInitial = { opacity: 0, y: 24 };
const stackUpAnimate = { opacity: 1, y: 0 };
const stackUpExit = { opacity: 0, y: -24 };

// Scroll distance for the pin so "Clear documentation" (last step) stays visible long enough before next section.
const SCROLL_DISTANCE_PX = 1100;
// Vertical spacing to sections above/below (64–80px).
const SECTION_PADDING = 'py-16 md:py-20';

export function getFeatureTextData(t) {
  return [
    { label: t('landing.value1Label'), title: t('landing.value1Title'), description: t('landing.value1Desc'), accent: 'accent' },
    { label: t('landing.value2Label'), title: t('landing.value2Title'), description: t('landing.value2Desc'), accent: 'red' },
    { label: t('landing.value3Label'), title: t('landing.value3Title'), description: t('landing.value3Desc'), accent: 'navy' },
  ];
}

export function StackedFeaturesSection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useLang();
  const prefersReducedMotion = useReducedMotion();
  const featureData = useMemo(() => getFeatureTextData(t), [t]);

  // Scroll progress over the section: 0 = section entering, 1 = section exited. No background change — only cards animate.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Progress 0→1 as section moves from viewport bottom to viewport top (full scroll through the section).
    offset: ['start end', 'end start'],
  });

  // Step thresholds: "Test cases in one place" (step 0) and "Clear documentation" (step 2) get longer holds so each stays visible long enough to read.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = v < 0.4 ? 0 : v < 0.65 ? 1 : 2;
    setActiveIndex(idx);
  });

  // User screenshots for the 3 cards: Organized (Projects), Collaboration, Reports (project detail).
  const CARD_IMAGES = ['/landing/card-organized.png', '/landing/card-collaboration.png', '/landing/card-reports.png'];

  if (prefersReducedMotion) {
    return (
      <section className={SECTION_PADDING} aria-label="Features">
        <div className="max-w-6xl mx-auto px-6 md:px-8 space-y-8 md:space-y-10">
          {featureData.map((feature, i) => {
            const fLabelClass = feature.accent === 'accent' ? 'text-brand-accent' : feature.accent === 'red' ? 'text-brand-red' : 'text-brand-navy';
            const fBorderClass = feature.accent === 'accent' ? 'border-l-brand-accent' : feature.accent === 'red' ? 'border-l-brand-red' : 'border-l-brand-navy';
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
                <div className="rounded-xl overflow-hidden border border-brand-navy/10 bg-white shadow-lg aspect-[4/3] max-w-lg">
                  <img src={CARD_IMAGES[i]} alt="" className="w-full h-full object-cover object-top" />
                </div>
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
      className={`relative overflow-visible ${SECTION_PADDING}`}
      aria-label="Stacked features"
    >
      {/* Wrapper height = viewport + scroll distance. Pin works because no ancestor has overflow/transform. */}
      <div
        className="relative"
        style={{ height: `calc(100vh + ${SCROLL_DISTANCE_PX}px)` }}
      >
        {/* Pin: sticky stays centered in viewport while user scrolls through the section. top-0 + h-screen + flex center = content centered. */}
        <div className="sticky top-0 h-screen flex items-center justify-center py-8 md:py-10">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-center">
            {/* Left: copy with stack-up animation (in sync with right card) */}
            <div className="relative min-h-[140px] lg:min-h-[160px] flex flex-col justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeIndex}
                  className={`absolute inset-0 flex flex-col justify-center pl-6 border-l-4 ${borderClass}`}
                  initial={stackUpInitial}
                  animate={stackUpAnimate}
                  exit={stackUpExit}
                  transition={STACK_UP_TRANSITION}
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

            {/* Right: single card per step, same stack-up animation as left */}
            <div className="relative flex justify-center items-center min-h-[260px] md:min-h-[300px]">
              <div className="w-full max-w-lg relative mx-auto flex justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeIndex}
                    className="w-full max-w-lg aspect-[4/3] max-h-[300px] flex justify-center items-center"
                    initial={stackUpInitial}
                    animate={stackUpAnimate}
                    exit={stackUpExit}
                    transition={STACK_UP_TRANSITION}
                  >
                    <div className="w-full h-full relative" aria-hidden>
                      {/* Stack effect: soft shadow layers behind the card */}
                      <div className="absolute inset-0 rounded-xl bg-white/60 border border-brand-navy/10 translate-y-2 translate-x-2 scale-[0.98]" style={{ boxShadow: '0 4px 12px rgba(62,86,103,0.08)' }} />
                      <div className="absolute inset-0 rounded-xl bg-white/40 border border-brand-navy/5 translate-y-1 translate-x-1 scale-[0.99]" style={{ boxShadow: '0 2px 8px rgba(62,86,103,0.06)' }} />
                      <div className="relative w-full h-full rounded-xl overflow-hidden border border-brand-navy/10 bg-white shadow-lg">
                        <img
                          src={CARD_IMAGES[activeIndex]}
                          alt=""
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
