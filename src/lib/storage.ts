import type { LifeState } from '../types'

const STORAGE_KEY = 'lifeos-state-v1'

export function loadLifeState(fallback: LifeState): LifeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    return JSON.parse(raw) as LifeState
  } catch {
    return fallback
  }
}

export function saveLifeState(state: LifeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}
