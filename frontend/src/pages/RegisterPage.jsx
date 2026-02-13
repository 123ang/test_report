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
      navigate('/');
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-white shadow-sm border border-gray-100 p-2">
            <img src="/logo.png" alt="Test Report" className="w-full h-full object-contain" />
=======
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:py-12 overflow-y-auto">
      <div className="max-w-md w-full my-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-600 rounded-xl mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
>>>>>>> Stashed changes
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Test Report</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">{t('auth.register')}</p>
        </div>

        <div className="card p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                {t('auth.name')}
              </label>
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
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (matchError) setMatchError('');
                }}
                className={`input ${matchError ? 'border-red-500' : ''}`}
                required
                autoComplete="new-password"
                minLength={6}
              />
              {matchError && (
                <p className="text-sm text-red-600 mt-1">{matchError}</p>
              )}
            </div>

            <div>
              <label htmlFor="preferredLang" className="label">
                {t('auth.preferredLanguage')}
              </label>
              <select
                id="preferredLang"
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="select"
              >
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.registerButton')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
