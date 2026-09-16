import { useMemo, useState } from "react";
import "./App.css";

const initialExpenses = [
  {
    id: 1,
    title: "Cement",
    category: "Materials",
    room: "General",
    amount: 18500,
    date: "2026-09-10",
    note: "50 bags",
  },
  {
    id: 2,
    title: "Bricks",
    category: "Materials",
    room: "Living Room",
    amount: 12000,
    date: "2026-09-11",
    note: "2000 bricks",
  },
  {
    id: 3,
    title: "Mason Labour",
    category: "Labour",
    room: "Living Room",
    amount: 8500,
    date: "2026-09-12",
    note: "5 days",
  },
  {
    id: 4,
    title: "Electrical Wiring",
    category: "Electrical",
    room: "Bedroom",
    amount: 6500,
    date: "2026-09-13",
    note: "Wiring materials",
  },
];

const initialMaterials = [
  {
    id: 1,
    name: "Cement",
    category: "Construction",
    quantity: 50,
    unit: "bags",
    rate: 370,
    status: "Purchased",
  },
  {
    id: 2,
    name: "Bricks",
    category: "Construction",
    quantity: 2000,
    unit: "pieces",
    rate: 6,
    status: "Purchased",
  },
  {
    id: 3,
    name: "Sand",
    category: "Construction",
    quantity: 3,
    unit: "loads",
    rate: 6500,
    status: "Ordered",
  },
  {
    id: 4,
    name: "Electrical Wire",
    category: "Electrical",
    quantity: 5,
    unit: "rolls",
    rate: 1800,
    status: "Pending",
  },
];

const initialLabour = [
  {
    id: 1,
    worker: "Ramesh Team",
    work: "Masonry",
    days: 5,
    rate: 900,
    status: "Active",
  },
  {
    id: 2,
    worker: "Suresh",
    work: "Electrical",
    days: 2,
    rate: 1000,
    status: "Completed",
  },
  {
    id: 3,
    worker: "Painting Team",
    work: "Painting",
    days: 0,
    rate: 0,
    status: "Upcoming",
  },
];

const initialTasks = [
  {
    id: 1,
    title: "Remove old flooring",
    room: "Living Room",
    priority: "High",
    status: "Completed",
    due: "2026-09-12",
  },
  {
    id: 2,
    title: "Brick wall construction",
    room: "Living Room",
    priority: "High",
    status: "In Progress",
    due: "2026-09-20",
  },
  {
    id: 3,
    title: "Electrical wiring",
    room: "Bedroom",
    priority: "Medium",
    status: "In Progress",
    due: "2026-09-22",
  },
  {
    id: 4,
    title: "Wall painting",
    room: "Bedroom",
    priority: "Low",
    status: "Pending",
    due: "2026-09-28",
  },
];

