import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import { StackedFeaturesSection } from '../components/landing/StackedFeaturesSection';
import { PageBackground } from '../components/landing/PageBackground';

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const { rootMargin = '0px 0px -80px 0px', threshold = 0.1 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}

const LandingPage = () => {
  const { t } = useLang();
  const [heroRef, heroInView] = useInView();
  const [workflowRef, workflowInView] = useInView();
  const [reportRef, reportInView] = useInView();
  const [trustRef, trustInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <PageBackground />
      {/* Header */}
      <header className="sticky top-0 z-20 w-full border-b border-brand-navy/8 bg-brand-bg/95 backdrop-blur-sm">
        <nav className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-5 md:py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="" className="h-8 w-8 shrink-0 object-contain" aria-hidden />
              <span className="text-lg font-semibold text-brand-navy tracking-tight truncate">Test Report</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Link
                to="/login"
                className="px-4 py-2.5 text-sm font-medium text-brand-navy/70 hover:text-brand-navy rounded-lg hover:bg-brand-navy/5 transition-colors"
              >
                {t('auth.login')}
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-navy hover:bg-brand-navy-light rounded-lg transition-colors"
              >
                {t('landing.getStarted')}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* 1) Hero */}
        <section className="relative py-12 md:py-16 lg:py-24 overflow-x-clip">
          <div className="section-overlay bg-gradient-to-b from-[rgba(111,168,220,0.06)] via-transparent to-transparent" />
          <div className="max-w-6xl mx-auto px-6 md:px-8">
            <motion.div
              ref={heroRef}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
              initial={{ opacity: 0, y: 24 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-brand-navy tracking-tight leading-[1.15]">
                  {t('landing.heroTitle')}
                  <span className="block mt-2 w-24 h-1 rounded-full bg-brand-accent/80" aria-hidden />
                </h1>
                <p className="text-lg sm:text-xl text-brand-navy/70 max-w-lg">
                  {t('landing.heroSubtitle')}
                </p>
                <div>
                  <Link
                    to="/register"
                    className="inline-flex px-6 py-3.5 text-base font-medium text-white bg-brand-navy hover:bg-brand-accent rounded-lg transition-colors"
                  >
                    {t('landing.startFree')}
                  </Link>
                </div>
              </div>
              <div className="relative flex justify-center lg:justify-end">
                <ProductMockup />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2) Stacked Preview - folder stacking scroll section */}
        <StackedFeaturesSection />

        {/* 3) Workflow */}
        <section className="relative py-10 md:py-12 lg:py-16">
          <div className="section-overlay bg-gradient-to-b from-transparent via-[rgba(111,168,220,0.04)] to-transparent" />
          <div ref={workflowRef} className="max-w-6xl mx-auto px-6 md:px-8 relative">
            <motion.p
              className="text-sm font-medium text-brand-accent uppercase tracking-wider mb-3"
              initial={{ opacity: 0, y: 12 }}
              animate={workflowInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              {t('landing.workflowLabel')}
            </motion.p>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight mb-8 md:mb-10"
              initial={{ opacity: 0, y: 12 }}
              animate={workflowInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              {t('landing.workflowTitle')}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <WorkflowStep number={1} title={t('landing.workflowStep1')} description={t('landing.workflowStep1Desc')} variant="navy" inView={workflowInView} delay={0} />
              <WorkflowStep number={2} title={t('landing.workflowStep2')} description={t('landing.workflowStep2Desc')} variant="accent" inView={workflowInView} delay={0.12} />
              <WorkflowStep number={3} title={t('landing.workflowStep3')} description={t('landing.workflowStep3Desc')} variant="red" inView={workflowInView} delay={0.24} />
            </div>
          </div>
        </section>

        {/* 4) Report Showcase */}
        <section className="relative py-12 md:py-16 lg:py-24">
          <div className="section-overlay bg-gradient-to-b from-transparent via-[rgba(62,86,103,0.03)] to-transparent" />
          <div ref={reportRef} className="max-w-6xl mx-auto px-6 md:px-8">
            <p className={`text-sm font-medium text-brand-accent uppercase tracking-wider mb-3 scroll-animate ${reportInView ? 'in-view' : ''}`}>
              {t('landing.reportLabel')}
            </p>
            <h2 className={`text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight mb-8 md:mb-10 scroll-animate scroll-stagger-1 ${reportInView ? 'in-view' : ''}`}>
              {t('landing.reportTitle')}
            </h2>
            <div className={`scroll-animate-scale ${reportInView ? 'in-view' : ''}`}>
              <ReportPreview />
            </div>
          </div>
        </section>

        {/* 5) Trust */}
        <section className="relative py-12 md:py-16 lg:py-24">
          <div className="section-overlay bg-gradient-to-b from-[rgba(111,168,220,0.04)] via-transparent to-transparent" />
          <div ref={trustRef} className="max-w-6xl mx-auto px-6 md:px-8">
            <h2 className={`text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight text-center mb-8 md:mb-10 scroll-animate ${trustInView ? 'in-view' : ''}`}>
              {t('landing.trustTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
              <TrustItem title={t('landing.trust1')} color="navy" inView={trustInView} delay={1} />
              <TrustItem title={t('landing.trust2')} color="accent" inView={trustInView} delay={2} />
              <TrustItem title={t('landing.trust3')} color="red" inView={trustInView} delay={3} />
            </div>
          </div>
        </section>

        {/* 6) Final CTA */}
        <section className="relative py-12 md:py-16 lg:py-24">
          <div className="section-overlay bg-gradient-to-b from-transparent via-[rgba(62,86,103,0.05)] to-[rgba(111,168,220,0.06)]" />
          <div ref={ctaRef} className={`max-w-3xl mx-auto px-6 md:px-8 text-center scroll-animate ${ctaInView ? 'in-view' : ''}`}>
            <p className="text-xl sm:text-2xl text-brand-navy/80 font-medium">
              {t('landing.finalCta')}
            </p>
            <div className="mt-8 md:mt-10">
              <Link
                to="/register"
                className="inline-flex px-8 py-4 text-base font-medium text-white bg-brand-navy hover:bg-brand-accent rounded-lg transition-colors"
              >
                {t('landing.startFree')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-brand-navy/10">
        <div className="section-overlay bg-gradient-to-b from-transparent to-[rgba(62,86,103,0.02)]" />
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-7 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <p className="text-sm text-brand-navy/50 order-2 sm:order-1">
              © {new Date().getFullYear()} Sun Tzu Technologies. {t('landing.allRightsReserved')}
            </p>
            <nav className="flex items-center gap-x-6 text-sm order-1 sm:order-2">
              <Link
                to="/privacy-policy"
                className="text-brand-navy/60 hover:text-brand-accent transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-brand-navy/60 hover:text-brand-accent transition-colors"
              >
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

function ProductMockup() {
  return (
    <div className="w-full max-w-md aspect-[4/3] bg-white border border-brand-navy/10 rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-navy/10 bg-brand-bg">
        <div className="w-2 h-2 rounded-full bg-brand-red" />
        <div className="w-2 h-2 rounded-full bg-brand-accent/60" />
        <div className="w-2 h-2 rounded-full bg-brand-navy/30" />
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="h-3 w-3/4 rounded bg-brand-navy/10" />
        <div className="h-3 w-full rounded bg-brand-navy/5" />
        <div className="h-3 w-5/6 rounded bg-brand-navy/5" />
        <div className="mt-4 flex gap-2">
          <div className="h-8 flex-1 rounded bg-brand-accent/20 border border-brand-accent/30" />
          <div className="h-8 w-16 rounded bg-brand-navy/10" />
        </div>
        <div className="mt-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-4 h-4 rounded border border-brand-navy/20" />
              <div className="h-2 flex-1 rounded bg-brand-navy/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, description, variant = 'navy', inView, delay = 0 }) {
  const circleClass = {
    navy: 'bg-brand-navy text-white',
    accent: 'bg-brand-accent text-white',
    red: 'bg-brand-red text-white',
  }[variant];
  const borderClass = {
    navy: 'border-brand-navy/10',
    accent: 'border-brand-accent/20',
    red: 'border-brand-red/20',
  }[variant];
  return (
    <motion.article
      className={`relative flex flex-col p-6 md:p-7 rounded-xl border ${borderClass} bg-white/60 backdrop-blur-sm transition-shadow duration-300 hover:shadow-md hover:-translate-y-1`}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={`flex items-center justify-center w-11 h-11 rounded-full font-semibold text-sm shrink-0 mb-4 ${circleClass}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        {number}
      </motion.div>
      <motion.h3
        className="text-lg font-semibold text-brand-navy mb-2"
        initial={{ opacity: 0, x: -6 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.14 }}
      >
        {title}
      </motion.h3>
      <motion.p
        className="text-sm text-brand-navy/70 leading-relaxed"
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.2 }}
      >
        {description}
      </motion.p>
    </motion.article>
  );
}

function ReportPreview() {
  const { t } = useLang();
  return (
    <div className="bg-white border border-brand-navy/12 rounded-lg overflow-hidden max-w-2xl mx-auto">
      <div className="px-6 py-4 border-b border-brand-navy/10 bg-brand-bg/80 flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-brand-accent/70" aria-hidden />
        <div className="flex items-center justify-between flex-1">
          <span className="text-sm font-medium text-brand-navy">Test Run Report</span>
          <span className="text-xs text-brand-navy/60">v1.2 · {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-medium rounded bg-brand-accent/15 text-brand-navy">
            {t('status.pass')}
          </span>
          <span className="text-brand-navy font-medium">Login flow — desktop</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-medium rounded bg-brand-red/15 text-brand-navy">
            {t('status.fail')}
          </span>
          <span className="text-brand-navy font-medium">Checkout — mobile</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-medium rounded bg-brand-navy/10 text-brand-navy">
            {t('status.skipped')}
          </span>
          <span className="text-brand-navy font-medium">Export CSV</span>
        </div>
      </div>
      <div className="px-6 py-3 border-t border-brand-navy/10 bg-brand-bg/50 text-sm text-brand-navy/70">
        12 {t('dashboard.total')} · 8 {t('status.pass')} · 2 {t('status.fail')}
      </div>
    </div>
  );
}

function TrustItem({ title, color = 'navy', inView, delay = 0 }) {
  const dotClass = {
    navy: 'bg-brand-navy',
    accent: 'bg-brand-accent',
    red: 'bg-brand-red',
  }[color];
  const delayClass = delay === 1 ? 'scroll-stagger-1' : delay === 2 ? 'scroll-stagger-2' : 'scroll-stagger-3';
  return (
    <div className={`text-center scroll-animate ${delayClass} ${inView ? 'in-view' : ''}`}>
      <div className={`w-3 h-3 rounded-full mx-auto mb-4 ${dotClass}`} />
      <p className="text-lg font-medium text-brand-navy">{title}</p>
    </div>
  );
}

export default LandingPage;
