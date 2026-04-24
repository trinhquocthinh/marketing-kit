'use client';

import { Suspense, useCallback, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { AlertCircle, Eye, EyeOff, Loader2, Lock, Phone, Sparkles } from 'lucide-react';

import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { I18n } from '@/i18n';
import { httpService } from '@/lib/http.service';
import { useAuthStore } from '@/stores/useAuthStore';

// ── Constants ported from RN ──────────────────────────────
const PHONE_NUMBER_REGEX = /([84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;

const phoneNumberMaxLen = (phone: string) => {
  if (!phone) return 12;
  if (phone.substring(0, 1) === '0') return 10;
  return 11;
};

// ── Types ────────────────────────────────────────────────
interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  agentCode?: string;
  phone?: string;
  fptesign?: boolean;
  isAgaEligible?: boolean;
  pendingESignForNewAgent?: boolean;
  commissionCampaigns?: unknown[];
}

interface LoginResponse {
  data: LoginResponseData;
}

// ── Inner component (uses useSearchParams — must be inside Suspense) ──────────
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCredentials = useAuthStore((s) => s.setCredentials);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isConfirmTerms, setIsConfirmTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);

  const isDisabled = !isConfirmTerms || phoneError !== '' || password.length <= 0;

  const handlePhoneChange = useCallback((value: string) => {
    const nextValue = value.replace(/[^0-9]/g, '');
    if (!nextValue || nextValue.length <= 0) {
      setPhoneError(I18n.phoneNumberIsRequired);
    } else {
      const valid = PHONE_NUMBER_REGEX.test(nextValue);
      setPhoneError(valid ? '' : I18n.phoneNumberIsInvalid);
    }
    setPhoneNumber(nextValue);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled || loading) return;

    setLoading(true);
    setLoginError('');

    try {
      const result = await httpService.post<
        { phone: string; password: string; deviceId: string },
        LoginResponse
      >('/agents/login', {
        phone: phoneNumber,
        password,
        deviceId: 'web',
      });

      if (result.isSuccess && result.data?.data?.accessToken) {
        const data = result.data.data;

        setCredentials({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          agentCode: data.agentCode,
          phone: phoneNumber,
        });
        httpService.setToken(data.accessToken);
        document.cookie = `auth_token=${data.accessToken}; path=/; SameSite=Lax`;

        if (data.fptesign) {
          const redirectPath = searchParams.get('redirect') || '/agent/marketing-kit/library';
          router.push(redirectPath);
        } else if (data.pendingESignForNewAgent) {
          setShowPendingModal(true);
        } else {
          const redirectPath = searchParams.get('redirect') || '/agent/marketing-kit/library';
          router.push(redirectPath);
        }
      } else {
        if (result.error?.includes('pending') || result.error?.includes('PENDING')) {
          setShowPendingModal(true);
        } else {
          setLoginError(result.error || 'Đăng nhập thất bại');
        }
      }
    } catch {
      setLoginError('Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
  };

  const brandGradient = 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="glass-bento relative z-10 w-full max-w-md overflow-hidden p-10">
        {/* Decorative corner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-40"
          style={{ background: brandGradient, filter: 'blur(60px)' }}
        />

        {/* Logo block */}
        <div className="relative z-10 mb-8 text-center">
          <div
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] text-white shadow-[var(--shadow-glow-primary-strong)]"
            style={{ background: brandGradient }}
          >
            <Image
              src="/images/logo.png"
              alt="Izion Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<span class="text-3xl font-black text-white">izi</span>';
              }}
            />
          </div>
          <p className="bento-eyebrow mb-2 justify-center" style={{ display: 'inline-flex' }}>
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            <span>Marketing Kit</span>
          </p>
          <h1 className="text-3xl font-black tracking-tight text-t-strong">
            {I18n.logIn}
          </h1>
          <p className="mt-2 text-sm text-t-muted">
            {I18n.marketingDashboard.tutorialDesc}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          {/* Phone */}
          <div>
            <label className="mb-2 block pl-3 text-[10px] font-black tracking-widest text-primary uppercase">
              {I18n.phoneNumber}
            </label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2 text-t-muted"
                strokeWidth={2.2}
              />
              <input
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                maxLength={phoneNumberMaxLen(phoneNumber)}
                placeholder={I18n.phoneNumberHolder}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="glass-input w-full py-3.5 pr-5 pl-12 text-sm font-bold text-t-strong placeholder:text-t-muted"
              />
            </div>
            {phoneError && phoneError.length > 0 && (
              <p className="mt-2 pl-3 text-[10px] font-black tracking-widest text-danger uppercase">
                {phoneError}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block pl-3 text-[10px] font-black tracking-widest text-primary uppercase">
              {I18n.password}
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2 text-t-muted"
                strokeWidth={2.2}
              />
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                placeholder={I18n.passwordHolder}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full py-3.5 pr-12 pl-12 text-sm font-bold text-t-strong placeholder:text-t-muted"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-t-muted transition-colors hover:text-t-strong"
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              >
                {passwordVisible ? (
                  <EyeOff className="h-4 w-4" strokeWidth={2.2} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={2.2} />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 pl-1">
            <button
              type="button"
              onClick={() => setIsConfirmTerms(!isConfirmTerms)}
              className={`flex h-5 w-5 shrink-0 items-end justify-end rounded-md border-2 transition-all ${
                isConfirmTerms
                  ? 'border-transparent text-white'
                  : 'border-(--surface-glass-border) bg-(--surface-glass-alt)'
              }`}
              style={isConfirmTerms ? { background: brandGradient } : undefined}
              aria-pressed={isConfirmTerms}
              aria-label={I18n.agreeTo}
            >
              {isConfirmTerms && (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 4L3.5 6L7 1.5" />
                </svg>
              )}
            </button>
            <span className="text-sm text-t-secondary">
              {I18n.agreeTo}{' '}
              <button
                type="button"
                className="font-bold text-primary underline underline-offset-2 transition-colors hover:opacity-80"
              >
                {I18n.termsAndCondition}
              </button>
            </span>
          </div>

          {/* Error */}
          {loginError && (
            <div className="flex items-center gap-2 rounded-(--radius-bento-sm) border border-[color-mix(in_srgb,var(--danger)_20%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-3 text-sm font-bold text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2.5} />
              <span>{loginError}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isDisabled || loading}
            className="w-full justify-center"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                {I18n.loading}
              </span>
            ) : (
              I18n.logIn
            )}
          </Button>

          {/* Forgot password */}
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-center text-[10px] font-black tracking-widest text-t-muted uppercase transition-colors hover:text-primary"
          >
            {I18n.forgotPassword}
          </button>
        </form>
      </div>

      {/* Pending account modal */}
      <Modal isOpen={showPendingModal} onClose={() => setShowPendingModal(false)}>
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-full text-white"
            style={{ background: brandGradient }}
          >
            <AlertCircle className="h-9 w-9" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-black tracking-tight text-t-strong">
            {I18n.yourAccountIsPending}
          </h3>
          <p className="mt-3 text-sm text-t-muted">
            {I18n.izionWillCheckInformationAndContactSoon}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowPendingModal(false)}
            className="mt-6 w-full justify-center"
          >
            {I18n.gotItAndTurnBack}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ── Page export — wraps LoginForm in Suspense for useSearchParams ─────────────
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
