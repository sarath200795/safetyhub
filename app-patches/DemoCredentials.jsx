import { useState } from 'react'

// Shared WE EHS demo login — matches the credentials seeded by demo-seed/
// and shown on the WE EHS landing page. Update here if they ever change.
export const DEMO_LOGIN = { email: 'demo@weehs.app', password: 'Demo@123' }

/**
 * A small "Try the demo" panel for an app's Login screen.
 * Drop it inside the sign-in form (e.g. just below the submit button).
 *
 *   <DemoCredentials onUse={(creds) => setForm(creds)} />
 *
 * `onUse` receives { email, password } so the parent can fill its form state
 * (and optionally auto-submit). Styling uses the brand/ink Tailwind tokens that
 * already exist in these apps; unknown shades degrade gracefully.
 */
export default function DemoCredentials({ onUse }) {
  const [copied, setCopied] = useState('')

  const copy = async (key) => {
    try {
      await navigator.clipboard.writeText(DEMO_LOGIN[key])
      setCopied(key)
      setTimeout(() => setCopied(''), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-900">Just exploring? Try the demo</p>
        <button
          type="button"
          onClick={() => onUse?.({ ...DEMO_LOGIN })}
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
        >
          Use demo account
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-ink-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink-500">Email</span>
          <code className="rounded bg-white px-1.5 py-0.5">{DEMO_LOGIN.email}</code>
          <button type="button" onClick={() => copy('email')} className="text-brand-600 hover:underline">
            {copied === 'email' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink-500">Password</span>
          <code className="rounded bg-white px-1.5 py-0.5">{DEMO_LOGIN.password}</code>
          <button type="button" onClick={() => copy('password')} className="text-brand-600 hover:underline">
            {copied === 'password' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </dl>

      <p className="mt-2 text-[11px] text-ink-400">Organization: WE EHS — shared evaluation demo.</p>
    </div>
  )
}
