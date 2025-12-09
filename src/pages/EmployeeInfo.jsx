// src/pages/EmployeeInfo.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet } from "../services/api";

export default function EmployeeInfo() {
  const navigate = useNavigate();
  const location = useLocation();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterJoinDate, setFilterJoinDate] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet("/employees");
        setEmployees(data.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load employees");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (d) => {
    const date = new Date(d);
    if (Number.isNaN(date)) return d;
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${m}/${day}/${date.getFullYear()}`;
  };

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department_name).filter(Boolean))],
    [employees]
  );
  const designations = useMemo(
    () => [...new Set(employees.map((e) => e.designation).filter(Boolean))],
    [employees]
  );

  const filtered = employees.filter((emp) => {
    const matchesSearch = `${emp.full_name} ${emp.employee_code || ""} ${emp.department_name || ""} ${emp.designation || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? emp.status === filterStatus : true;
    const matchesDepartment = filterDepartment ? emp.department_name === filterDepartment : true;
    const matchesDesignation = filterDesignation ? emp.designation === filterDesignation : true;

    let matchesJoin = true;
    if (filterJoinDate) {
      const empDate = new Date(emp.joining_date);
      const selectedDate = new Date(filterJoinDate);
      matchesJoin =
        empDate.getFullYear() === selectedDate.getFullYear() &&
        empDate.getMonth() === selectedDate.getMonth() &&
        empDate.getDate() === selectedDate.getDate();
    }

    return matchesSearch && matchesStatus && matchesDepartment && matchesDesignation && matchesJoin;
  });

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Employee Information", "Employee Information Management"]}
        title="Employee Information Management"
      />

      {/* Tabs - Single Line */}
      <div className="card" style={{ display: "flex", gap: "8px", overflowX: "auto", whiteSpace: "nowrap" }}>
        {[
          { label: "Overview", path: "/employee-info" },
          { label: "Add Employee", path: "/add-employee" },
          { label: "Attendance & Leave Records", path: "/attendance-leave" },
          { label: "Performance & Training", path: "/performance-training" },
          { label: "Documents & Contracts", path: "/documents-contracts" },
          { label: "Audit Logs", path: "/audit-logs" },
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

      {/* Filters Card */}
      <div className="card">
        <div className="grid-3" style={{ alignItems: "end", marginBottom: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Search</label>
            <input
              className="input"
              placeholder="Search employees…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Status</label>
              <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>On-contract</option>
                <option>Seasonal</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Join Date</label>
              <input
                className="input"
                type="date"
                value={filterJoinDate}
                onChange={(e) => setFilterJoinDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Department</label>
              <select className="select" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Designation</label>
              <select className="select" value={filterDesignation} onChange={(e) => setFilterDesignation(e.target.value)}>
                <option value="">All Designations</option>
                {designations.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {filterJoinDate && (
              <button className="btn btn-soft" onClick={() => setFilterJoinDate("")}>
                Clear Join Date
              </button>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/add-employee")}>
            + Add Employee
          </button>
        </div>
      </div>

      {/* Scrollable Table Section */}
      <div className="table-container">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
            <div style={{ fontWeight: "700" }}>All Employees</div>
            <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
              {loading ? "Loading…" : `${filtered.length} result(s)`}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "16px" }}>Loading…</div>
          ) : error ? (
            <div style={{ color: "var(--danger)", padding: "16px" }}>{error}</div>
          ) : (
            <div style={{ overflowX: "auto", flex: 1 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Joining Date</th>
                    <th>Designation</th>
                    <th style={{ width: "140px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id}>
                      
                <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    className="user-avatar"
                    style={{ width: 32, height: 32, overflow: "hidden" }}
                  >
                    {emp.profile_photo_url && (
                      <img
                        src={emp.profile_photo_url}
                        alt={emp.full_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{emp.full_name}</div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {emp.email || "-"}
                    </div>
                  </div>
                </td>

                      <td>{emp.employee_code || emp.id}</td>
                      <td>
                        <span className={`pill ${String(emp.status).toLowerCase() === "active" ? "pill-ok" : String(emp.status).toLowerCase() === "on leave" ? "pill-warn" : ""}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td>{emp.department_name}</td>
                      <td>{emp.phone}</td>
                      <td>{formatDate(emp.joining_date)}</td>
                      <td>{emp.designation}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="btn btn-soft" onClick={() => navigate(`/employees/${emp.id}/view`)}>View</button>
                          <button className="btn btn-soft" onClick={() => navigate(`/employees/${emp.id}/edit`)}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>No employees found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}