import type { LifeState } from '../types'

const STORAGE_KEY = 'lifeos-state-v1'
const STORAGE_VERSION = 1

type StoredState = LifeState & { _version?: number }

export function loadLifeState(fallback: LifeState): LifeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as StoredState
    if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.goals) || !parsed.money) return fallback
    return {
      tasks: parsed.tasks.map((task) => ({ ...task, priority: task.priority === 'low' || task.priority === 'high' ? task.priority : 'medium' })),
      goals: parsed.goals.map((goal) => ({ ...goal, progress: Math.max(0, Math.min(100, Number(goal.progress) || 0)) })),
      money: { ...fallback.money, ...parsed.money, available: Number(parsed.money.available) || 0, spent: Number(parsed.money.spent) || 0, saved: Number(parsed.money.saved) || 0 },
    }
  } catch {
    return fallback
  }
}

export function saveLifeState(state: LifeState) {
  try {
    const stored: StoredState = { ...state, _version: STORAGE_VERSION }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
}
