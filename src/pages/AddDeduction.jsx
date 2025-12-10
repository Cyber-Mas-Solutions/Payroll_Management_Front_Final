// src/pages/AddDeduction.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiJSON } from "../services/api";

export default function AddDeduction() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const editId = search.get("id"); // if present => edit mode

  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    type: "Tax",
    basis: "Fixed", // 'Fixed' | 'Percent'
    percent: "",
    amount: "",
    effective_date: "",
    status: "Active",
  });

  // Load employees
  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("/employees?status=Active");
        setEmployees(res.data || []);
      } catch (e) {
        setEmployees([]);
      }
    })();
  }, []);

  // Load existing deduction in edit mode
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await apiGet(`/salary/deductions/${editId}`);
        const d = res.data;
        if (d) {
          setForm({
            employee_id: d.employee_id ?? "",
            name: d.name ?? "",
            type: d.type ?? "Tax",
            basis: d.basis ?? "Fixed",
            percent: d.percent ?? "",
            amount: d.amount ?? "",
            effective_date: (d.effective_date || "").slice(0, 10),
            status: d.status ?? "Active",
          });
        }
      } catch (e) {
        console.error(e);
        alert("Failed to load deduction");
      }
    })();
  }, [editId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "employee_id") {
      const selected = employees.find((emp) => emp.id === Number(value));
      setForm((f) => ({
        ...f,
        employee_id: value,
        employee_name: selected ? selected.full_name : "",
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setMsg("");
    setSaving(true);
    try {
      const payload = {
        employee_id: Number(form.employee_id),
        name: form.name,
        type: form.type,
        basis: form.basis,
        percent: form.basis === "Percent" ? Number(form.percent) : null,
        amount: form.basis === "Fixed" ? Number(form.amount) : null,
        effective_date: form.effective_date,
        status: form.status,
      };

      const method = editId ? "PUT" : "POST";
      const path = editId ? `/salary/deductions/${editId}` : "/salary/deductions";

      const res = await apiJSON(path, method, payload);
      if (!res.ok) throw new Error(res.message || "Save failed");

      setMsg(editId ? "✅ Deduction updated" : "✅ Deduction saved");
      setTimeout(() => navigate("/deductions"), 400);
    } catch (err) {
      setMsg(`❌ ${err.message || "Failed to save"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader 
        breadcrumb={["Salary & Compensation", "Deductions", editId ? "Edit Deduction" : "Add Deduction"]} 
        title="Salary & Compensation" 
      />

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
      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        <div className="card">
          <div style={{ 
            maxWidth: "600px", 
            margin: "0 auto",
            padding: "20px 0" 
          }}>
            <h2 style={{ 
              marginBottom: "24px", 
              fontSize: "20px", 
              fontWeight: "600",
              color: "#333"
            }}>
              {editId ? "Edit Deduction" : "Add Deduction"}
            </h2>

            {msg && (
              <div 
                className="card" 
                style={{ 
                  marginBottom: "16px", 
                  color: msg.startsWith("✅") ? "#0f5132" : "#842029",
                  background: msg.startsWith("✅") ? "#d1e7dd" : "#f8d7da",
                  border: msg.startsWith("✅") ? "1px solid #badbcc" : "1px solid #f5c2c7"
                }}
              >
                {msg}
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Employee *
                  </label>
                  <select 
                    className="select"
                    name="employee_id" 
                    value={form.employee_id} 
                    onChange={onChange} 
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.full_name} (#{e.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Deduction Name *
                  </label>
                  <input
                    className="input"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Deduction Name"
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Type *
                  </label>
                  <select 
                    className="select"
                    name="type" 
                    value={form.type} 
                    onChange={onChange} 
                    required
                  >
                    
                    <option>Statutory</option>
                    <option>Insurance</option>
                    <option>Loan</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Basis *
                  </label>
                  <select
                    className="select"
                    name="basis"
                    value={form.basis}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((f) =>
                        val === "Percent" 
                          ? { ...f, basis: "Percent", amount: "" } 
                          : { ...f, basis: "Fixed", percent: "" }
                      );
                    }}
                    required
                  >
                    <option>Fixed</option>
                    <option>Percent</option>
                  </select>
                </div>
              </div>

              {form.basis === "Percent" ? (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Percent (%) *
                  </label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    name="percent"
                    value={form.percent}
                    onChange={onChange}
                    placeholder="e.g. 10"
                    required
                  />
                </div>
              ) : (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Amount *
                  </label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    name="amount"
                    value={form.amount}
                    onChange={onChange}
                    placeholder="e.g. 200"
                    required
                  />
                </div>
              )}

              <div className="grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Effective Date *
                  </label>
                  <input 
                    className="input"
                    type="date" 
                    name="effective_date" 
                    value={form.effective_date} 
                    onChange={onChange} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Status
                  </label>
                  <select 
                    className="select"
                    name="status" 
                    value={form.status} 
                    onChange={onChange}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ 
                display: "flex", 
                gap: "12px", 
                justifyContent: "flex-end",
                marginTop: "24px",
                borderTop: "1px solid var(--border)",
                paddingTop: "20px"
              }}>
                <button 
                  type="button" 
                  className="btn btn-soft" 
                  onClick={() => navigate("/deductions")}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={saving}
                >
                  {saving ? "Saving…" : editId ? "Update Deduction" : "Save Deduction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}