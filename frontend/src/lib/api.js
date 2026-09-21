import { readSession } from './session.js'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

const UNREACHABLE = 'Cannot reach the Levitron API. Is the backend running on port 4000?'

function fallbackMessage(status) {
  if (status === 502 || status === 503 || status === 504) {
    return UNREACHABLE
  }

  return `Request failed with status ${status}`
}

async function request(path, options = {}) {
  const session = readSession()
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`
  }

  let response

  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    // fetch only rejects when the request never completed at all — server down,
    // DNS failure, offline. An unreachable proxy lands here too.
    const error = new Error(UNREACHABLE)
    error.status = 0

    throw error
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(payload?.error ?? fallbackMessage(response.status))
    error.status = response.status

    throw error
  }

  return payload
}

export function getStats() {
  return request('/stats').then((payload) => payload.data)
}

export function joinWaitlist(email) {
  return request('/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }).then((payload) => payload.data)
}

export function registerAccount({ name, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }).then((payload) => payload.data)
}

export function loginAccount({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }).then((payload) => payload.data)
}

export function getCurrentUser() {
  return request('/auth/me').then((payload) => payload.data.user)
}
