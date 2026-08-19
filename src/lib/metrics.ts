import type { LifeState } from '../types'

export function getFocusScore(state: LifeState) {
  if (state.tasks.length === 0) return 0
  const completed = state.tasks.filter((task) => task.completed).length
  const highPriorityDone = state.tasks.filter((task) => task.priority === 'high' && task.completed).length
  return Math.min(100, Math.round((completed / state.tasks.length) * 80 + highPriorityDone * 20))
}

export function getGoalSummary(state: LifeState) {
  if (state.goals.length === 0) return { average: 0, completed: 0, total: 0 }
  const average = Math.round(state.goals.reduce((sum, goal) => sum + goal.progress, 0) / state.goals.length)
  const completed = state.goals.filter((goal) => goal.progress >= 100).length
  return { average, completed, total: state.goals.length }
}
