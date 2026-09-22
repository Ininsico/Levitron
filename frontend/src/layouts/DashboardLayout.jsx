import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import Logo from '../components/Logo.jsx'
import { icons } from '../components/icons.jsx'
import { useAuth } from '../hooks/useAuth.js'

const SIDEBAR_KEY = 'levitron.sidebar'

const links = [
  { to: '/app', label: 'Dashboard', icon: 'chart', end: true },
  { to: '/app/new', label: 'New document', icon: 'plus', end: false },
]

function readCollapsed() {
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) === 'collapsed'
  } catch {
    return false
  }
}

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  // Collapsing the rail is a preference, so it survives a reload.
  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'expanded')
    } catch {
      // Private mode: the layout still works, it just is not remembered.
    }
  }, [collapsed])

  function handleSignOut() {
    signOut()
    navigate('/', { replace: true })
  }

  function renderNav(onNavigate) {
    return (
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-0' : 'px-3.5'
              } ${
                isActive
                  ? 'bg-blue-500/25 text-white ring-1 ring-inset ring-blue-300/30'
                  : 'text-blue-100/75 hover:bg-blue-500/15 hover:text-white'
              }`
            }
          >
            <span className="h-4 w-4 shrink-0">{icons[link.icon]}</span>
            {collapsed ? null : <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>
    )
  }

  function renderAccount(onNavigate) {
    return (
      <div className="border-t border-blue-300/15 px-3 py-4">
        {collapsed ? null : (
          <p className="truncate px-2 text-xs text-blue-200/60">{user?.email ?? 'Signed in'}</p>
        )}

        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            handleSignOut()
          }}
          title="Sign out"
          className={`mt-1 flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-blue-100/75 transition-colors hover:bg-blue-500/15 hover:text-white ${
            collapsed ? 'justify-center px-0' : 'px-3.5'
          }`}
        >
          <span className="h-4 w-4 shrink-0">{icons.close}</span>
          {collapsed ? null : 'Sign out'}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-gradient-to-b from-blue-900 via-blue-950 to-blue-950 text-blue-50 transition-[width] duration-300 ease-out lg:flex ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div
          className={`flex h-18 items-center border-b border-blue-300/15 ${
            collapsed ? 'justify-center px-2' : 'px-5'
          }`}
        >
          <Link to="/" className="flex items-center gap-3 overflow-hidden" title="Levitron">
            <Logo className="h-8 w-auto shrink-0" tone="light" />
            {collapsed ? null : (
              <span className="font-display text-base font-semibold tracking-tight text-white">Levitron</span>
            )}
          </Link>
        </div>

        {renderNav()}
        {renderAccount()}

        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="flex h-11 items-center justify-center gap-2 border-t border-blue-300/15 text-xs font-medium text-blue-100/70 transition-colors hover:bg-blue-500/15 hover:text-white"
        >
          <span className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
            {icons.chevronUp}
          </span>
          {collapsed ? null : 'Collapse'}
        </button>
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-blue-950 px-5 text-blue-50 lg:hidden">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-7 w-auto" tone="light" />
          <span className="font-display text-base font-semibold tracking-tight text-white">Levitron</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-lg p-2 text-blue-100/80 transition-colors hover:bg-blue-500/15 hover:text-white"
        >
          <span className="h-5 w-5">{open ? icons.close : icons.menu}</span>
        </button>
      </header>

      {open ? (
        <div className="sticky top-16 z-30 flex flex-col bg-gradient-to-b from-blue-900 to-blue-950 text-blue-50 lg:hidden">
          {renderNav(() => setOpen(false))}
          {renderAccount(() => setOpen(false))}
        </div>
      ) : null}

      <main className={`transition-[padding] duration-300 ease-out ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
