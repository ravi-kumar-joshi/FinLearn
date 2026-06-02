import React, { useState, useRef, useEffect } from 'react'
import {
  MdEmail, MdLock, MdClose, MdLogin,
  MdVisibility, MdVisibilityOff, MdCheckCircle, MdInfo,
} from 'react-icons/md'
import api from '../services/api'

const STRENGTH_LEVELS = [
  { label: 'Weak', bar: 'w-1/4 bg-red-500', text: 'text-red-400' },
  { label: 'Fair', bar: 'w-2/4 bg-amber-400', text: 'text-amber-400' },
  { label: 'Good', bar: 'w-3/4 bg-emerald-400', text: 'text-emerald-400' },
  { label: 'Strong', bar: 'w-full bg-blue-400', text: 'text-blue-400' },
]

function getPasswordStrength(pw) {
  if (!pw) return null
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length
  return STRENGTH_LEVELS[score - 1] ?? STRENGTH_LEVELS[0]
}

function validateFields({ email, password }) {
  const errors = {}
  if (!email) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email.'
  if (!password) errors.password = 'Password is required.'
  return errors
}

function InputField({ icon, error, touched, children }) {
  const hasError = error && touched
  return (
    <div>
      <div className={[
        'flex items-center gap-2 rounded-lg border bg-slate-800 px-3 py-2.5 transition-all',
        hasError
          ? 'border-red-500/60 ring-1 ring-red-500/20'
          : 'border-slate-700 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/20',
      ].join(' ')}>
        {React.createElement(icon, { className: `shrink-0 text-lg ${hasError ? 'text-red-400' : 'text-slate-500'}` })}
        {children}
      </div>
      {hasError && <p className="ml-1 mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

function StrengthBar({ password }) {
  const strength = getPasswordStrength(password)
  if (!password || !strength) return null
  return (
    <div className="mt-2">
      <div className="h-0.5 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full rounded-full transition-all duration-300 ${strength.bar}`} />
      </div>
      <p className={`ml-1 mt-1 text-xs ${strength.text}`}>{strength.label}</p>
    </div>
  )
}

function SuccessView() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
        <MdCheckCircle className="text-4xl text-emerald-400" />
      </div>
      <p className="text-sm font-medium text-slate-100">Signed in successfully</p>
      <p className="text-xs text-slate-500">Loading dashboard…</p>
    </div>
  )
}

export default function AdminLoginModal({ open, onClose, onSuccess }) {
  const [fields, setFields] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState(null)
  const emailRef = useRef(null)

  // Focus email input on mount
  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 80)
  }, []) // eslint-disable-line

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open && !loading) onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, loading])

  if (!open) return null

  function setField(name, value) {
    const next = { ...fields, [name]: value }
    setFields(next)
    if (touched[name]) {
      const errs = validateFields(next)
      setErrors(e => ({ ...e, [name]: errs[name] }))
    }
    setApiError(null)
  }

  function touchField(name) {
    setTouched(t => ({ ...t, [name]: true }))
    const errs = validateFields(fields)
    setErrors(e => ({ ...e, [name]: errs[name] }))
  }

  function touchAll() {
    setTouched({ email: true, password: true })
    const errs = validateFields(fields)
    setErrors(errs)
    return errs
  }

  async function handleSubmit() {
    const errs = touchAll()
    if (Object.keys(errs).length) return

    setLoading(true)
    setApiError(null)
    try {
      const userData = await api.login(fields.email, fields.password)
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.(userData ?? { email: fields.email })
      }, 1200)
    } catch (err) {
      // BUG FIX: don't call reset() before setting error — it clears field values
      // Surface the API error without wiping the form
      setApiError(err.message || 'Invalid credentials. Please try again.')
      setLoading(false)
    }
  }

  function handleForgotPassword() {
    const errs = validateFields({ ...fields, password: 'placeholder' })
    if (errs.email) {
      touchField('email')
      emailRef.current?.focus()
    } else {
      alert(`A reset link will be sent to ${fields.email}`)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <MdLock className="text-lg text-blue-400" />
            </div>
            <div>
              <p id="modal-title" className="text-sm font-medium text-slate-100">Admin sign in</p>
              <p className="text-xs text-slate-500">Restricted access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-300 disabled:opacity-40"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {success ? <SuccessView /> : (
          <>
            {/* API-level error banner */}
            {apiError && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-900/20 border border-red-800/60 px-3 py-2">
                <p className="text-xs text-red-400">{apiError}</p>
              </div>
            )}

            {/* Email */}
            <div className="mb-3">
              <InputField icon={MdEmail} error={errors.email} touched={touched.email}>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Email address"
                  value={fields.email}
                  onChange={(e) => setField('email', e.target.value)}
                  onBlur={() => touchField('email')}
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                  autoComplete="email"
                  disabled={loading}
                />
              </InputField>
            </div>

            {/* Password */}
            <div className="mb-2">
              <InputField icon={MdLock} error={errors.password} touched={touched.password}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={fields.password}
                  onChange={(e) => setField('password', e.target.value)}
                  onBlur={() => touchField('password')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-slate-500 transition-colors hover:text-slate-300"
                >
                  {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                </button>
              </InputField>
              <StrengthBar password={fields.password} />
            </div>

            <div className="mb-4 flex justify-end">
              <button type="button" onClick={handleForgotPassword} className="text-xs text-blue-400 transition-colors hover:text-blue-300">
                Forgot password?
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-400 transition-all hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  : <MdLogin className="text-lg" />
                }
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-4">
              <p className="flex items-center justify-center gap-1 text-center text-xs text-slate-600">
                <MdInfo className="text-sm" />
                Access is monitored and logged.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}