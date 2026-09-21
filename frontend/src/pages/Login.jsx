import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import Logo from '../components/Logo.jsx'
import { icons } from '../components/icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const highlights = [
  'Prompt, document or repo in — a designed deck out',
  'Every theme driven from one stylesheet',
  'Print-accurate PDF export, on your own hardware',
]

export default function Login() {
  const { isAuthenticated, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState('signin')
  const [fields, setFields] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const isSignup = mode === 'signup'
  const redirectTo = location.state?.from ?? '/app'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  function update(name) {
    return (event) => setFields((current) => ({ ...current, [name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')

    try {
      if (isSignup) {
        await signUp(fields)
      } else {
        await signIn({ email: fields.email, password: fields.password })
      }

      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
      setStatus('idle')
    }
  }

  function switchMode() {
    setMode(isSignup ? 'signin' : 'signup')
    setError('')
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink-950 p-12 text-cream-100 lg:flex xl:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="grid-lines absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_30%_15%,#000,transparent_72%)]" />
          <div className="animate-ember absolute -right-28 top-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,253,248,0.09),transparent_65%)] blur-3xl" />
        </div>

        <Link to="/" className="relative flex items-center gap-3">
          <Logo className="h-10 w-10" tone="light" />
          <span className="font-display text-xl font-semibold tracking-tight text-cream-50">Levitron</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl leading-[1.1] text-cream-50">
            Everything between an idea and a finished deck.
          </h2>

          <ul className="mt-10 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-cream-200/75">
                <span className="mt-0.5 h-4 w-4 shrink-0 text-cream-200">{icons.check}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-xs tracking-wide text-cream-200/40">
          Open source · MIT licensed
        </p>
      </aside>

      <main className="flex w-full flex-col justify-center px-6 py-14 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-12 flex items-center gap-3 lg:hidden">
            <Logo className="h-9 w-9" />
            <span className="font-display text-lg font-semibold tracking-tight text-ink-950">Levitron</span>
          </Link>

          <h1 className="text-3xl text-ink-950">{isSignup ? 'Create your account.' : 'Welcome back.'}</h1>

          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            {isSignup
              ? 'Free while in development. No card, no seat licences.'
              : 'Sign in to open your workspace.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-4">
            {isSignup ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-700">Name</span>
                <input
                  className="field"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  required
                  value={fields.name}
                  onChange={update('name')}
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">Email</span>
              <input
                className="field"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                value={fields.email}
                onChange={update('email')}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink-700">Password</span>
              <input
                className="field"
                type="password"
                name="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
                required
                minLength={isSignup ? 8 : undefined}
                value={fields.password}
                onChange={update('password')}
              />
            </label>

            <div className="space-y-4 pt-2">
              {error ? (
                <div
                  className="flex items-start gap-2.5 rounded-xl border border-ink-950/12 bg-ink-50 px-3.5 py-3"
                  role="alert"
                >
                  <span className="mt-0.5 h-4 w-4 shrink-0 text-ink-700">{icons.alert}</span>
                  <p className="text-sm leading-relaxed text-ink-900">{error}</p>
                </div>
              ) : null}

              <button type="submit" className="btn btn-primary btn-block" disabled={status === 'loading'}>
                {status === 'loading' ? 'Working…' : isSignup ? 'Create account' : 'Sign in'}
                {status === 'loading' ? null : <span className="h-4 w-4">{icons.arrow}</span>}
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm text-ink-600">
            {isSignup ? 'Already have an account?' : 'New to Levitron?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-ink-950 underline decoration-ink-300 underline-offset-4 transition-colors hover:decoration-ink-950"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </button>
          </p>

          <div className="hairline my-8" />

          <Link to="/" className="text-sm text-ink-500 transition-colors hover:text-ink-950">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
