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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header bar – Register button (top-right), matching RN headerBar */}
      <div className="w-full flex justify-end px-4 py-3">
        <button
          onClick={() => {/* TODO: Register flow */}}
          className="text-sm font-semibold text-[#FA875B] font-[Montserrat,sans-serif]"
        >
          {I18n.registerIconText}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-4 mt-8 max-w-md mx-auto w-full">
        {/* Logo – centered, matching RN imageContent */}
        <div className="flex justify-center items-center mb-6">
          <div className="w-[128px] h-[128px] relative">
            <Image
              src="/images/logo.png"
              alt="Izion Logo"
              width={128}
              height={128}
              className="object-contain"
              priority
              onError={(e) => {
                // Fallback if logo image not found
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<div class="w-[128px] h-[128px] bg-[#FA875B] rounded-2xl flex items-center justify-center"><svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>';
              }}
            />
          </div>
        </div>

        {/* Form – matching RN bottomContainer */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-0">
          {/* Phone Number field */}
          <div className="mb-1">
            <label className="block text-sm font-bold text-gray-900 mb-1.5 mt-5 font-[Montserrat,sans-serif]">
              {I18n.phoneNumber}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              maxLength={phoneNumberMaxLen(phoneNumber)}
              placeholder={I18n.phoneNumberHolder}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
              className={`w-full h-12 px-4 rounded-lg border text-sm font-[Montserrat,sans-serif] text-black placeholder-gray-400 outline-none transition-colors ${
                phoneFocused
                  ? 'border-[#FA875B]'
                  : 'border-gray-400'
              }`}
            />
            {phoneError && phoneError.length > 0 && (
              <p className="mt-1.5 mx-1 text-sm text-red-500">{phoneError}</p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-1">
            <label className="block text-sm font-bold text-gray-900 mb-1.5 mt-5 font-[Montserrat,sans-serif]">
              {I18n.password}
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                placeholder={I18n.passwordHolder}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className={`w-full h-12 px-4 pr-12 rounded-lg border text-sm font-[Montserrat,sans-serif] text-black placeholder-gray-400 outline-none transition-colors ${
                  passwordFocused
                    ? 'border-[#FA875B]'
                    : 'border-gray-400'
                }`}
              />
              {/* Eye icon – matching RN eyeIcon (absolute, 20x20, top-14 right-14) */}
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 w-5 h-5 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {passwordVisible ? (
                  // Eye On
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  // Eye Off
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Terms & Conditions checkbox – matching RN EnrolmentCheckBox */}
          <div className="flex items-start gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsConfirmTerms(!isConfirmTerms)}
              className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                isConfirmTerms
                  ? 'bg-[#FA875B] border-[#FA875B]'
                  : 'bg-white border-gray-400'
              }`}
            >
              {isConfirmTerms && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-sm text-gray-700 font-[Montserrat,sans-serif]">
              {I18n.agreeTo}{' '}
              <button
                type="button"
                onClick={() => {/* TODO: Show T&C */}}
                className="font-semibold text-gray-900 underline"
              >
                {I18n.termsAndCondition}
              </button>
            </span>
          </div>

          {/* Login error message */}
          {loginError && (
            <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{loginError}</p>
          )}

          {/* Login button – matching RN loginButtonEnabled / loginDisableButton */}
          <button
            type="submit"
            disabled={isDisabled || loading}
            className={`w-full h-12 mt-5 rounded-full font-bold text-sm font-[Montserrat,sans-serif] transition-all ${
              isDisabled || loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#FA875B] text-white shadow-[0_1.5px_2px_0_#C45922] hover:bg-[#EB7446] active:scale-[0.98]'
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

          {/* Forgot password – matching RN forgotPassword style */}
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-center mt-4 text-sm font-semibold text-[#FA875B] font-[Montserrat,sans-serif] hover:opacity-80"
          >
            {I18n.forgotPassword}
          </button>
        </form>
      </div>

      {/* Loading overlay – matching RN CustomsActivityIndicatorComponent */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-[#FA875B]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-gray-700">{I18n.loading}</span>
          </div>
        </div>
      )}

      {/* Pending account modal – matching RN ActionModal + popup */}
      <Modal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
      >
        <div className="flex flex-col items-center text-center">
          {/* Popup image area */}
          <div className="w-full h-36 bg-gradient-to-br from-orange-100 to-orange-50 rounded-t-xl flex items-center justify-center mb-4">
            <svg className="w-20 h-20 text-[#FA875B] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full h-12 mt-5 bg-[#FA875B] text-white rounded-full font-bold text-sm font-[Montserrat,sans-serif] shadow-[0_1.5px_2px_0_#C45922] hover:bg-[#EB7446] active:scale-[0.98] transition-all"
            >
              {I18n.gotItAndTurnBack}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
