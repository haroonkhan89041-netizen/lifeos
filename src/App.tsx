import { useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Sparkles,
  Target,
  X,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Goals', icon: Target },
  { label: 'Tasks', icon: ListChecks },
  { label: 'Money', icon: CircleDollarSign },
  { label: 'Career', icon: BriefcaseBusiness },
  { label: 'Analytics', icon: BarChart3 },
]

const tasks = [
  { title: 'Finish portfolio case study', time: '10:00 AM', done: true },
  { title: '30 min learning session', time: '2:00 PM', done: false },
  { title: 'Review monthly expenses', time: '6:30 PM', done: false },
]

function App() {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand-row">
          <div className="brand-mark"><Sparkles size={17} /></div>
          <span>LifeOS</span>
          <button className="close-menu" onClick={() => setMenuOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(label); setMenuOpen(false) }}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Bell size={18} /><span>Reminders</span></button>
          <button className="nav-item"><Moon size={18} /><span>Appearance</span></button>
          <div className="profile-mini">
            <div className="avatar">HK</div>
            <div><strong>My workspace</strong><small>Personal account</small></div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <div>
            <div className="eyebrow">WEDNESDAY, AUGUST 19</div>
            <h1>Good morning.</h1>
          </div>
          <button className="assistant-button"><Sparkles size={17} /> Ask LifeOS <ArrowUpRight size={15} /></button>
        </header>

        <section className="hero-grid">
          <div className="hero-card">
            <div>
              <span className="pill">YOUR DAY AT A GLANCE</span>
              <h2>Make today<br /><em>count.</em></h2>
              <p>Three focused priorities. One clear direction. LifeOS keeps the important things in view.</p>
            </div>
            <div className="focus-score">
              <span>FOCUS SCORE</span>
              <strong>82</strong>
              <small>+8% this week</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-heading"><span>GOAL PROGRESS</span><Target size={17} /></div>
            <strong>68%</strong>
            <div className="progress"><i style={{ width: '68%' }} /></div>
            <p>Build a stronger career</p>
            <span className="muted">4 of 6 milestones complete</span>
          </div>
        </section>

        <section className="section-heading">
          <div><span className="eyebrow">TODAY</span><h3>Your priorities</h3></div>
          <button className="text-button">View planner <ChevronRight size={16} /></button>
        </section>

        <section className="content-grid">
          <div className="panel task-panel">
            <div className="panel-head"><h4>Today's tasks</h4><span>3 items</span></div>
            {tasks.map((task) => (
              <div className="task-row" key={task.title}>
                <CheckCircle2 className={task.done ? 'done' : 'todo'} size={21} />
                <div><strong className={task.done ? 'completed' : ''}>{task.title}</strong><small>{task.time}</small></div>
              </div>
            ))}
            <button className="add-task">+ Add a task</button>
          </div>

          <div className="panel ai-panel">
            <div className="ai-icon"><Sparkles size={18} /></div>
            <span className="eyebrow">LIFEOS INTELLIGENCE</span>
            <h4>A smarter way to plan your day.</h4>
            <p>Your goals, schedule and progress work together. Get a practical plan instead of another list to manage.</p>
            <button className="primary-button">Plan my day <ArrowUpRight size={16} /></button>
          </div>

          <div className="panel money-panel">
            <div className="panel-head"><h4>Money snapshot</h4><CircleDollarSign size={17} /></div>
            <div className="money-value">Rs. 84,500</div>
            <span className="muted">Available this month</span>
            <div className="money-row"><span>Spent</span><strong>Rs. 32,850</strong></div>
            <div className="money-row"><span>Saved</span><strong>Rs. 18,000</strong></div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
