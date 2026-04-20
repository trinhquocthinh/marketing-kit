'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAppDispatch } from '@/hooks/useStore';
import { authActions } from '@/lib/slices/auth.slice';
import { httpService } from '@/lib/http.service';
import { I18n } from '@/i18n';
import Modal from '@/components/ui/Modal';

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

// ── Component ────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isConfirmTerms, setIsConfirmTerms] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Focus state (for input border color)
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Pending account modal
  const [showPendingModal, setShowPendingModal] = useState(false);

  // ── Button disabled logic (matches RN) ──
  useEffect(() => {
    setIsDisabled(
      !isConfirmTerms || phoneError !== '' || password.length <= 0,
    );
  }, [phoneError, isConfirmTerms, password.length]);

  // ── Phone validation (matches RN Controller onChange) ──
  const handlePhoneChange = useCallback((value: string) => {
    // Strip non-numeric chars
    const nextValue = value.replace(/[^0-9]/g, '');

    if (!nextValue || nextValue.length <= 0) {
      setPhoneError(I18n.phoneNumberIsRequired);
    } else {
      const valid = PHONE_NUMBER_REGEX.test(nextValue);
      setPhoneError(valid ? '' : I18n.phoneNumberIsInvalid);
    }

    setPhoneNumber(nextValue);
  }, []);

  // ── Submit handler (matches RN onSubmit) ──
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

        dispatch(authActions.setCredentials({
          token: data.accessToken,
          refreshToken: data.refreshToken,
          agentCode: data.agentCode,
          phone: phoneNumber,
        }));
        httpService.setToken(data.accessToken);

        // Set cookie for middleware auth guard
        document.cookie = `auth_token=${data.accessToken}; path=/; SameSite=Lax`;

        if (data.fptesign) {
          // Agent has completed e-sign → go to main app
          const redirectPath = searchParams.get('redirect') || '/agent/marketing-kit/library';
          router.push(redirectPath);
        } else if (data.pendingESignForNewAgent) {
          // Pending e-sign flow – show pending modal
          setShowPendingModal(true);
        } else {
          // Default redirect
          const redirectPath = searchParams.get('redirect') || '/agent/marketing-kit/library';
          router.push(redirectPath);
        }
      } else {
        // Check for pending account error
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

  // ── Forgot password ──
  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-(--blob-1) blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-(--blob-2) blur-[150px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-(--blob-3) blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-(--glass-bg) backdrop-blur-xl border border-(--glass-border) shadow-2xl rounded-3xl p-8 relative z-10 overflow-hidden theme-transition">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-400 to-rose-400 opacity-20 rounded-bl-full blur-2xl" />

        {/* Header – Register button */}
        {/* <div className="flex justify-end mb-6 relative z-10">
          <button
            onClick={() => {TODO: Register flow }}
            className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            {I18n.registerIconText}
          </button>
        </div> */}

        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border border-white/20 mb-4 shadow-inner">
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
                  '<span class="text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-rose-400">izi</span>';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-t-primary tracking-tight">Marketing Kit</h1>
          <p className="text-t-secondary mt-2 font-medium text-sm">{I18n.marketingDashboard.tutorialDesc}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Phone Number field */}
          <div>
            <label className="block text-sm font-medium text-t-secondary mb-2 pl-1">
              {I18n.phoneNumber}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 transition-colors ${phoneFocused ? 'text-orange-400' : 'text-t-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                maxLength={phoneNumberMaxLen(phoneNumber)}
                placeholder={I18n.phoneNumberHolder}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                className={`block w-full pl-12 pr-4 py-3.5 bg-(--input-bg) border rounded-xl text-t-primary placeholder-t-muted outline-none transition-all backdrop-blur-sm text-sm ${phoneFocused
                    ? 'border-orange-400/50 ring-2 ring-orange-400/50'
                    : 'border-(--border)'
                  }`}
              />
            </div>
            {phoneError && phoneError.length > 0 && (
              <p className="mt-1.5 ml-1 text-sm text-rose-400">{phoneError}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-t-secondary mb-2 pl-1">
              {I18n.password}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className={`w-5 h-5 transition-colors ${passwordFocused ? 'text-orange-400' : 'text-t-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                placeholder={I18n.passwordHolder}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className={`block w-full pl-12 pr-12 py-3.5 bg-(--input-bg) border rounded-xl text-t-primary placeholder-t-muted outline-none transition-all backdrop-blur-sm text-sm ${passwordFocused
                    ? 'border-orange-400/50 ring-2 ring-orange-400/50'
                    : 'border-(--border)'
                  }`}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 w-5 h-5 text-t-muted hover:text-t-secondary focus:outline-none transition-colors"
              >
                {passwordVisible ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Terms & Conditions checkbox */}
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={() => setIsConfirmTerms(!isConfirmTerms)}
              className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${isConfirmTerms
                  ? 'bg-linear-to-r from-orange-500 to-rose-500 border-orange-500'
                  : 'bg-(--input-bg) border-white/30'
                }`}
            >
              {isConfirmTerms && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-sm text-t-secondary">
              {I18n.agreeTo}{'  '}
              <button
                type="button"
                onClick={() => {/* TODO: Show T&C */ }}
                className="font-semibold text-orange-400 underline underline-offset-2 hover:text-orange-300 transition-colors"
              >
                {I18n.termsAndCondition}
              </button>
            </span>
          </div>

          {/* Login error message */}
          {loginError && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl backdrop-blur-sm">{loginError}</p>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={isDisabled || loading}
            className={`w-full py-4 rounded-xl font-bold text-sm transition-all transform ${isDisabled || loading
                ? 'bg-surface-hover text-t-muted cursor-not-allowed border border-(--border)'
                : 'bg-linear-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:from-orange-400 hover:to-rose-400 hover:scale-[1.02] active:scale-95'
              }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {I18n.loading}
              </span>
            ) : (
              I18n.logIn
            )}
          </button>

          {/* Forgot password */}
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-center text-sm font-medium text-t-muted hover:text-orange-400 transition-colors"
          >
            {I18n.forgotPassword}
          </button>
        </form>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-(--overlay-bg) backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-t-secondary">{I18n.loading}</span>
          </div>
        </div>
      )}

      {/* Pending account modal */}
      <Modal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-full h-36 bg-linear-to-br from-orange-500/20 to-rose-500/20 rounded-t-xl flex items-center justify-center mb-4">
            <svg className="w-20 h-20 text-orange-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="w-[90%] flex flex-col items-center px-2 pb-4">
            <h3 className="text-sm font-bold text-gray-900 font-[Montserrat,sans-serif]">
              {I18n.yourAccountIsPending}
            </h3>
            <p className="text-sm text-gray-800 font-[Montserrat,sans-serif] mt-3 text-center">
              {I18n.izionWillCheckInformationAndContactSoon}
            </p>
            <button
              onClick={() => setShowPendingModal(false)}
              className="w-full h-12 mt-5 bg-linear-to-r from-orange-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg hover:from-orange-400 hover:to-rose-400 active:scale-95 transition-all"
            >
              {I18n.gotItAndTurnBack}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
