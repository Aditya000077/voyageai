import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Sparkles, Mail, Lock, Eye, EyeOff, User, ArrowRight, Phone } from 'lucide-react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'signin' | 'signup' | 'otp'

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    otp: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    if (mode === 'otp' && !otpSent) {
      setOtpSent(true)
      return
    }
    alert(
      mode === 'signin'
        ? `Welcome back! Signed in as ${form.email}`
        : mode === 'signup'
          ? `Account created! Welcome to VoyageAI, ${form.name}!`
          : `OTP verified! Welcome to VoyageAI!`
    )
    onClose()
  }

  const socialButtons = [
    { label: 'Continue with Google', color: '#4285F4', icon: '🇬' },
    { label: 'Continue with Apple', color: '#F8FAFC', textColor: '#020617', icon: '' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              boxShadow: '0 0 24px rgba(245,158,11,0.4)',
            }}
          >
            <Sparkles size={26} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Join VoyageAI' : 'OTP Login'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'signin'
              ? "Sign in to your India travel intelligence account"
              : mode === 'signup'
                ? "Create your free VoyageAI India account"
                : otpSent
                  ? `Enter the 6-digit OTP sent to ${form.phone}`
                  : "Enter your mobile number to receive an OTP"}
          </p>
        </div>

        {/* Social Buttons */}
        {mode !== 'otp' && (
          <div className="space-y-2">
            {socialButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => alert(`${btn.label} integration coming soon!`)}
                className="w-full py-3 px-4 rounded-xl border border-slate-800 text-sm font-semibold flex items-center justify-center gap-3 transition-all hover:border-slate-600 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', color: '#F8FAFC', fontFamily: 'var(--font-body)' }}
              >
                <span className="text-base">{btn.icon}</span>
                {btn.label}
              </button>
            ))}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-500 font-mono">OR</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="name"
                type="text"
                required
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          )}

          {mode === 'otp' ? (
            <>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={otpSent}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-50"
                />
              </div>
              {otpSent && (
                <input
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={form.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors text-center tracking-widest text-lg font-mono"
                />
              )}
            </>
          ) : (
            <>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </>
          )}

          {mode === 'signin' && (
            <div className="text-right">
              <button type="button" className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-70"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              boxShadow: '0 0 20px rgba(245,158,11,0.35)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {mode === 'otp' && !otpSent ? 'Sending OTP...' : 'Processing...'}
              </span>
            ) : (
              <>
                <span>
                  {mode === 'signin'
                    ? 'Sign In'
                    : mode === 'signup'
                      ? 'Create Account'
                      : otpSent
                        ? 'Verify OTP'
                        : 'Send OTP'}
                </span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Mode toggles */}
        <div className="space-y-2 pt-2 border-t border-slate-800 text-center">
          {mode !== 'signin' && (
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setOtpSent(false) }}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
          {mode !== 'signup' && (
            <p className="text-xs text-slate-400">
              New to VoyageAI?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setOtpSent(false) }}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Create Account
              </button>
            </p>
          )}
          {mode !== 'otp' && (
            <p className="text-xs text-slate-400">
              Prefer OTP login?{' '}
              <button
                type="button"
                onClick={() => { setMode('otp'); setOtpSent(false) }}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Login with Mobile
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
