// src/pages/Deductions.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiDelete } from "../services/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Deductions() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState("All Employees");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiGet("/salary/deductions");
        setDeductions(res.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load deductions");
        setDeductions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build filter options from data
  const employeeOptions = useMemo(() => {
    const names = Array.from(new Set(deductions.map((d) => d.employee_name))).filter(Boolean).sort();
    return ["All Employees", ...names];
  }, [deductions]);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(deductions.map((d) => d.department || ""))).filter(Boolean).sort();
    return ["All Departments", ...depts];
  }, [deductions]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(deductions.map((d) => d.type))).filter(Boolean).sort();
    return ["All Types", ...types];
  }, [deductions]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(deductions.map((d) => d.status))).filter(Boolean).sort();
    return ["All Status", ...statuses];
  }, [deductions]);

  // Filter logic
  const filtered = useMemo(() => {
    let data = deductions;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (d) =>
          d.employee_name?.toLowerCase().includes(q) ||
          d.name?.toLowerCase().includes(q) ||
          d.type?.toLowerCase().includes(q) ||
          String(d.employee_id).toLowerCase().includes(q)
      );
    }

    if (employeeFilter !== "All Employees") {
      data = data.filter((d) => d.employee_name === employeeFilter);
    }

    if (departmentFilter !== "All Departments") {
      data = data.filter((d) => (d.department || "") === departmentFilter);
    }

    if (typeFilter !== "All Types") {
      data = data.filter((d) => d.type === typeFilter);
    }

    if (statusFilter !== "All Status") {
      data = data.filter((d) => d.status === statusFilter);
    }

    return data;
  }, [deductions, searchTerm, employeeFilter, departmentFilter, typeFilter, statusFilter]);

  const handleResetFilters = () => {
    setEmployeeFilter("All Employees");
    setDepartmentFilter("All Departments");
    setTypeFilter("All Types");
    setStatusFilter("All Status");
    setSearchTerm("");
  };

  const handleEdit = (row) => {
    navigate(`/add-deduction?id=${row.id}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete deduction "${row.name}" for employee #${row.employee_id}?`)) return;
    try {
      await apiDelete(`/salary/deductions/${row.id}`);
      setDeductions((prev) => prev.filter((d) => d.id !== row.id));
    } catch (e) {
      alert(e.message || "Failed to delete deduction");
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
      "Employee ID", "Employee Name", "Description", "Type", "Category", 
      "Rate", "Amount", "Status", "Effective Date"
    ];
    csvRows.push(header.join(","));

    filtered.forEach((d) => {
      const row = [
        d.employee_id,
        d.employee_name || "",
        d.name,
        d.type,
        d.basis || "",
        d.basis === "Percent" ? d.percent : "-",
        d.basis === "Fixed" ? d.amount : "-",
        d.status,
        d.effective_date || "",
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Deductions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
      <PageHeader breadcrumb={["Salary & Compensation", "Deductions"]} title="Salary & Compensation" />

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
                Type
              </label>
              <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {typeOptions.map((opt) => (
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
                Month
              </label>
              <select className="select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                {monthOptions.map((opt) => (
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
                placeholder="Name, ID, Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(employeeFilter !== "All Employees" || departmentFilter !== "All Departments" || typeFilter !== "All Types" || statusFilter !== "All Status" || searchTerm) && (
                <button className="btn btn-soft" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={handleExport}>
                Export Report
              </button>
              <button className="btn btn-primary" onClick={() => navigate("/add-deduction")}>
                + Add Deduction
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

        {/* Deductions Table Section */}
        <div className="table-container">
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: "700" }}>Deduction Configuration</div>
              <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
                {loading ? "Loading..." : `${filtered.length} deduction(s)`}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "16px" }}>Loading...</div>
            ) : (
              <div style={{ overflowX: "auto", flex: 1 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Effective Date</th>
                      <th style={{ width: "120px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td>{item.employee_id}</td>
                        <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="user-avatar" />
                          <div style={{ fontWeight: "600" }}>{item.employee_name || "-"}</div>
                        </td>
                        <td>{item.name}</td>
                        <td>{item.type}</td>
                        <td>{item.basis || ""}</td>
                        <td>{item.basis === "Percent" ? `${item.percent}%` : "-"}</td>
                        <td>{item.basis === "Fixed" ? Number(item.amount || 0).toLocaleString() : "-"}</td>
                        <td>
                          <span className={`pill ${item.status === "Active" ? "pill-ok" : "pill-warn"}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{formatDate(item.effective_date)}</td>
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
                        <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                          No deductions found. Click "Add Deduction" to create one.
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