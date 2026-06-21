import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import AuthShell from '../../components/AuthShell'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { login, resetPassword } from '../../services/orgs'
import { friendlyAuthError } from '../../lib/authErrors'
import DemoCredentials from '../../components/DemoCredentials'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    setError('')
    setNotice('')
    if (!email) {
      setError('Enter your email above, then tap “Forgot password?”.')
      return
    }
    try {
      await resetPassword(email)
      setNotice('Password reset email sent. Check your inbox.')
    } catch (err) {
      setError(friendlyAuthError(err))
    }
  }

  return (
    <AuthShell>
      <h2 className="text-4xl font-extrabold tracking-tight text-ink-800">
        Sign in
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Access your organization’s audit portal.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          action={
            <button
              type="button"
              onClick={handleForgot}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Forgot password?
            </button>
          }
        />

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {notice}
          </p>
        )}

        <Button type="submit" loading={loading} iconRight={ArrowRight} className="w-full">
          Sign in
        </Button>
        <DemoCredentials onUse={(c) => { setEmail(c.email); setPassword(c.password) }} />
      </form>

      <div className="mt-8 space-y-1.5 text-center text-sm text-slate-500">
        <p>
          New teammate?{' '}
          <Link to="/signup" className="link-accent">
            Join your organization
          </Link>
        </p>
        <p>
          Setting up a new company?{' '}
          <Link to="/register-org" className="link-accent">
            Create an organization
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
