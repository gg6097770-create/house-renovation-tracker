import { useEffect, useMemo, useState } from "react";
import "./App.css";

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

const CATEGORIES = [
  "Labour",
  "Materials",
  "Machine Rental",
  "Travel / Transport",
  "Food / Beverage",
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

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  category: "Labour",
  workType: "Mason",
  person: "",
  steelWorkType: "Basement Steel",
  description: "",
  workers: 1,
  quantity: 1,
  unit: "day",
  rate: 0,
  total: 0,
  paymentStatus: "Paid",
  notes: "",
};

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMonday(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function getSaturday(dateString) {
  const monday = new Date(`${getMonday(dateString)}T00:00:00`);
  monday.setDate(monday.getDate() + 5);
  return monday.toISOString().slice(0, 10);
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [expenses, setExpenses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("renovationExpenses")) || [];
    } catch {
      return [];
    }
  });

  const [budget, setBudget] = useState(() => {
    return Number(localStorage.getItem("renovationBudget")) || 0;
  });

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterDate, setFilterDate] = useState(todayString());
  const [search, setSearch] = useState("");
  const [reportWeek, setReportWeek] = useState(todayString());

  useEffect(() => {
    localStorage.setItem("renovationExpenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("renovationBudget", budget);
  }, [budget]);

  const todayExpenses = useMemo(
    () => expenses.filter((item) => item.date === todayString()),
    [expenses]
  );

  const todayTotal = todayExpenses.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  const todayPending = todayExpenses
    .filter((item) => item.paymentStatus === "Pending")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);

  const todayPaid = todayExpenses
    .filter((item) => item.paymentStatus === "Paid")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);

  const overallTotal = expenses.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  const overallPending = expenses
    .filter((item) => item.paymentStatus === "Pending")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);

  const categoryTotals = CATEGORIES.map((category) => ({
    category,
    total: expenses
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + Number(item.total || 0), 0),
  }));

  const todayCategoryTotals = CATEGORIES.map((category) => ({
    category,
    total: todayExpenses
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + Number(item.total || 0), 0),
  }));

  const filteredExpenses = expenses
    .filter((item) => !filterDate || item.date === filterDate)
    .filter((item) => {
      const text = `${item.person} ${item.description} ${item.workType} ${item.category} ${item.steelWorkType}`;
      return text.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const weekStart = getMonday(reportWeek);
  const weekEnd = getSaturday(reportWeek);

  const weeklyExpenses = expenses.filter(
    (item) => item.date >= weekStart && item.date <= weekEnd
  );

  const weeklyTotal = weeklyExpenses.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  const weeklyPaid = weeklyExpenses
    .filter((item) => item.paymentStatus === "Paid")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);

  const weeklyPending = weeklyExpenses
    .filter((item) => item.paymentStatus === "Pending")
    .reduce((sum, item) => sum + Number(item.total || 0), 0);

  const labourSummary = WORK_TYPES.map((type) => ({
    type,
    total: weeklyExpenses
      .filter((item) => item.category === "Labour" && item.workType === type)
      .reduce((sum, item) => sum + Number(item.total || 0), 0),
    workers: weeklyExpenses
      .filter((item) => item.category === "Labour" && item.workType === type)
      .reduce((sum, item) => sum + Number(item.workers || 0), 0),
  })).filter((item) => item.total > 0);

  const weekCategorySummary = CATEGORIES.map((category) => ({
    category,
    total: weeklyExpenses
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + Number(item.total || 0), 0),
  })).filter((item) => item.total > 0);

  const steelSummary = weeklyExpenses
    .filter(
      (item) =>
        item.category === "Labour" &&
        item.workType === "Steel / Iron Worker"
    )
    .reduce(
      (acc, item) => {
        acc[item.steelWorkType || "Other Steel Work"] =
          (acc[item.steelWorkType || "Other Steel Work"] || 0) +
          Number(item.total || 0);
        return acc;
      },
      {}
    );

  function updateForm(field, value) {
    setForm((previous) => {
      const next = { ...previous, [field]: value };

      if (field === "quantity" || field === "rate") {
        next.total =
          Number(field === "quantity" ? value : previous.quantity || 0) *
          Number(field === "rate" ? value : previous.rate || 0);
      }

      return next;
    });
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      date: todayString(),
    });
    setEditingId(null);
  }

  function saveExpense(event) {
    event.preventDefault();

    const quantity = Number(form.quantity || 0);
    const rate = Number(form.rate || 0);

    if (quantity <= 0 || rate < 0) {
      alert("Please enter a valid quantity and rate.");
      return;
    }

    const expense = {
      ...form,
      id: editingId || Date.now(),
      quantity,
      rate,
      total: quantity * rate,
      workers: Number(form.workers || 0),
    };

    if (editingId) {
      setExpenses((previous) =>
        previous.map((item) => (item.id === editingId ? expense : item))
      );
    } else {
      setExpenses((previous) => [...previous, expense]);
    }

    resetForm();
    setActivePage("dashboard");
  }

  function editExpense(item) {
    setForm(item);
    setEditingId(item.id);
    setActivePage("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteExpense(id) {
    if (!window.confirm("Delete this expense?")) return;
    setExpenses((previous) => previous.filter((item) => item.id !== id));
  }

  function togglePayment(id) {
    setExpenses((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              paymentStatus:
                item.paymentStatus === "Paid" ? "Pending" : "Paid",
            }
          : item
      )
    );
  }

  function exportCSV() {
    const headers = [
      "Date",
      "Category",
      "Work Type",
      "Person / Team",
      "Steel Work",
      "Description",
      "Workers",
      "Quantity",
      "Unit",
      "Rate",
      "Total",
      "Payment Status",
      "Notes",
    ];

    const rows = expenses.map((item) => [
      item.date,
      item.category,
      item.workType,
      item.person,
      item.steelWorkType || "",
      item.description,
      item.workers,
      item.quantity,
      item.unit,
      item.rate,
      item.total,
      item.paymentStatus,
      item.notes,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `house-renovation-expenses-${todayString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  function createEmailReport() {
    const subject = `House Renovation Weekly Report - ${weekStart} to ${weekEnd}`;

    const body = `
HOUSE RENOVATION WEEKLY REPORT

Period: ${formatDate(weekStart)} - ${formatDate(weekEnd)}

TOTAL: ${money(weeklyTotal)}
PAID: ${money(weeklyPaid)}
PENDING: ${money(weeklyPending)}

LABOUR:
${labourSummary
  .map(
    (item) =>
      `${item.type}: ${money(item.total)} | Workers: ${item.workers}`
  )
  .join("\n")}

CATEGORIES:
${weekCategorySummary
  .map((item) => `${item.category}: ${money(item.total)}`)
  .join("\n")}

STEEL / IRON:
${Object.entries(steelSummary)
  .map(([name, amount]) => `${name}: ${money(amount)}`)
  .join("\n")}

Generated by House Renovation Expense Tracker.
`;

    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  function shareWhatsApp() {
    const text = `
HOUSE RENOVATION WEEKLY REPORT

${formatDate(weekStart)} - ${formatDate(weekEnd)}

Total: ${money(weeklyTotal)}
Paid: ${money(weeklyPaid)}
Pending: ${money(weeklyPending)}

Labour:
${labourSummary
  .map((item) => `${item.type}: ${money(item.total)}`)
  .join("\n")}

Categories:
${weekCategorySummary
  .map((item) => `${item.category}: ${money(item.total)}`)
  .join("\n")}
`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  function shareSMS() {
    const text = `House Renovation Report ${formatDate(
      weekStart
    )}-${formatDate(weekEnd)} | Total ${money(
      weeklyTotal
    )} | Paid ${money(weeklyPaid)} | Pending ${money(weeklyPending)}`;

    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  }

  function setQuickCategory(category) {
    setForm({
      ...emptyForm,
      date: todayString(),
      category,
      workType: category === "Labour" ? "Mason" : "Mason",
      unit:
        category === "Labour"
          ? "day"
          : category === "Machine Rental"
          ? "day"
          : "unit",
    });

    setEditingId(null);
    setActivePage("add");
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">
            <span className="brand-icon">🏠</span>
            <div>
              <h1>House Renovation</h1>
              <p>Expense & Work Tracker</p>
            </div>
          </div>
        </div>

        <div className="top-date">
          <span>Today</span>
          <strong>{formatDate(todayString())}</strong>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <button
            className={activePage === "dashboard" ? "nav active" : "nav"}
            onClick={() => setActivePage("dashboard")}
          >
            <span>📊</span> Dashboard
          </button>

          <button
            className={activePage === "add" ? "nav active" : "nav"}
            onClick={() => setActivePage("add")}
          >
            <span>➕</span> Add Expense
          </button>

          <button
            className={activePage === "history" ? "nav active" : "nav"}
            onClick={() => setActivePage("history")}
          >
            <span>📋</span> Daily History
          </button>

          <button
            className={activePage === "reports" ? "nav active" : "nav"}
            onClick={() => setActivePage("reports")}
          >
            <span>📈</span> Weekly Report
          </button>

          <button
            className={activePage === "settings" ? "nav active" : "nav"}
            onClick={() => setActivePage("settings")}
          >
            <span>⚙️</span> Settings
          </button>

          <div className="sidebar-bottom">
            <div className="budget-mini">
              <span>Overall Budget</span>
              <strong>{budget ? money(budget) : "Not set"}</strong>
            </div>
          </div>
        </aside>

        <main className="content">
          {activePage === "dashboard" && (
            <>
              <section className="welcome">
                <div>
                  <span className="eyebrow">HOUSE RENOVATION</span>
                  <h2>Today's Spending</h2>
                  <p>Track everything spent on your house work today.</p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => {
                    resetForm();
                    setActivePage("add");
                  }}
                >
                  + Add Today's Expense
                </button>
              </section>

              <section className="stats-grid">
                <div className="stat-card main-stat">
                  <span>Today's Spending</span>
                  <strong>{money(todayTotal)}</strong>
                  <small>{todayExpenses.length} entries</small>
                </div>

                <div className="stat-card">
                  <span>Paid Today</span>
                  <strong>{money(todayPaid)}</strong>
                  <small>Completed payments</small>
                </div>

                <div className="stat-card pending-card">
                  <span>Pending Today</span>
                  <strong>{money(todayPending)}</strong>
                  <small>Amount to pay</small>
                </div>

                <div className="stat-card">
                  <span>Overall Spending</span>
                  <strong>{money(overallTotal)}</strong>
                  <small>All recorded expenses</small>
                </div>
              </section>

              <section className="section-title">
                <div>
                  <h3>Quick Add</h3>
                  <p>Choose what you spent money on today.</p>
                </div>
              </section>

              <section className="quick-grid">
                {[
                  ["Labour", "👷", "Masons, workers & professionals"],
                  ["Materials", "🧱", "Bricks, cement, sand, steel..."],
                  ["Machine Rental", "🚜", "Mixer, JCB, cutting machine..."],
                  ["Travel / Transport", "🚚", "Auto, lorry, fuel, transport"],
                  ["Food / Beverage", "🍛", "Food, tea, water, drinks"],
                  ["Other", "📦", "Anything else"],
                ].map(([category, icon, description]) => (
                  <button
                    key={category}
                    className="quick-card"
                    onClick={() => setQuickCategory(category)}
                  >
                    <span className="quick-icon">{icon}</span>
                    <strong>{category}</strong>
                    <small>{description}</small>
                  </button>
                ))}
              </section>

              <section className="section-title">
                <div>
                  <h3>Today's Breakdown</h3>
                  <p>Where today's money is going.</p>
                </div>
              </section>

              <section className="breakdown-grid">
                {todayCategoryTotals.map((item) => (
                  <div className="breakdown-card" key={item.category}>
                    <span>{item.category}</span>
                    <strong>{money(item.total)}</strong>
                    <div className="progress">
                      <div
                        style={{
                          width:
                            todayTotal > 0
                              ? `${Math.min(
                                  (item.total / todayTotal) * 100,
                                  100
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </section>

              <section className="recent-section">
                <div className="section-title">
                  <div>
                    <h3>Today's Entries</h3>
                    <p>Latest renovation expenses.</p>
                  </div>
                  <button
                    className="text-btn"
                    onClick={() => setActivePage("history")}
                  >
                    View All →
                  </button>
                </div>

                {todayExpenses.length === 0 ? (
                  <div className="empty">
                    <div>🧾</div>
                    <h3>No expenses recorded today</h3>
                    <p>Start by adding today's labour, materials or other costs.</p>
                  </div>
                ) : (
                  <div className="table-card">
                    <ExpenseTable
                      items={todayExpenses}
                      onEdit={editExpense}
                      onDelete={deleteExpense}
                      onTogglePayment={togglePayment}
                    />
                  </div>
                )}
              </section>
            </>
          )}

          {activePage === "add" && (
            <section>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">EXPENSE ENTRY</span>
                  <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>
                  <p>Record exactly what you spent and who performed the work.</p>
                </div>
              </div>

              <form className="form-card" onSubmit={saveExpense}>
                <div className="form-section">
                  <h3>Basic Information</h3>

                  <div className="form-grid">
                    <label>
                      Date
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => updateForm("date", e.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Category
                      <select
                        value={form.category}
                        onChange={(e) =>
                          updateForm("category", e.target.value)
                        }
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                    </label>

                    {form.category === "Labour" && (
                      <label>
                        Work Type
                        <select
                          value={form.workType}
                          onChange={(e) =>
                            updateForm("workType", e.target.value)
                          }
                        >
                          {WORK_TYPES.map((type) => (
                            <option key={type}>{type}</option>
                          ))}
                        </select>
                      </label>
                    )}

                    <label>
                      Person / Team Name
                      <input
                        type="text"
                        placeholder="Example: Kumar Steel Team"
                        value={form.person}
                        onChange={(e) =>
                          updateForm("person", e.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>

                {form.category === "Labour" &&
                  form.workType === "Steel / Iron Worker" && (
                    <div className="steel-box">
                      <div className="steel-heading">
                        <span>🔩</span>
                        <div>
                          <h3>Steel / Iron Work</h3>
                          <p>Record exactly which steel work is being done.</p>
                        </div>
                      </div>

                      <label>
                        Steel Work Type
                        <select
                          value={form.steelWorkType}
                          onChange={(e) =>
                            updateForm("steelWorkType", e.target.value)
                          }
                        >
                          {STEEL_WORK_TYPES.map((type) => (
                            <option key={type}>{type}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                <div className="form-section">
                  <h3>Work / Expense Details</h3>

                  <div className="form-grid">
                    <label className="wide">
                      Description
                      <input
                        type="text"
                        placeholder="Example: Basement reinforcement steel work"
                        value={form.description}
                        onChange={(e) =>
                          updateForm("description", e.target.value)
                        }
                      />
                    </label>

                    {form.category === "Labour" && (
                      <label>
                        Number of Workers
                        <input
                          type="number"
                          min="0"
                          value={form.workers}
                          onChange={(e) =>
                            updateForm("workers", e.target.value)
                          }
                        />
                      </label>
                    )}

                    <label>
                      Quantity
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.quantity}
                        onChange={(e) =>
                          updateForm("quantity", e.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Unit
                      <select
                        value={form.unit}
                        onChange={(e) => updateForm("unit", e.target.value)}
                      >
                        <option>day</option>
                        <option>hour</option>
                        <option>kg</option>
                        <option>ton</option>
                        <option>piece</option>
                        <option>load</option>
                        <option>bag</option>
                        <option>trip</option>
                        <option>unit</option>
                        <option>other</option>
                      </select>
                    </label>

                    <label>
                      Rate
                      <div className="input-prefix">
                        <span>₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.rate}
                          onChange={(e) =>
                            updateForm("rate", e.target.value)
                          }
                          required
                        />
                      </div>
                    </label>

                    <div className="calculated">
                      <span>Total Amount</span>
                      <strong>
                        {money(Number(form.quantity) * Number(form.rate))}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Payment</h3>

                  <div className="payment-options">
                    <button
                      type="button"
                      className={
                        form.paymentStatus === "Paid"
                          ? "payment active paid"
                          : "payment"
                      }
                      onClick={() => updateForm("paymentStatus", "Paid")}
                    >
                      ✓ Paid
                    </button>

                    <button
                      type="button"
                      className={
                        form.paymentStatus === "Pending"
                          ? "payment active pending"
                          : "payment"
                      }
                      onClick={() =>
                        updateForm("paymentStatus", "Pending")
                      }
                    >
                      ⏳ Pending
                    </button>
                  </div>

                  <label>
                    Notes
                    <textarea
                      placeholder="Any additional information..."
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      resetForm();
                      setActivePage("dashboard");
                    }}
                  >
                    Cancel
                  </button>

                  <button className="primary-btn" type="submit">
                    {editingId ? "Update Expense" : "Save Expense"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activePage === "history" && (
            <section>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">RECORDS</span>
                  <h2>Daily Expense History</h2>
                  <p>View, edit and manage your renovation spending.</p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => {
                    resetForm();
                    setActivePage("add");
                  }}
                >
                  + Add Expense
                </button>
              </div>

              <div className="filters">
                <label>
                  Date
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </label>

                <label className="search-field">
                  Search
                  <input
                    type="text"
                    placeholder="Person, material, work..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>

                <button
                  className="secondary-btn filter-clear"
                  onClick={() => {
                    setFilterDate("");
                    setSearch("");
                  }}
                >
                  Clear Filters
                </button>
              </div>

              <div className="history-summary">
                <div>
                  <span>Showing</span>
                  <strong>{filteredExpenses.length} entries</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>
                    {money(
                      filteredExpenses.reduce(
                        (sum, item) => sum + Number(item.total || 0),
                        0
                      )
                    )}
                  </strong>
                </div>
              </div>

              <div className="table-card">
                {filteredExpenses.length === 0 ? (
                  <div className="empty">
                    <div>🔎</div>
                    <h3>No matching expenses</h3>
                    <p>Try another date or search term.</p>
                  </div>
                ) : (
                  <ExpenseTable
                    items={filteredExpenses}
                    onEdit={editExpense}
                    onDelete={deleteExpense}
                    onTogglePayment={togglePayment}
                  />
                )}
              </div>
            </section>
          )}

          {activePage === "reports" && (
            <section className="report-page">
              <div className="page-heading">
                <div>
                  <span className="eyebrow">WEEKLY REPORT</span>
                  <h2>Monday → Saturday</h2>
                  <p>
                    Your weekly renovation spending report, including labour,
                    materials and payments.
                  </p>
                </div>

                <div className="report-actions">
                  <button className="secondary-btn" onClick={printReport}>
                    🖨 Print / PDF
                  </button>
                  <button className="secondary-btn" onClick={exportCSV}>
                    📊 Excel / CSV
                  </button>
                </div>
              </div>

              <div className="week-selector">
                <label>
                  Select any date in the week
                  <input
                    type="date"
                    value={reportWeek}
                    onChange={(e) => setReportWeek(e.target.value)}
                  />
                </label>

                <div className="week-range">
                  {formatDate(weekStart)} → {formatDate(weekEnd)}
                </div>
              </div>

              <div className="report-total">
                <div>
                  <span>WEEKLY TOTAL</span>
                  <strong>{money(weeklyTotal)}</strong>
                </div>
                <div>
                  <span>PAID</span>
                  <strong>{money(weeklyPaid)}</strong>
                </div>
                <div>
                  <span>PENDING</span>
                  <strong>{money(weeklyPending)}</strong>
                </div>
              </div>

              <div className="report-grid">
                <div className="report-card">
                  <div className="report-card-heading">
                    <h3>Labour Summary</h3>
                    <span>Monday - Saturday</span>
                  </div>

                  {labourSummary.length === 0 ? (
                    <p className="muted">No labour expenses this week.</p>
                  ) : (
                    <div className="summary-list">
                      {labourSummary.map((item) => (
                        <div className="summary-row" key={item.type}>
                          <div>
                            <strong>{item.type}</strong>
                            <small>{item.workers} worker entries</small>
                          </div>
                          <strong>{money(item.total)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="report-card">
                  <div className="report-card-heading">
                    <h3>Expense Categories</h3>
                    <span>Weekly</span>
                  </div>

                  {weekCategorySummary.length === 0 ? (
                    <p className="muted">No expenses this week.</p>
                  ) : (
                    <div className="summary-list">
                      {weekCategorySummary.map((item) => (
                        <div className="summary-row" key={item.category}>
                          <strong>{item.category}</strong>
                          <strong>{money(item.total)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="report-card steel-report">
                <div className="report-card-heading">
                  <div>
                    <h3>🔩 Steel / Iron Work</h3>
                    <span>Basement, foundation, belt, columns, roof etc.</span>
                  </div>
                </div>

                {Object.keys(steelSummary).length === 0 ? (
                  <p className="muted">No steel/iron work recorded this week.</p>
                ) : (
                  <div className="steel-summary-grid">
                    {Object.entries(steelSummary).map(([work, amount]) => (
                      <div key={work}>
                        <span>{work}</span>
                        <strong>{money(amount)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="report-card">
                <div className="report-card-heading">
                  <h3>Weekly Entries</h3>
                  <span>{weeklyExpenses.length} records</span>
                </div>

                {weeklyExpenses.length === 0 ? (
                  <p className="muted">No records for this week.</p>
                ) : (
                  <ExpenseTable
                    items={weeklyExpenses}
                    onEdit={editExpense}
                    onDelete={deleteExpense}
                    onTogglePayment={togglePayment}
                  />
                )}
              </div>

              <div className="communication-actions">
                <button className="primary-btn" onClick={createEmailReport}>
                  ✉️ Email Report
                </button>

                <button className="whatsapp-btn" onClick={shareWhatsApp}>
                  WhatsApp
                </button>

                <button className="sms-btn" onClick={shareSMS}>
                  SMS
                </button>
              </div>

              <div className="automation-note">
                <strong>Saturday report automation</strong>
                <p>
                  The report screen is ready for Email, WhatsApp, SMS, PDF and
                  Excel. Automatic Saturday-morning sending will require a
                  small backend/automation service so it can run even when
                  your PC/browser is closed.
                </p>
              </div>
            </section>
          )}

          {activePage === "settings" && (
            <section>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">SETTINGS</span>
                  <h2>Renovation Settings</h2>
                  <p>Configure your project budget and manage your data.</p>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <span className="settings-icon">💰</span>
                  <h3>Overall Budget</h3>
                  <p>
                    Set your planned total renovation budget to compare actual
                    spending.
                  </p>

                  <div className="input-prefix">
                    <span>₹</span>
                    <input
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                    />
                  </div>

                  <div className="budget-status">
                    <span>Spent</span>
                    <strong>{money(overallTotal)}</strong>

                    <span>Remaining</span>
                    <strong>
                      {budget > 0
                        ? money(Math.max(budget - overallTotal, 0))
                        : "—"}
                    </strong>
                  </div>
                </div>

                <div className="settings-card">
                  <span className="settings-icon">📊</span>
                  <h3>Data Export</h3>
                  <p>Download all your renovation expenses as an Excel-compatible CSV file.</p>

                  <button className="secondary-btn" onClick={exportCSV}>
                    Download Excel / CSV
                  </button>

                  <button className="secondary-btn" onClick={printReport}>
                    Print Current Report
                  </button>
                </div>

                <div className="settings-card danger-card">
                  <span className="settings-icon">⚠️</span>
                  <h3>Reset Data</h3>
                  <p>
                    This removes all saved renovation expenses from this
                    browser.
                  </p>

                  <button
                    className="danger-btn"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure? All renovation expenses will be deleted."
                        )
                      ) {
                        setExpenses([]);
                      }
                    }}
                  >
                    Delete All Expenses
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function ExpenseTable({
  items,
  onEdit,
  onDelete,
  onTogglePayment,
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Work / Category</th>
            <th>Person / Team</th>
            <th>Details</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {[...items]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.date)}</td>

                <td>
                  <div className="table-main">
                    <strong>
                      {item.category === "Labour"
                        ? item.workType
                        : item.category}
                    </strong>

                    {item.workType === "Steel / Iron Worker" && (
                      <small className="steel-label">
                        🔩 {item.steelWorkType}
                      </small>
                    )}
                  </div>
                </td>

                <td>{item.person || "—"}</td>

                <td>
                  <div className="table-main">
                    <span>{item.description || "—"}</span>
                    {item.workers > 0 && item.category === "Labour" && (
                      <small>{item.workers} workers</small>
                    )}
                  </div>
                </td>

                <td>
                  {item.quantity} {item.unit}
                </td>

                <td>{money(item.rate)}</td>

                <td>
                  <strong>{money(item.total)}</strong>
                </td>

                <td>
                  <button
                    className={
                      item.paymentStatus === "Paid"
                        ? "status paid"
                        : "status pending"
                    }
                    onClick={() => onTogglePayment(item.id)}
                    title="Click to change payment status"
                  >
                    {item.paymentStatus === "Paid" ? "✓ Paid" : "⏳ Pending"}
                  </button>
                </td>

                <td>
                  <div className="table-actions">
                    <button onClick={() => onEdit(item)} title="Edit">
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;