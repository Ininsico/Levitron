const STORAGE_KEY = 'levitron.session'

export function readSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSession(session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
