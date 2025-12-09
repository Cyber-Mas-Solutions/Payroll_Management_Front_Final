// src/pages/AddAllowance.jsx - CORRECTED VERSION
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiJSON } from "../services/api";

export default function AddAllowance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const editId = search.get("id");

  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    employee_id: "",
    description: "",
    category: "Transportation",
    amount: "",
    taxable: 0,
    frequency: "Monthly",
    effective_from: "",
    effective_to: "",
    status: "Active",
  });

  const categoryOptions = ["Transportation", "Meal", "Housing", "Medical", "Communication", "Other"];
  const frequencyOptions = ["Monthly", "Yearly"];
  const statusOptions = ["Active", "Inactive"];

  // Load employees
  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet("/employees?status=Active");
        setEmployees(res.data || []);
      } catch (e) {
        console.error("Error loading employees:", e);
        setEmployees([]);
        setMsg("❌ Failed to load employees");
      }
    })();
  }, []);

  // Load existing allowance in edit mode
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await apiGet(`/salary/allowance/${editId}`);
        const d = res.data;
        if (d) {
          setForm({
            employee_id: d.employee_id?.toString() ?? "",
            description: d.description ?? "",
            category: d.category ?? "Transportation",
            amount: d.amount?.toString() ?? "",
            taxable: d.taxable ?? 0,
            frequency: d.frequency ?? "Monthly",
            effective_from: (d.effective_from || "").slice(0, 10),
            effective_to: (d.effective_to || "").slice(0, 10),
            status: d.status ?? "Active",
          });
        }
      } catch (e) {
        console.error("Error loading allowance:", e);
        setMsg("❌ Failed to load allowance data");
      }
    })();
  }, [editId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    
    if (!form.employee_id || !form.description || !form.amount) {
      setMsg("❌ Please fill in all required fields");
      return;
    }

    setMsg("");
    setSaving(true);
    
    try {
      const payload = {
        employee_id: Number(form.employee_id),
        description: form.description,
        category: form.category,
        amount: Number(form.amount),
        taxable: Number(form.taxable),
        frequency: form.frequency,
        effective_from: form.effective_from || null,
        effective_to: form.effective_to || null,
        status: form.status,
      };

      let path, method;
      
      if (editId) {
        // EDIT MODE - Use PUT request
        method = "PUT";
        path = `/salary/allowance/${editId}`;
      } else {
        // CREATE MODE - Use POST request  
        method = "POST";
        path = "/salary/allowance";
      }

      console.log(`Making ${method} request to: ${path}`, payload);

      const response = await apiJSON(path, method, payload);
      
      console.log("API Response:", response);

      if (!response.ok) {
        throw new Error(response.message || response.error || "Save failed");
      }

      setMsg(editId ? "✅ Allowance updated successfully" : "✅ Allowance created successfully");
      setTimeout(() => navigate("/allowances"), 1500);
      
    } catch (err) {
      console.error("Save error:", err);
      setMsg(`❌ ${err.message || "Failed to save allowance. Please try again."}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <PageHeader 
        breadcrumb={["Salary & Compensation", "Allowances", editId ? "Edit Allowance" : "Add Allowance"]} 
        title="Salary & Compensation" 
      />

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
              {editId ? "Edit Allowance" : "Add Allowance"}
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
                    disabled={editId} // Disable employee selection in edit mode
                  >
                    <option value="">Select employee</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.full_name} (#{e.id})
                      </option>
                    ))}
                  </select>
                  {editId && (
                    <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                      Employee cannot be changed when editing
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Description *
                  </label>
                  <input
                    className="input"
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="e.g., Travel Allowance"
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Category *
                  </label>
                  <select 
                    className="select"
                    name="category" 
                    value={form.category} 
                    onChange={onChange} 
                    required
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
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
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Taxable
                  </label>
                  <select
                    className="select"
                    name="taxable"
                    value={form.taxable}
                    onChange={onChange}
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Frequency *
                  </label>
                  <select
                    className="select"
                    name="frequency"
                    value={form.frequency}
                    onChange={onChange}
                    required
                  >
                    {frequencyOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Effective From
                  </label>
                  <input 
                    className="input"
                    type="date" 
                    name="effective_from" 
                    value={form.effective_from} 
                    onChange={onChange} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                    Effective To
                  </label>
                  <input 
                    className="input"
                    type="date" 
                    name="effective_to" 
                    value={form.effective_to} 
                    onChange={onChange} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Status
                </label>
                <select 
                  className="select"
                  name="status" 
                  value={form.status} 
                  onChange={onChange}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
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
                  onClick={() => navigate("/allowances")}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={saving}
                >
                  {saving ? "Saving…" : editId ? "Update Allowance" : "Save Allowance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}