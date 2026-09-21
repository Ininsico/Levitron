import Logo from './Logo.jsx'
import { footerColumns } from '../data/content.js'

export default function Footer() {
  return (
    <footer className="relative border-t border-ash-950/10 bg-cream-100">
      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <a href="#top" className="flex items-center gap-3">
              <Logo className="h-9 w-9" />
              <span className="font-display text-lg font-semibold text-ash-950">Levitron</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ash-600">
              An open-source presentation and PDF generator driven by AI. Built to be read, forked and self-hosted.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">MIT licensed</span>
              <span className="chip">React + Vite</span>
              <span className="chip">Express API</span>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ash-400">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-ash-600 transition-colors hover:text-lava-700"
                      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline my-12" />

        <div className="flex flex-col items-start justify-between gap-4 text-xs text-ash-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Levitron contributors. Released under the MIT license.</p>
          <p className="font-mono">
            cream <span className="text-lava-500">#fffdf8</span> · lava <span className="text-lava-500">#ff3b21</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
