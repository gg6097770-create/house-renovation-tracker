import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const CATEGORIES = [
  "Labour",
  "Materials",
  "Machine Rental",
  "Travel / Transport",
  "Food / Beverage",
  "Other",
];

const WORK_TYPES = [
  "Mason",
  "Normal Labour",
  "Steel / Iron Worker",
  "Carpenter",
  "Painter",
  "Electrician",
  "Plumber",
  "Other",
];

const STEEL_WORK_TYPES = [
  "Basement Steel",
  "Foundation Steel",
  "Column Steel",
  "Belt Beam Steel",
  "Roof / Slab Steel",
  "Staircase Steel",
  "Other Steel Work",
];

const PROJECT_STAGES = [
  "Planning",
  "Foundation",
  "Structure",
  "Roof / Slab",
  "Electrical",
  "Plumbing",
  "Flooring",
  "Painting",
  "Finishing",
];

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  category: "Labour",
  workType: "Mason",
  steelWorkType: "",
  description: "",
  quantity: 1,
  rate: 0,
  total: 0,
  paymentStatus: "Paid",
  notes: "",
};

const money = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const todayString = () => new Date().toISOString().slice(0, 10);

const getMonday = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + diff);

  return date.toISOString().slice(0, 10);
};

const getSaturday = (mondayValue) => {
  const date = new Date(`${mondayValue}T00:00:00`);
  date.setDate(date.getDate() + 5);

  return date.toISOString().slice(0, 10);
};

