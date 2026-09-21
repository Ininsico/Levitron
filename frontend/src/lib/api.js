import { readSession } from './session.js'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

/**
 * User-facing copy only. Technical detail goes to the console — this text can
 * reach someone who has no idea what a backend, a port or a proxy is, so it
 * never names them.
 */
const OFFLINE = 'We could not reach the server. Check your connection and try again.'
const SERVER_ERROR = 'Something went wrong on our end. Please try again in a moment.'

function messageFor(status, payload) {
  // 5xx text comes from the gateway or the framework rather than from something
  // the user can act on, so it is replaced instead of shown.
  if (status === 502 || status === 503 || status === 504) return OFFLINE
  if (status >= 500) return SERVER_ERROR

  // 4xx messages are written for people ("That email is already registered"),
  // so those are passed through.
  return payload?.error ?? 'That request could not be completed.'
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
  } catch (cause) {
    // fetch only rejects when the request never completed at all — server down,
    // offline, DNS. The detail is for whoever is debugging, not for the screen.
    console.error(`[api] ${options.method ?? 'GET'} ${path} — request did not complete`, cause)

    const error = new Error(OFFLINE)
    error.status = 0

    throw error
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status >= 500) {
      console.error(`[api] ${options.method ?? 'GET'} ${path} → ${response.status}`, payload)
    }

    const error = new Error(messageFor(response.status, payload))
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

export function getCapabilities() {
  return request('/documents/capabilities').then((payload) => payload.data)
}

export function listDocuments() {
  return request('/documents').then((payload) => payload.data)
}

export function getDocument(id) {
  return request(`/documents/${id}`).then((payload) => payload.data)
}

export function createDocument(input) {
  return request('/documents', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((payload) => payload.data)
}

export function updateDocument(id, patch) {
  return request(`/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  }).then((payload) => payload.data)
}

export function deleteDocument(id) {
  return request(`/documents/${id}`, { method: 'DELETE' }).then((payload) => payload.data)
}

/**
 * Renders a document server-side and hands the bytes to the browser as a
 * download. Kept apart from request() because the response is a file.
 */
export async function exportDocument({ id, format }) {
  const session = readSession()

  const response = await fetch(`${API_BASE}/documents/${id}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    body: JSON.stringify({ format }),
  }).catch(() => null)

  if (!response) {
    const error = new Error(OFFLINE)
    error.status = 0

    throw error
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const error = new Error(messageFor(response.status, payload))
    error.status = response.status

    throw error
  }

  const blob = await response.blob()
  const disposition = response.headers.get('content-disposition') ?? ''
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? `levitron-export.${format}`

  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = filename
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return filename
}
