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
  const { lang, changeLang, t } = useLang();
  const [heroRef, heroInView] = useInView();
  const [workflowRef, workflowInView] = useInView({ threshold: 0.2 });
  const [reportRef, reportInView] = useInView();
  const [trustRef, trustInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  return (
    <div className="min-h-screen relative w-full min-w-0 overflow-x-hidden">
      <PageBackground />
      {/* Header */}
      <header className="sticky top-0 z-20 w-full border-b border-brand-navy/8 bg-brand-bg/95 backdrop-blur-sm">
        <nav className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-5 md:py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="" className="h-8 w-8 shrink-0 object-contain" aria-hidden />
              <span className="text-lg font-semibold text-brand-navy tracking-tight truncate">Test Report</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center bg-brand-navy/5 rounded-lg p-0.5" role="group" aria-label={t('landing.langSwitch') || 'Language'}>
                <button
                  type="button"
                  onClick={() => changeLang('en')}
                  className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${lang === 'en' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-navy/70 hover:text-brand-navy'}`}
                  aria-pressed={lang === 'en'}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => changeLang('ja')}
                  className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${lang === 'ja' ? 'bg-white text-brand-navy shadow-sm' : 'text-brand-navy/70 hover:text-brand-navy'}`}
                  aria-pressed={lang === 'ja'}
                >
                  日本語
                </button>
              </div>
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
        {/* 1) Hero — vertically centered in viewport; overflow-x-clip only here to avoid breaking sticky below */}
        <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center overflow-x-clip">
          <div className="section-overlay bg-gradient-to-b from-[rgba(111,168,220,0.06)] via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 w-full py-12 md:py-16">
            <motion.div
              ref={heroRef}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 xl:gap-16 items-center"
              initial={{ opacity: 0, y: 24 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="space-y-6 text-center lg:text-left min-w-0">
                <p className="text-sm font-medium text-brand-accent uppercase tracking-widest">
                  Manual testing, simplified
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-brand-navy tracking-tight leading-[1.15]">
                  {t('landing.heroTitle')}
                  <span className="block mt-2 w-24 h-1 rounded-full bg-brand-accent/80" aria-hidden />
                </h1>
                <p className="text-lg sm:text-xl text-brand-navy/70 max-w-lg mx-auto lg:mx-0">
                  {t('landing.heroSubtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-brand-navy hover:bg-brand-accent rounded-xl transition-colors shadow-lg"
                  >
                    {t('landing.startFree')}
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-brand-navy border-2 border-brand-navy/20 hover:border-brand-navy/40 rounded-xl transition-colors"
                  >
                    {t('auth.login')}
                  </Link>
                </div>
              </div>
              <div className="relative flex justify-center lg:justify-end min-w-0 overflow-visible">
                <div className="w-full max-w-xl lg:max-w-2xl rounded-2xl overflow-hidden border border-brand-navy/10 bg-white shadow-xl ring-1 ring-black/5">
                  <img
                    src="/hero-dashboard.png"
                    alt=""
                    className="w-full h-auto object-cover object-top"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2) Stacked Preview - folder stacking scroll section */}
        <StackedFeaturesSection />

        {/* 3) Workflow — overlap + entrance bridge (next section after pinned) */}
        <div ref={workflowRef} className={`next-section-bridge ${workflowInView ? 'next-section-bridge--visible' : ''}`}>
        <section className="relative pt-4 md:pt-6 pb-6 md:pb-8 lg:pb-12 overflow-x-hidden">
          <div className="section-overlay bg-gradient-to-b from-transparent via-[rgba(111,168,220,0.04)] to-transparent" />
          <div className="next-section-bridge__gradient" aria-hidden />
          <div className="max-w-6xl mx-auto px-6 md:px-8 relative">
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
              <WorkflowStep number={1} title={t('landing.workflowStep1')} description={t('landing.workflowStep1Desc')} variant="navy" inView={workflowInView} delay={0} hasArrow />
              <WorkflowStep number={2} title={t('landing.workflowStep2')} description={t('landing.workflowStep2Desc')} variant="accent" inView={workflowInView} delay={0.12} hasArrow />
              <WorkflowStep number={3} title={t('landing.workflowStep3')} description={t('landing.workflowStep3Desc')} variant="red" inView={workflowInView} delay={0.24} />
            </div>
          </div>
        </section>
        </div>

        {/* 4) Report Showcase */}
        <section className="relative py-6 md:py-10 lg:py-14 bg-gradient-to-b from-[#6FA8DC]/18 via-[#6FA8DC]/10 to-transparent">
          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#6FA8DC]/20 blur-3xl rounded-full" />
          </div>
          <div ref={reportRef} className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
            <div className="relative rounded-[32px] bg-white/45 backdrop-blur-lg border border-[#6FA8DC]/18 shadow-[0_18px_60px_rgba(62,86,103,0.14)] p-8 md:p-10 lg:p-12">
              <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/60 via-white/10 to-transparent overflow-hidden" aria-hidden />
              <p className={`relative text-sm font-medium text-brand-accent uppercase tracking-wider mb-3 scroll-animate ${reportInView ? 'in-view' : ''}`}>
                {t('landing.reportLabel')}
              </p>
              <h2 className={`relative text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight mb-8 md:mb-10 scroll-animate scroll-stagger-1 ${reportInView ? 'in-view' : ''}`}>
                {t('landing.reportTitle')}
              </h2>
              <div className={`relative scroll-animate-scale ${reportInView ? 'in-view' : ''}`}>
                <ReportPreview />
              </div>
            </div>
          </div>
        </section>

        {/* 5) Before / After */}
        <section className="feature-highlight relative isolate py-6 md:py-10 lg:py-14 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[#D4E6F7]" aria-hidden />
          <div ref={trustRef} className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
            <p className={`text-sm font-medium text-brand-accent uppercase tracking-wider mb-3 text-center scroll-animate ${trustInView ? 'in-view' : ''}`}>
              {t('landing.beforeAfterLabel')}
            </p>
            <h2 className={`text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight text-center mb-4 scroll-animate scroll-stagger-1 ${trustInView ? 'in-view' : ''}`}>
              {t('landing.beforeAfterTitle')}
            </h2>
            <p className={`text-center text-brand-navy/85 max-w-xl mx-auto mb-8 md:mb-10 scroll-animate scroll-stagger-2 ${trustInView ? 'in-view' : ''}`}>
              {t('landing.beforeAfterSubtext')}
            </p>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 scroll-animate scroll-stagger-3 ${trustInView ? 'in-view' : ''}`}>
              <div className="feature-highlight-card rounded-xl border border-brand-navy/10 bg-brand-navy/5 p-6 md:p-7">
                <span className="feature-highlight-pill inline-block text-xs font-medium text-brand-navy/70 uppercase tracking-wider mb-5 px-3 py-1.5 rounded-full bg-brand-navy/10">
                  {t('landing.beforeAfterBeforeTitle')}
                </span>
                <ul className="space-y-4">
                  {[t('landing.beforeAfterBefore1'), t('landing.beforeAfterBefore2'), t('landing.beforeAfterBefore3')].map((line, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-brand-navy/10 text-brand-navy/50" aria-hidden>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="feature-highlight-card feature-highlight-card-after rounded-xl border border-brand-accent/20 bg-brand-accent/5 p-6 md:p-7">
                <span className="feature-highlight-pill inline-block text-xs font-medium text-brand-accent uppercase tracking-wider mb-5 px-3 py-1.5 rounded-full bg-brand-accent/15">
                  {t('landing.beforeAfterAfterTitle')}
                </span>
                <ul className="space-y-4">
                  {[t('landing.beforeAfterAfter1'), t('landing.beforeAfterAfter2'), t('landing.beforeAfterAfter3')].map((line, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-brand-accent/20 text-brand-accent" aria-hidden>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 6) Final CTA */}
        <section className="relative py-6 md:py-10 lg:py-14">
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
    <div className="w-full aspect-[4/3] bg-white border border-brand-navy/10 rounded-2xl overflow-hidden flex flex-col shadow-xl ring-1 ring-black/5">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-navy/10 bg-brand-bg/80">
        <div className="w-2.5 h-2.5 rounded-full bg-brand-red" />
        <div className="w-2.5 h-2.5 rounded-full bg-brand-accent/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-brand-navy/30" />
      </div>
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div className="h-3 w-3/4 rounded-md bg-brand-navy/10" />
        <div className="h-3 w-full rounded-md bg-brand-navy/5" />
        <div className="h-3 w-5/6 rounded-md bg-brand-navy/5" />
        <div className="mt-4 flex gap-2">
          <div className="h-9 flex-1 rounded-lg bg-brand-accent/20 border border-brand-accent/30" />
          <div className="h-9 w-20 rounded-lg bg-brand-navy/10" />
        </div>
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-5 h-5 rounded border border-brand-navy/20" />
              <div className="h-2.5 flex-1 rounded bg-brand-navy/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ARROW_FILL = { navy: 'rgba(62,86,103,0.05)', accent: 'rgba(111,168,220,0.1)', red: 'rgba(229,115,115,0.1)' };
const ARROW_STROKE = { navy: 'rgba(62,86,103,0.15)', accent: 'rgba(111,168,220,0.2)', red: 'rgba(229,115,115,0.2)' };
const ARROW_PATH = 'M 12,0 L 100,0 L 124,50 L 100,100 L 12,100 Q 0,100 0,88 L 0,12 Q 0,0 12,0 Z';

function WorkflowStep({ number, title, description, variant = 'navy', inView, delay = 0, hasArrow = false }) {
  const panelBgClass = {
    navy: 'bg-brand-navy/5',
    accent: 'bg-brand-accent/10',
    red: 'bg-brand-red/10',
  }[variant];
  const panelBorderClass = {
    navy: 'border-brand-navy/15',
    accent: 'border-brand-accent/20',
    red: 'border-brand-red/20',
  }[variant];
  const panelShapeClass = 'rounded-xl';
  return (
    <motion.article
      className="relative flex flex-col w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.p
        className="text-4xl md:text-5xl font-bold text-brand-navy/25 tracking-tight mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.08 }}
      >
        STEP {String(number).padStart(2, '0')}
      </motion.p>
      <div className="relative flex-1 min-h-0">
        <motion.div
          className={`relative backdrop-blur-sm transition-shadow duration-300 hover:shadow-sm overflow-visible ${hasArrow ? '' : `${panelBgClass} border ${panelBorderClass} ${panelShapeClass} p-5 md:p-6`}`}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: delay + 0.16 }}
        >
          {hasArrow && (
            <div className="absolute inset-0 hidden md:block w-[calc(100%+1.5rem)] h-full pointer-events-none" aria-hidden>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 124 100" preserveAspectRatio="none" aria-hidden>
                <path
                  d={ARROW_PATH}
                  fill={ARROW_FILL[variant]}
                  stroke={ARROW_STROKE[variant]}
                  strokeWidth="1.25"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          )}
          <div className={`relative ${hasArrow ? 'p-5 md:p-6 pr-6 md:pr-8' : ''}`}>
            <motion.h3
              className="text-lg font-semibold text-brand-navy mb-2"
              initial={{ opacity: 0, x: -6 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: delay + 0.22 }}
            >
              {title}
            </motion.h3>
            <motion.p
              className="text-sm text-brand-navy/70 leading-relaxed"
              initial={{ opacity: 0, y: 6 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: delay + 0.26 }}
            >
              {description}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
}

function ReportPreview() {
  const { t } = useLang();
  const executedAt = new Date();
  executedAt.setDate(executedAt.getDate() - 2);
  return (
    <div className="bg-white border border-brand-navy/12 rounded-lg overflow-hidden max-w-2xl mx-auto">
      <div className="px-6 py-4 border-b border-brand-navy/10 bg-brand-bg/80 flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-brand-accent/70" aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-medium text-brand-navy">{t('landing.reportPreviewTitle')}</span>
            <span className="text-xs text-brand-navy/60">{t('landing.reportPreviewVersion')} 1.2</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-brand-navy/60">
            <span>{t('landing.reportPreviewEnv')}: Staging</span>
            <span>{t('landing.reportPreviewExecutedAt')}: {executedAt.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
            <span>{t('landing.reportPreviewExecutedBy')}: M. Sato</span>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 border-b border-brand-navy/10 bg-brand-bg/50 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-brand-navy font-medium">{t('landing.reportPreviewSuccessRate')}: 83%</span>
        <span className="text-brand-navy/70">12 {t('dashboard.total')} · 8 {t('status.pass')} · 2 {t('status.fail')} · 2 {t('status.skipped')}</span>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-medium rounded bg-brand-accent/15 text-brand-navy shrink-0">{t('status.pass')}</span>
            <span className="text-brand-navy font-medium">Login flow — desktop</span>
          </div>
          <p className="text-xs text-brand-navy/60 pl-14">Chrome 120 · 2.3s</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-medium rounded bg-brand-red/15 text-brand-navy shrink-0">{t('status.fail')}</span>
            <span className="text-brand-navy font-medium">Checkout — mobile</span>
          </div>
          <p className="text-xs text-brand-navy/60 pl-14">iOS Safari · 1.1s · Payment timeout · High impact</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-medium rounded bg-brand-navy/10 text-brand-navy shrink-0">{t('status.skipped')}</span>
            <span className="text-brand-navy font-medium">Export CSV</span>
          </div>
          <p className="text-xs text-brand-navy/60 pl-14">Env not configured</p>
        </div>
      </div>
      <div className="px-6 py-3 border-t border-brand-navy/10 bg-brand-bg/50 flex items-center gap-4 text-sm text-brand-navy/70">
        <span>{t('landing.reportPreviewShare')}</span>
        <span>·</span>
        <span>{t('landing.reportPreviewComments')} (3)</span>
        <span>·</span>
        <span>{t('landing.reportPreviewExport')} PDF / Excel</span>
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
