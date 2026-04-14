'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/hooks/useStore';
import { authActions } from '@/lib/slices/auth.slice';
import { httpService } from '@/lib/http.service';
import { I18n } from '@/i18n';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(I18n.fieldIsRequired);
      return;
    }
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual login API endpoint
      const result = await httpService.post<
        { email: string; password: string, deviceId: string; phone: string },
        { token: string; refreshToken?: string; agentCode?: string }
      >('/login', { email, password: 'M@Tkhau1', deviceId: 'web', phone: '0867613942' });

      if (result.isSuccess) {
        dispatch(authActions.setCredentials({
          token: result.data.token,
          refreshToken: result.data.refreshToken,
          agentCode: result.data.agentCode,
        }));
        httpService.setToken(result.data.token);

        // Set cookie so middleware allows access to protected routes
        document.cookie = `auth_token=${result.data.token}; path=/; SameSite=Lax`;

        const redirectPath = searchParams.get('redirect') || '/agent/marketing-kit/library';
        router.push(redirectPath);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FA875B] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Kit</h1>
          <p className="text-gray-500 mt-1 text-sm">{I18n.marketingDashboard.tutorialDesc}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label={I18n.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="agent@example.com"
            autoComplete="email"
          />
          <Input
            label={I18n.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {I18n.login}
          </Button>
        </form>
      </div>
    </div>
  );
}
