import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Mail, Smartphone, RefreshCw, AlertCircle, Sparkles, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

export default function TwoFactorVerify({
  twoFactorData,
  onVerifySuccess,
  onCancel
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeMethod, setActiveMethod] = useState(twoFactorData?.requestedMethod || 'both');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(twoFactorData?.previewUrl || null);

  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError('');

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    if (newDigits.every(d => d !== '') && index === 5) {
      submitOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
      submitOtp(pastedData);
    }
  };

  const submitOtp = async (codeToSubmit) => {
    const code = codeToSubmit || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: twoFactorData.userId,
          singleCode: code,
          twoFactorToken: twoFactorData.twoFactorToken
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Check the code and try again.');
      }

      setSuccessMsg('Security code verified successfully!');
      setTimeout(() => {
        onVerifySuccess(data);
      }, 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (methodToRequest) => {
    if (!canResend && timer > 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: twoFactorData.userId,
          method: methodToRequest || activeMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend real-time code');
      }

      setTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
      setSuccessMsg('A new real-time security code has been dispatched!');
      setTimeout(() => setSuccessMsg(''), 4000);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-1 text-left">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E1EFEF] text-[#1D4548] mb-3 shadow-inner border border-[#C4E1DE]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-[#1F2421]">Enter 2-Factor Code</h3>
        <p className="text-xs text-gray-500 mt-1">
          A real-time 6-digit security code has been dispatched.
        </p>
      </div>

      {/* Target Badges */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E0D4F5] text-xs font-extrabold text-[#1D4548] shadow-2xs">
          <Mail className="w-3.5 h-3.5 text-[#8A68E8]" />
          <span>{twoFactorData.email || 'Email Address'}</span>
        </div>
        {twoFactorData.phone && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#C4E1DE] text-xs font-extrabold text-[#1D4548] shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 text-[#2B6064]" />
            <span>{twoFactorData.phone}</span>
          </div>
        )}
      </div>

      {/* Online Real-Time Inbox Link (Ethereal / Live Dispatch) */}
      {previewUrl && (
        <div className="mb-4">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#FFF9E5] to-[#FEF0C0] border border-[#E9C46A] text-xs font-extrabold text-[#133032] hover:shadow-xs transition flex items-center justify-center gap-2 shadow-2xs"
          >
            <Mail className="w-4 h-4 text-[#8C6200]" />
            <span>📬 Open Real-Time Dispatched Web Mailbox</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto text-gray-500" />
          </a>
        </div>
      )}

      {/* Error & Success */}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 6 Digit Real-Time OTP Inputs */}
      <div className="flex justify-center items-center gap-2.5 my-5" onPaste={handlePaste}>
        {otpDigits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-extrabold font-mono rounded-2xl bg-white border-2 border-[#EDE4D6] focus:border-[#8A68E8] focus:ring-4 focus:ring-[#E0D4F5] focus:outline-none transition-all shadow-inner text-[#1F2421]"
            disabled={loading}
          />
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={() => submitOtp()}
        disabled={loading || otpDigits.some(d => d === '')}
        className="w-full py-3.5 rounded-2xl btn-primary-artisan text-sm font-extrabold tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Security Code...
          </>
        ) : (
          <>
            Verify & Enter Store <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Resend & Cancel */}
      <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-800 font-bold transition cursor-pointer"
        >
          ← Back to Login
        </button>

        <div className="flex items-center gap-1.5">
          <span>Didn't receive it?</span>
          {canResend ? (
            <button
              type="button"
              onClick={() => handleResendOtp()}
              className="text-[#5F32C4] font-extrabold hover:underline cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Resend Code
            </button>
          ) : (
            <span className="font-mono text-gray-400 font-bold">Resend in {timer}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