const initialRooms = [
  {
    id: 1,
    name: "Living Room",
    type: "Living",
    progress: 65,
    budget: 120000,
  },
  {
    id: 2,
    name: "Bedroom",
    type: "Bedroom",
    progress: 40,
    budget: 80000,
  },
  {
    id: 3,
    name: "Kitchen",
    type: "Kitchen",
    progress: 20,
    budget: 95000,
  },
  {
    id: 4,
    name: "Bathroom",
    type: "Bathroom",
    progress: 10,
    budget: 70000,
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "expenses", label: "Expenses", icon: "₹" },
  { id: "materials", label: "Materials", icon: "▦" },
  { id: "labour", label: "Labour", icon: "♙" },
  { id: "tasks", label: "Tasks", icon: "✓" },
  { id: "rooms", label: "Rooms", icon: "⌂" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [expenses, setExpenses] = useState(initialExpenses);
  const [materials, setMaterials] = useState(initialMaterials);
  const [labour, setLabour] = useState(initialLabour);
  const [tasks, setTasks] = useState(initialTasks);
  const [rooms] = useState(initialRooms);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [expenseSearch, setExpenseSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "Materials",
    room: "General",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const [materialForm, setMaterialForm] = useState({
    name: "",
    category: "Construction",
    quantity: "",
    unit: "bags",
    rate: "",
    status: "Pending",
  });

  const [labourForm, setLabourForm] = useState({
    worker: "",
    work: "Masonry",
    days: "",
    rate: "",
    status: "Upcoming",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    room: "Living Room",
    priority: "Medium",
    status: "Pending",
    due: new Date().toISOString().slice(0, 10),
  });

  const budget = 400000;

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [expenses]
  );

  const materialValue = useMemo(
    () =>
      materials.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.rate),
        0
      ),
    [materials]
  );

  const labourValue = useMemo(
    () =>
      labour.reduce(
        (sum, item) => sum + Number(item.days) * Number(item.rate),
        0
      ),
    [labour]
  );

  const remainingBudget = Math.max(budget - totalExpenses, 0);
  const budgetPercentage = Math.min(
    Math.round((totalExpenses / budget) * 100),
    100
  );

  const averageProgress = Math.round(
    rooms.reduce((sum, room) => sum + room.progress, 0) / rooms.length
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const filteredExpenses = expenses.filter((expense) =>
    `${expense.title} ${expense.category} ${expense.room}`
      .toLowerCase()
      .includes(expenseSearch.toLowerCase())
  );

  const filteredMaterials = materials.filter((material) =>
    `${material.name} ${material.category}`
      .toLowerCase()
      .includes(materialSearch.toLowerCase())
  );

  function addExpense(event) {
    event.preventDefault();

    if (!expenseForm.title || !expenseForm.amount) return;

    setExpenses((current) => [
      {
        id: Date.now(),
        ...expenseForm,
        amount: Number(expenseForm.amount),
      },
      ...current,
    ]);

    setExpenseForm({
      title: "",
      category: "Materials",
      room: "General",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });

    setShowExpenseModal(false);
  }

  function addMaterial(event) {
    event.preventDefault();

    if (!materialForm.name || !materialForm.quantity || !materialForm.rate) {
      return;
    }

    setMaterials((current) => [
      {
        id: Date.now(),
        ...materialForm,
        quantity: Number(materialForm.quantity),
        rate: Number(materialForm.rate),
      },
      ...current,
    ]);

    setMaterialForm({
      name: "",
      category: "Construction",
      quantity: "",
      unit: "bags",
      rate: "",
      status: "Pending",
    });

    setShowMaterialModal(false);
  }

  function addLabour(event) {
    event.preventDefault();

    if (!labourForm.worker || !labourForm.days || !labourForm.rate) {
      return;
    }

    setLabour((current) => [
      {
        id: Date.now(),
        ...labourForm,
        days: Number(labourForm.days),
        rate: Number(labourForm.rate),
      },
      ...current,
    ]);

    setLabourForm({
      worker: "",
      work: "Masonry",
      days: "",
      rate: "",
      status: "Upcoming",
    });

    setShowLabourModal(false);
  }

  function addTask(event) {
    event.preventDefault();

    if (!taskForm.title) return;

    setTasks((current) => [
      {
        id: Date.now(),
        ...taskForm,
      },
      ...current,
    ]);

    setTaskForm({
      title: "",
      room: "Living Room",
      priority: "Medium",
      status: "Pending",
      due: new Date().toISOString().slice(0, 10),
    });

    setShowTaskModal(false);
  }

  function deleteExpense(id) {
    setExpenses((current) => current.filter((item) => item.id !== id));
  }

  function deleteMaterial(id) {
    setMaterials((current) => current.filter((item) => item.id !== id));
  }

  function deleteLabour(id) {
    setLabour((current) => current.filter((item) => item.id !== id));
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((item) => item.id !== id));
  }

  function updateTaskStatus(id, status) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
  }

  function renderDashboard() {
    return (
      <>
        <section className="hero-card">
          <div>
            <span className="eyebrow">RENOVA V2</span>
            <h2>Home Renovation Project</h2>
            <p>
              Track your renovation budget, expenses, materials, labour and
              progress from one place.
            </p>

            <div className="hero-meta">
              <span>📍 Madurai Home</span>
              <span>📅 Started Sep 2026</span>
              <span>🏗️ Renovation</span>
            </div>
          </div>

          <div className="hero-progress">
            <div className="progress-ring">
              <strong>{averageProgress}%</strong>
              <span>Complete</span>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            icon="₹"
            title="Total Budget"
            value={formatCurrency(budget)}
            subtitle="Project allocation"
            tone="blue"
          />

          <StatCard
            icon="↗"
            title="Spent"
            value={formatCurrency(totalExpenses)}
            subtitle={`${budgetPercentage}% of budget`}
            tone="orange"
          />

          <StatCard
            icon="✓"
            title="Remaining"
            value={formatCurrency(remainingBudget)}
            subtitle="Available budget"
            tone="green"
          />

          <StatCard
            icon="✓"
            title="Tasks"
            value={`${completedTasks}/${tasks.length}`}
            subtitle="Tasks completed"
            tone="purple"
          />
        </section>

        <section className="dashboard-grid">
          <div className="panel budget-panel">
            <PanelHeader
              title="Budget Overview"
              subtitle="Current project spending"
            />

            <div className="budget-total">
              <div>
                <span>Used</span>
                <strong>{formatCurrency(totalExpenses)}</strong>
              </div>

              <div className="budget-right">
                <span>Budget</span>
                <strong>{formatCurrency(budget)}</strong>
              </div>
            </div>

            <div className="progress-track large">
              <div
                className="progress-fill"
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>

            <div className="budget-footer">
              <span>{budgetPercentage}% utilized</span>
              <span>{formatCurrency(remainingBudget)} remaining</span>
            </div>

            <div className="mini-breakdown">
              <BreakdownItem
                label="Expenses"
                value={formatCurrency(totalExpenses)}
              />
              <BreakdownItem
                label="Materials"
                value={formatCurrency(materialValue)}
              />
              <BreakdownItem
                label="Labour"
                value={formatCurrency(labourValue)}
              />
            </div>
          </div>

          <div className="panel">
            <PanelHeader
              title="Project Progress"
              subtitle="Room-wise completion"
            />

            <div className="room-progress-list">
              {rooms.map((room) => (
                <div className="room-progress" key={room.id}>
                  <div className="room-row">
                    <div>
                      <strong>{room.name}</strong>
                      <span>{room.type}</span>
                    </div>
                    <strong>{room.progress}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${room.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <PanelHeader
              title="Recent Expenses"
              subtitle="Latest project spending"
              action={
                <button
                  className="text-button"
                  onClick={() => setActivePage("expenses")}
                >
                  View all →
                </button>
              }
            />

            <ExpenseTable
              expenses={expenses.slice(0, 4)}
              onDelete={deleteExpense}
            />
          </div>

          <div className="panel">
            <PanelHeader
              title="Upcoming Tasks"
              subtitle="Work that needs attention"
              action={
                <button
                  className="text-button"
                  onClick={() => setActivePage("tasks")}
                >
                  View all →
                </button>
              }
            />

            <div className="task-list">
              {tasks
                .filter((task) => task.status !== "Completed")
                .slice(0, 4)
                .map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onStatusChange={updateTaskStatus}
                  />
                ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  function renderExpenses() {
    return (
      <PageLayout
        title="Expenses"
        subtitle="Track every renovation expense"
        action={
          <button
            className="primary-button"
            onClick={() => setShowExpenseModal(true)}
          >
            + Add Expense
          </button>
        }
      >
        <div className="toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              value={expenseSearch}
              onChange={(event) => setExpenseSearch(event.target.value)}
              placeholder="Search expenses..."
            />
          </div>

          <div className="toolbar-summary">
            Total: <strong>{formatCurrency(totalExpenses)}</strong>
          </div>
        </div>

        <div className="panel table-panel">
          <ExpenseTable
            expenses={filteredExpenses}
            onDelete={deleteExpense}
          />
        </div>
      </PageLayout>
    );
  }

  function renderMaterials() {
    return (
      <PageLayout
        title="Materials"
        subtitle="Manage construction materials and purchases"
        action={
          <button
            className="primary-button"
            onClick={() => setShowMaterialModal(true)}
          >
            + Add Material
          </button>
        }
      >
        <div className="stats-grid compact">
          <StatCard
            icon="▦"
            title="Material Items"
            value={materials.length}
            subtitle="Tracked items"
            tone="blue"
          />
          <StatCard
            icon="₹"
            title="Material Value"
            value={formatCurrency(materialValue)}
            subtitle="Current value"
            tone="green"
          />
          <StatCard
            icon="!"
            title="Pending"
            value={materials.filter((m) => m.status === "Pending").length}
            subtitle="Need attention"
            tone="orange"
          />
        </div>

        <div className="toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              value={materialSearch}
              onChange={(event) => setMaterialSearch(event.target.value)}
              placeholder="Search materials..."
            />
          </div>
        </div>

        <div className="panel table-panel">
          <MaterialTable
            materials={filteredMaterials}
            onDelete={deleteMaterial}
          />
        </div>
      </PageLayout>
    );
  }

  function renderLabour() {
    return (
      <PageLayout
        title="Labour"
        subtitle="Track workers, teams and labour costs"
        action={
          <button
            className="primary-button"
            onClick={() => setShowLabourModal(true)}
          >
            + Add Labour
          </button>
        }
      >
        <div className="stats-grid compact">
          <StatCard
            icon="♙"
            title="Teams / Workers"
            value={labour.length}
            subtitle="Active records"
            tone="blue"
          />

          <StatCard
            icon="₹"
            title="Labour Cost"
            value={formatCurrency(labourValue)}
            subtitle="Recorded labour"
            tone="orange"
          />

          <StatCard
            icon="✓"
            title="Completed"
            value={labour.filter((x) => x.status === "Completed").length}
            subtitle="Completed work"
            tone="green"
          />
        </div>

        <div className="panel table-panel">
          <LabourTable labour={labour} onDelete={deleteLabour} />
        </div>
      </PageLayout>
    );
  }

  function renderTasks() {
    return (
      <PageLayout
        title="Tasks"
        subtitle="Plan and monitor renovation work"
        action={
          <button
            className="primary-button"
            onClick={() => setShowTaskModal(true)}
          >
            + Add Task
          </button>
        }
      >
        <div className="task-columns">
          {["Pending", "In Progress", "Completed"].map((status) => (
            <div className="task-column" key={status}>
              <div className="column-heading">
                <div>
                  <strong>{status}</strong>
                  <span>
                    {tasks.filter((task) => task.status === status).length}
                  </span>
                </div>
              </div>

              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={deleteTask}
                    onStatusChange={updateTaskStatus}
                  />
                ))}

              {tasks.filter((task) => task.status === status).length ===
                0 && <div className="empty-column">No tasks</div>}
            </div>
          ))}
        </div>
      </PageLayout>
    );
  }

  function renderRooms() {
    return (
      <PageLayout
        title="Rooms & Areas"
        subtitle="Track renovation progress by room"
      >
        <div className="room-grid">
          {rooms.map((room) => (
            <div className="room-card" key={room.id}>
              <div className="room-icon">
                {room.type === "Kitchen"
                  ? "▣"
                  : room.type === "Bathroom"
                    ? "◇"
                    : "⌂"}
              </div>

              <div className="room-card-header">
                <div>
                  <span>{room.type}</span>
                  <h3>{room.name}</h3>
                </div>

                <strong>{room.progress}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${room.progress}%` }}
                />
              </div>

              <div className="room-card-footer">
                <span>Budget</span>
                <strong>{formatCurrency(room.budget)}</strong>
              </div>
            </div>
          ))}
        </div>
      </PageLayout>
    );
  }

  function renderContent() {
    switch (activePage) {
      case "expenses":
        return renderExpenses();
      case "materials":
        return renderMaterials();
      case "labour":
        return renderLabour();
      case "tasks":
        return renderTasks();
      case "rooms":
        return renderRooms();
      default:
        return renderDashboard();
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div>
            <strong>RENOVA</strong>
            <span>Home Project Manager</span>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              key={item.id}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="project-mini">
            <span className="project-mini-icon">🏠</span>
            <div>
              <strong>My Renovation</strong>
              <span>Active Project</span>
            </div>
          </div>

          <div className="user-card">
            <div className="avatar">G</div>
            <div>
              <strong>Gowtham</strong>
              <span>Project Owner</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark">R</div>
            <strong>RENOVA</strong>
          </div>

          <div className="topbar-right">
            <button className="icon-button" title="Notifications">
              ♢
            </button>

            <div className="topbar-user">
              <div className="avatar small">G</div>
              <div>
                <strong>Gowtham</strong>
                <span>Owner</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activePage === "dashboard" && (
            <div className="page-heading">
              <div>
                <span className="eyebrow">OVERVIEW</span>
                <h1>Good afternoon, Gowtham 👋</h1>
                <p>Here's what's happening with your renovation project.</p>
              </div>

              <div className="date-chip">
                <span>Today</span>
                <strong>
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>
          )}

          {renderContent()}
        </div>
      </main>

      {showExpenseModal && (
        <Modal
          title="Add Expense"
          subtitle="Record a new project expense"
          onClose={() => setShowExpenseModal(false)}
        >
          <form onSubmit={addExpense} className="form-grid">
            <FormField label="Expense name">
              <input
                value={expenseForm.title}
                onChange={(event) =>
                  setExpenseForm({
                    ...expenseForm,
                    title: event.target.value,
                  })
                }
                placeholder="e.g. Cement purchase"
                required
              />
            </FormField>

            <FormField label="Amount">
              <input
                type="number"
                min="0"
                value={expenseForm.amount}
                onChange={(event) =>
                  setExpenseForm({
                    ...expenseForm,
                    amount: event.target.value,
                  })
                }
                placeholder="₹ 0"
                required
              />
            </FormField>

            <FormField label="Category">
              <select
                value={expenseForm.category}
                onChange={(event) =>
                  setExpenseForm({
                    ...expenseForm,
                    category: event.target.value,
                  })
                }
              >
                <option>Materials</option>
                <option>Labour</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Painting</option>
                <option>Furniture</option>
                <option>Other</option>
              </select>
            </FormField>

            <FormField label="Room">
              <select
                value={expenseForm.room}
                onChange={(event) =>
                  setExpenseForm({
                    ...expenseForm,
                    room: event.target.value,
                  })
                }
              >
                <option>General</option>
                {rooms.map((room) => (
                  <option key={room.id}>{room.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Date">
              <input
                type="date"
                value={expenseForm.date}
                onChange={(event) =>
                  setExpenseForm({
                    ...expenseForm,
                    date: event.target.value,
                  })
                }
              />
            </FormField>

            <FormField label="Note" full>
              <textarea
                value={expenseForm.note}
                onChange={(event) =>
                  setExpenseForm({
                    ...expenseForm,
                    note: event.target.value,
                  })
                }
                placeholder="Additional details..."
                rows="3"
              />
            </FormField>

            <ModalActions
              onCancel={() => setShowExpenseModal(false)}
              submit="Save Expense"
            />
          </form>
        </Modal>
      )}

      {showMaterialModal && (
        <Modal
          title="Add Material"
          subtitle="Add a construction material"
          onClose={() => setShowMaterialModal(false)}
        >
          <form onSubmit={addMaterial} className="form-grid">
            <FormField label="Material name" full>
              <input
                value={materialForm.name}
                onChange={(event) =>
                  setMaterialForm({
                    ...materialForm,
                    name: event.target.value,
                  })
                }
                placeholder="e.g. Tiles"
                required
              />
            </FormField>

            <FormField label="Category">
              <select
                value={materialForm.category}
                onChange={(event) =>
                  setMaterialForm({
                    ...materialForm,
                    category: event.target.value,
                  })
                }
              >
                <option>Construction</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Painting</option>
                <option>Furniture</option>
              </select>
            </FormField>

            <FormField label="Quantity">
              <input
                type="number"
                min="0"
                value={materialForm.quantity}
                onChange={(event) =>
                  setMaterialForm({
                    ...materialForm,
                    quantity: event.target.value,
                  })
                }
                required
              />
            </FormField>

            <FormField label="Unit">
              <select
                value={materialForm.unit}
                onChange={(event) =>
                  setMaterialForm({
                    ...materialForm,
                    unit: event.target.value,
                  })
                }
              >
                <option>bags</option>
                <option>pieces</option>
                <option>loads</option>
                <option>rolls</option>
                <option>boxes</option>
                <option>sq.ft</option>
                <option>litres</option>
              </select>
            </FormField>

            <FormField label="Rate">
              <input
                type="number"
                min="0"
                value={materialForm.rate}
                onChange={(event) =>
                  setMaterialForm({
                    ...materialForm,
                    rate: event.target.value,
                  })
                }
                placeholder="₹"
                required
              />
            </FormField>

            <FormField label="Status">
              <select
                value={materialForm.status}
                onChange={(event) =>
                  setMaterialForm({
                    ...materialForm,
                    status: event.target.value,
                  })
                }
              >
                <option>Pending</option>
                <option>Ordered</option>
                <option>Purchased</option>
              </select>
            </FormField>

            <ModalActions
              onCancel={() => setShowMaterialModal(false)}
              submit="Save Material"
            />
          </form>
        </Modal>
      )}

      {showLabourModal && (
        <Modal
          title="Add Labour"
          subtitle="Add a worker or labour team"
          onClose={() => setShowLabourModal(false)}
        >
          <form onSubmit={addLabour} className="form-grid">
            <FormField label="Worker / Team" full>
              <input
                value={labourForm.worker}
                onChange={(event) =>
                  setLabourForm({
                    ...labourForm,
                    worker: event.target.value,
                  })
                }
                placeholder="e.g. Kumar Mason Team"
                required
              />
            </FormField>

            <FormField label="Work type">
              <select
                value={labourForm.work}
                onChange={(event) =>
                  setLabourForm({
                    ...labourForm,
                    work: event.target.value,
                  })
                }
              >
                <option>Masonry</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Painting</option>
                <option>Carpentry</option>
                <option>Other</option>
              </select>
            </FormField>

            <FormField label="Days">
              <input
                type="number"
                min="0"
                value={labourForm.days}
                onChange={(event) =>
                  setLabourForm({
                    ...labourForm,
                    days: event.target.value,
                  })
                }
                required
              />
            </FormField>

            <FormField label="Daily rate">
              <input
                type="number"
                min="0"
                value={labourForm.rate}
                onChange={(event) =>
                  setLabourForm({
                    ...labourForm,
                    rate: event.target.value,
                  })
                }
                placeholder="₹"
                required
              />
            </FormField>

            <FormField label="Status">
              <select
                value={labourForm.status}
                onChange={(event) =>
                  setLabourForm({
                    ...labourForm,
                    status: event.target.value,
                  })
                }
              >
                <option>Upcoming</option>
                <option>Active</option>
                <option>Completed</option>
              </select>
            </FormField>

            <ModalActions
              onCancel={() => setShowLabourModal(false)}
              submit="Save Labour"
            />
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <Modal
          title="Add Task"
          subtitle="Create a renovation task"
          onClose={() => setShowTaskModal(false)}
        >
          <form onSubmit={addTask} className="form-grid">
            <FormField label="Task name" full>
              <input
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    title: event.target.value,
                  })
                }
                placeholder="e.g. Install floor tiles"
                required
              />
            </FormField>

            <FormField label="Room">
              <select
                value={taskForm.room}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    room: event.target.value,
                  })
                }
              >
                {rooms.map((room) => (
                  <option key={room.id}>{room.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Priority">
              <select
                value={taskForm.priority}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    priority: event.target.value,
                  })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </FormField>

            <FormField label="Status">
              <select
                value={taskForm.status}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    status: event.target.value,
                  })
                }
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </FormField>

            <FormField label="Due date">
              <input
                type="date"
                value={taskForm.due}
                onChange={(event) =>
                  setTaskForm({
                    ...taskForm,
                    due: event.target.value,
                  })
                }
              />
            </FormField>

            <ModalActions
              onCancel={() => setShowTaskModal(false)}
              submit="Create Task"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

function PageLayout({ title, subtitle, action, children }) {
  return (
    <>
      <div className="page-heading inner">
        <div>
          <span className="eyebrow">RENOVA</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {action && <div>{action}</div>}
      </div>

      {children}
    </>
  );
}

function StatCard({ icon, title, value, subtitle, tone }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}

function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="panel-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function BreakdownItem({ label, value }) {
  return (
    <div className="breakdown-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ExpenseTable({ expenses, onDelete }) {
  if (!expenses.length) {
    return <EmptyState text="No expenses found." />;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Expense</th>
            <th>Category</th>
            <th>Room</th>
            <th>Date</th>
            <th>Amount</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>
                <div className="table-primary">
                  <strong>{expense.title}</strong>
                  {expense.note && <span>{expense.note}</span>}
                </div>
              </td>

              <td>
                <StatusBadge text={expense.category} />
              </td>

              <td>{expense.room}</td>
              <td>{expense.date}</td>

              <td>
                <strong>{formatCurrency(expense.amount)}</strong>
              </td>

              <td>
                <button
                  className="delete-button"
                  onClick={() => onDelete(expense.id)}
                  title="Delete"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MaterialTable({ materials, onDelete }) {
  if (!materials.length) {
    return <EmptyState text="No materials found." />;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Material</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Total</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {materials.map((material) => {
            const total =
              Number(material.quantity) * Number(material.rate);

            return (
              <tr key={material.id}>
                <td>
                  <div className="table-primary">
                    <strong>{material.name}</strong>
                  </div>
                </td>

                <td>{material.category}</td>

                <td>
                  {material.quantity} {material.unit}
                </td>

                <td>{formatCurrency(material.rate)}</td>

                <td>
                  <strong>{formatCurrency(total)}</strong>
                </td>

                <td>
                  <StatusBadge text={material.status} />
                </td>

                <td>
                  <button
                    className="delete-button"
                    onClick={() => onDelete(material.id)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LabourTable({ labour, onDelete }) {
  if (!labour.length) {
    return <EmptyState text="No labour records found." />;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Worker / Team</th>
            <th>Work</th>
            <th>Days</th>
            <th>Daily Rate</th>
            <th>Total</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {labour.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.worker}</strong>
              </td>

              <td>{item.work}</td>
              <td>{item.days}</td>
              <td>{formatCurrency(item.rate)}</td>

              <td>
                <strong>
                  {formatCurrency(item.days * item.rate)}
                </strong>
              </td>

              <td>
                <StatusBadge text={item.status} />
              </td>

              <td>
                <button
                  className="delete-button"
                  onClick={() => onDelete(item.id)}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TaskRow({ task, onStatusChange }) {
  return (
    <div className="task-row">
      <div className={`task-check ${task.status === "Completed" ? "done" : ""}`}>
        {task.status === "Completed" ? "✓" : ""}
      </div>

      <div className="task-row-content">
        <strong>{task.title}</strong>
        <span>
          {task.room} · Due {task.due}
        </span>
      </div>

      <select
        value={task.status}
        onChange={(event) =>
          onStatusChange(task.id, event.target.value)
        }
        className="mini-select"
      >
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>
    </div>
  );
}

function TaskCard({ task, onDelete, onStatusChange }) {
  return (
    <div className="task-card">
      <div className="task-card-top">
        <StatusBadge text={task.priority} />

        <button
          className="delete-button"
          onClick={() => onDelete(task.id)}
        >
          ×
        </button>
      </div>

      <h3>{task.title}</h3>

      <div className="task-card-meta">
        <span>⌂ {task.room}</span>
        <span>◷ {task.due}</span>
      </div>

      <select
        value={task.status}
        onChange={(event) =>
          onStatusChange(task.id, event.target.value)
        }
      >
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>
    </div>
  );
}

function StatusBadge({ text }) {
  const normalized = text.toLowerCase().replaceAll(" ", "-");

  return (
    <span className={`status-badge ${normalized}`}>
      {text}
    </span>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function FormField({ label, children, full = false }) {
  return (
    <label className={`form-field ${full ? "full" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function ModalActions({ onCancel, submit }) {
  return (
    <div className="modal-actions full">
      <button
        type="button"
        className="secondary-button"
        onClick={onCancel}
      >
        Cancel
      </button>

      <button type="submit" className="primary-button">
        {submit}
      </button>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div>◎</div>
      <strong>{text}</strong>
      <span>Try adding a new record.</span>
    </div>
  );
}

export default App;