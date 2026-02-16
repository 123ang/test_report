import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LangContext';

export function PublicFooter() {
  const { t } = useLang();

  return (
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
  );
}
