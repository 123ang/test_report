import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [matchError, setMatchError] = useState('');

  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMatchError('');
    if (password !== confirmPassword) {
      setMatchError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, preferredLang);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12 overflow-y-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-sky-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-slate-100/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[400px] my-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-sm border border-slate-100/80 p-3 mb-5">
            <img src="/logo.png" alt="Test Report" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Test Report</h1>
          <p className="text-slate-500 mt-1.5 text-sm">{t('auth.register')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.name')}</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.email')}</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required autoComplete="email" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.password')}</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required autoComplete="new-password" minLength={6} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.confirmPassword')}</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (matchError) setMatchError(''); }}
                className={`input ${matchError ? 'border-red-400 focus:ring-red-500/20 focus:border-red-400' : ''}`}
                required
                autoComplete="new-password"
                minLength={6}
              />
              {matchError && <p className="text-sm text-red-600 mt-1">{matchError}</p>}
            </div>
            <div>
              <label htmlFor="preferredLang" className="block text-sm font-medium text-slate-700 mb-1.5">{t('auth.preferredLanguage')}</label>
              <select id="preferredLang" value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)} className="select">
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
              {loading ? t('common.loading') : t('auth.registerButton')}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
