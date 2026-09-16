import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "renova_v2_final";

const initialData = {
  project: {
    name: "My House Renovation",
    owner: "Home Owner",
    location: "Tamil Nadu",
    budget: 400000,
    startDate: "2026-09-01",
    targetDate: "2026-12-31",
    notes: "House renovation project",
  },

  rooms: [
    { id: 1, name: "Living Room", progress: 65, budget: 90000 },
    { id: 2, name: "Bedroom", progress: 40, budget: 70000 },
    { id: 3, name: "Kitchen", progress: 20, budget: 120000 },
    { id: 4, name: "Bathroom", progress: 10, budget: 60000 },
  ],

  tasks: [
    {
      id: 1,
      title: "Remove old flooring",
      room: "Living Room",
      status: "Completed",
      priority: "High",
      dueDate: "2026-09-20",
    },
    {
      id: 2,
      title: "Brick wall construction",
      room: "Bedroom",
      status: "In Progress",
      priority: "High",
      dueDate: "2026-10-05",
    },
    {
      id: 3,
      title: "Electrical wiring",
      room: "Kitchen",
      status: "Pending",
      priority: "Medium",
      dueDate: "2026-10-15",
    },
    {
      id: 4,
      title: "Wall painting",
      room: "Bathroom",
      status: "Pending",
      priority: "Low",
      dueDate: "2026-11-01",
    },
  ],

  materials: [
    {
      id: 1,
      name: "Cement",
      category: "Construction",
      quantity: 50,
      unit: "bags",
      unitPrice: 370,
      supplier: "ABC Traders",
      minStock: 10,
    },
    {
      id: 2,
      name: "Bricks",
      category: "Construction",
      quantity: 2500,
      unit: "pieces",
      unitPrice: 8,
      supplier: "Sri Agencies",
      minStock: 500,
    },
    {
      id: 3,
      name: "Sand",
      category: "Construction",
      quantity: 3,
      unit: "loads",
      unitPrice: 8500,
      supplier: "ABC Traders",
      minStock: 1,
    },
    {
      id: 4,
      name: "Electrical Wire",
      category: "Electrical",
      quantity: 5,
      unit: "rolls",
      unitPrice: 2400,
      supplier: "Electrical Mart",
      minStock: 2,
    },
  ],

  labour: [
    {
      id: 1,
      name: "Ramesh Team",
      role: "Masonry",
      room: "Living Room",
      days: 8,
      dailyRate: 1200,
      status: "Active",
    },
    {
      id: 2,
      name: "Suresh",
      role: "Electrician",
      room: "Kitchen",
      days: 4,
      dailyRate: 1500,
      status: "Active",
    },
    {
      id: 3,
      name: "Painting Team",
      role: "Painting",
      room: "Bedroom",
      days: 3,
      dailyRate: 1300,
      status: "Completed",
    },
  ],

  expenses: [
    {
      id: 1,
      title: "Cement Purchase",
      category: "Materials",
      room: "Living Room",
      amount: 18500,
      date: "2026-09-05",
      payment: "UPI",
      notes: "",
    },
    {
      id: 2,
      title: "Bricks Purchase",
      category: "Materials",
      room: "Bedroom",
      amount: 12000,
      date: "2026-09-07",
      payment: "Cash",
      notes: "",
    },
    {
      id: 3,
      title: "Mason Labour",
      category: "Labour",
      room: "Living Room",
      amount: 8500,
      date: "2026-09-10",
      payment: "Cash",
      notes: "",
    },
    {
      id: 4,
      title: "Electrical Wiring",
      category: "Electrical",
      room: "Kitchen",
      amount: 6500,
      date: "2026-09-12",
      payment: "UPI",
      notes: "",
    },
  ],
};

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return {
        ...initialData,
        ...JSON.parse(saved),
      };
    }
  } catch {
    // Ignore invalid local storage.
  }

  return initialData;
}

