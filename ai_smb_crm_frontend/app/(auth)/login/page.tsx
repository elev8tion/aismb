'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showOperator, setShowOperator] = useState(false);
  const { signIn, refreshSession } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      const res = await fetch('/api/demo-login', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error || 'Demo sign-in failed');
      }
      await refreshSession();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign-in failed');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.failedSignIn);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logos/dark_mode_brand.svg"
            alt="ELEV8TION"
            className="h-28 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">KRE8TION</h1>
          <p className="text-white/60 mt-2">{t.auth.signInSubtitle}</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-center text-sm text-white/60">
              Testers enter with one click. No email. No password.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              className="btn-primary w-full"
            >
              {demoLoading ? 'Opening demo…' : 'Enter demo'}
            </button>
          </div>

          {showOperator && (
            <form onSubmit={handleSubmit} className="space-y-6 mt-8 border-t border-white/10 pt-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass w-full"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass w-full"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || demoLoading}
                className="btn-secondary w-full"
              >
                {loading ? t.auth.signingIn : t.auth.signIn}
              </button>
            </form>
          )}

          {!showOperator && (
            <button
              type="button"
              onClick={() => setShowOperator(true)}
              className="mt-6 w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Operator sign in
            </button>
          )}
        </div>

        {/* Back to landing */}
        <div className="mt-6 text-center">
          <a
            href="https://kre8tion.com"
            className="text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            ← {t.common.backTo}
          </a>
        </div>
      </div>
    </div>
  );
}
