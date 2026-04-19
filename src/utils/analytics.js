const ANON_ID_KEY = 'northern-anon-id'

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

const generateUuidV4 = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const h = []
  for (let i = 0; i < 16; i++) h.push(bytes[i].toString(16).padStart(2, '0'))
  return (
    h.slice(0, 4).join('') +
    '-' +
    h.slice(4, 6).join('') +
    '-' +
    h.slice(6, 8).join('') +
    '-' +
    h.slice(8, 10).join('') +
    '-' +
    h.slice(10, 16).join('')
  )
}

export const getAnonId = () => {
  if (!isBrowser()) return null
  try {
    const existing = localStorage.getItem(ANON_ID_KEY)
    if (existing && UUID_V4_RE.test(existing)) return existing
    const fresh = generateUuidV4()
    localStorage.setItem(ANON_ID_KEY, fresh)
    return fresh
  } catch (e) {
    return null
  }
}

// sendBeacon не блокирует навигацию (важно, т.к. CTA ведёт на /app).
// Fallback — fetch с keepalive: тот же семантический контракт, браузер
// дописывает запрос даже если страница уже ушла.
const sendEvent = (url, payload) => {
  if (!isBrowser()) return false
  const body = JSON.stringify(payload)
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      if (navigator.sendBeacon(url, blob)) return true
    }
  } catch (e) {}
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
    return true
  } catch (e) {
    return false
  }
}

const trackCtaEvent = (ctaId, eventType) => {
  if (!isBrowser()) return
  sendEvent('/c/cta-event', {
    event_type: eventType,
    cta_id: ctaId,
    anon_id: getAnonId(),
    path: window.location.pathname + window.location.search,
    referer: document.referrer || null,
  })
}

export const trackCtaClick = (ctaId) => trackCtaEvent(ctaId, 'click')

export const trackCtaView = (ctaId) => trackCtaEvent(ctaId, 'view')
