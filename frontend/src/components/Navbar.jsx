import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Logo from './Logo.jsx'
import { icons } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { REPO_URL } from '../config.js'
import { navLinks } from '../data/content.js'

export default function Navbar() {
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'border-b border-ash-950/8 bg-cream-50/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="shell flex h-18 items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo className="h-9 w-9" />
          <span className="font-display text-lg font-semibold tracking-tight text-ash-950">Levitron</span>
          <span className="hidden rounded-full border border-ash-950/10 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-ash-500 sm:inline">
            v0.1
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ash-600 transition-colors hover:bg-cream-200 hover:text-lava-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
            <span className="h-4 w-4">{icons.star}</span>
            GitHub
          </a>
          <Link to={isAuthenticated ? '/app' : '/login'} className="btn btn-primary">
            {isAuthenticated ? 'Open app' : 'Start building'}
            <span className="h-4 w-4">{icons.arrow}</span>
          </Link>
        </div>

        <button
          type="button"
          className="btn btn-ghost lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span className="h-5 w-5">{open ? icons.close : icons.menu}</span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-ash-950/8 bg-cream-50/95 backdrop-blur-xl lg:hidden">
          <nav className="shell flex flex-col gap-1 py-5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-base font-medium text-ash-700 transition-colors hover:bg-cream-200 hover:text-lava-700"
              >
                {link.label}
              </a>
            ))}
            <Link
              to={isAuthenticated ? '/app' : '/login'}
              className="btn btn-primary mt-3"
              onClick={() => setOpen(false)}
            >
              {isAuthenticated ? 'Open app' : 'Start building'}
              <span className="h-4 w-4">{icons.arrow}</span>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
