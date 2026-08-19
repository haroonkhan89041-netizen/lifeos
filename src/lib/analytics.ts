import type { Goal, Task } from '../types'

export function getTaskCompletionRate(tasks: Task[]) {
  if (!tasks.length) return 0
  return Math.round((tasks.filter((task) => task.completed).length / tasks.length) * 100)
}

export function getGoalAverage(goals: Goal[]) {
  if (!goals.length) return 0
  return Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
}

export function getFocusScore(tasks: Task[], goals: Goal[]) {
  const taskScore = getTaskCompletionRate(tasks)
  const goalScore = getGoalAverage(goals)
  return Math.round(taskScore * 0.45 + goalScore * 0.55)
}

export function getCompletedTaskCount(tasks: Task[]) {
  return tasks.filter((task) => task.completed).length
}
