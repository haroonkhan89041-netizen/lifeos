export type Priority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  time: string
  completed: boolean
  priority: Priority
}

export type Goal = {
  id: string
  title: string
  progress: number
  milestones: number
  completedMilestones: number
}

export type MoneySnapshot = {
  available: number
  spent: number
  saved: number
  currency: string
}

export type LifeState = {
  tasks: Task[]
  goals: Goal[]
  money: MoneySnapshot
}
