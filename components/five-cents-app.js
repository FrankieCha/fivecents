"use client";

import { useMemo, useState } from "react";
import {
  Bell, BookOpen, ChevronRight, CircleDollarSign, FileText, FolderKanban,
  LayoutDashboard, Lock, Plus, Settings, ShieldCheck, Users, X
} from "lucide-react";

const initialEntries = [
  {
    id: 1,
    title: "Agentic AI Workflow Automation with n8n",
    category: "CET",
    goal: "Future-Proof Learners",
    cents: 300,
    status: "Completed",
    participants: ["FC", "PK"],
    people: "Frankie Cha and Peter Kenny",
    shared: true,
  },
  {
    id: 2,
    title: "Workflow Automation for Manpower Management",
    category: "Projects",
    goal: "Focus TIE Efforts",
    cents: 250,
    status: "Ongoing",
    participants: ["FC", "AY", "GL"],
    people: "3 contributors",
    shared: true,
  },
  {
    id: 3,
    title: "DAAA Year Lead and Competition Coaching",
    category: "Student Matters",
    goal: "Social Mobility",
    cents: 180,
    status: "Completed",
    participants: ["FC"],
    people: "Personal contribution",
    shared: false,
  },
  {
    id: 4,
    title: "Social Constructivist CET Teaching",
    category: "T&L / Pedagogy",
    goal: "Future-Proof Learners",
    cents: 90,
    status: "Completed",
    participants: ["FC", "SW"],
    people: "2 contributors",
    shared: true,
  },
];

const categories = ["PET", "CET", "Teaching & Learning / Pedagogy", "Projects", "Consultation", "SOI Activities", "edTech Initiatives", "Student Matters", "Alumni Matters", "Diploma Activities", "Awards", "Training & Certification", "Others"];
const goals = ["Future-Proof Learners", "Focus TIE Efforts", "Strengthen Support for Social Mobility", "Digitalise RP", "Transform RP's Capabilities"];

