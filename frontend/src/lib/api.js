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
    const error = new Error(UNREACHABLE)
    error.status = 0

    throw error
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const error = new Error(payload?.error ?? fallbackMessage(response.status))
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
