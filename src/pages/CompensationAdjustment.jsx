// src/pages/CompensationAdjustment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiPost } from "../services/api";

export default function CompensationAdjustment() {
  const navigate = useNavigate();
  const location = useLocation();

  // Adjustment form
  const [adj, setAdj] = useState({
    type: "Bonus",
    mode: "fixed",
    amount: "",
    percent: "",
    month: "",
    note: "",
    category: "Other",
  });

  // Filters + data
  const [q, setQ] = useState("");
  const [departments, setDepartments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [deptId, setDeptId] = useState("");
  const [gradeId, setGradeId] = useState("");

  const [rows, setRows] = useState([]); // employees grid
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Selection
  const [checked, setChecked] = useState({}); // { employee_id: true }
  const selectedIds = useMemo(() => Object.keys(checked).filter((k) => checked[k]).map(Number), [checked]);

  // Preview
  const [preview, setPreview] = useState(null); // { items, total, meta }

  // Load dropdowns once
  useEffect(() => {
    (async () => {
      try {
        const [dJson, gJson] = await Promise.all([
          apiGet("/salary/departments"),
          apiGet("/salary/grades"),
        ]);
        if (dJson?.ok) setDepartments(dJson.data || []);
        setGrades(Array.isArray(gJson) ? gJson : gJson?.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Load employees with filters
  const loadEmployees = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (deptId) params.set("department_id", deptId);
      if (gradeId) params.set("grade_id", gradeId);

      const json = await apiGet(`/salary/employees?${params.toString()}`);
      if (json?.ok) {
        const data = json.data || [];
        setRows(data);
        // keep selection where still visible
        setChecked((prev) => {
          const next = {};
          data.forEach((r) => {
            if (prev[r.employee_id]) next[r.employee_id] = true;
          });
          return next;
        });
      } else {
        setRows([]);
        setLoadError(json?.message || "Failed to load employees");
      }
    } catch (e) {
      console.error(e);
      setRows([]);
      setLoadError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const toggleOne = (id) => setChecked((m) => ({ ...m, [id]: !m[id] }));
  const clearSel = () => setChecked({});

  const onPreview = async () => {
    setPreview(null);
    if (!adj.month) {
      alert("Please pick an effective month");
      return;
    }
    if (selectedIds.length === 0) {
      alert("Select at least one employee");
      return;
    }

    const payload = {
      type: adj.type,
      mode: adj.mode,
      amount: adj.mode === "fixed" ? Number(adj.amount || 0) : null,
      percent: adj.mode === "percent" ? Number(adj.percent || 0) : null,
      month: adj.month,
      note: adj.note || null,
      employee_ids: selectedIds,
      category: adj.category || "Other",
    };

    const json = await apiPost("/salary/compensation/preview", payload);
    if (!json?.ok) {
      alert(json?.message || "Preview failed");
      return;
    }
    setPreview(json);
  };

  const onApply = async () => {
    if (!adj.month) {
      alert("Please pick an effective month");
      return;
    }
    if (selectedIds.length === 0) {
      alert("Select at least one employee");
      return;
    }
    if (!window.confirm(`Apply ${adj.type} to ${selectedIds.length} employee(s)?`)) return;

    const payload = {
      type: adj.type,
      mode: adj.mode,
      amount: adj.mode === "fixed" ? Number(adj.amount || 0) : null,
      percent: adj.mode === "percent" ? Number(adj.percent || 0) : null,
      month: adj.month,
      note: adj.note || null,
      employee_ids: selectedIds,
      category: adj.category || "Other",
    };

    const json = await apiPost("/salary/compensation/apply", payload);
    if (!json?.ok) {
      alert(json?.message || "Apply failed");
      return;
    }
    alert(json.message);
    setPreview(null);
    clearSel();
    loadEmployees();
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader breadcrumb={["Salary & Compensation", "Compensation Adjustment"]} title="Salary & Compensation" />

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
        <div className="grid-2" style={{ gap: "16px", margin: "24px" }}>
          {/* Left: Adjustment Builder Card */}
          <div className="card">
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>
              Create Adjustment
            </h3>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Type
              </label>
              <select
                className="select"
                value={adj.type}
                onChange={(e) => setAdj((a) => ({ ...a, type: e.target.value }))}
              >
                <option>Bonus</option>
                <option>Arrears</option>
                <option>Correction</option>
                <option>Allowance</option>
                <option>Reimbursement</option>
              </select>
            </div>

            {(adj.type === "Reimbursement" || adj.type === "Allowance") && (
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Category (optional)
                </label>
                <input
                  className="input"
                  value={adj.category}
                  onChange={(e) => setAdj((a) => ({ ...a, category: e.target.value }))}
                />
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Apply as
              </label>
              <select
                className="select"
                value={adj.mode}
                onChange={(e) => setAdj((a) => ({ ...a, mode: e.target.value }))}
              >
                <option value="fixed">Fixed amount</option>
                <option value="percent">% of basic</option>
              </select>
            </div>

            {adj.mode === "fixed" ? (
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Amount (LKR)
                </label>
                <input
                  className="input"
                  value={adj.amount}
                  onChange={(e) => setAdj((a) => ({ ...a, amount: e.target.value }))}
                />
              </div>
            ) : (
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Percent (%)
                </label>
                <input
                  className="input"
                  value={adj.percent}
                  onChange={(e) => setAdj((a) => ({ ...a, percent: e.target.value }))}
                />
              </div>
            )}

            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Effective month
              </label>
              <input
                type="month"
                className="input"
                value={adj.month}
                onChange={(e) => setAdj((a) => ({ ...a, month: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Reason / note
              </label>
              <textarea
                className="input"
                value={adj.note}
                onChange={(e) => setAdj((a) => ({ ...a, note: e.target.value }))}
                style={{ minHeight: "80px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <button className="btn btn-primary" onClick={onPreview}>
                Preview Impact
              </button>
              <button className="btn btn-soft" onClick={onApply}>
                Apply to Selected
              </button>
            </div>

            {preview && (
              <div style={{ marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <div className="pill pill-ok" style={{ marginBottom: "12px" }}>
                  Preview ready
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Basic</th>
                        <th>Computed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.items.map((it) => (
                        <tr key={it.employee_id}>
                          <td>
                            {it.name} (#{it.employee_id})
                          </td>
                          <td>{Number(it.basic_salary || 0).toFixed(2)}</td>
                          <td>{Number(it.computed_amount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={2} style={{ textAlign: "right" }}>
                          Total
                        </th>
                        <th>{Number(preview.total || 0).toFixed(2)}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right: Select Employees Card */}
          <div className="card">
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#333" }}>
              Select Employees
            </h3>

            {/* Filters */}
            <div className="grid-3" style={{ gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Search
                </label>
                <input
                  className="input"
                  placeholder="Name / ID / Code"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Department
                </label>
                <select className="select" value={deptId} onChange={(e) => setDeptId(e.target.value)}>
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Grade
                </label>
                <select className="select" value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
                  <option value="">All Grades</option>
                  {grades.map((g) => (
                    <option key={g.grade_id} value={g.grade_id}>
                      {g.grade_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <button className="btn btn-primary" onClick={loadEmployees}>
                Search Employees
              </button>
            </div>

            {/* Employees Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}></th>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Department</th>
                    <th>Grade</th>
                    <th>Basic Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                        Loading…
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "var(--danger)" }}>
                        {loadError}
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    rows.map((e) => (
                      <tr key={e.employee_id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!checked[e.employee_id]}
                            onChange={() => toggleOne(e.employee_id)}
                            style={{ transform: "scale(1.2)" }}
                          />
                        </td>
                        <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="user-avatar" />
                          <div style={{ fontWeight: "600" }}>{e.full_name}</div>
                        </td>
                        <td>{e.employee_id}</td>
                        <td>{e.department_name || "-"}</td>
                        <td>
                          <span className="pill">{e.grade_name || "-"}</span>
                        </td>
                        <td>{Number(e.basic_salary || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Selection Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-primary" onClick={onApply}>
                  Apply to Selected
                </button>
                <button className="btn btn-soft" onClick={clearSel}>
                  Clear Selection
                </button>
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Selected: {selectedIds.length} employee(s)
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}