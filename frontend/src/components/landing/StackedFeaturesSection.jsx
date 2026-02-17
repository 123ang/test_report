import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '../../context/LangContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const VIEWPORT_ENTER = { once: true, amount: 0.35 };
const EASE_OUT = [0, 0, 0.58, 1];
// Shared stack-up animation: left copy and right card use the same motion so they feel in sync.
const STACK_UP_TRANSITION = { duration: 0.45, ease: EASE_OUT };
const stackUpInitial = { opacity: 0, y: 24 };
const stackUpAnimate = { opacity: 1, y: 0 };
const stackUpExit = { opacity: 0, y: -24 };

const SLIDES_COUNT = 3;
// Pin duration: shorter = less scroll and less perceived gap.
const PIN_VIEWPORT_MULTIPLIER = 1.5;
// Vertical spacing: less top padding to close gap from hero; reduce bottom so workflow follows.
const SECTION_PADDING = 'pt-8 md:pt-12 pb-6 md:pb-8';

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

  // GSAP ScrollTrigger pinning: section stays fixed while slides change; last slide visible ≥20% of pin duration.
  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      const vh = window.innerHeight;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${PIN_VIEWPORT_MULTIPLIER * vh}`,
        pin: true,
        scrub: true,
        anticipatePin: 1,
        pinSpacing: true,
        onUpdate: (self) => {
          const p = self.progress;
          // Last slide (Report) gets at least 20% of scroll duration: [0,0.4]->0, [0.4,0.8]->1, [0.8,1]->2
          const idx = p < 0.4 ? 0 : p < 0.8 ? 1 : 2;
          setActiveIndex(idx);
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

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
                <div className="rounded-xl overflow-hidden border border-brand-navy/10 bg-white shadow-lg w-full max-w-[60vw]">
                  <img src={CARD_IMAGES[i]} alt="" className="w-full h-auto block" />
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
      className={`relative ${SECTION_PADDING}`}
      style={{ minHeight: '100vh', overflow: 'visible' }}
      aria-label="Stacked features"
    >
      {/* Wrapper: 100vh so section fills viewport when pinned; ScrollTrigger pinSpacing adds scroll duration. */}
      <div className="relative" style={{ minHeight: '100vh' }}>
        <div className="sticky top-0 h-screen w-full overflow-visible flex items-center justify-center pt-0 pb-8">
          <div className="w-full max-w-4xl px-6 md:px-8 lg:px-10 py-4 max-h-[calc(100vh-2rem)] flex items-center justify-center min-h-0 -translate-y-16 md:-translate-y-24">
            <div className="w-full max-h-full grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 lg:gap-8 items-center min-h-0">
            {/* Left: copy with stack-up animation (in sync with right card) */}
            <div className="relative min-h-[160px] lg:min-h-[180px] flex flex-col justify-center min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeIndex}
                  className={`absolute inset-0 flex flex-col justify-center pl-6 border-l-4 ${borderClass}`}
                  initial={stackUpInitial}
                  animate={stackUpAnimate}
                  exit={stackUpExit}
                  transition={STACK_UP_TRANSITION}
                >
                  <p className={`text-base font-medium uppercase tracking-wider mb-3 ${labelClass}`}>
                    {activeFeature.label}
                  </p>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-navy tracking-tight leading-tight">
                    {activeFeature.title}
                  </h2>
                  <p className="mt-4 text-xl text-brand-navy/70 max-w-lg">
                    {activeFeature.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: one card at a time in a fixed slot (absolute so cards don't stack) */}
            <div className="relative flex justify-center items-center min-h-[260px] sm:min-h-[320px] md:min-h-[380px] w-full flex-shrink">
              <div className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] aspect-[5/4] mx-auto">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeIndex}
                    className="absolute inset-0 flex justify-center items-center"
                    initial={stackUpInitial}
                    animate={stackUpAnimate}
                    exit={stackUpExit}
                    transition={STACK_UP_TRANSITION}
                  >
                    <div className="relative w-full h-full" aria-hidden>
                      {/* Stack effect: soft shadow layers behind the card */}
                      <div className="absolute inset-0 rounded-xl bg-white/60 border border-brand-navy/10 translate-y-2 translate-x-2 scale-[0.98]" style={{ boxShadow: '0 4px 12px rgba(62,86,103,0.08)' }} />
                      <div className="absolute inset-0 rounded-xl bg-white/40 border border-brand-navy/5 translate-y-1 translate-x-1 scale-[0.99]" style={{ boxShadow: '0 2px 8px rgba(62,86,103,0.06)' }} />
                      <div className="absolute inset-0 rounded-xl overflow-hidden border border-brand-navy/10 bg-white shadow-lg flex items-center justify-center bg-slate-50">
                        <img
                          src={CARD_IMAGES[activeIndex]}
                          alt=""
                          className="w-full h-full object-contain object-top"
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
      </div>
    </section>
  );
}