function createId(items) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">◌</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function StatCard({ label, value, detail, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
        {detail && <span>{detail}</span>}
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(loadData);
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  const totals = useMemo(() => {
    const expenseTotal = data.expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const labourTotal = data.labour.reduce(
      (sum, item) => sum + Number(item.days || 0) * Number(item.dailyRate || 0),
      0
    );

    const materialValue = data.materials.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0
    );

    const completedTasks = data.tasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const progress = data.tasks.length
      ? Math.round((completedTasks / data.tasks.length) * 100)
      : 0;

    const spentPercentage = data.project.budget
      ? Math.round((expenseTotal / data.project.budget) * 100)
      : 0;

    return {
      expenseTotal,
      labourTotal,
      materialValue,
      completedTasks,
      progress,
      spentPercentage,
      remaining: Number(data.project.budget) - expenseTotal,
    };
  }, [data]);

  const updateData = (key, value) => {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const showNotice = (message) => {
    setNotice(message);
  };

  const openAdd = (type) => {
    setEditingItem(null);
    setModal(type);
  };

  const openEdit = (type, item) => {
    setEditingItem(item);
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setEditingItem(null);
  };

  const deleteItem = (key, id) => {
    if (!window.confirm("Delete this record?")) return;

    updateData(
      key,
      data[key].filter((item) => item.id !== id)
    );

    showNotice("Record deleted");
  };

  const saveRecord = (key, record) => {
    if (editingItem) {
      updateData(
        key,
        data[key].map((item) =>
          item.id === editingItem.id ? { ...record, id: item.id } : item
        )
      );
      showNotice("Record updated");
    } else {
      updateData(key, [
        ...data[key],
        {
          ...record,
          id: createId(data[key]),
        },
      ]);
      showNotice("Record added");
    }

    closeModal();
  };

  const resetProject = () => {
    if (
      !window.confirm(
        "Reset RENOVA to the demo project? Your current local data will be removed."
      )
    ) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setData(initialData);
    showNotice("Project reset");
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `renova-backup-${today()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    showNotice("Backup downloaded");
  };

  const importBackup = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        if (
          !imported.project ||
          !Array.isArray(imported.expenses) ||
          !Array.isArray(imported.materials)
        ) {
          throw new Error("Invalid backup");
        }

        setData({
          ...initialData,
          ...imported,
        });

        showNotice("Backup restored successfully");
      } catch {
        window.alert("This is not a valid RENOVA backup file.");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const navigation = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Project", icon: "▣" },
    { name: "Rooms", icon: "⌂" },
    { name: "Tasks", icon: "✓" },
    { name: "Materials", icon: "▤" },
    { name: "Labour", icon: "♙" },
    { name: "Expenses", icon: "₹" },
    { name: "Reports", icon: "▥" },
    { name: "Settings", icon: "⚙" },
  ];

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    setSearch("");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">R</div>
          <div>
            <strong>RENOVA</strong>
            <span>Renovation Manager</span>
          </div>
        </div>

        <nav className="navigation">
          <div className="nav-label">WORKSPACE</div>

          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => navigate(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-project">
            <span>Current Project</span>
            <strong>{data.project.name}</strong>
            <small>{data.project.location}</small>
          </div>

          <div className="app-version">RENOVA V2 FINAL</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen((value) => !value)}
          >
            ☰
          </button>

          <div className="page-heading">
            <span>RENOVA</span>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
              />
            </div>

            <button
              className="notification-button"
              onClick={() => navigate("Settings")}
              title="Settings"
            >
              ⚙
            </button>

            <div className="avatar">G</div>
          </div>
        </header>

        <div className="content">
          {notice && <div className="toast">{notice}</div>}

          {activePage === "Dashboard" && (
            <Dashboard
              data={data}
              totals={totals}
              navigate={navigate}
              openAdd={openAdd}
            />
          )}

          {activePage === "Project" && (
            <ProjectPage
              project={data.project}
              setProject={(project) => {
                updateData("project", project);
                showNotice("Project details saved");
              }}
            />
          )}

          {activePage === "Rooms" && (
            <RoomsPage
              rooms={data.rooms}
              search={search}
              openAdd={() => openAdd("room")}
              openEdit={(item) => openEdit("room", item)}
              deleteItem={(id) => deleteItem("rooms", id)}
              onSave={(record) => saveRecord("rooms", record)}
            />
          )}

          {activePage === "Tasks" && (
            <TasksPage
              tasks={data.tasks}
              rooms={data.rooms}
              search={search}
              openAdd={() => openAdd("task")}
              openEdit={(item) => openEdit("task", item)}
              deleteItem={(id) => deleteItem("tasks", id)}
              onSave={(record) => saveRecord("tasks", record)}
              setTasks={(tasks) => updateData("tasks", tasks)}
            />
          )}

          {activePage === "Materials" && (
            <MaterialsPage
              materials={data.materials}
              search={search}
              openAdd={() => openAdd("material")}
              openEdit={(item) => openEdit("material", item)}
              deleteItem={(id) => deleteItem("materials", id)}
              onSave={(record) => saveRecord("materials", record)}
            />
          )}

          {activePage === "Labour" && (
            <LabourPage
              labour={data.labour}
              search={search}
              openAdd={() => openAdd("labour")}
              openEdit={(item) => openEdit("labour", item)}
              deleteItem={(id) => deleteItem("labour", id)}
              onSave={(record) => saveRecord("labour", record)}
            />
          )}

          {activePage === "Expenses" && (
            <ExpensesPage
              expenses={data.expenses}
              search={search}
              openAdd={() => openAdd("expense")}
              openEdit={(item) => openEdit("expense", item)}
              deleteItem={(id) => deleteItem("expenses", id)}
              onSave={(record) => saveRecord("expenses", record)}
              total={totals.expenseTotal}
            />
          )}

          {activePage === "Reports" && (
            <ReportsPage data={data} totals={totals} />
          )}

          {activePage === "Settings" && (
            <SettingsPage
              data={data}
              exportBackup={exportBackup}
              importBackup={importBackup}
              resetProject={resetProject}
            />
          )}
        </div>
      </main>

      {modal === "room" && (
        <RoomForm
          item={editingItem}
          onClose={closeModal}
          onSave={(record) => saveRecord("rooms", record)}
        />
      )}

      {modal === "task" && (
        <TaskForm
          item={editingItem}
          rooms={data.rooms}
          onClose={closeModal}
          onSave={(record) => saveRecord("tasks", record)}
        />
      )}

      {modal === "material" && (
        <MaterialForm
          item={editingItem}
          onClose={closeModal}
          onSave={(record) => saveRecord("materials", record)}
        />
      )}

      {modal === "labour" && (
        <LabourForm
          item={editingItem}
          rooms={data.rooms}
          onClose={closeModal}
          onSave={(record) => saveRecord("labour", record)}
        />
      )}

      {modal === "expense" && (
        <ExpenseForm
          item={editingItem}
          rooms={data.rooms}
          onClose={closeModal}
          onSave={(record) => saveRecord("expenses", record)}
        />
      )}
    </div>
  );
}

function Dashboard({ data, totals, navigate, openAdd }) {
  const recentExpenses = [...data.expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const pendingTasks = data.tasks.filter(
    (task) => task.status !== "Completed"
  ).slice(0, 5);

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">PROJECT OVERVIEW</span>
          <h2>{data.project.name}</h2>
          <p>
            Track your renovation, budget, materials, labour and progress from
            one place.
          </p>
        </div>

        <button className="primary-button" onClick={() => openAdd("expense")}>
          + Add Expense
        </button>
      </section>

      <div className="stat-grid">
        <StatCard
          label="Total Budget"
          value={money(data.project.budget)}
          detail="Project budget"
          icon="₹"
        />
        <StatCard
          label="Spent"
          value={money(totals.expenseTotal)}
          detail={`${totals.spentPercentage}% of budget`}
          icon="↗"
        />
        <StatCard
          label="Remaining"
          value={money(totals.remaining)}
          detail={totals.remaining >= 0 ? "Available budget" : "Over budget"}
          icon="◈"
        />
        <StatCard
          label="Progress"
          value={`${totals.progress}%`}
          detail={`${totals.completedTasks}/${data.tasks.length} tasks complete`}
          icon="✓"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel progress-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">PROJECT PROGRESS</span>
              <h3>Renovation Progress</h3>
            </div>
            <strong className="big-number">{totals.progress}%</strong>
          </div>

          <div className="large-progress">
            <div style={{ width: `${totals.progress}%` }} />
          </div>

          <div className="progress-meta">
            <span>Overall completion</span>
            <strong>{totals.completedTasks} completed tasks</strong>
          </div>

          <div className="room-progress-list">
            {data.rooms.map((room) => (
              <div className="room-progress" key={room.id}>
                <div>
                  <span>{room.name}</span>
                  <strong>{room.progress}%</strong>
                </div>
                <div className="mini-progress">
                  <div style={{ width: `${room.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel budget-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">BUDGET</span>
              <h3>Budget Health</h3>
            </div>
          </div>

          <div className="budget-circle">
            <div>
              <strong>{totals.spentPercentage}%</strong>
              <span>spent</span>
            </div>
          </div>

          <div className="budget-lines">
            <div>
              <span>Budget</span>
              <strong>{money(data.project.budget)}</strong>
            </div>
            <div>
              <span>Spent</span>
              <strong>{money(totals.expenseTotal)}</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{money(totals.remaining)}</strong>
            </div>
          </div>

          <button
            className="secondary-button full-button"
            onClick={() => navigate("Reports")}
          >
            View Financial Report
          </button>
        </section>
      </div>

      <div className="dashboard-grid lower-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">RECENT ACTIVITY</span>
              <h3>Recent Expenses</h3>
            </div>
            <button className="text-button" onClick={() => navigate("Expenses")}>
              View all →
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <EmptyState title="No expenses" text="Add your first expense." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th className="right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <strong>{expense.title}</strong>
                        <small>{expense.room}</small>
                      </td>
                      <td>
                        <span className="badge">{expense.category}</span>
                      </td>
                      <td>{expense.date}</td>
                      <td className="right amount">
                        {money(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">TASKS</span>
              <h3>Upcoming Tasks</h3>
            </div>
            <button className="text-button" onClick={() => navigate("Tasks")}>
              View all →
            </button>
          </div>

          <div className="task-list">
            {pendingTasks.map((task) => (
              <div className="task-row" key={task.id}>
                <div className={`task-dot ${task.status.toLowerCase().replace(" ", "-")}`} />
                <div>
                  <strong>{task.title}</strong>
                  <small>
                    {task.room} · Due {task.dueDate}
                  </small>
                </div>
                <span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>
                  {task.status}
                </span>
              </div>
            ))}

            {!pendingTasks.length && (
              <EmptyState title="All tasks completed" text="Great work!" />
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function ProjectPage({ project, setProject }) {
  const [form, setForm] = useState(project);

  useEffect(() => {
    setForm(project);
  }, [project]);

  const change = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">PROJECT MANAGEMENT</span>
          <h2>Project Details</h2>
          <p>Configure the basic information for your renovation project.</p>
        </div>
      </section>

      <section className="panel form-panel">
        <div className="form-grid">
          <Field
            label="Project Name"
            value={form.name}
            onChange={(value) => change("name", value)}
          />
          <Field
            label="Owner"
            value={form.owner}
            onChange={(value) => change("owner", value)}
          />
          <Field
            label="Location"
            value={form.location}
            onChange={(value) => change("location", value)}
          />
          <Field
            label="Budget"
            type="number"
            value={form.budget}
            onChange={(value) => change("budget", Number(value))}
          />
          <Field
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(value) => change("startDate", value)}
          />
          <Field
            label="Target Date"
            type="date"
            value={form.targetDate}
            onChange={(value) => change("targetDate", value)}
          />
          <div className="field full">
            <label>Project Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => change("notes", e.target.value)}
              rows="5"
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="primary-button" onClick={() => setProject(form)}>
            Save Project
          </button>
        </div>
      </section>
    </div>
  );
}

function RoomsPage({
  rooms,
  search,
  openAdd,
  openEdit,
  deleteItem,
  onSave,
}) {
  const filtered = rooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="SPACE MANAGEMENT"
        title="Rooms"
        text="Track progress and budget for every room."
        button="+ Add Room"
        onClick={openAdd}
      />

      <div className="card-grid room-grid">
        {filtered.map((room) => (
          <div className="room-card" key={room.id}>
            <div className="room-card-top">
              <div className="room-symbol">⌂</div>
              <div className="row-actions">
                <button onClick={() => openEdit(room)}>Edit</button>
                <button onClick={() => deleteItem(room.id)}>Delete</button>
              </div>
            </div>

            <h3>{room.name}</h3>

            <div className="room-stat">
              <span>Progress</span>
              <strong>{room.progress}%</strong>
            </div>

            <div className="progress-track">
              <div style={{ width: `${room.progress}%` }} />
            </div>

            <div className="room-budget">
              <span>Room Budget</span>
              <strong>{money(room.budget)}</strong>
            </div>
          </div>
        ))}

        {!filtered.length && (
          <EmptyState title="No rooms found" text="Add a room to your project." />
        )}
      </div>
    </div>
  );
}

function TasksPage({
  tasks,
  rooms,
  search,
  openAdd,
  openEdit,
  deleteItem,
  setTasks,
}) {
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.room.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const changeStatus = (id, status) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, status } : task))
    );
  };

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="WORK MANAGEMENT"
        title="Tasks"
        text="Manage renovation activities and progress."
        button="+ Add Task"
        onClick={openAdd}
      />

      <div className="toolbar">
        <div className="filter-group">
          {["All", "Pending", "In Progress", "Completed"].map((status) => (
            <button
              key={status}
              className={statusFilter === status ? "selected" : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Room</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                  </td>
                  <td>{task.room}</td>
                  <td>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>{task.dueDate}</td>
                  <td>
                    <select
                      className="inline-select"
                      value={task.status}
                      onChange={(e) =>
                        changeStatus(task.id, e.target.value)
                      }
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => openEdit(task)}>Edit</button>
                      <button onClick={() => deleteItem(task.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <EmptyState title="No tasks found" text="Try another filter." />
        )}
      </section>
    </div>
  );
}

function MaterialsPage({
  materials,
  search,
  openAdd,
  openEdit,
  deleteItem,
}) {
  const filtered = materials.filter((material) =>
    `${material.name} ${material.category} ${material.supplier}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalValue = materials.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="INVENTORY MANAGEMENT"
        title="Materials"
        text="Track construction materials, quantities and stock value."
        button="+ Add Material"
        onClick={openAdd}
      />

      <div className="summary-strip">
        <div>
          <span>Material Types</span>
          <strong>{materials.length}</strong>
        </div>
        <div>
          <span>Total Stock Value</span>
          <strong>{money(totalValue)}</strong>
        </div>
        <div>
          <span>Low Stock Items</span>
          <strong>
            {materials.filter((item) => item.quantity <= item.minStock).length}
          </strong>
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Stock Value</th>
                <th>Supplier</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const low = item.quantity <= item.minStock;

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>{money(item.unitPrice)}</td>
                    <td className="amount">
                      {money(item.quantity * item.unitPrice)}
                    </td>
                    <td>{item.supplier}</td>
                    <td>
                      <span className={`stock ${low ? "low" : "good"}`}>
                        {low ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => openEdit(item)}>Edit</button>
                        <button onClick={() => deleteItem(item.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <EmptyState title="No materials found" text="Add your materials." />
        )}
      </section>
    </div>
  );
}

function LabourPage({
  labour,
  search,
  openAdd,
  openEdit,
  deleteItem,
}) {
  const filtered = labour.filter((item) =>
    `${item.name} ${item.role} ${item.room}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const total = labour.reduce(
    (sum, item) => sum + item.days * item.dailyRate,
    0
  );

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="WORKFORCE MANAGEMENT"
        title="Labour"
        text="Track workers, days, rates and labour costs."
        button="+ Add Labour"
        onClick={openAdd}
      />

      <div className="summary-strip">
        <div>
          <span>Workers / Teams</span>
          <strong>{labour.length}</strong>
        </div>
        <div>
          <span>Total Labour Cost</span>
          <strong>{money(total)}</strong>
        </div>
        <div>
          <span>Total Days</span>
          <strong>{labour.reduce((sum, item) => sum + item.days, 0)}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Room</th>
                <th>Days</th>
                <th>Daily Rate</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.role}</td>
                  <td>{item.room}</td>
                  <td>{item.days}</td>
                  <td>{money(item.dailyRate)}</td>
                  <td className="amount">
                    {money(item.days * item.dailyRate)}
                  </td>
                  <td>
                    <span
                      className={`status ${
                        item.status === "Active" ? "in-progress" : "completed"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => openEdit(item)}>Edit</button>
                      <button onClick={() => deleteItem(item.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <EmptyState title="No labour records" text="Add your workers." />
        )}
      </section>
    </div>
  );
}

function ExpensesPage({
  expenses,
  search,
  openAdd,
  openEdit,
  deleteItem,
  total,
}) {
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(expenses.map((item) => item.category))];

  const filtered = expenses.filter((item) => {
    const textMatch =
      `${item.title} ${item.room} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const categoryMatch = category === "All" || item.category === category;

    return textMatch && categoryMatch;
  });

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="FINANCIAL MANAGEMENT"
        title="Expenses"
        text="Track every renovation expense and payment."
        button="+ Add Expense"
        onClick={openAdd}
      />

      <div className="summary-strip">
        <div>
          <span>Total Expenses</span>
          <strong>{expenses.length}</strong>
        </div>
        <div>
          <span>Total Spent</span>
          <strong>{money(total)}</strong>
        </div>
        <div>
          <span>Average Expense</span>
          <strong>
            {money(expenses.length ? total / expenses.length : 0)}
          </strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-group">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "selected" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Room</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <strong>{expense.title}</strong>
                    {expense.notes && <small>{expense.notes}</small>}
                  </td>
                  <td>
                    <span className="badge">{expense.category}</span>
                  </td>
                  <td>{expense.room}</td>
                  <td>{expense.date}</td>
                  <td>{expense.payment}</td>
                  <td className="amount">{money(expense.amount)}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => openEdit(expense)}>Edit</button>
                      <button onClick={() => deleteItem(expense.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <EmptyState title="No expenses found" text="Add your first expense." />
        )}
      </section>
    </div>
  );
}

