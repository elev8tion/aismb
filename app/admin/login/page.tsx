'use client';

import { useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/bookings';

  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify token by making a test request to protected API
      const res = await fetch('/api/admin/bookings/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Store token in cookie
        document.cookie = `admin-token=${token}; path=/; max-age=86400; SameSite=Strict`;

        // Redirect to intended page
        window.location.href = redirect;
      } else {
        setError('Invalid admin token. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-white/60 text-sm">
              Enter your admin API key to access the admin panel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-white/80 mb-2">
                Admin API Key
              </label>
              <input
                id="token"
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9] transition-colors"
                placeholder="Enter your admin API key"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full px-6 py-3 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 disabled:bg-[#0EA5E9]/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <p className="text-xs text-white/50 mb-2">
              <strong>For Development:</strong>
            </p>
            <p className="text-xs text-white/40">
              Set <code className="px-1 py-0.5 bg-white/10 rounded">ADMIN_API_KEY</code> in your <code className="px-1 py-0.5 bg-white/10 rounded">.env.local</code> file.
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-[#0EA5E9] hover:text-[#0EA5E9]/80 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
