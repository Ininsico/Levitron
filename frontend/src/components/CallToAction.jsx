import { useState } from 'react'

import { icons } from './icons.jsx'
import { joinWaitlist } from '../lib/api.js'

export default function CallToAction() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const data = await joinWaitlist(email)
      setStatus('success')
      setMessage(
        data.created
          ? `You are on the list — you are number ${data.total}.`
          : 'You were already on the list. Still counts.',
      )
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <section id="get-started" className="relative pb-24 sm:pb-32">
      <div className="shell">
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-ink-950 px-6 py-16 text-center text-cream-100 sm:px-12 sm:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="animate-drift absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,253,248,0.09),transparent_65%)] blur-2xl" />
            <div className="grid-lines absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_70%)]" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream-50/20 bg-cream-50/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-cream-200">
              <span className="h-1.5 w-1.5 rounded-full bg-cream-100" />
              Early access
            </span>

            <h2 className="mt-6 text-3xl leading-[1.1] text-cream-50 sm:text-4xl md:text-5xl">
              Your next deck is one sentence away.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cream-200/70 sm:text-lg">
              Get notified when the hosted renderer opens, or skip the line and self-host tonight. The source is
              already public.
            </p>

            <form onSubmit={handleSubmit} className="mx-auto mt-9 flex max-w-lg flex-col gap-3 sm:flex-row">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="field"
                disabled={status === 'loading'}
              />
              <button type="submit" className="btn btn-light btn-lg shrink-0 rounded-xl" disabled={status === 'loading'}>
                {status === 'loading' ? 'Joining…' : 'Join the list'}
                {status === 'loading' ? null : <span className="h-4 w-4">{icons.arrow}</span>}
              </button>
            </form>

            <p
              className={`mt-4 min-h-6 text-sm ${status === 'error' ? 'text-cream-300' : 'text-cream-200/55'}`}
              role="status"
            >
              {message || 'This form posts to the Levitron Express API at /api/waitlist.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
