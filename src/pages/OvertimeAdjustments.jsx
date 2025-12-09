// src/pages/OvertimeAdjustments.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiPost } from "../services/api";

// ---- Static grades shown in UI (no backend call needed)
const STATIC_GRADES = [
  { grade_id: 1, grade_name: "A" },
  { grade_id: 2, grade_name: "B" },
  { grade_id: 3, grade_name: "C" },
];

export default function OvertimeAdjustments() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ================== Grade-first (STATIC) ================== */
  const grades = STATIC_GRADES;
  const [gradeId, setGradeId] = useState("");
  const [uiDisabled, setUiDisabled] = useState(true);

  const selectedGradeName = useMemo(
    () => grades.find((g) => String(g.grade_id) === String(gradeId))?.grade_name || "",
    [grades, gradeId]
  );

  /* ================== Grade rules overview cards ================== */
  const [rulesOverview, setRulesOverview] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const ids = [1, 2, 3];
        const out = [];
        for (const id of ids) {
          const r = await apiGet(`/salary/overtime/rules/${id}`);
          out.push({
            grade_id: id,
            grade_name: ["A", "B", "C"][id - 1],
            ot_rate: r?.ot_rate ?? null,
            max_ot_hours: r?.max_ot_hours ?? null,
            created_at: r?.created_at || null,
          });
        }
        setRulesOverview(out);
      } catch {
        setRulesOverview([]);
      }
    })();
  }, []);

  /* ================== Rules ================== */
  const [rules, setRules] = useState({
    weekdayRate: "",
    weekendRate: "2",
    holidayRate: "2.5",
    maxHours: "",
    effective: "",
  });
  const [savingRule, setSavingRule] = useState(false);
  const onRuleChange = (e) => setRules((r) => ({ ...r, [e.target.name]: e.target.value }));

  const loadRule = async (gid) => {
    if (!gid) return;
    try {
      const data = await apiGet(`/salary/overtime/rules/${gid}`);
      setRules((cur) => ({
        ...cur,
        weekdayRate: data?.ot_rate ?? "",
        maxHours: data?.max_ot_hours ?? "",
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const onPickGrade = async (gid) => {
    setGradeId(gid);
    const enabled = !!gid;
    setUiDisabled(!enabled);
    if (enabled) {
      await loadRule(gid);
      await refreshEntries(gid);
      await loadEmployeesForGrade(gid); // also feeds search
    } else {
      setEntries([]);
      setGradeEmployees([]);
    }
  };

  const saveRule = async () => {
    if (!gradeId) return window.alert("Select a grade first.");
    if (rules.weekdayRate === "" || rules.maxHours === "") {
      return window.alert("Weekday rate and monthly OT cap are required.");
    }
    setSavingRule(true);
    try {
      await apiPost("/salary/overtime/rules", {
        grade_id: Number(gradeId),
        ot_rate: Number(rules.weekdayRate),
        max_ot_hours: Number(rules.maxHours),
      });
      window.alert("Overtime rule saved.");
      await loadRule(gradeId);

      // update overview card for this grade
      setRulesOverview((old) => {
        const idx = old.findIndex((x) => Number(x.grade_id) === Number(gradeId));
        const next = [...old];
        const now = new Date().toISOString();
        const updated = {
          grade_id: Number(gradeId),
          grade_name: selectedGradeName || `#${gradeId}`,
          ot_rate: Number(rules.weekdayRate),
          max_ot_hours: Number(rules.maxHours),
          created_at: now,
        };
        if (idx >= 0) next[idx] = updated;
        else next.push(updated);
        return next;
      });
    } catch (e) {
      console.error(e);
      window.alert(e.message || "Failed to save rule");
    } finally {
      setSavingRule(false);
    }
  };

  /* ================== Manual Adjustment ================== */
  const [empQuery, setEmpQuery] = useState("");
  const [empResults, setEmpResults] = useState([]);
  const [empSelected, setEmpSelected] = useState(null);
  const [otDate, setOtDate] = useState("");
  const [otHours, setOtHours] = useState("");
  const [otType, setOtType] = useState("weekday");
  const [otReason, setOtReason] = useState("");
  const [savingAdj, setSavingAdj] = useState(false);
  const searchTimer = useRef(null);

  // we use server rules for weekday base, then UI multipliers for weekend/holiday
  const multipliers = useMemo(
    () => ({
      weekday: 1,
      weekend: Number(rules.weekendRate || 2),
      holiday: Number(rules.holidayRate || 2.5),
    }),
    [rules.weekendRate, rules.holidayRate]
  );

  // ====== Employee data source for search & "Employees in grade" table
  const [allEmployees, setAllEmployees] = useState([]); // cache
  const [gradeEmployees, setGradeEmployees] = useState([]); // filtered
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const loadEmployeesForGrade = async (gid) => {
    setLoadingEmployees(true);
    try {
      // one endpoint already used elsewhere that returns joined department name:
      const data = await apiGet("/employees"); // { ok:true, data: [...] }
      const all = Array.isArray(data?.data) ? data.data : [];
      setAllEmployees(all);
      setGradeEmployees(all.filter((e) => Number(e.grade_id) === Number(gid)));
      // also seed search results with top 10 from the selected grade
      setEmpResults(
        all
          .filter((e) => Number(e.grade_id) === Number(gid))
          .slice(0, 10)
          .map(toSearchRow)
      );
    } catch (e) {
      console.error(e);
      setAllEmployees([]);
      setGradeEmployees([]);
      setEmpResults([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // convert "employees" list row -> search row (same shape as old /salary/employees/search)
  const toSearchRow = (e) => ({
    employee_id: e.id,
    full_name: e.full_name,
    grade_id: e.grade_id,
    grade_name: STATIC_GRADES.find((g) => Number(g.grade_id) === Number(e.grade_id))?.grade_name || "",
    department_name: e.department_name || "",
  });

  // new search: filter client-side over cached employees by name / id / department
  const runLocalSearch = (term) => {
    const q = term.trim().toLowerCase();
    let base = allEmployees;
    if (gradeId) base = base.filter((e) => Number(e.grade_id) === Number(gradeId)); // limit by selected grade

    if (!q) {
      setEmpResults(base.slice(0, 10).map(toSearchRow));
      return;
    }
    const out = base
      .filter((e) => {
        const byName = (e.full_name || "").toLowerCase().includes(q);
        const byId = String(e.id).includes(q);
        const byDept = (e.department_name || "").toLowerCase().includes(q);
        return byName || byId || byDept;
      })
      .slice(0, 25);
    setEmpResults(out.map(toSearchRow));
  };

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => runLocalSearch(empQuery), 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empQuery]);

  const submitAdjustment = async () => {
    if (!gradeId) return window.alert("Select a grade first.");
    if (!empSelected?.employee_id) return window.alert("Pick an employee.");
    if (otHours === "") return window.alert("Enter OT hours.");
    if (rules.weekdayRate === "") return window.alert("Weekday rate is required to compute OT rate.");

    const base = Number(rules.weekdayRate);
    const rate = base * (multipliers[otType] || 1);

    setSavingAdj(true);
    try {
      await apiPost("/salary/overtime/adjustments", {
        employee_id: Number(empSelected.employee_id),
        grade_id: Number(gradeId),
        ot_hours: Number(otHours),
        ot_rate: Number(rate.toFixed(2)),
        adjustment_reason: otReason || null,
      });
      window.alert("Overtime adjustment saved.");
      setOtHours("");
      setOtReason("");
      setOtType("weekday");
      setEmpQuery("");
      setEmpSelected(null);
      await refreshEntries(gradeId);
    } catch (e) {
      console.error(e);
      window.alert(e.message || "Failed to save adjustment");
    } finally {
      setSavingAdj(false);
    }
  };

  /* ================== Entries table ================== */
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const refreshEntries = async (gid = gradeId) => {
    if (!gid) return;
    setLoadingEntries(true);
    try {
      const qs = new URLSearchParams();
      if (dateFrom) qs.set("from", dateFrom);
      if (dateTo) qs.set("to", dateTo);
      const data = await apiGet(`/salary/overtime/adjustments/grade/${gid}${qs.toString() ? `?${qs}` : ""}`);
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      window.alert("Failed to load overtime entries");
    } finally {
      setLoadingEntries(false);
    }
  };

  const amountFmt = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader breadcrumb={["Salary & Compensation", "Overtime & Adjustments"]} title="Salary & Compensation" />

      {/* Fixed Tabs Section */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "var(--bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="card"
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            marginBottom: 0,
            borderRadius: "0",
          }}
        >
          {[
            { label: "Earnings", path: "/earnings" },
            { label: "Deductions", path: "/deductions" },
            { label: "Allowances", path: "/allowances" },
            { label: "Overtime & Adjustments", path: "/overtime-adjustments" },
            { label: "Compensation Adjustment", path: "/compensation-adjustment" },
            { label: "ETF & EPF", path: "/etf-epf" },
            { label: "ETF/EPF Process", path: "/etf-epf-process" },
            { label: "Unpaid Leaves", path: "/unpaid-leaves" },
            { label: "Net Salary Summary", path: "/net-salary-summary" },
          ].map((t) => (
            <button
              key={t.path}
              className={`btn ${location.pathname === t.path ? "btn-primary" : "btn-soft"}`}
              onClick={() => navigate(t.path)}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Grade Selector Card */}
        <div className="card">
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ minWidth: "260px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Select Grade (required)
              </label>
              <select className="select" value={gradeId} onChange={(e) => onPickGrade(e.target.value)}>
                <option value="">-- choose grade --</option>
                {grades.map((g) => (
                  <option key={g.grade_id} value={g.grade_id}>
                    {g.grade_name} (#{g.grade_id})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              Current: <strong>{selectedGradeName || "-"}</strong>
            </div>
          </div>
        </div>

        {/* Grade Rules Overview Cards */}
        <div className="card">
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>Grade Rules Overview</h3>
          <div className="grid-3" style={{ gap: "16px" }}>
            {rulesOverview.map((r) => (
              <div key={r.grade_id} className="card" style={{ background: "var(--soft)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", margin: 0 }}>Grade {r.grade_name}</h4>
                  <span className="pill pill-ok">
                    {r.created_at ? formatDate(r.created_at) : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>Weekday rate</div>
                  <div style={{ fontWeight: "700", color: "#111" }}>{r.ot_rate ?? "—"}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>Monthly cap (hrs)</div>
                  <div style={{ fontWeight: "700", color: "#111" }}>{r.max_ot_hours ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules + Manual Adjustment */}
        <div className="grid-2" style={{ gap: "16px", margin: "0 24px 16px 24px" }}>
          {/* Overtime Rules Card */}
          <div className="card" style={uiDisabled ? { opacity: 0.6, pointerEvents: "none" } : {}}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>Overtime Rules</h3>
            
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Weekday rate (Rs per hour)
              </label>
              <input
                className="input"
                name="weekdayRate"
                value={rules.weekdayRate}
                onChange={onRuleChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Weekend rate (×)
              </label>
              <input
                className="input"
                name="weekendRate"
                value={rules.weekendRate}
                onChange={onRuleChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Public holiday rate (×)
              </label>
              <input
                className="input"
                name="holidayRate"
                value={rules.holidayRate}
                onChange={onRuleChange}
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Monthly OT cap (hours)
              </label>
              <input
                className="input"
                name="maxHours"
                value={rules.maxHours}
                onChange={onRuleChange}
                type="number"
                step="1"
                min="0"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Effective date
              </label>
              <input type="date" className="input" name="effective" value={rules.effective} onChange={onRuleChange} />
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button className="btn btn-primary" onClick={saveRule} disabled={uiDisabled || savingRule}>
                {savingRule ? "Saving…" : "Save Rules"}
              </button>
              <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                Applies to new entries; weekend/holiday multipliers are UI helpers.
              </div>
            </div>
          </div>

          {/* Manual Adjustment Card */}
          <div className="card" style={uiDisabled ? { opacity: 0.6, pointerEvents: "none" } : {}}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>Manual Adjustment</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
              Search by <strong>Name</strong>, <strong>ID</strong>, or <strong>Department</strong>. Results are limited to the selected grade.
            </p>

            <div className="grid-2" style={{ gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Employee name / code / department
                </label>
                <div style={{ position: "relative" }}>
                  <EmployeeSearch
                    value={empQuery}
                    onChange={(v) => {
                      setEmpSelected(null);
                      setEmpQuery(v);
                    }}
                    results={empResults}
                    onPick={(row) => {
                      setEmpSelected(row);
                      setEmpQuery(`${row.full_name} (#${row.employee_id})`);
                      setEmpResults([]);
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Date
                </label>
                <input className="input" type="date" value={otDate} onChange={(e) => setOtDate(e.target.value)} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Hours
                </label>
                <input
                  className="input"
                  placeholder="e.g., 3.5"
                  value={otHours}
                  onChange={(e) => setOtHours(e.target.value)}
                  type="number"
                  min="0"
                  step="0.25"
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Type
                </label>
                <select className="select" value={otType} onChange={(e) => setOtType(e.target.value)}>
                  <option value="weekday">Weekday (×1)</option>
                  <option value="weekend">Weekend (×{rules.weekendRate || 2})</option>
                  <option value="holiday">Public holiday (×{rules.holidayRate || 2.5})</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Reason / note (optional)
              </label>
              <textarea
                className="input"
                placeholder="Reason / note (optional)"
                value={otReason}
                onChange={(e) => setOtReason(e.target.value)}
                style={{ minHeight: "60px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-primary" onClick={submitAdjustment} disabled={uiDisabled || savingAdj}>
                {savingAdj ? "Saving…" : "Add OT Entry"}
              </button>
              <button className="btn btn-soft" onClick={() => window.alert("CSV import coming soon")}>
                Import CSV
              </button>
            </div>
          </div>
        </div>

        {/* Overtime Entries Table */}
        <div className="table-container">
          <div className="card" style={{ padding: 0 }}>
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: "700" }}>
                Recent Overtime Entries — Grade {selectedGradeName || "-"}
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  className="input"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  style={{ width: "140px" }}
                />
                <input
                  className="input"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  style={{ width: "140px" }}
                />
                <button className="btn btn-soft" onClick={() => refreshEntries()} disabled={loadingEntries}>
                  {loadingEntries ? "Loading…" : "Filter"}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!entries.length) return window.alert("No data to export.");
                    const headers = ["Adjustment ID", "Employee ID", "Employee", "Grade", "Hours", "Rate", "Amount", "Reason", "Created At"];
                    const rows = entries.map((r) => [
                      r.adjustment_id,
                      r.employee_id,
                      r.full_name,
                      r.grade_name || "",
                      r.ot_hours,
                      r.ot_rate,
                      r.ot_amount,
                      r.adjustment_reason || "",
                      r.created_at,
                    ]);
                    const csv = [headers, ...rows]
                      .map((arr) =>
                        arr
                          .map((v) => {
                            const s = String(v ?? "");
                            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
                          })
                          .join(",")
                      )
                      .join("\n");
                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `overtime_grade_${gradeId}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto", flex: 1 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Grade</th>
                    <th>Created</th>
                    <th>Hours</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                        No entries found.
                      </td>
                    </tr>
                  )}
                  {entries.map((r) => (
                    <tr key={r.adjustment_id}>
                      <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="user-avatar" />
                        <div style={{ fontWeight: "600" }}>{r.full_name}</div>
                      </td>
                      <td>
                        <span className="pill pill-ok">{r.grade_name || "-"}</span>
                      </td>
                      <td>{new Date(r.created_at).toLocaleString()}</td>
                      <td>{Number(r.ot_hours)}</td>
                      <td>{amountFmt(r.ot_rate)}</td>
                      <td>{amountFmt(r.ot_amount)}</td>
                      <td>{r.adjustment_reason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Employees in Grade Table */}
        <div className="table-container">
          <div className="card" style={{ padding: 0 }}>
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: "700" }}>Employees in Grade {selectedGradeName || "-"}</div>
            </div>

            <div style={{ overflowX: "auto", flex: 1 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEmployees && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!loadingEmployees && gradeEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                        No employees in this grade.
                      </td>
                    </tr>
                  )}
                  {gradeEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="user-avatar" />
                        <div style={{ fontWeight: "600" }}>{emp.full_name}</div>
                      </td>
                      <td>{emp.department_name || "-"}</td>
                      <td>{emp.designation || "-"}</td>
                      <td>
                        <span className={`pill ${emp.status === "Active" ? "pill-ok" : "pill-warn"}`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Search box with results dropdown (client-side filter by name/id/department)
function EmployeeSearch({ value, onChange, results, onPick }) {
  return (
    <>
      <input
        className="input"
        placeholder="Type name / ID / department…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid var(--border)",
          borderTop: "none",
          zIndex: 5,
          maxHeight: "260px",
          overflowY: "auto",
        }}
      >
        {results.length === 0 && value?.trim() && (
          <div style={{ padding: "10px 12px", fontSize: "12px", color: "var(--muted)" }}>
            No matches. Try a different name, ID, or department.
          </div>
        )}
        {results.map((row) => (
          <div
            key={row.employee_id}
            onClick={() => onPick(row)}
            style={{
              padding: "8px 10px",
              cursor: "pointer",
              borderTop: "1px solid var(--border)",
              fontSize: "13px",
            }}
          >
            <div style={{ fontWeight: "600", color: "#111" }}>{row.full_name}</div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
              #{row.employee_id} • Grade {row.grade_name || "-"} • {row.department_name || "No dept"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}