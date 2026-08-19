import type { LifeState } from '../types'

const STORAGE_KEY = 'lifeos-state-v2'
const OLD_STORAGE_KEY = 'lifeos-state-v1'
const STORAGE_VERSION = 2

type StoredState = LifeState & { _version?: number }

function normalise(state: Partial<LifeState>, fallback: LifeState): LifeState {
  return {
    tasks: Array.isArray(state.tasks) ? state.tasks.map((task) => ({
      ...task,
      id: String(task.id),
      title: String(task.title || 'Untitled task'),
      due: String(task.due || 'Today'),
      completed: Boolean(task.completed),
      priority: task.priority === 'low' || task.priority === 'high' ? task.priority : 'medium',
    })) : fallback.tasks,
    goals: Array.isArray(state.goals) ? state.goals.map((goal) => ({
      ...goal,
      id: String(goal.id),
      title: String(goal.title || 'Untitled goal'),
      progress: Math.max(0, Math.min(100, Number(goal.progress) || 0)),
      target: String(goal.target || 'No target'),
      category: String(goal.category || 'Personal'),
    })) : fallback.goals,
    money: {
      ...fallback.money,
      ...(state.money || {}),
      available: Number(state.money?.available) || 0,
      spent: Number(state.money?.spent) || 0,
      saved: Number(state.money?.saved) || 0,
      transactions: Array.isArray(state.money?.transactions) ? state.money!.transactions : fallback.money.transactions,
    },
    settings: {
      ...fallback.settings,
      ...(state.settings || {}),
      remindersEnabled: state.settings?.remindersEnabled !== false,
      reminderTime: String(state.settings?.reminderTime || fallback.settings.reminderTime),
      darkMode: state.settings?.darkMode !== false,
      workspaceName: String(state.settings?.workspaceName || fallback.settings.workspaceName),
    },
  }
}

export function loadLifeState(fallback: LifeState): LifeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as StoredState
    if (!parsed) return fallback
    const state = normalise(parsed, fallback)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _version: STORAGE_VERSION }))
    return state
  } catch {
    return fallback
  }
}

export function saveLifeState(state: LifeState) {
  try {
    const stored: StoredState = { ...state, _version: STORAGE_VERSION }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Storage may be unavailable in restricted/private browser contexts.
  }
}

export function clearLifeState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(OLD_STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}
