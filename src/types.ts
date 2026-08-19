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

export type MoneyTransaction = {
  id: string
  type: 'income' | 'expense' | 'saving'
  title: string
  amount: number
  date: string
}

export type MoneySnapshot = {
  available: number
  spent: number
  saved: number
  currency: string
  transactions: MoneyTransaction[]
}

export type LifeSettings = {
  remindersEnabled: boolean
  reminderTime: string
  darkMode: boolean
  workspaceName: string
}

export type LifeState = {
  tasks: Task[]
  goals: Goal[]
  money: MoneySnapshot
  settings: LifeSettings
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
  money: {
    available: 84500,
    spent: 32850,
    saved: 18000,
    currency: 'PKR',
    transactions: [
      { id: 'tx-1', type: 'income', title: 'Monthly income', amount: 135350, date: 'Today' },
      { id: 'tx-2', type: 'expense', title: 'Monthly expenses', amount: 32850, date: 'Today' },
      { id: 'tx-3', type: 'saving', title: 'Emergency savings', amount: 18000, date: 'Today' },
    ],
  },
  settings: {
    remindersEnabled: true,
    reminderTime: '09:00',
    darkMode: true,
    workspaceName: 'My workspace',
  },
}
