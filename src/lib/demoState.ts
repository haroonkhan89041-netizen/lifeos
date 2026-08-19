import type { LifeState } from './types'

export const initialLifeState: LifeState = {
  tasks: [
    { id: 'task-1', title: 'Finish portfolio case study', time: '10:00 AM', completed: true, priority: 'high' },
    { id: 'task-2', title: '30 min learning session', time: '2:00 PM', completed: false, priority: 'medium' },
    { id: 'task-3', title: 'Review monthly expenses', time: '6:30 PM', completed: false, priority: 'medium' },
  ],
  goals: [
    { id: 'goal-1', title: 'Build a stronger career', progress: 68, milestones: 6, completedMilestones: 4 },
  ],
  money: {
    available: 84500,
    spent: 32850,
    saved: 18000,
    currency: 'Rs.',
  },
}
