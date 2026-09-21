import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import Logo from '../components/Logo.jsx'
import { icons } from '../components/icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-paper">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="grid-lines absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_50%_0%,#000_10%,transparent_72%)]" />
        <div className="animate-drift absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,59,33,0.2),transparent_62%)] blur-2xl" />
      </div>

      <header className="shell relative flex h-18 items-center">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <span className="font-display text-lg font-semibold tracking-tight text-ash-950">Levitron</span>
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-lava-500" />
              {isSignup ? 'Create account' : 'Sign in'}
            </span>

            <h1 className="mt-6 text-3xl text-ash-950">{isSignup ? 'Start building decks.' : 'Welcome back.'}</h1>

            <p className="mt-3 text-sm leading-relaxed text-ash-600">
              {isSignup
                ? 'One account keeps your themes, decks and exports in one place.'
                : 'Sign in to open your workspace.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-3">
              {isSignup ? (
                <label className="block">
                  <span className="sr-only">Name</span>
                  <input
                    className="field"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    value={fields.name}
                    onChange={update('name')}
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="sr-only">Email address</span>
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
                <span className="sr-only">Password</span>
                <input
                  className="field"
                  type="password"
                  name="password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
                  required
                  minLength={isSignup ? 8 : undefined}
                  value={fields.password}
                  onChange={update('password')}
                />
              </label>

              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Working…' : isSignup ? 'Create account' : 'Sign in'}
                {status === 'loading' ? null : <span className="h-4 w-4">{icons.arrow}</span>}
              </button>
            </form>

            <p className="mt-4 min-h-6 text-sm text-lava-700" role="alert">
              {error}
            </p>

            <div className="hairline mb-6" />

            <p className="text-sm text-ash-600">
              {isSignup ? 'Already have an account?' : 'New to Levitron?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="font-semibold text-lava-700 underline-offset-4 hover:underline"
              >
                {isSignup ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-ash-500">
            <Link to="/" className="transition-colors hover:text-lava-700">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