export default function FiveCentsApp() {
  const [view, setView] = useState("Dashboard");
  const [entries, setEntries] = useState(initialEntries);
  const [showCreate, setShowCreate] = useState(false);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState("");

  const total = useMemo(() => entries.reduce((sum, entry) => sum + entry.cents, 0), [entries]);
  const shared = entries.filter((entry) => entry.shared).length;

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function createEntry(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setEntries((current) => [{
      id: Date.now(),
      title: data.get("title"),
      category: data.get("category"),
      goal: data.get("goal"),
      cents: Number(data.get("cents")),
      status: "Ongoing",
      participants: ["FC"],
      people: "Personal contribution",
      shared: false,
    }, ...current]);
    setShowCreate(false);
    notify("Contribution added to your AY2026 journal");
  }

  const nav = [
    ["Dashboard", LayoutDashboard],
    ["My journal", BookOpen],
    ["Reportees", Users],
    ["Reports", FileText],
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">5¢</div>
          <div><strong>FiveCents</strong><span>Contribution journal</span></div>
        </div>
        <nav className="nav" aria-label="Main navigation">
          {nav.map(([label, Icon]) => (
            <button key={label} className={view === label ? "active" : ""} onClick={() => setView(label)}>
              <Icon /> {label}
            </button>
          ))}
          <button onClick={() => setView("Administration")}><Settings /> Administration</button>
        </nav>
        <div className="sidebar-footer">
          <p>Frankie Cha</p>
          <span>Senior Lecturer · DAAA</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>{view}</h1>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications" onClick={() => notify("1 contribution invitation awaiting acknowledgement")}>
              <Bell size={18}/><span className="dot" />
            </button>
            <span className="avatar" style={{ width: 38, height: 38, margin: 0 }}>FC</span>
          </div>
        </header>

        <div className="content">
          {view === "Dashboard" || view === "My journal" ? (
            <>
              <section className="hero">
                <div>
                  <div className="eyebrow">AY2026 · Current academic year</div>
                  <h2>{view === "Dashboard" ? "Your contribution story" : "My contribution journal"}</h2>
                  <p>Capture the work that made a difference, while it is still fresh.</p>
                </div>
                <div style={{ display: "flex", gap: 9 }}>
                  <button className="button" onClick={() => { setLocked(!locked); notify(!locked ? "Journal locked" : "Journal unlocked"); }}>
                    <Lock /> {locked ? "Unlock journal" : "Lock journal"}
                  </button>
                  <button className="button primary" disabled={locked} onClick={() => setShowCreate(true)}><Plus /> Add contribution</button>
                </div>
              </section>

              {locked && <div style={{ marginBottom: 18, padding: 13, borderRadius: 11, background: "#fff0e8", color: "#8b330b", borderLeft: "4px solid #dd5411", fontSize: 13 }}><Lock size={15} style={{ display: "inline", marginRight: 8 }}/>This AY2026 journal is locked. Contributions and cents cannot be changed.</div>}

              <section className="stats" aria-label="Journal summary">
                <Stat title="Total cents" value={`${total}¢`} note="Across all contributions" icon={CircleDollarSign} gold />
                <Stat title="Contributions" value={entries.length} note={`${entries.filter(e => e.status === "Completed").length} completed`} icon={BookOpen} />
                <Stat title="Shared entries" value={shared} note="With your colleagues" icon={Users} />
                <Stat title="Evidence items" value="7" note="Files and links" icon={FolderKanban} gold />
              </section>

              <section className="grid-main">
                <div className="panel">
                  <div className="panel-header">
                    <div><h3>{view === "My journal" ? "All contributions" : "Recent contributions"}</h3><p>Lecturer cents shown before any RO adjustment</p></div>
                    <button className="text-link" onClick={() => setView("My journal")}>View journal <ChevronRight size={12} style={{display:"inline"}}/></button>
                  </div>
                  <div className="entry-list">
                    {entries.map((entry) => <Entry key={entry.id} entry={entry} />)}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
                  <div className="panel">
                    <div className="panel-header"><div><h3>Cents by category</h3><p>Your AY2026 contribution mix</p></div></div>
                    <div className="progress-wrap">
                      <Progress label="CET" value={300} total={total} />
                      <Progress label="Projects" value={250} total={total} gold />
                      <Progress label="Student Matters" value={180} total={total} />
                      <Progress label="T&L / Pedagogy" value={90} total={total} gold />
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-header"><div><h3>Needs your attention</h3><p>Updates from shared contributions</p></div></div>
                    <div className="notice-list">
                      <Notice icon={Users} text="Mary invited you to a shared contribution" time="Today" />
                      <Notice icon={ShieldCheck} text="Your Reporting Officer adjusted a contribution to 275¢" time="2 days ago" />
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <Placeholder view={view} />
          )}
        </div>
      </main>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onSubmit={createEntry} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Stat({ title, value, note, icon: Icon, gold }) {
  return <div className="stat"><div className="stat-top"><span>{title}</span><span className={`stat-icon ${gold ? "gold" : ""}`}><Icon size={17}/></span></div><strong>{value}</strong><small>{note}</small></div>;
}

function Entry({ entry }) {
  return <article className="entry">
    <div>
      <h4>{entry.title}</h4>
      <div className="entry-meta"><span className="badge">{entry.category}</span><span className="badge gold">{entry.status}</span><span>{entry.goal}</span></div>
      <div className="avatar-stack">{entry.participants.map((person) => <span className="avatar" key={person}>{person}</span>)}<span className="avatar-note">{entry.people}</span></div>
    </div>
    <div className="cents"><strong>{entry.cents}¢</strong><span>Your value</span></div>
  </article>;
}

function Progress({ label, value, total, gold }) {
  const width = Math.max(5, Math.round(value / total * 100));
  return <div className="progress-row"><div className="progress-label"><span>{label}</span><span>{value}¢</span></div><div className="track"><div className={`fill ${gold ? "gold" : ""}`} style={{width:`${width}%`}} /></div></div>;
}

function Notice({ icon: Icon, text, time }) {
  return <div className="notice"><span className="notice-icon"><Icon size={15}/></span><div><p>{text}</p><time>{time}</time></div></div>;
}

function Placeholder({ view }) {
  const copy = {
    Reportees: ["Reportee journals", "Review contributions and adjust cents for staff below you in the reporting hierarchy."],
    Reports: ["Academic Year reports", "Reports will be designed in the next requirements phase."],
    Administration: ["Administration", "Manage staff accounts, groups, reporting lines, Academic Years, and cents limits."],
  }[view] || [view, "This section is ready for the next implementation phase."];
  return <div className="panel empty"><ShieldCheck size={36} style={{margin:"0 auto 14px", color:"#74b01f"}}/><h2>{copy[0]}</h2><p>{copy[1]}</p></div>;
}

function CreateModal({ onClose, onSubmit }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <form className="modal" onSubmit={onSubmit}>
      <div className="modal-head"><div><div className="eyebrow">AY2026</div><h3>Add a contribution</h3></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={17}/></button></div>
      <div className="modal-body">
        <div className="field"><label htmlFor="title">Contribution title</label><input id="title" name="title" required placeholder="What did you contribute?" /></div>
        <div className="field-row">
          <div className="field"><label htmlFor="category">Category</label><select id="category" name="category">{categories.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label htmlFor="goal">Transformation goal</label><select id="goal" name="goal">{goals.map(g => <option key={g}>{g}</option>)}</select></div>
        </div>
        <div className="field"><label htmlFor="description">Description</label><textarea id="description" name="description" required placeholder="Describe the initiative, improvements, or problem solved." /></div>
        <div className="field"><label htmlFor="outcomes">Outcomes and impact</label><textarea id="outcomes" name="outcomes" placeholder="Include measurable outcomes such as ratings, participants, time saved, or student achievements." /></div>
        <div className="field"><label htmlFor="cents">Your cents</label><input id="cents" name="cents" type="number" min="5" max="1000" defaultValue="50" required /><span className="helper">AY2026 permits whole values from 5¢ to 1,000¢.</span></div>
      </div>
      <div className="modal-foot"><button type="button" className="button" onClick={onClose}>Cancel</button><button className="button primary" type="submit"><Plus/>Add contribution</button></div>
    </form>
  </div>;
}
