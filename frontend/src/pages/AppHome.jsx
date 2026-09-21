import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Logo from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long' })

export default function AppHome() {
  const { user, refresh, signOut } = useAuth()
  const navigate = useNavigate()

  const [account, setAccount] = useState(user)
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    refresh()
      .then((fresh) => {
        if (!active) return
        setAccount(fresh)
        setStatus('verified')
      })
      .catch((refreshError) => {
        if (!active) return
        setError(refreshError.message)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [refresh])

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="relative min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-ink-950/8 bg-cream-50/80 backdrop-blur-xl">
        <div className="shell flex h-18 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="font-display text-lg font-semibold tracking-tight text-ink-950">Levitron</span>
          </Link>

          <button type="button" className="btn btn-outline" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="shell py-16">
        <div className="mx-auto max-w-2xl">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-950" />
            Workspace
          </span>

          <h1 className="mt-6 text-3xl text-ink-950 sm:text-4xl">
            {account?.name ? `Signed in as ${account.name}.` : 'Signed in.'}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-ink-600">
            Your account is stored in MongoDB. This page reads it back over{' '}
            <code className="font-mono text-sm text-ink-950">GET /api/auth/me</code> using the token in your session.
          </p>

          <div className="card mt-10 overflow-hidden bg-ink-950/12">
            <div className="grid gap-px sm:grid-cols-2">
              <Field label="Name" value={account?.name} />
              <Field label="Email" value={account?.email} />
              <Field
                label="Member since"
                value={account?.createdAt ? dateFormat.format(new Date(account.createdAt)) : ''}
              />
              <Field
                label="Session"
                value={status === 'verified' ? 'verified against the API' : status === 'error' ? error : 'checking…'}
              />
            </div>
          </div>

          <p className="mt-8 text-sm text-ink-500">The deck builder lands here next.</p>
        </div>
      </main>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="bg-cream-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p className="mt-2 truncate font-display text-lg text-ink-950">{value || '—'}</p>
    </div>
  )
}