function ReportsPage({ data, totals }) {
  const categories = {};

  data.expenses.forEach((expense) => {
    categories[expense.category] =
      (categories[expense.category] || 0) + Number(expense.amount || 0);
  });

  const rooms = {};

  data.expenses.forEach((expense) => {
    rooms[expense.room] = (rooms[expense.room] || 0) + Number(expense.amount || 0);
  });

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="REPORTING"
        title="Reports"
        text="Review the financial and operational status of your renovation."
      />

      <div className="report-grid">
        <section className="panel report-main">
          <div className="panel-header">
            <div>
              <span className="eyebrow">FINANCIAL SUMMARY</span>
              <h3>Budget vs Actual</h3>
            </div>
          </div>

          <div className="report-budget">
            <div className="report-bar">
              <span>Budget</span>
              <strong>{money(data.project.budget)}</strong>
              <div>
                <i
                  style={{
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <div className="report-bar">
              <span>Actual Spending</span>
              <strong>{money(totals.expenseTotal)}</strong>
              <div>
                <i
                  style={{
                    width: `${Math.min(
                      totals.spentPercentage,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="report-total">
            <span>Remaining Budget</span>
            <strong>{money(totals.remaining)}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">PROJECT</span>
              <h3>Overview</h3>
            </div>
          </div>

          <div className="report-list">
            <div>
              <span>Tasks</span>
              <strong>{data.tasks.length}</strong>
            </div>
            <div>
              <span>Completed</span>
              <strong>{totals.completedTasks}</strong>
            </div>
            <div>
              <span>Rooms</span>
              <strong>{data.rooms.length}</strong>
            </div>
            <div>
              <span>Materials</span>
              <strong>{data.materials.length}</strong>
            </div>
            <div>
              <span>Labour Records</span>
              <strong>{data.labour.length}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="report-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">EXPENSE ANALYSIS</span>
              <h3>By Category</h3>
            </div>
          </div>

          <div className="report-list">
            {Object.entries(categories).map(([name, value]) => {
              const percentage = totals.expenseTotal
                ? Math.round((value / totals.expenseTotal) * 100)
                : 0;

              return (
                <div className="analysis-row" key={name}>
                  <div>
                    <span>{name}</span>
                    <small>{percentage}%</small>
                  </div>
                  <strong>{money(value)}</strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">ROOM ANALYSIS</span>
              <h3>Spending by Room</h3>
            </div>
          </div>

          <div className="report-list">
            {Object.entries(rooms).map(([name, value]) => (
              <div className="analysis-row" key={name}>
                <span>{name}</span>
                <strong>{money(value)}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsPage({
  data,
  exportBackup,
  importBackup,
  resetProject,
}) {
  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="APPLICATION"
        title="Settings"
        text="Manage your RENOVA project data."
      />

      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="settings-icon">💾</div>
          <h3>Backup Project</h3>
          <p>
            Download all your current project data as a JSON backup file.
          </p>
          <button className="primary-button" onClick={exportBackup}>
            Download Backup
          </button>
        </section>

        <section className="panel settings-card">
          <div className="settings-icon">↥</div>
          <h3>Restore Project</h3>
          <p>Restore a previously downloaded RENOVA backup.</p>

          <label className="upload-button">
            Choose Backup File
            <input
              type="file"
              accept=".json,application/json"
              onChange={importBackup}
            />
          </label>
        </section>

        <section className="panel settings-card danger-card">
          <div className="settings-icon">!</div>
          <h3>Reset Project</h3>
          <p>
            Reset the application back to the original demo data. This does
            not affect your GitHub project.
          </p>
          <button className="danger-button" onClick={resetProject}>
            Reset Local Data
          </button>
        </section>

        <section className="panel settings-card">
          <div className="settings-icon">R</div>
          <h3>RENOVA Information</h3>
          <p>Current project: {data.project.name}</p>
          <p>Version: V2 FINAL</p>
          <p>Storage: Browser Local Storage</p>
        </section>
      </div>
    </div>
  );
}

function PageTitle({ eyebrow, title, text, button, onClick }) {
  return (
    <section className="page-intro">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>

      {button && (
        <button className="primary-button" onClick={onClick}>
          {button}
        </button>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function FormButtons({ onClose }) {
  return (
    <div className="form-actions">
      <button type="button" className="secondary-button" onClick={onClose}>
        Cancel
      </button>
      <button type="submit" className="primary-button">
        Save
      </button>
    </div>
  );
}

function RoomForm({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item || {
      name: "",
      progress: 0,
      budget: 0,
    }
  );

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <Modal title={item ? "Edit Room" : "Add Room"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...form,
            progress: Number(form.progress),
            budget: Number(form.budget),
          });
        }}
      >
        <div className="form-grid">
          <Field
            label="Room Name"
            value={form.name}
            onChange={(value) => update("name", value)}
          />
          <Field
            label="Budget"
            type="number"
            value={form.budget}
            onChange={(value) => update("budget", value)}
          />
          <Field
            label="Progress %"
            type="number"
            value={form.progress}
            onChange={(value) => update("progress", value)}
          />
        </div>

        <FormButtons onClose={onClose} />
      </form>
    </Modal>
  );
}

function TaskForm({ item, rooms, onClose, onSave }) {
  const [form, setForm] = useState(
    item || {
      title: "",
      room: rooms[0]?.name || "",
      status: "Pending",
      priority: "Medium",
      dueDate: today(),
    }
  );

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <Modal title={item ? "Edit Task" : "Add Task"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <div className="form-grid">
          <div className="field full">
            <label>Task Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <SelectField
            label="Room"
            value={form.room}
            onChange={(value) => update("room", value)}
            options={rooms.length ? rooms.map((room) => room.name) : ["General"]}
          />

          <SelectField
            label="Priority"
            value={form.priority}
            onChange={(value) => update("priority", value)}
            options={["Low", "Medium", "High"]}
          />

          <SelectField
            label="Status"
            value={form.status}
            onChange={(value) => update("status", value)}
            options={["Pending", "In Progress", "Completed"]}
          />

          <Field
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={(value) => update("dueDate", value)}
          />
        </div>

        <FormButtons onClose={onClose} />
      </form>
    </Modal>
  );
}

function MaterialForm({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item || {
      name: "",
      category: "Construction",
      quantity: 0,
      unit: "bags",
      unitPrice: 0,
      supplier: "",
      minStock: 0,
    }
  );

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <Modal title={item ? "Edit Material" : "Add Material"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          onSave({
            ...form,
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
            minStock: Number(form.minStock),
          });
        }}
      >
        <div className="form-grid">
          <Field
            label="Material Name"
            value={form.name}
            onChange={(value) => update("name", value)}
          />

          <SelectField
            label="Category"
            value={form.category}
            onChange={(value) => update("category", value)}
            options={[
              "Construction",
              "Electrical",
              "Plumbing",
              "Painting",
              "Flooring",
              "Other",
            ]}
          />

          <Field
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={(value) => update("quantity", value)}
          />

          <Field
            label="Unit"
            value={form.unit}
            onChange={(value) => update("unit", value)}
          />

          <Field
            label="Unit Price"
            type="number"
            value={form.unitPrice}
            onChange={(value) => update("unitPrice", value)}
          />

          <Field
            label="Minimum Stock"
            type="number"
            value={form.minStock}
            onChange={(value) => update("minStock", value)}
          />

          <Field
            label="Supplier"
            value={form.supplier}
            onChange={(value) => update("supplier", value)}
          />
        </div>

        <FormButtons onClose={onClose} />
      </form>
    </Modal>
  );
}

function LabourForm({ item, rooms, onClose, onSave }) {
  const [form, setForm] = useState(
    item || {
      name: "",
      role: "Masonry",
      room: rooms[0]?.name || "General",
      days: 1,
      dailyRate: 1000,
      status: "Active",
    }
  );

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <Modal title={item ? "Edit Labour" : "Add Labour"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          onSave({
            ...form,
            days: Number(form.days),
            dailyRate: Number(form.dailyRate),
          });
        }}
      >
        <div className="form-grid">
          <Field
            label="Worker / Team"
            value={form.name}
            onChange={(value) => update("name", value)}
          />

          <Field
            label="Role"
            value={form.role}
            onChange={(value) => update("role", value)}
          />

          <SelectField
            label="Room"
            value={form.room}
            onChange={(value) => update("room", value)}
            options={
              rooms.length ? rooms.map((room) => room.name) : ["General"]
            }
          />

          <Field
            label="Days"
            type="number"
            value={form.days}
            onChange={(value) => update("days", value)}
          />

          <Field
            label="Daily Rate"
            type="number"
            value={form.dailyRate}
            onChange={(value) => update("dailyRate", value)}
          />

          <SelectField
            label="Status"
            value={form.status}
            onChange={(value) => update("status", value)}
            options={["Active", "Completed"]}
          />
        </div>

        <FormButtons onClose={onClose} />
      </form>
    </Modal>
  );
}

function ExpenseForm({ item, rooms, onClose, onSave }) {
  const [form, setForm] = useState(
    item || {
      title: "",
      category: "Materials",
      room: rooms[0]?.name || "General",
      amount: 0,
      date: today(),
      payment: "UPI",
      notes: "",
    }
  );

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <Modal title={item ? "Edit Expense" : "Add Expense"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          onSave({
            ...form,
            amount: Number(form.amount),
          });
        }}
      >
        <div className="form-grid">
          <div className="field full">
            <label>Description</label>
            <input
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Cement purchase"
            />
          </div>

          <SelectField
            label="Category"
            value={form.category}
            onChange={(value) => update("category", value)}
            options={[
              "Materials",
              "Labour",
              "Electrical",
              "Plumbing",
              "Painting",
              "Flooring",
              "Transport",
              "Other",
            ]}
          />

          <SelectField
            label="Room"
            value={form.room}
            onChange={(value) => update("room", value)}
            options={
              rooms.length ? rooms.map((room) => room.name) : ["General"]
            }
          />

          <Field
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(value) => update("amount", value)}
          />

          <Field
            label="Date"
            type="date"
            value={form.date}
            onChange={(value) => update("date", value)}
          />

          <SelectField
            label="Payment Method"
            value={form.payment}
            onChange={(value) => update("payment", value)}
            options={["Cash", "UPI", "Bank Transfer", "Card", "Other"]}
          />

          <div className="field full">
            <label>Notes</label>
            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>

        <FormButtons onClose={onClose} />
      </form>
    </Modal>
  );
}

export default App;