function App() {
  const restoreInputRef = useRef(null);

  const [activePage, setActivePage] = useState("Dashboard");

  const [expenses, setExpenses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("renovationExpenses")) || [];
    } catch {
      return [];
    }
  });

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem("renovationBudget");
    return saved ? Number(saved) : 1000000;
  });

  const [projectName, setProjectName] = useState(
    () =>
      localStorage.getItem("renovationProjectName") ||
      "My House Renovation",
  );

  const [projectStage, setProjectStage] = useState(
    () => localStorage.getItem("renovationProjectStage") || "Foundation",
  );

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("renovaTheme") === "dark",
  );

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");
  const [reportWeek, setReportWeek] = useState(getMonday(todayString()));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("renovationExpenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("renovationBudget", String(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem("renovationProjectName", projectName);
  }, [projectName]);

  useEffect(() => {
    localStorage.setItem("renovationProjectStage", projectStage);
  }, [projectStage]);

  useEffect(() => {
    localStorage.setItem("renovaTheme", darkMode ? "dark" : "light");
    document.body.className = darkMode ? "dark-mode" : "";
  }, [darkMode]);

  useEffect(() => {
    const quantity = Number(form.quantity || 0);
    const rate = Number(form.rate || 0);

    setForm((previous) => {
      const total = quantity * rate;

      if (previous.total === total) {
        return previous;
      }

      return {
        ...previous,
        total,
      };
    });
  }, [form.quantity, form.rate]);

  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (sum, expense) => sum + Number(expense.total || 0),
        0,
      ),
    [expenses],
  );

  const totalPending = useMemo(
    () =>
      expenses
        .filter((expense) => expense.paymentStatus === "Pending")
        .reduce((sum, expense) => sum + Number(expense.total || 0), 0),
    [expenses],
  );

  const totalPaid = useMemo(
    () =>
      expenses
        .filter((expense) => expense.paymentStatus !== "Pending")
        .reduce((sum, expense) => sum + Number(expense.total || 0), 0),
    [expenses],
  );

  const remaining = Math.max(Number(budget || 0) - totalSpent, 0);

  const budgetPercentage =
    Number(budget || 0) > 0
      ? Math.min((totalSpent / Number(budget)) * 100, 100)
      : 0;

  const todaySpent = useMemo(
    () =>
      expenses
        .filter((expense) => expense.date === todayString())
        .reduce((sum, expense) => sum + Number(expense.total || 0), 0),
    [expenses],
  );

  const stageIndex = Math.max(PROJECT_STAGES.indexOf(projectStage), 0);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return expenses
      .filter((expense) => {
        const matchesDate = filterDate
          ? expense.date === filterDate
          : true;

        if (!matchesDate) return false;

        if (!query) return true;

        return [
          expense.description,
          expense.category,
          expense.workType,
          expense.steelWorkType,
          expense.notes,
          expense.paymentStatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const dateCompare = String(b.date).localeCompare(String(a.date));

        if (dateCompare !== 0) return dateCompare;

        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [expenses, filterDate, search]);

  const categoryTotals = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      total: expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + Number(expense.total || 0), 0),
    }));
  }, [expenses]);

  const lastSevenDays = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateString = date.toISOString().slice(0, 10);

      const total = expenses
        .filter((expense) => expense.date === dateString)
        .reduce((sum, expense) => sum + Number(expense.total || 0), 0);

      days.push({
        date: dateString,
        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        total,
      });
    }

    return days;
  }, [expenses]);

  const maxChartValue = Math.max(
    ...lastSevenDays.map((day) => day.total),
    1,
  );

  const recentExpenses = [...expenses]
    .sort((a, b) => {
      const dateCompare = String(b.date).localeCompare(String(a.date));

      if (dateCompare !== 0) return dateCompare;

      return Number(b.id || 0) - Number(a.id || 0);
    })
    .slice(0, 6);

  const calculatedTotal =
    Number(form.quantity || 0) * Number(form.rate || 0);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      date: todayString(),
    });
    setEditingId(null);
  };

  const saveExpense = (event) => {
    event.preventDefault();

    const quantity = Number(form.quantity || 0);
    const rate = Number(form.rate || 0);
    const total = quantity * rate;

    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    if (rate < 0) {
      alert("Rate cannot be negative.");
      return;
    }

    if (!form.description.trim()) {
      alert("Please enter a description.");
      return;
    }

    const expense = {
      id: editingId || Date.now(),
      date: form.date || todayString(),
      category: form.category,
      workType: form.workType,
      steelWorkType:
        form.category === "Materials" &&
        form.workType === "Steel / Iron Worker"
          ? form.steelWorkType
          : "",
      description: form.description.trim(),
      quantity,
      rate,
      total,
      paymentStatus: form.paymentStatus,
      notes: form.notes.trim(),
    };

    if (editingId) {
      setExpenses((previous) =>
        previous.map((item) =>
          item.id === editingId ? expense : item,
        ),
      );
    } else {
      setExpenses((previous) => [expense, ...previous]);
    }

    resetForm();
    setActivePage("History");
  };

  const editExpense = (expense) => {
    setForm({
      date: expense.date || todayString(),
      category: expense.category || "Labour",
      workType: expense.workType || "Other",
      steelWorkType: expense.steelWorkType || "",
      description: expense.description || "",
      quantity: Number(expense.quantity || 1),
      rate: Number(expense.rate || 0),
      total: Number(expense.total || 0),
      paymentStatus: expense.paymentStatus || "Paid",
      notes: expense.notes || "",
    });

    setEditingId(expense.id);
    setActivePage("Add Expense");
    setSidebarOpen(false);
  };

  const deleteExpense = (id) => {
    const confirmed = window.confirm(
      "Delete this expense permanently?",
    );

    if (!confirmed) return;

    setExpenses((previous) =>
      previous.filter((expense) => expense.id !== id),
    );
  };

  const togglePayment = (id) => {
    setExpenses((previous) =>
      previous.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              paymentStatus:
                expense.paymentStatus === "Pending"
                  ? "Paid"
                  : "Pending",
            }
          : expense,
      ),
    );
  };

  const exportCSV = (data = expenses) => {
    if (!data.length) {
      alert("There is no expense data to export.");
      return;
    }

    const headers = [
      "Date",
      "Category",
      "Work Type",
      "Steel Work Type",
      "Description",
      "Quantity",
      "Rate",
      "Total",
      "Payment Status",
      "Notes",
    ];

    const rows = data.map((expense) => [
      expense.date,
      expense.category,
      expense.workType,
      expense.steelWorkType || "",
      expense.description,
      expense.quantity,
      expense.rate,
      expense.total,
      expense.paymentStatus,
      expense.notes || "",
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replaceAll('"', '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `renova-expenses-${todayString()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const backupData = () => {
    const backup = {
      app: "RENOVA",
      version: 1,
      exportedAt: new Date().toISOString(),
      project: {
        name: projectName,
        budget,
        stage: projectStage,
      },
      appearance: {
        darkMode,
      },
      expenses,
    };

    const blob = new Blob(
      [JSON.stringify(backup, null, 2)],
      {
        type: "application/json",
      },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `renova-backup-${todayString()}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const restoreData = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));

        const restoredExpenses = Array.isArray(data.expenses)
          ? data.expenses
          : [];

        const restoredProject = data.project || {};

        const restoredName =
          restoredProject.name ||
          data.projectName ||
          "My House Renovation";

        const restoredBudget = Number(
          restoredProject.budget ?? data.budget ?? 1000000,
        );

        const restoredStage = PROJECT_STAGES.includes(
          restoredProject.stage || data.projectStage,
        )
          ? restoredProject.stage || data.projectStage
          : "Foundation";

        const restoredDarkMode =
          typeof data.appearance?.darkMode === "boolean"
            ? data.appearance.darkMode
            : typeof data.darkMode === "boolean"
              ? data.darkMode
              : null;

        const confirmed = window.confirm(
          "Restore this RENOVA backup?\n\nYour current project data will be replaced.",
        );

        if (!confirmed) {
          event.target.value = "";
          return;
        }

        localStorage.setItem(
          "renovationExpenses",
          JSON.stringify(restoredExpenses),
        );

        localStorage.setItem(
          "renovationBudget",
          String(
            Number.isFinite(restoredBudget)
              ? restoredBudget
              : 1000000,
          ),
        );

        localStorage.setItem(
          "renovationProjectName",
          String(restoredName),
        );

        localStorage.setItem(
          "renovationProjectStage",
          restoredStage,
        );

        if (restoredDarkMode !== null) {
          localStorage.setItem(
            "renovaTheme",
            restoredDarkMode ? "dark" : "light",
          );
        }

        alert(
          "Backup restored successfully.\n\nRENOVA will refresh automatically.",
        );

        window.location.reload();
      } catch {
        alert(
          "This is not a valid RENOVA backup file.",
        );
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      alert("Unable to read the backup file.");
      event.target.value = "";
    };

    reader.readAsText(file);
  };

  const printReport = () => {
    window.print();
  };

  const weekStart = reportWeek;
  const weekEnd = getSaturday(reportWeek);

  const weeklyExpenses = expenses.filter(
    (expense) =>
      expense.date >= weekStart && expense.date <= weekEnd,
  );

  const weeklyTotal = weeklyExpenses.reduce(
    (sum, expense) => sum + Number(expense.total || 0),
    0,
  );

  const weeklyPaid = weeklyExpenses
    .filter((expense) => expense.paymentStatus !== "Pending")
    .reduce((sum, expense) => sum + Number(expense.total || 0), 0);

  const weeklyPending = weeklyExpenses
    .filter((expense) => expense.paymentStatus === "Pending")
    .reduce((sum, expense) => sum + Number(expense.total || 0), 0);

  const shareReport = (type) => {
    const message = [
      `${projectName} - Weekly Renovation Report`,
      `${formatDate(weekStart)} to ${formatDate(weekEnd)}`,
      "",
      `Total: ${money(weeklyTotal)}`,
      `Paid: ${money(weeklyPaid)}`,
      `Pending: ${money(weeklyPending)}`,
      "",
      `Overall spent: ${money(totalSpent)}`,
      `Remaining budget: ${money(remaining)}`,
    ].join("\n");

    if (type === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(
        `${projectName} - Weekly Report`,
      )}&body=${encodeURIComponent(message)}`;
      return;
    }

    if (type === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank",
      );
      return;
    }

    if (type === "sms") {
      window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    }
  };

  const resetAllData = () => {
    const confirmed = window.confirm(
      "This will delete all renovation expenses and reset the project data. Continue?",
    );

    if (!confirmed) return;

    localStorage.removeItem("renovationExpenses");
    localStorage.removeItem("renovationBudget");
    localStorage.removeItem("renovationProjectName");
    localStorage.removeItem("renovationProjectStage");

    setExpenses([]);
    setBudget(1000000);
    setProjectName("My House Renovation");
    setProjectStage("Foundation");

    resetForm();
  };

  const pageTitle = {
    Dashboard: "Dashboard",
    "Add Expense": editingId ? "Edit Expense" : "Add Expense",
    History: "Expense History",
    Reports: "Weekly Reports",
    Settings: "Settings",
  }[activePage];

  const pageSubtitle = {
    Dashboard: "Track your renovation spending at a glance.",
    "Add Expense": editingId
      ? "Update your renovation expense."
      : "Record a new renovation expense.",
    History: "Search, filter and manage all expenses.",
    Reports: "Review your Monday to Saturday renovation spending.",
    Settings: "Manage your project and local data.",
  }[activePage];

  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    if (page === "Add Expense" && !editingId) {
      resetForm();
    }
  };

  return (
    <div className={`app-shell ${darkMode ? "dark" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">R</div>

          <div>
            <div className="brand-name">RENOVA</div>
            <div className="brand-subtitle">
              House Renovation Tracker
            </div>
          </div>
        </div>

        <nav className="nav-list">
          {[
            ["Dashboard", "⌂"],
            ["Add Expense", "+"],
            ["History", "▤"],
            ["Reports", "▥"],
            ["Settings", "⚙"],
          ].map(([page, icon]) => (
            <button
              key={page}
              className={`nav-item ${
                activePage === page ? "active" : ""
              }`}
              onClick={() => navigate(page)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{page}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-project">
            <span className="sidebar-project-label">
              Current project
            </span>

            <strong>{projectName}</strong>

            <span>{projectStage}</span>
          </div>

          <button
            className="theme-button"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? "☀ Light mode" : "☾ Dark mode"}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div>
              <h1>{pageTitle}</h1>
              <p>{pageSubtitle}</p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="budget-mini">
              <span>Budget</span>
              <strong>{money(budget)}</strong>
            </div>

            <button
              className="topbar-add"
              onClick={() => navigate("Add Expense")}
            >
              + Add Expense
            </button>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" && (
            <section className="page-section">
              <div className="hero-card">
                <div>
                  <span className="eyebrow">
                    {projectStage}
                  </span>

                  <h2>{projectName}</h2>

                  <p>
                    Keep every renovation expense organized,
                    visible and under control.
                  </p>
                </div>

                <div className="hero-progress">
                  <div className="progress-circle">
                    <strong>
                      {Math.round(budgetPercentage)}%
                    </strong>
                    <span>used</span>
                  </div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">₹</div>
                  <span>Total spent</span>
                  <strong>{money(totalSpent)}</strong>
                  <small>
                    {expenses.length} expense
                    {expenses.length === 1 ? "" : "s"}
                  </small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✓</div>
                  <span>Paid</span>
                  <strong>{money(totalPaid)}</strong>
                  <small>Completed payments</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">!</div>
                  <span>Pending</span>
                  <strong>{money(totalPending)}</strong>
                  <small>Payments pending</small>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">↗</div>
                  <span>Remaining</span>
                  <strong>{money(remaining)}</strong>
                  <small>Available budget</small>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="content-card chart-card">
                  <div className="card-header">
                    <div>
                      <h3>Last 7 days</h3>
                      <p>Daily renovation spending</p>
                    </div>
                  </div>

                  <div className="bar-chart">
                    {lastSevenDays.map((day) => (
                      <div
                        className="bar-column"
                        key={day.date}
                      >
                        <span className="bar-value">
                          {day.total > 0
                            ? money(day.total)
                            : ""}
                        </span>

                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              height: `${Math.max(
                                (day.total / maxChartValue) *
                                  100,
                                day.total > 0 ? 8 : 0,
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="bar-label">
                          {day.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-card">
                  <div className="card-header">
                    <div>
                      <h3>Budget progress</h3>
                      <p>Current project budget</p>
                    </div>

                    <strong>
                      {Math.round(budgetPercentage)}%
                    </strong>
                  </div>

                  <div className="large-progress">
                    <div
                      style={{
                        width: `${budgetPercentage}%`,
                      }}
                    />
                  </div>

                  <div className="budget-row">
                    <span>Spent</span>
                    <strong>{money(totalSpent)}</strong>
                  </div>

                  <div className="budget-row">
                    <span>Remaining</span>
                    <strong>{money(remaining)}</strong>
                  </div>

                  <div className="budget-row">
                    <span>Today</span>
                    <strong>{money(todaySpent)}</strong>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="content-card">
                  <div className="card-header">
                    <div>
                      <h3>Recent expenses</h3>
                      <p>Your latest renovation activity</p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => navigate("History")}
                    >
                      View all →
                    </button>
                  </div>

                  {recentExpenses.length === 0 ? (
                    <div className="empty-state">
                      <div>₹</div>
                      <h3>No expenses yet</h3>
                      <p>
                        Start tracking your renovation costs.
                      </p>

                      <button
                        className="primary-button"
                        onClick={() => navigate("Add Expense")}
                      >
                        Add first expense
                      </button>
                    </div>
                  ) : (
                    <div className="expense-list">
                      {recentExpenses.map((expense) => (
                        <div
                          className="expense-row"
                          key={expense.id}
                        >
                          <div className="expense-main">
                            <div className="expense-avatar">
                              {expense.category
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {expense.description}
                              </strong>

                              <span>
                                {expense.category} ·{" "}
                                {formatDate(expense.date)}
                              </span>
                            </div>
                          </div>

                          <div className="expense-amount">
                            <strong>
                              {money(expense.total)}
                            </strong>

                            <span
                              className={`status ${
                                expense.paymentStatus ===
                                "Pending"
                                  ? "pending"
                                  : "paid"
                              }`}
                            >
                              {expense.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="content-card">
                  <div className="card-header">
                    <div>
                      <h3>Category spending</h3>
                      <p>Where your money is going</p>
                    </div>
                  </div>

                  <div className="category-list">
                    {categoryTotals.map((item) => {
                      const percentage =
                        totalSpent > 0
                          ? (item.total / totalSpent) * 100
                          : 0;

                      return (
                        <div
                          className="category-item"
                          key={item.category}
                        >
                          <div className="category-heading">
                            <span>{item.category}</span>
                            <strong>
                              {money(item.total)}
                            </strong>
                          </div>

                          <div className="category-track">
                            <div
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="content-card stages-card">
                <div className="card-header">
                  <div>
                    <h3>Renovation stages</h3>
                    <p>Track your current project phase</p>
                  </div>
                </div>

                <div className="stage-list">
                  {PROJECT_STAGES.map((stage, index) => (
                    <div
                      className={`stage-item ${
                        index < stageIndex
                          ? "completed"
                          : ""
                      } ${
                        index === stageIndex
                          ? "current"
                          : ""
                      }`}
                      key={stage}
                    >
                      <div className="stage-dot">
                        {index < stageIndex
                          ? "✓"
                          : index + 1}
                      </div>

                      <span>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === "Add Expense" && (
            <section className="page-section narrow-section">
              <div className="form-card">
                <div className="form-card-header">
                  <div>
                    <span className="eyebrow">
                      Expense entry
                    </span>

                    <h2>
                      {editingId
                        ? "Edit expense"
                        : "Add a new expense"}
                    </h2>

                    <p>
                      Enter the details below to update your
                      renovation budget.
                    </p>
                  </div>

                  {editingId && (
                    <button
                      className="secondary-button"
                      onClick={resetForm}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>

                <form onSubmit={saveExpense}>
                  <div className="form-grid">
                    <label className="field">
                      <span>Date</span>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            date: event.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label className="field">
                      <span>Category</span>
                      <select
                        value={form.category}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            category: event.target.value,
                          })
                        }
                      >
                        {CATEGORIES.map((category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Work type</span>
                      <select
                        value={form.workType}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            workType: event.target.value,
                          })
                        }
                      >
                        {WORK_TYPES.map((workType) => (
                          <option
                            key={workType}
                            value={workType}
                          >
                            {workType}
                          </option>
                        ))}
                      </select>
                    </label>

                    {form.category === "Materials" &&
                      form.workType ===
                        "Steel / Iron Worker" && (
                        <label className="field">
                          <span>Steel work</span>
                          <select
                            value={form.steelWorkType}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                steelWorkType:
                                  event.target.value,
                              })
                            }
                          >
                            <option value="">
                              Select steel work
                            </option>

                            {STEEL_WORK_TYPES.map(
                              (steelType) => (
                                <option
                                  key={steelType}
                                  value={steelType}
                                >
                                  {steelType}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                      )}

                    <label className="field field-wide">
                      <span>Description</span>
                      <input
                        type="text"
                        placeholder="Example: Cement bags"
                        value={form.description}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            description:
                              event.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label className="field">
                      <span>Quantity</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={form.quantity}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            quantity: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Rate</span>
                      <div className="input-prefix">
                        <span>₹</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={form.rate}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              rate: event.target.value,
                            })
                          }
                        />
                      </div>
                    </label>

                    <div className="field">
                      <span>Total</span>
                      <div className="total-preview">
                        {money(calculatedTotal)}
                      </div>
                    </div>

                    <label className="field">
                      <span>Payment status</span>
                      <select
                        value={form.paymentStatus}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            paymentStatus:
                              event.target.value,
                          })
                        }
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">
                          Pending
                        </option>
                      </select>
                    </label>

                    <label className="field field-wide">
                      <span>Notes</span>
                      <textarea
                        rows="4"
                        placeholder="Optional notes..."
                        value={form.notes}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            notes: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="form-footer">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetForm}
                    >
                      Clear
                    </button>

                    <button
                      type="submit"
                      className="primary-button"
                    >
                      {editingId
                        ? "Update expense"
                        : "Save expense"}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {activePage === "History" && (
            <section className="page-section">
              <div className="content-card">
                <div className="card-header history-header">
                  <div>
                    <h3>Expense history</h3>
                    <p>
                      {filteredExpenses.length} result
                      {filteredExpenses.length === 1
                        ? ""
                        : "s"}
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      exportCSV(filteredExpenses)
                    }
                  >
                    ↓ Export CSV
                  </button>
                </div>

                <div className="filter-bar">
                  <div className="search-box">
                    <span>⌕</span>

                    <input
                      type="text"
                      placeholder="Search expenses..."
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                    />
                  </div>

                  <input
                    type="date"
                    value={filterDate}
                    onChange={(event) =>
                      setFilterDate(event.target.value)
                    }
                  />

                  {(filterDate || search) && (
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setFilterDate("");
                        setSearch("");
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="empty-state">
                    <div>▤</div>
                    <h3>No expenses found</h3>
                    <p>
                      Try another search or add a new
                      expense.
                    </p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Work</th>
                          <th>Qty</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredExpenses.map((expense) => (
                          <tr key={expense.id}>
                            <td>{formatDate(expense.date)}</td>

                            <td>
                              <strong>
                                {expense.description}
                              </strong>

                              {expense.notes && (
                                <small>
                                  {expense.notes}
                                </small>
                              )}
                            </td>

                            <td>{expense.category}</td>

                            <td>
                              {expense.steelWorkType ||
                                expense.workType}
                            </td>

                            <td>{expense.quantity}</td>

                            <td>
                              <strong>
                                {money(expense.total)}
                              </strong>
                            </td>

                            <td>
                              <button
                                className={`status ${
                                  expense.paymentStatus ===
                                  "Pending"
                                    ? "pending"
                                    : "paid"
                                } status-button`}
                                onClick={() =>
                                  togglePayment(
                                    expense.id,
                                  )
                                }
                              >
                                {expense.paymentStatus}
                              </button>
                            </td>

                            <td>
                              <div className="table-actions">
                                <button
                                  className="icon-button"
                                  onClick={() =>
                                    editExpense(expense)
                                  }
                                  title="Edit"
                                >
                                  ✎
                                </button>

                                <button
                                  className="icon-button danger-icon"
                                  onClick={() =>
                                    deleteExpense(
                                      expense.id,
                                    )
                                  }
                                  title="Delete"
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage === "Reports" && (
            <section className="page-section">
              <div className="report-toolbar content-card">
                <div>
                  <span className="eyebrow">
                    Weekly report
                  </span>

                  <h2>
                    {formatDate(weekStart)} —{" "}
                    {formatDate(weekEnd)}
                  </h2>
                </div>

                <div className="week-controls">
                  <button
                    className="secondary-button"
                    onClick={() => {
                      const date = new Date(
                        `${reportWeek}T00:00:00`,
                      );

                      date.setDate(date.getDate() - 7);

                      setReportWeek(
                        date.toISOString().slice(0, 10),
                      );
                    }}
                  >
                    ← Previous
                  </button>

                  <input
                    type="date"
                    value={reportWeek}
                    onChange={(event) =>
                      setReportWeek(
                        getMonday(event.target.value),
                      )
                    }
                  />

                  <button
                    className="secondary-button"
                    onClick={() => {
                      const date = new Date(
                        `${reportWeek}T00:00:00`,
                      );

                      date.setDate(date.getDate() + 7);

                      setReportWeek(
                        date.toISOString().slice(0, 10),
                      );
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Weekly total</span>
                  <strong>{money(weeklyTotal)}</strong>
                  <small>
                    {weeklyExpenses.length} expense
                    {weeklyExpenses.length === 1
                      ? ""
                      : "s"}
                  </small>
                </div>

                <div className="stat-card">
                  <span>Paid</span>
                  <strong>{money(weeklyPaid)}</strong>
                  <small>Paid this week</small>
                </div>

                <div className="stat-card">
                  <span>Pending</span>
                  <strong>{money(weeklyPending)}</strong>
                  <small>Pending this week</small>
                </div>

                <div className="stat-card">
                  <span>Average/day</span>
                  <strong>
                    {money(weeklyTotal / 6)}
                  </strong>
                  <small>Monday to Saturday</small>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header">
                  <div>
                    <h3>Weekly expenses</h3>
                    <p>
                      Monday to Saturday breakdown
                    </p>
                  </div>

                  <div className="share-buttons">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        shareReport("email")
                      }
                    >
                      Email
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() =>
                        shareReport("whatsapp")
                      }
                    >
                      WhatsApp
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() =>
                        shareReport("sms")
                      }
                    >
                      SMS
                    </button>

                    <button
                      className="secondary-button"
                      onClick={printReport}
                    >
                      ⎙ Print
                    </button>
                  </div>
                </div>

                {weeklyExpenses.length === 0 ? (
                  <div className="empty-state">
                    <div>▥</div>
                    <h3>No expenses this week</h3>
                    <p>
                      There are no expenses between{" "}
                      {formatDate(weekStart)} and{" "}
                      {formatDate(weekEnd)}.
                    </p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Category</th>
                          <th>Work</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {weeklyExpenses
                          .sort((a, b) =>
                            String(a.date).localeCompare(
                              String(b.date),
                            ),
                          )
                          .map((expense) => (
                            <tr key={expense.id}>
                              <td>
                                {formatDate(expense.date)}
                              </td>

                              <td>
                                {expense.description}
                              </td>

                              <td>{expense.category}</td>

                              <td>
                                {expense.steelWorkType ||
                                  expense.workType}
                              </td>

                              <td>
                                <strong>
                                  {money(expense.total)}
                                </strong>
                              </td>

                              <td>
                                <span
                                  className={`status ${
                                    expense.paymentStatus ===
                                    "Pending"
                                      ? "pending"
                                      : "paid"
                                  }`}
                                >
                                  {expense.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage === "Settings" && (
            <section className="page-section settings-section">
              <div className="settings-card">
                <div className="settings-icon">⌂</div>

                <div className="settings-card-heading">
                  <h3>Project</h3>
                  <p>
                    Update your renovation project details.
                  </p>
                </div>

                <div className="settings-fields">
                  <label className="field">
                    <span>Project name</span>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(event) =>
                        setProjectName(event.target.value)
                      }
                    />
                  </label>

                  <label className="field">
                    <span>Current stage</span>
                    <select
                      value={projectStage}
                      onChange={(event) =>
                        setProjectStage(event.target.value)
                      }
                    >
                      {PROJECT_STAGES.map((stage) => (
                        <option
                          key={stage}
                          value={stage}
                        >
                          {stage}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Total budget</span>

                    <div className="input-prefix">
                      <span>₹</span>

                      <input
                        type="number"
                        min="0"
                        value={budget}
                        onChange={(event) =>
                          setBudget(
                            Number(event.target.value),
                          )
                        }
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-icon">☾</div>

                <div className="settings-card-heading">
                  <h3>Appearance</h3>
                  <p>
                    Customize how RENOVA looks on your
                    device.
                  </p>
                </div>

                <div className="settings-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      setDarkMode((value) => !value)
                    }
                  >
                    {darkMode
                      ? "☀ Switch to light mode"
                      : "☾ Switch to dark mode"}
                  </button>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-icon">↓</div>

                <div className="settings-card-heading">
                  <h3>Data & Backup</h3>
                  <p>
                    Backup your RENOVA data or restore a
                    previous backup.
                  </p>
                </div>

                <div className="settings-actions">
                  <button
                    className="secondary-button"
                    onClick={backupData}
                  >
                    ↓ Backup JSON
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      restoreInputRef.current?.click()
                    }
                  >
                    ↑ Restore Backup
                  </button>

                  <input
                    ref={restoreInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden-file-input"
                    onChange={restoreData}
                  />

                  <button
                    className="secondary-button"
                    onClick={() =>
                      exportCSV(expenses)
                    }
                  >
                    ↓ Export CSV
                  </button>

                  <button
                    className="secondary-button"
                    onClick={printReport}
                  >
                    ⎙ Print
                  </button>
                </div>

                <div className="data-note">
                  Restore replaces the current project
                  data and automatically refreshes RENOVA
                  after a successful restore.
                </div>
              </div>

              <div className="settings-card danger-card">
                <div className="settings-icon">!</div>

                <div className="settings-card-heading">
                  <h3>Reset project</h3>
                  <p>
                    Permanently remove all local
                    renovation data.
                  </p>
                </div>

                <div className="settings-actions">
                  <button
                    className="danger-button"
                    onClick={resetAllData}
                  >
                    Reset all data
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;