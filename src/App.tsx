import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, BarChart3, Bell, BriefcaseBusiness, CheckCircle2, ChevronRight, CircleDollarSign, LayoutDashboard, ListChecks, Menu, Moon, Plus, Sparkles, Target, Trash2, X, Pencil, Settings, RotateCcw } from 'lucide-react'
import { initialLifeState, type Goal, type LifeState, type MoneyTransaction, type Task } from './types'
import { clearLifeState, loadLifeState, saveLifeState } from './lib/storage'
import { formatTime, formatTodayLabel } from './lib/date'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Goals', icon: Target }, { label: 'Tasks', icon: ListChecks },
  { label: 'Money', icon: CircleDollarSign }, { label: 'Career', icon: BriefcaseBusiness }, { label: 'Analytics', icon: BarChart3 },
]

type Modal = 'settings' | 'goal' | 'money' | 'reminders' | null

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="assistant-modal" role="dialog" aria-modal="true"><div className="assistant-box form-box"><button className="assistant-close" aria-label="Close" onClick={onClose}><X size={18} /></button><span className="eyebrow">LIFEOS</span><h3>{title}</h3>{children}</div></div>
}

function App() {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [state, setState] = useState<LifeState>(() => loadLifeState(initialLifeState))
  const [newTask, setNewTask] = useState('')
  const [showTaskInput, setShowTaskInput] = useState(false)
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [modal, setModal] = useState<Modal>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [goalForm, setGoalForm] = useState({ title: '', target: '', category: 'Personal', progress: 0 })
  const [moneyForm, setMoneyForm] = useState({ type: 'expense' as MoneyTransaction['type'], title: '', amount: '' })
  const [assistantOpen, setAssistantOpen] = useState(false)

  useEffect(() => saveLifeState(state), [state])
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer) }, [])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2600); return () => window.clearTimeout(timer) }, [notice])

  const completed = useMemo(() => state.tasks.filter((task) => task.completed).length, [state.tasks])
  const focusScore = Math.min(100, 70 + completed * 6)
  const activeGoal = state.goals[0]
  const currency = state.money.currency

  function toast(message: string) { setNotice(message) }
  function handleAction(label: string) { setActive(label); setMenuOpen(false) }

  function toggleTask(id: string) {
    setState((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task) }))
  }
  function deleteTask(id: string) {
    setState((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) })); toast('Task removed')
  }
  function addTask() {
    const title = newTask.trim(); if (!title) return
    const task: Task = { id: `task-${Date.now()}`, title, due: 'Today', completed: false, priority: 'medium' }
    setState((current) => ({ ...current, tasks: [...current.tasks, task] }))
    setNewTask(''); setShowTaskInput(false); toast('Task added successfully')
  }

  function openGoal(goal?: Goal) {
    setEditingGoal(goal || null)
    setGoalForm(goal ? { title: goal.title, target: goal.target, category: goal.category, progress: goal.progress } : { title: '', target: '', category: 'Personal', progress: 0 })
    setModal('goal')
  }
  function saveGoal() {
    if (!goalForm.title.trim()) return toast('Goal title is required')
    const goal: Goal = { id: editingGoal?.id || `goal-${Date.now()}`, title: goalForm.title.trim(), target: goalForm.target.trim() || 'No target', category: goalForm.category, progress: Math.max(0, Math.min(100, Number(goalForm.progress) || 0)) }
    setState((current) => ({ ...current, goals: editingGoal ? current.goals.map((item) => item.id === goal.id ? goal : item) : [...current.goals, goal] }))
    setModal(null); toast(editingGoal ? 'Goal updated' : 'Goal created')
  }
  function deleteGoal(id: string) {
    setState((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== id) })); toast('Goal deleted')
  }

  function addMoneyTransaction() {
    const amount = Number(moneyForm.amount)
    if (!moneyForm.title.trim() || !Number.isFinite(amount) || amount <= 0) return toast('Enter a title and a valid amount')
    const transaction: MoneyTransaction = { id: `tx-${Date.now()}`, type: moneyForm.type, title: moneyForm.title.trim(), amount, date: new Date().toLocaleDateString() }
    setState((current) => {
      const money = { ...current.money, transactions: [transaction, ...current.money.transactions] }
      if (transaction.type === 'income') money.available += amount
      if (transaction.type === 'expense') { money.available = Math.max(0, money.available - amount); money.spent += amount }
      if (transaction.type === 'saving') { money.available = Math.max(0, money.available - amount); money.saved += amount }
      return { ...current, money }
    })
    setMoneyForm({ type: 'expense', title: '', amount: '' }); setModal(null); toast('Money transaction saved')
  }
  function deleteTransaction(transaction: MoneyTransaction) {
    setState((current) => {
      const money = { ...current.money, transactions: current.money.transactions.filter((item) => item.id !== transaction.id) }
      if (transaction.type === 'income') money.available = Math.max(0, money.available - transaction.amount)
      if (transaction.type === 'expense') { money.available += transaction.amount; money.spent = Math.max(0, money.spent - transaction.amount) }
      if (transaction.type === 'saving') { money.available += transaction.amount; money.saved = Math.max(0, money.saved - transaction.amount) }
      return { ...current, money }
    })
    toast('Transaction deleted')
  }

  function resetApp() {
    if (!window.confirm('Reset LifeOS to the original demo data? Your current local data will be removed.')) return
    clearLifeState(); setState(loadLifeState(initialLifeState)); setModal(null); toast('LifeOS has been reset')
  }

  function TaskList({ compact = false }: { compact?: boolean }) {
    return <div className="panel task-panel"><div className="panel-head"><h4>{compact ? "Today's tasks" : 'All tasks'}</h4><span>{state.tasks.length} items</span></div>{state.tasks.length === 0 ? <div className="empty-tasks"><CheckCircle2 size={22} /><strong>All clear for today.</strong><span>Add a task when something needs your attention.</span></div> : state.tasks.map((task) => <div className="task-row-wrap" key={task.id}><button className="task-row" onClick={() => toggleTask(task.id)}><CheckCircle2 className={task.completed ? 'done' : 'todo'} size={21} /><div><strong className={task.completed ? 'completed' : ''}>{task.title}</strong><small>{task.due} · {task.priority} priority</small></div></button><button className="delete-task" aria-label={`Delete ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 size={15} /></button></div>)}<div className="task-footer">{showTaskInput ? <div className="task-add-row"><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addTask(); if (event.key === 'Escape') setShowTaskInput(false) }} placeholder="What needs to be done?" /><button onClick={addTask}>Add</button></div> : <button className="add-task" onClick={() => setShowTaskInput(true)}><Plus size={14} /> Add a task</button>}{compact && <button className="text-button" onClick={() => handleAction('Tasks')}>Open planner <ChevronRight size={14} /></button>}</div></div>
  }

  function Overview() {
    return <><section className="hero-grid"><div className="hero-card"><div><span className="pill">YOUR DAY AT A GLANCE</span><h2>Make today<br /><em>count.</em></h2><p>Three focused priorities. One clear direction. LifeOS keeps the important things in view.</p></div><div className="focus-score"><span>FOCUS SCORE</span><strong>{focusScore}</strong><small>{completed} completed today</small></div></div><div className="stat-card"><div className="stat-heading"><span>GOAL PROGRESS</span><Target size={17} /></div><strong>{activeGoal?.progress ?? 0}%</strong><div className="progress"><i style={{ width: `${activeGoal?.progress ?? 0}%` }} /></div><p>{activeGoal?.title ?? 'Create your first goal'}</p><span className="muted">{completed} of {state.tasks.length} tasks complete today</span></div></section><section className="section-heading"><div><span className="eyebrow">TODAY</span><h3>Your priorities</h3></div><button className="text-button" onClick={() => handleAction('Tasks')}>View planner <ChevronRight size={16} /></button></section><section className="content-grid"><TaskList compact /><div className="panel ai-panel"><div className="ai-icon"><Sparkles size={18} /></div><span className="eyebrow">LIFEOS PLANNER</span><h4>Turn your priorities into a practical plan.</h4><p>LifeOS reads your current tasks and goal, then suggests the next useful action without pretending to be an AI service.</p><button className="primary-button" onClick={() => setAssistantOpen(true)}>Plan my day <ArrowUpRight size={16} /></button></div><div className="panel money-panel"><div className="panel-head"><h4>Money snapshot</h4><CircleDollarSign size={17} /></div><div className="money-value">{currency} {state.money.available.toLocaleString()}</div><span className="muted">Available balance</span><div className="money-row"><span>Spent</span><strong>{currency} {state.money.spent.toLocaleString()}</strong></div><div className="money-row"><span>Saved</span><strong>{currency} {state.money.saved.toLocaleString()}</strong></div></div></section></>
  }

  function Goals() {
    return <><section className="section-heading"><div><span className="eyebrow">GOAL TRACKER</span><h3>Build the life you are aiming for</h3></div><button className="primary-button" onClick={() => openGoal()}><Plus size={15} /> New goal</button></section><section className="content-grid goals-grid">{state.goals.map((goal) => <div className="panel" key={goal.id}><div className="panel-head"><h4>{goal.category}</h4><div className="inline-actions"><button className="icon-button" onClick={() => openGoal(goal)} aria-label="Edit goal"><Pencil size={14} /></button><button className="icon-button danger" onClick={() => deleteGoal(goal.id)} aria-label="Delete goal"><Trash2 size={14} /></button></div></div><div className="money-value">{goal.progress}%</div><div className="progress"><i style={{ width: `${goal.progress}%` }} /></div><h4 className="goal-title">{goal.title}</h4><p className="muted">Target: {goal.target}</p><button className="text-button goal-edit" onClick={() => openGoal(goal)}>Edit progress <Pencil size={13} /></button></div>)}{state.goals.length === 0 && <div className="panel empty-tasks"><Target size={22} /><strong>No goals yet.</strong><span>Create a goal and track its progress here.</span><button className="primary-button" onClick={() => openGoal()}>Create goal</button></div>}<div className="panel ai-panel"><div className="ai-icon"><Target size={18} /></div><span className="eyebrow">NEXT MOVE</span><h4>Turn your goal into today's priority.</h4><p>{activeGoal ? `Your current focus is “${activeGoal.title}”. Pick one task that directly moves it forward.` : 'Create your first goal, then connect your daily tasks to it.'}</p><button className="primary-button" onClick={() => handleAction('Tasks')}>Open tasks <ArrowUpRight size={16} /></button></div></section></>
  }

  function Money() {
    return <><section className="section-heading"><div><span className="eyebrow">FINANCE</span><h3>Your money at a glance</h3></div><button className="primary-button" onClick={() => setModal('money')}><Plus size={15} /> Add transaction</button></section><section className="content-grid"><div className="panel money-panel"><div className="panel-head"><h4>Available balance</h4><CircleDollarSign size={17} /></div><div className="money-value">{currency} {state.money.available.toLocaleString()}</div><div className="money-row"><span>Spent</span><strong>{currency} {state.money.spent.toLocaleString()}</strong></div><div className="money-row"><span>Saved</span><strong>{currency} {state.money.saved.toLocaleString()}</strong></div></div><div className="panel"><div className="panel-head"><h4>Saving rate</h4><span>Current</span></div><div className="money-value">{state.money.available ? Math.round((state.money.saved / (state.money.available + state.money.saved + state.money.spent)) * 100) : 0}%</div><p className="muted">Calculated from your recorded balance, spending and savings.</p></div><div className="panel"><div className="panel-head"><h4>Recent transactions</h4><span>{state.money.transactions.length}</span></div><div className="transaction-list">{state.money.transactions.slice(0, 5).map((tx) => <div className="transaction" key={tx.id}><div><strong>{tx.title}</strong><small>{tx.date} · {tx.type}</small></div><span className={tx.type === 'income' ? 'income' : 'expense'}>{tx.type === 'income' ? '+' : '-'}{currency} {tx.amount.toLocaleString()}</span><button className="delete-task" onClick={() => deleteTransaction(tx)} aria-label="Delete transaction"><Trash2 size={13} /></button></div>)}{state.money.transactions.length === 0 && <span className="muted">No transactions yet.</span>}</div></div></section></>
  }

  function Tasks() { return <><section className="section-heading"><div><span className="eyebrow">TASK MANAGEMENT</span><h3>Everything you need to finish</h3></div></section><section className="content-grid"><TaskList /><div className="panel ai-panel"><div className="ai-icon"><Sparkles size={18} /></div><span className="eyebrow">FOCUS</span><h4>{completed} of {state.tasks.length} tasks completed.</h4><p>Complete one important task at a time and keep your momentum visible.</p><button className="primary-button" onClick={() => toast(`Focus score is ${focusScore}`)}>Check my progress <ArrowUpRight size={16} /></button></div><div className="panel stat-card"><div className="stat-heading"><span>TODAY'S FOCUS</span><Target size={17} /></div><strong>{focusScore}</strong><div className="progress"><i style={{ width: `${focusScore}%` }} /></div><p>Keep going</p><span className="muted">Your score updates instantly.</span></div></section></> }

  function Career() { return <><section className="section-heading"><div><span className="eyebrow">CAREER</span><h3>Build a stronger career</h3></div></section><section className="content-grid"><div className="panel ai-panel"><div className="ai-icon"><BriefcaseBusiness size={18} /></div><span className="eyebrow">CAREER FOCUS</span><h4>Build skills that compound.</h4><p>Turn career growth into concrete tasks you can finish and measure.</p><button className="primary-button" onClick={() => { setNewTask('Practice one career skill'); handleAction('Tasks'); setShowTaskInput(true) }}>Set a career task <Plus size={15} /></button></div><div className="panel"><div className="panel-head"><h4>Career progress</h4><span>Today</span></div><div className="money-value">{focusScore}%</div><div className="progress"><i style={{ width: `${focusScore}%` }} /></div><p className="muted">Based on completed actions.</p></div><div className="panel"><div className="panel-head"><h4>Primary career goal</h4><BriefcaseBusiness size={17} /></div><p className="career-goal">{activeGoal?.title || 'No career goal yet.'}</p><button className="text-button" onClick={() => openGoal(activeGoal)}>Manage goal <ChevronRight size={14} /></button></div></section></> }

  function Analytics() { const ratio = state.tasks.length ? Math.round((completed / state.tasks.length) * 100) : 0; return <><section className="section-heading"><div><span className="eyebrow">INSIGHTS</span><h3>See how your actions are trending</h3></div></section><section className="content-grid"><div className="panel"><div className="panel-head"><h4>Task completion</h4><BarChart3 size={17} /></div><div className="money-value">{ratio}%</div><div className="progress"><i style={{ width: `${ratio}%` }} /></div><p className="muted">{completed} completed of {state.tasks.length} tasks</p></div><div className="panel"><div className="panel-head"><h4>Goals tracked</h4><span>Live</span></div><div className="money-value">{state.goals.length}</div><p className="muted">Average progress: {state.goals.length ? Math.round(state.goals.reduce((sum, goal) => sum + goal.progress, 0) / state.goals.length) : 0}%</p></div><div className="panel"><div className="panel-head"><h4>Money activity</h4><CircleDollarSign size={17} /></div><div className="money-value">{state.money.transactions.length}</div><p className="muted">Recorded transactions</p></div></section></> }

  function pageContent() { if (active === 'Tasks') return <Tasks />; if (active === 'Goals') return <Goals />; if (active === 'Money') return <Money />; if (active === 'Career') return <Career />; if (active === 'Analytics') return <Analytics />; return <Overview /> }

  const assistantText = activeGoal ? `Priority 1: finish “${state.tasks.find((task) => !task.completed)?.title || 'your next task'}”. Priority 2: protect time for “${activeGoal.title}”. You currently have ${state.money.currency} ${state.money.available.toLocaleString()} available. Keep the plan small and finish one important action before adding more.` : 'Create a goal first, then add one task that directly supports it. Keep the day focused on a small number of finishable actions.'

  return <div className="app-shell">
    {notice && <div className="toast"><CheckCircle2 size={16} />{notice}</div>}
    {assistantOpen && <ModalShell title="Your practical plan" onClose={() => setAssistantOpen(false)}><div className="ai-icon"><Sparkles size={18} /></div><p className="assistant-plan">{assistantText}</p><div className="assistant-actions"><button className="primary-button" onClick={() => { setAssistantOpen(false); handleAction('Tasks'); setShowTaskInput(true) }}>Add priority <Plus size={15} /></button><button className="assistant-secondary" onClick={() => { setAssistantOpen(false); toast(`You have ${completed} of ${state.tasks.length} tasks completed`) }}>Review progress</button></div></ModalShell>}
    {modal === 'settings' && <ModalShell title="Workspace settings" onClose={() => setModal(null)}><div className="form-grid"><label>Workspace name<input value={state.settings.workspaceName} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, workspaceName: e.target.value } }))} /></label><label>Reminder time<input type="time" value={state.settings.reminderTime} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, reminderTime: e.target.value } }))} /></label><label className="toggle-row"><span>Enable reminders</span><input type="checkbox" checked={state.settings.remindersEnabled} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, remindersEnabled: e.target.checked } }))} /></label><label className="toggle-row"><span>Dark appearance</span><input type="checkbox" checked={state.settings.darkMode} onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, darkMode: e.target.checked } }))} /></label></div><div className="form-actions"><button className="primary-button" onClick={() => { setModal(null); toast('Settings saved') }}>Save settings</button><button className="assistant-secondary" onClick={resetApp}><RotateCcw size={14} /> Reset data</button></div></ModalShell>}
    {modal === 'reminders' && <ModalShell title="Reminders" onClose={() => setModal(null)}><div className="reminder-card"><Bell size={20} /><div><strong>{state.settings.remindersEnabled ? 'Reminders are enabled' : 'Reminders are disabled'}</strong><p>Preferred reminder time: {state.settings.reminderTime}</p></div></div><button className="primary-button" onClick={() => { setState((s) => ({ ...s, settings: { ...s.settings, remindersEnabled: !s.settings.remindersEnabled } })); toast(state.settings.remindersEnabled ? 'Reminders disabled' : 'Reminders enabled') }}>{state.settings.remindersEnabled ? 'Disable reminders' : 'Enable reminders'}</button></ModalShell>}
    {modal === 'goal' && <ModalShell title={editingGoal ? 'Edit goal' : 'Create a goal'} onClose={() => setModal(null)}><div className="form-grid"><label>Goal title<input autoFocus value={goalForm.title} onChange={(e) => setGoalForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Learn web development" /></label><label>Target<input value={goalForm.target} onChange={(e) => setGoalForm((f) => ({ ...f, target: e.target.value }))} placeholder="e.g. 3 milestones" /></label><label>Category<select value={goalForm.category} onChange={(e) => setGoalForm((f) => ({ ...f, category: e.target.value }))}><option>Personal</option><option>Career</option><option>Money</option><option>Health</option><option>Learning</option></select></label><label>Progress: {goalForm.progress}%<input type="range" min="0" max="100" value={goalForm.progress} onChange={(e) => setGoalForm((f) => ({ ...f, progress: Number(e.target.value) }))} /></label></div><div className="form-actions"><button className="primary-button" onClick={saveGoal}>{editingGoal ? 'Save changes' : 'Create goal'}</button></div></ModalShell>}
    {modal === 'money' && <ModalShell title="Add money transaction" onClose={() => setModal(null)}><div className="form-grid"><label>Type<select value={moneyForm.type} onChange={(e) => setMoneyForm((f) => ({ ...f, type: e.target.value as MoneyTransaction['type'] }))}><option value="expense">Expense</option><option value="income">Income</option><option value="saving">Saving</option></select></label><label>Description<input autoFocus value={moneyForm.title} onChange={(e) => setMoneyForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Internet bill" /></label><label>Amount ({currency})<input type="number" min="1" value={moneyForm.amount} onChange={(e) => setMoneyForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0" /></label></div><div className="form-actions"><button className="primary-button" onClick={addMoneyTransaction}>Save transaction</button></div></ModalShell>}

    <aside className={menuOpen ? 'sidebar open' : 'sidebar'}><div className="brand-row"><img className="brand-logo" src="/lifeos-logo.svg" alt="LifeOS" /><span>LifeOS</span><button className="close-menu" onClick={() => setMenuOpen(false)}><X size={18} /></button></div><div className="workspace-label">PERSONAL WORKSPACE</div><nav>{navItems.map(({ label, icon: Icon }) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => handleAction(label)}><Icon size={18} /><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><button className="nav-item" onClick={() => setModal('reminders')}><Bell size={18} /><span>Reminders</span></button><button className="nav-item" onClick={() => setModal('settings')}><Settings size={18} /><span>Settings</span></button><div className="profile-mini"><div className="avatar">HK</div><div><strong>{state.settings.workspaceName || 'My workspace'}</strong><small>Local personal account</small></div></div></div></aside>
    <main className="main-content"><header className="topbar"><button className="menu-button" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div><div className="eyebrow">{formatTodayLabel(now).toUpperCase()} · {formatTime(now)} · {active.toUpperCase()}</div><h1>{active === 'Overview' ? 'Good morning.' : active}</h1></div><button className="assistant-button" onClick={() => setAssistantOpen(true)}><Sparkles size={17} /> Ask LifeOS <ArrowUpRight size={15} /></button></header>{pageContent()}</main>
  </div>
}

export default App
