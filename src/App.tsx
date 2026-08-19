import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, BarChart3, Bell, BriefcaseBusiness, CheckCircle2, ChevronRight, CircleDollarSign, LayoutDashboard, ListChecks, Menu, Moon, Plus, Sparkles, Target, Trash2, X } from 'lucide-react'
import { initialLifeState, type LifeState } from './types'
import { loadLifeState, saveLifeState } from './lib/storage'
import { formatTime, formatTodayLabel } from './lib/date'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Goals', icon: Target }, { label: 'Tasks', icon: ListChecks },
  { label: 'Money', icon: CircleDollarSign }, { label: 'Career', icon: BriefcaseBusiness }, { label: 'Analytics', icon: BarChart3 },
]

function App() {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [state, setState] = useState<LifeState>(() => loadLifeState(initialLifeState))
  const [newTask, setNewTask] = useState('')
  const [showTaskInput, setShowTaskInput] = useState(false)
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [showAssistant, setShowAssistant] = useState(false)

  useEffect(() => saveLifeState(state), [state])
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer) }, [])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2600); return () => window.clearTimeout(timer) }, [notice])
  const completed = useMemo(() => state.tasks.filter((task) => task.completed).length, [state.tasks])
  const focusScore = Math.min(100, 70 + completed * 6)
  const activeGoal = state.goals[0]

  function toggleTask(id: string) { setState((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task) })) }
  function deleteTask(id: string) { setState((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) })); setNotice('Task removed') }
  function addTask() {
    const title = newTask.trim(); if (!title) return
    setState((current) => ({ ...current, tasks: [...current.tasks, { id: `task-${Date.now()}`, title, due: 'Today', completed: false, priority: 'medium' }] }))
    setNewTask(''); setShowTaskInput(false); setNotice('Task added successfully')
  }
  function handleAction(label: string) { setActive(label); setMenuOpen(false) }

  return <div className="app-shell">
    {notice && <div className="toast"><CheckCircle2 size={16} />{notice}</div>}
    {showAssistant && <div className="assistant-modal" role="dialog" aria-modal="true" aria-label="LifeOS assistant"><div className="assistant-box"><button className="assistant-close" aria-label="Close assistant" onClick={() => setShowAssistant(false)}><X size={18} /></button><div className="ai-icon"><Sparkles size={18} /></div><span className="eyebrow">LIFEOS INTELLIGENCE</span><h3>Your planning assistant is ready.</h3><p>Start with one clear priority. LifeOS will keep your tasks, goals and money snapshot together.</p><div className="assistant-actions"><button className="primary-button" onClick={() => { setShowAssistant(false); setShowTaskInput(true); setNotice('Ready to add your next priority') }}>Add a priority <Plus size={15} /></button><button className="assistant-secondary" onClick={() => { setShowAssistant(false); setNotice(`${completed} of ${state.tasks.length} tasks completed today`) }}>Review my progress</button></div></div></div>}
    <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand-row"><img className="brand-logo" src="/lifeos-logo.svg" alt="LifeOS" /><span>LifeOS</span><button className="close-menu" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <div className="workspace-label">PERSONAL WORKSPACE</div>
      <nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => handleAction(label)}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => setNotice('Reminders are ready')}><Bell size={18} /><span>Reminders</span></button><button className="nav-item" onClick={() => setNotice('Appearance settings are ready')}><Moon size={18} /><span>Appearance</span></button><div className="profile-mini"><div className="avatar">HK</div><div><strong>My workspace</strong><small>Personal account</small></div></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div><div className="eyebrow">{formatTodayLabel(now).toUpperCase()} · {formatTime(now)} · {active.toUpperCase()}</div><h1>{active === 'Overview' ? 'Good morning.' : active}</h1></div><button className="assistant-button" onClick={() => setShowAssistant(true)}><Sparkles size={17} /> Ask LifeOS <ArrowUpRight size={15} /></button></header>
      <section className="hero-grid"><div className="hero-card"><div><span className="pill">YOUR DAY AT A GLANCE</span><h2>Make today<br /><em>count.</em></h2><p>Three focused priorities. One clear direction. LifeOS keeps the important things in view.</p></div><div className="focus-score"><span>FOCUS SCORE</span><strong>{focusScore}</strong><small>Live from your tasks</small></div></div><div className="stat-card"><div className="stat-heading"><span>GOAL PROGRESS</span><Target size={17} /></div><strong>{activeGoal?.progress ?? 0}%</strong><div className="progress"><i style={{ width: `${activeGoal?.progress ?? 0}%` }} /></div><p>{activeGoal?.title ?? 'Create your first goal'}</p><span className="muted">{completed} of {state.tasks.length} tasks complete today</span></div></section>
      <section className="section-heading"><div><span className="eyebrow">TODAY</span><h3>Your priorities</h3></div><button className="text-button" onClick={() => setNotice('Planner view is ready')}>View planner <ChevronRight size={16} /></button></section>
      <section className="content-grid"><div className="panel task-panel"><div className="panel-head"><h4>Today's tasks</h4><span>{state.tasks.length} items</span></div>{state.tasks.length === 0 ? <div className="empty-tasks"><CheckCircle2 size={22} /><strong>All clear for today.</strong><span>Add a task when something needs your attention.</span></div> : state.tasks.map((task) => <div className="task-row-wrap" key={task.id}><button className="task-row" onClick={() => toggleTask(task.id)}><CheckCircle2 className={task.completed ? 'done' : 'todo'} size={21} /><div><strong className={task.completed ? 'completed' : ''}>{task.title}</strong><small>{task.due} · {task.priority} priority</small></div></button><button className="delete-task" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 size={15} /></button></div>)}{showTaskInput ? <div className="task-add-row"><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addTask(); if (event.key === 'Escape') setShowTaskInput(false) }} placeholder="What needs to be done?" /><button onClick={addTask}>Add</button></div> : <button className="add-task" onClick={() => setShowTaskInput(true)}><Plus size={14} /> Add a task</button>}</div><div className="panel ai-panel"><div className="ai-icon"><Sparkles size={18} /></div><span className="eyebrow">LIFEOS INTELLIGENCE</span><h4>A smarter way to plan your day.</h4><p>Your goals, schedule and progress work together. Get a practical plan instead of another list to manage.</p><button className="primary-button" onClick={() => setShowAssistant(true)}>Plan my day <ArrowUpRight size={16} /></button></div><div className="panel money-panel"><div className="panel-head"><h4>Money snapshot</h4><CircleDollarSign size={17} /></div><div className="money-value">{state.money.currency} {state.money.available.toLocaleString()}</div><span className="muted">Available this month</span><div className="money-row"><span>Spent</span><strong>{state.money.currency} {state.money.spent.toLocaleString()}</strong></div><div className="money-row"><span>Saved</span><strong>{state.money.currency} {state.money.saved.toLocaleString()}</strong></div></div></section>
    </main>
  </div>
}
export default App
