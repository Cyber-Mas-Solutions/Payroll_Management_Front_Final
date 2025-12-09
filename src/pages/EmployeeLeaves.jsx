// src/pages/EmployeeLeaves.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { leaveApi } from "../services/api";

const EmployeeLeaves = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Overview", path: "/employee-leaves" },
    { label: "Leave Approval", path: "/leave-approval" },
    { label: "Calendar", path: "/leave-calendar" },
    { label: "Leave Request", path: "/leave-request" },
  ];

  // ---- State --------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");

  // Local pagination for UI
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Data from API
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- Fetch from backend -------------------------------------------
  useEffect(() => {
    let ignore = false;

    async function fetchBalances() {
      setLoading(true);
      setError("");

      try {
        const currentYear = new Date().getFullYear();
        const res = await leaveApi.getEmployeeBalances({
          year: currentYear,
          page: 1,
          pageSize: 500,
        });

        if (ignore) return;

        const items = (res && res.data) || [];
        setAllEmployees(items);
        setPage(1);
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setError(err.message || "Failed to load employee leave balances");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchBalances();
    return () => {
      ignore = true;
    };
  }, []);

  // ---- Derived lists / filters --------------------------------------
  const departments = useMemo(() => {
    const s = new Set(["All Departments"]);
    allEmployees.forEach((e) => s.add(e.department));
    return Array.from(s);
  }, [allEmployees]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const bySearch = (e) => (e.name || "").toLowerCase().includes(term);
    const byDept = (e) =>
      deptFilter === "All Departments" ? true : e.department === deptFilter;
    return allEmployees.filter((e) => bySearch(e) && byDept(e));
  }, [allEmployees, searchTerm, deptFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const current = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ---- Actions ------------------------------------------------------
  const onExportCSV = () => {
    const headers = [
      "Employee Name",
      "Department",
      "Annual Leave Used",
      "Annual Leave Total",
      "Casual Leave Used",
      "Casual Leave Total",
      "Half Day 1",
      "Half Day 2",
    ];
    const csvRows = filtered.map((e) => [
      e.name ?? "",
      e.department ?? "",
      e.annualUsed ?? 0,
      e.annualTotal ?? 0,
      e.casualUsed ?? 0,
      e.casualTotal ?? 0,
      e.halfDay1 ?? "",
      e.halfDay2 ?? "",
    ]);

    const csv = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll(`"`, `""`)}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_leaves_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDeptFilter("All Departments");
    setPage(1);
  };

  const getLeaveProgress = (used, total) => {
    if (!total || total <= 0) return { color: "var(--soft)", width: "0%" };
    const percentage = Math.min(100, (used / total) * 100);
    if (percentage >= 80) return { color: "var(--danger)", width: `${percentage}%` };
    if (percentage >= 50) return { color: "var(--warn)", width: `${percentage}%` };
    return { color: "var(--success)", width: `${percentage}%` };
  };

  // ---- Render -------------------------------------------------------
  return (
    <Layout>
      <PageHeader breadcrumb={["Leave Management", "Employee Leaves"]} title="Employee Leaves" />

      {/* Tabs (wrap + scroll-safe) */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`btn ${location.pathname === tab.path ? "btn-primary" : "btn-soft"}`}
            onClick={() => navigate(tab.path)}
            style={{ whiteSpace: "nowrap" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Card (responsive grid + non-squishy controls) */}
      <div className="card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1fr) minmax(220px, 1fr) auto",
            gap: "16px",
            alignItems: "end",
            marginBottom: "12px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Search Employee
            </label>
            <input
              className="input"
              placeholder="Filter by Employee Name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Department
            </label>
            <select
              className="select"
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: "100%" }}
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-soft" onClick={clearFilters} style={{ whiteSpace: "nowrap" }}>
              Clear Filters
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", color: "var(--muted)" }}>
            {loading ? "Loading employees..." : `${filtered.length} employee(s) found`}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-end" }}>
            <button className="btn btn-soft" style={{ whiteSpace: "nowrap" }}>
              View Short Leave Counts
            </button>
            <button
              className="btn btn-primary"
              onClick={onExportCSV}
              disabled={loading || !filtered.length}
              style={{ whiteSpace: "nowrap" }}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Employee Leaves Table */}
      <div className="table-container">
        <div className="card" style={{ padding: 0 }}>
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: "700" }}>Employee Leave Balances</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              {loading ? "Loading..." : `Showing ${current.length} of ${filtered.length} records`}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Emp No</th>
                  <th style={{ whiteSpace: "nowrap" }}>Employee Name</th>
                  <th style={{ whiteSpace: "nowrap" }}>Department</th>
                  <th style={{ whiteSpace: "nowrap" }}>Annual Leave</th>
                  <th style={{ whiteSpace: "nowrap" }}>Casual Leave</th>
                  <th style={{ whiteSpace: "nowrap" }}>Half Day</th>
                  <th style={{ whiteSpace: "nowrap" }}>Leave Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "16px" }}>
                      Loading employee leave balances...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "16px", color: "var(--danger)" }}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && current.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "16px" }}>
                      No employee leave data found.
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  current.map((employee, index) => {
                    const annualUsed = Number(employee.annualUsed ?? 0);
                    const annualTotal = Number(employee.annualTotal ?? 0);
                    const casualUsed = Number(employee.casualUsed ?? 0);
                    const casualTotal = Number(employee.casualTotal ?? 0);

                    const annualProgress = getLeaveProgress(annualUsed, annualTotal);
                    const casualProgress = getLeaveProgress(casualUsed, casualTotal);

                    return (
                      <tr key={employee.employee_id || index}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {employee.employee_code || employee.employee_id || "-"}
                        </td>

                        <td style={{ minWidth: 220 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                            <div className="user-avatar" style={{ flex: "0 0 auto" }} />
                            <div
                              style={{
                                fontWeight: "600",
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={employee.name}
                            >
                              {employee.name}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="pill" style={{ background: "var(--soft)", color: "var(--text)" }}>
                            {employee.department}
                          </span>
                        </td>

                        <td style={{ minWidth: 180 }}>
                          <div style={{ marginBottom: "4px", fontSize: "12px", fontWeight: "600" }}>
                            {annualUsed.toFixed(1)} / {annualTotal} days
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "6px",
                              backgroundColor: "var(--soft)",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: annualProgress.width,
                                height: "100%",
                                backgroundColor: annualProgress.color,
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                        </td>

                        <td style={{ minWidth: 180 }}>
                          <div style={{ marginBottom: "4px", fontSize: "12px", fontWeight: "600" }}>
                            {casualUsed.toFixed(1)} / {casualTotal} days
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "6px",
                              backgroundColor: "var(--soft)",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: casualProgress.width,
                                height: "100%",
                                backgroundColor: casualProgress.color,
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                        </td>

                        <td style={{ fontSize: "12px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                          {employee.halfDay1 ?? "-"}
                          {employee.halfDay2 ? `, ${employee.halfDay2}` : ""}
                        </td>

                        <td>
                          <span
                            className={`pill ${
                              annualTotal > 0 && annualUsed >= annualTotal * 0.8
                                ? "pill-warn"
                                : annualTotal > 0 && annualUsed >= annualTotal * 0.5
                                ? "pill-soft"
                                : "pill-ok"
                            }`}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {annualTotal > 0 && annualUsed >= annualTotal * 0.8
                              ? "Critical"
                              : annualTotal > 0 && annualUsed >= annualTotal * 0.5
                              ? "Moderate"
                              : "Good"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination (wrap-safe) */}
      <div
        className="card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
          {loading
            ? "Loading..."
            : `Showing ${current.length} of ${filtered.length} results (Page ${safePage} of ${pageCount})`}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button className="btn btn-soft" disabled={safePage === 1 || loading} onClick={() => setPage(safePage - 1)}>
            Previous
          </button>
          <button
            className="btn btn-soft"
            disabled={safePage === pageCount || loading}
            onClick={() => setPage(safePage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeLeaves;
