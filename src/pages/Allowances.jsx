// src/pages/Allowances.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiDelete } from "../services/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Allowances() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState("All Employees");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [frequencyFilter, setFrequencyFilter] = useState("All Frequency");
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Month dropdown
  const monthOptions = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const list = [];
    [y - 1, y, y + 1].forEach((yr) => {
      MONTHS.forEach((mn) => list.push(`${mn} ${yr}`));
    });
    return list.reverse();
  }, []);

  // Category options
  const categoryOptions = ["All Categories", "Transportation", "Meal", "Housing", "Medical", "Communication", "Other"];
  const frequencyOptions = ["All Frequency", "Monthly", "Yearly"];
  const statusOptions = ["All Status", "Active", "Inactive"];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const resp = await apiGet("/salary/allowances");
        const list = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
        setRows(list);
      } catch (e) {
        console.error(e);
        setError("Failed to load allowances");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build filter options from data
  const employeeOptions = useMemo(() => {
    const names = Array.from(new Set(rows.map((r) => r.full_name))).filter(Boolean).sort();
    return ["All Employees", ...names];
  }, [rows]);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(rows.map((r) => r.department || ""))).filter(Boolean).sort();
    return ["All Departments", ...depts];
  }, [rows]);

  // Filter logic
  const filtered = useMemo(() => {
    let data = rows;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.category?.toLowerCase().includes(q) ||
          String(r.employee_id).toLowerCase().includes(q)
      );
    }

    if (employeeFilter !== "All Employees") {
      data = data.filter((r) => r.full_name === employeeFilter);
    }

    if (departmentFilter !== "All Departments") {
      data = data.filter((r) => (r.department || "") === departmentFilter);
    }

    if (categoryFilter !== "All Categories") {
      data = data.filter((r) => r.category === categoryFilter);
    }

    if (statusFilter !== "All Status") {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (frequencyFilter !== "All Frequency") {
      data = data.filter((r) => r.frequency === frequencyFilter);
    }

    return data;
  }, [rows, searchTerm, employeeFilter, departmentFilter, categoryFilter, statusFilter, frequencyFilter]);

  const handleResetFilters = () => {
    setEmployeeFilter("All Employees");
    setDepartmentFilter("All Departments");
    setCategoryFilter("All Categories");
    setStatusFilter("All Status");
    setFrequencyFilter("All Frequency");
    setSearchTerm("");
  };

  // CORRECTED: Edit handler
  const handleEdit = (item) => {
    navigate(`/add-allowance?id=${item.id}`);
  };

  // CORRECTED: Delete handler with proper endpoint
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete allowance "${item.description}" for ${item.full_name}?`)) return;
    
    try {
      await apiDelete(`/salary/allowance/${item.id}`); // CORRECTED ENDPOINT: singular "allowance"
      // Refresh the list
      const resp = await apiGet("/salary/allowances");
      const list = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
      setRows(list);
    } catch (e) {
      alert(e.message || "Failed to delete allowance");
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (!filtered.length) {
      alert("No data to export.");
      return;
    }
    const csvRows = [];
    const header = [
      "Employee ID", "Employee Name", "Description", "Category", "Amount", 
      "Taxable", "Frequency", "Effective From", "Effective To", "Status"
    ];
    csvRows.push(header.join(","));

    filtered.forEach((r) => {
      const row = [
        r.employee_id,
        r.full_name || "",
        r.description,
        r.category || "",
        Number(r.amount || 0),
        Number(r.taxable) ? "Yes" : "No",
        r.frequency || "",
        r.effective_from || "",
        r.effective_to || "",
        r.status,
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Allowances_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return dateString;
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
      <PageHeader breadcrumb={["Salary & Compensation", "Allowances"]} title="Salary & Compensation" />

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

      {/* Fixed Filters Section */}
      <div
        style={{
          position: "sticky",
          top: "56px", // Height of tabs section
          zIndex: 90,
          backgroundColor: "var(--bg)",
        }}
      >
        {/* Filters Card */}
        <div className="card">
          <div className="grid-3" style={{ alignItems: "end", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Employee
              </label>
              <select className="select" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
                {employeeOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Department
              </label>
              <select className="select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                {departmentOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Category
              </label>
              <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categoryOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Status
              </label>
              <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statusOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Frequency
              </label>
              <select className="select" value={frequencyFilter} onChange={(e) => setFrequencyFilter(e.target.value)}>
                {frequencyOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Search
              </label>
              <input
                className="input"
                placeholder="Name, ID, Description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(employeeFilter !== "All Employees" || departmentFilter !== "All Departments" || categoryFilter !== "All Categories" || statusFilter !== "All Status" || frequencyFilter !== "All Frequency" || searchTerm) && (
                <button className="btn btn-soft" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={handleExport}>
                Export Report
              </button>
              <button className="btn btn-primary" onClick={() => navigate("/add-allowance")}>
                + Add Allowance
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card" style={{ color: "var(--danger)", background: "#fef2f2" }}>
            {error}
          </div>
        )}
      </div>

      {/* Scrollable Table Section */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="table-container" style={{ marginTop: 0, flex: 1, minHeight: 0 }}>
          <div className="card" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              padding: "12px 16px", 
              borderBottom: "1px solid var(--border)", 
              display: "flex", 
              alignItems: "center",
              flexShrink: 0
            }}>
              <div style={{ fontWeight: "700" }}>Allowance Configuration</div>
              <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
                {loading ? "Loading..." : `${filtered.length} allowance(s)`}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "16px", flex: 1 }}>Loading...</div>
            ) : (
              <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
                <table className="table">
                  <thead style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#f8f9fa",
                    zIndex: 10
                  }}>
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Taxable</th>
                      <th>Frequency</th>
                      <th>Effective From</th>
                      <th>Effective To</th>
                      <th>Status</th>
                      <th style={{ width: "120px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td>{item.employee_id}</td>
                        <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="user-avatar" />
                          <div style={{ fontWeight: "600" }}>{item.full_name || "-"}</div>
                        </td>
                        <td>{item.description}</td>
                        <td>{item.category || "-"}</td>
                        <td>{Number(item.amount || 0).toLocaleString()}</td>
                        <td>
                          <span className={`pill ${Number(item.taxable) ? "pill-warn" : "pill-ok"}`}>
                            {Number(item.taxable) ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>{item.frequency || "-"}</td>
                        <td>{formatDate(item.effective_from)}</td>
                        <td>{formatDate(item.effective_to)}</td>
                        <td>
                          <span className={`pill ${item.status === "Active" ? "pill-ok" : "pill-warn"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button 
                              className="btn btn-soft" 
                              onClick={() => handleEdit(item)}
                              style={{ fontSize: "12px", padding: "6px 12px" }}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-soft" 
                              onClick={() => handleDelete(item)}
                              style={{ 
                                fontSize: "12px", 
                                padding: "6px 12px",
                                background: "#fef2f2",
                                color: "#dc2626",
                                border: "1px solid #fecaca"
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                          No allowances found. Click "Add Allowance" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}