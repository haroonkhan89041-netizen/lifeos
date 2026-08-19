export type Task = {
  id: string
  title: string
  due: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

export type Goal = {
  id: string
  title: string
  progress: number
  target: string
  category: string
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

export const initialLifeState: LifeState = {
  tasks: [
    { id: 'task-1', title: 'Finish portfolio case study', due: '10:00 AM', completed: true, priority: 'high' },
    { id: 'task-2', title: '30 min learning session', due: '2:00 PM', completed: false, priority: 'medium' },
    { id: 'task-3', title: 'Review monthly expenses', due: '6:30 PM', completed: false, priority: 'medium' },
  ],
  goals: [
    { id: 'goal-1', title: 'Build a stronger career', progress: 68, target: '6 milestones', category: 'Career' },
  ],
  money: { available: 84500, spent: 32850, saved: 18000, currency: 'PKR' },
}
