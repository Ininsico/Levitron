import { readSession } from './session.js'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request(path, options = {}) {
  const session = readSession()
  const headers = { 'Content-Type': 'application/json', ...options.headers }

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(payload?.error ?? `Request failed with status ${response.status}`)
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
