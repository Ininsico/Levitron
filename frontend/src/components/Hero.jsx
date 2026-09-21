import { Link } from 'react-router-dom'

import { icons } from './icons.jsx'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="grid-lines absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_50%_0%,#000_10%,transparent_72%)]" />
        <div className="animate-drift absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,59,33,0.22),transparent_62%)] blur-2xl" />
        <div className="animate-ember absolute -top-24 right-[8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,157,130,0.45),transparent_65%)] blur-2xl" />
      </div>

      <div className="shell relative">
        <div className="mx-auto max-w-4xl text-center">
          <span className="eyebrow reveal">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lava-500" />
            Open source · MIT licensed
          </span>

          <h1 className="reveal mt-7 text-4xl leading-[1.05] text-ash-950 sm:text-5xl md:text-6xl lg:text-7xl" style={{ '--reveal-delay': '60ms' }}>
            Turn a prompt into a deck
            <br className="hidden sm:block" /> worth <span className="text-gradient">presenting</span>.
          </h1>

          <p className="reveal mx-auto mt-7 max-w-2xl text-base leading-relaxed text-ash-600 sm:text-lg" style={{ '--reveal-delay': '140ms' }}>
            Levitron is the open-source engine that reads a sentence, a document or a repository and builds a
            designed, export-ready PDF deck. Self-host it, theme it, own every pixel.
          </p>

          <div className="reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ '--reveal-delay': '220ms' }}>
            <Link to="/login" className="btn btn-primary btn-lg w-full sm:w-auto">
              Generate your first deck
              <span className="h-4 w-4">{icons.arrow}</span>
            </Link>
            <a href="#features" className="btn btn-outline btn-lg w-full sm:w-auto">
              Explore features
            </a>
          </div>

          <p className="reveal mt-6 text-sm text-ash-500" style={{ '--reveal-delay': '280ms' }}>
            No credit card. No account. One command:{' '}
            <code className="font-mono text-lava-700">docker run levitron</code>
          </p>
        </div>
      </div>
    </section>
  )
}
