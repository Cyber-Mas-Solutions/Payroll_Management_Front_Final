// src/pages/Earnings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet } from "../services/api";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseMonthYear(label) {
  if (!label) {
    const d = new Date();
    return { m: d.getMonth() + 1, y: d.getFullYear() };
  }
  const [mName, yStr] = label.split(" ");
  const m = MONTHS.findIndex((n) => n === mName) + 1 || new Date().getMonth() + 1;
  const y = Number(yStr) || new Date().getFullYear();
  return { m, y };
}

export default function Earnings() {
  const navigate = useNavigate();
  const location = useLocation();

  // data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [employeeFilter, setEmployeeFilter] = useState("All Employees");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [designationFilter, setDesignationFilter] = useState("All Designations");
  const [monthFilter, setMonthFilter] = useState(() => {
    const d = new Date();
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  });
  const [searchTerm, setSearchTerm] = useState("");

  // month dropdown (this year ±1)
  const monthOptions = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const list = [];
    [y - 1, y, y + 1].forEach((yr) => {
      MONTHS.forEach((mn) => list.push(`${mn} ${yr}`));
    });
    return list.reverse();
  }, []);

  // fetch from backend whenever month changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const { m, y } = parseMonthYear(monthFilter);
        const resp = await apiGet(`/salary/earnings?month=${m}&year=${y}`);
        setRows(Array.isArray(resp.data) ? resp.data : resp.data?.data || []);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load earnings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [monthFilter]);

  // build filter options from data
  const employeeOptions = useMemo(() => {
    const names = Array.from(new Set(rows.map((r) => r.name))).sort();
    return ["All Employees", ...names];
  }, [rows]);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(rows.map((r) => r.department || ""))).filter(Boolean).sort();
    return ["All Departments", ...depts];
  }, [rows]);

  // filter logic
  const filtered = useMemo(() => {
    let data = rows;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.department?.toLowerCase().includes(q) ||
          String(r.employee_id).toLowerCase().includes(q)
      );
    }

    if (employeeFilter !== "All Employees") {
      data = data.filter((r) => r.name === employeeFilter);
    }

    if (departmentFilter !== "All Departments") {
      data = data.filter((r) => (r.department || "") === departmentFilter);
    }

    return data;
  }, [rows, searchTerm, employeeFilter, departmentFilter, designationFilter]);

  const handleResetFilters = () => {
    setEmployeeFilter("All Employees");
    setDepartmentFilter("All Departments");
    setDesignationFilter("All Designations");
    setSearchTerm("");
  };

  // Export to CSV
  const handleExport = () => {
    if (!filtered.length) {
      alert("No data to export.");
      return;
    }
    const csvRows = [];
    const header = ["Employee", "Employee ID", "Department", "Basic Salary", "Overtime", "Bonus", "Allowances", "Gross Earnings"];
    csvRows.push(header.join(","));

    filtered.forEach((r) => {
      const row = [
        r.name,
        r.employee_id,
        r.department || "",
        Number(r.basic_salary || 0),
        Number(r.overtime || 0),
        Number(r.bonus || 0),
        Number(r.allowances || 0),
        Number(r.gross || 0),
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const { m, y } = parseMonthYear(monthFilter);
    a.download = `Earnings_${m}-${y}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewEmployee = (employeeId) => {
    navigate(`/employees/${employeeId}/view`);
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader breadcrumb={["Salary & Compensation", "Earnings"]} title="Salary & Compensation" />

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
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="card" style={{ marginBottom: 0, borderRadius: "0" }}>
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
                Designation
              </label>
              <select className="select" value={designationFilter} onChange={(e) => setDesignationFilter(e.target.value)}>
                {["All Designations", "Branch Manager", "Regional Manager", "Trust Administrator", "Vice President", "Trust Office"].map(
                  (opt) => (
                    <option key={opt}>{opt}</option>
                  )
                )}
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
                placeholder="Name, ID, Department"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "end", gap: "8px" }}>
              <button className="btn btn-primary" onClick={handleExport} style={{ flex: 1 }}>
                Export Report
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(employeeFilter !== "All Employees" || departmentFilter !== "All Departments" || designationFilter !== "All Designations" || searchTerm) && (
                <button className="btn btn-soft" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>{filtered.length} employee(s)</div>
          </div>
        </div>

        {/* Error Display - Fixed position */}
        {error && (
          <div className="card" style={{ color: "var(--danger)", background: "#fef2f2", marginBottom: 0, borderRadius: "0" }}>
            {error}
          </div>
        )}
      </div>

      {/* Scrollable Table Area Only */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Earnings Table Section */}
        <div className="table-container">
          <div className="card" style={{ padding: 0, margin: 0, height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div style={{ fontWeight: "700" }}>All Employees</div>
              <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
                {loading ? "Loading..." : `${filtered.length} result(s)`}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "16px", flex: 1 }}>Loading...</div>
            ) : (
              <div style={{ overflow: "auto", flex: 1, position: "relative" }}>
                <table className="table">
                  <thead style={{ 
                    position: "sticky", 
                    top: 0, 
                    zIndex: 10,
                    backgroundColor: "#f8f9fa" 
                  }}>
                    <tr>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>Employee</th>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>ID</th>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>Department</th>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>Basic Salary</th>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>Overtime</th>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>Bonus</th>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>Allowances</th>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>Gross Earnings</th>
                      <th style={{ position: "sticky", top: 0, background: "#f8f9fa", width: "100px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((emp) => (
                      <tr key={emp.employee_id}>
                        <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="user-avatar" />
                          <div style={{ fontWeight: "600" }}>{emp.name}</div>
                        </td>
                        <td>{emp.employee_id}</td>
                        <td>{emp.department || "-"}</td>
                        <td>{Number(emp.basic_salary || 0).toLocaleString()}</td>
                        <td>{Number(emp.overtime || 0).toLocaleString()}</td>
                        <td>{Number(emp.bonus || 0).toLocaleString()}</td>
                        <td>{Number(emp.allowances || 0).toLocaleString()}</td>
                        <td style={{ fontWeight: "600" }}>{Number(emp.gross || 0).toLocaleString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button 
                              className="btn btn-soft" 
                              onClick={() => handleViewEmployee(emp.employee_id)} 
                              style={{ fontSize: "12px", padding: "6px 12px" }}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                          No employees found.
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