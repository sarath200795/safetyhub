import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { friendlyAuthError } from '../utils/authErrors'
import { takeSessionExpiredFlag } from '../utils/session'
import DemoCredentials from '../components/DemoCredentials'

const MailIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)
const LockIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Honor a `next` target only for a LOTO operation (e.g. from a scanned QR
  // code); any other login lands on the dashboard.
  const nextParam = params.get('next')
  const dest = /^\/app\/operations\/[A-Za-z0-9_-]+$/.test(nextParam || '') ? nextParam : '/app'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Notify when the previous session ended due to inactivity.
  useEffect(() => {
    if (takeSessionExpiredFlag()) {
      toast('Signed out due to inactivity.', { icon: '🔒' })
    }
  }, [])

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back')
      // QR-scan sign-ins go to that equipment's LOTO Operations; else dashboard.
      navigate(dest, { replace: true })
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your organization's safety portal."
      footer={
        <div className="space-y-1.5">
          <p>
            New teammate?{' '}
            <Link to="/signup" className="font-semibold text-amber-600 hover:underline">
              Join your organization
            </Link>
          </p>
          <p>
            Setting up a new company?{' '}
            <Link to="/register-org" className="font-semibold text-amber-600 hover:underline">
              Register an organization
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          icon={MailIcon}
          value={form.email}
          onChange={update('email')}
          placeholder="you@company.com"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          icon={LockIcon}
          value={form.password}
          onChange={update('password')}
          placeholder="••••••••"
        />
        <div className="-mt-1 text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-amber-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {error && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          <span className="inline-flex items-center gap-2">
            Sign in
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </Button>
        <DemoCredentials onUse={(c) => setForm(c)} />
      </form>
    </AuthShell>
  )
}
