import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import Logo from '../components/Logo.jsx'
import { icons } from '../components/icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/app', label: 'Dashboard', icon: 'chart', end: true },
  { to: '/app/new', label: 'New document', icon: 'plus', end: false },
]

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

  const nav = (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-ink-950 text-cream-50' : 'text-ink-600 hover:bg-cream-200 hover:text-ink-950'
            }`
          }
        >
          <span className="h-4 w-4">{icons[link.icon]}</span>
          {link.label}
        </NavLink>
      ))}
    </nav>
  )

  const account = (
    <div className="border-t border-ink-950/10 px-3 py-4">
      <p className="truncate px-2 text-xs text-ink-500">{user?.email ?? 'Signed in'}</p>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-cream-200 hover:text-ink-950"
      >
        <span className="h-4 w-4">{icons.close}</span>
        Sign out
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-ink-950/10 bg-cream-50 lg:flex">
        <Link to="/" className="flex h-18 items-center gap-3 border-b border-ink-950/10 px-6">
          <Logo className="h-8 w-auto" />
          <span className="font-display text-base font-semibold tracking-tight text-ink-950">Levitron</span>
        </Link>

        {nav}
        {account}
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-ink-950/10 bg-cream-50/90 px-5 backdrop-blur-xl lg:hidden">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-7 w-auto" />
          <span className="font-display text-base font-semibold tracking-tight text-ink-950">Levitron</span>
        </Link>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="h-5 w-5">{open ? icons.close : icons.menu}</span>
        </button>
      </header>

      {open ? (
        <div className="sticky top-16 z-30 flex flex-col border-b border-ink-950/10 bg-cream-50 lg:hidden">
          {nav}
          {account}
        </div>
      ) : null}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
