// src/pages/CheckinCheckoutReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { attendanceApi } from "../services/api";

const CheckinCheckoutReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Overview", path: "/attendance-overview" },
    { label: "Time Management", path: "/time-management" },
    { label: "Absence Report", path: "/absence-report" },
    { label: "Attendance Adjustment", path: "/attendance-adjustment" },
    { label: "Check In & Out Report", path: "/checkin-checkout-report" },
  ];

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInFilter, setCheckInFilter] = useState("All Check-in Types");
  const [checkOutFilter, setCheckOutFilter] = useState("All Check-out Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // Data from backend
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Helpers
  const normalizeDateOnly = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateDisplay = (value) => {
    const norm = normalizeDateOnly(value);
    if (!norm) return "";
    const [y, m, d] = norm.split("-");
    return `${m}/${d}/${y}`;
  };

  // Fetch report data
  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await attendanceApi.getCheckinCheckoutReport({});
        const list = Array.isArray(data) ? data : data?.data || [];

        const mapped = list.map((r, idx) => ({
          id: idx + 1,
          // 🔥 Employee No from backend
          empNo:
            r.employee_code || // from controller
            r.empNo || // in case of alias
            r.employee_id || // fallback to id
            "-",
          name: r.full_name || r.employee_name || "-",
          activeStatus: "Active", // adjust if you later have real status
          date: r.date || r.attendance_date || "",
          checkInTime: r.check_in_time || r.checkInTime || "",
          checkOutTime: r.check_out_time || r.checkOutTime || "",
          checkInType: r.check_in_type || r.checkInType || "Normal",
          checkOutType: r.check_out_type || r.checkOutType || "Normal",
          status: r.status || "",
          ot:
            r.overtime_hours != null && r.overtime_hours !== ""
              ? `${r.overtime_hours}h`
              : "0h",
          checkInAddress: r.check_in_address || "-",
          checkOutAddress: r.check_out_address || "-",
        }));

        if (alive) setRows(mapped);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load check-in/out report");
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, []);

  // Client-side filtering
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const rowDate = normalizeDateOnly(row.date);

      const matchesFrom =
        !fromDate || (rowDate && rowDate >= normalizeDateOnly(fromDate));
      const matchesTo =
        !toDate || (rowDate && rowDate <= normalizeDateOnly(toDate));

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (row.empNo || "").toString().toLowerCase().includes(search) ||
        (row.name || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All Statuses" || row.status === statusFilter;

      const matchesCheckIn =
        checkInFilter === "All Check-in Types" ||
        row.checkInType === checkInFilter;

      const matchesCheckOut =
        checkOutFilter === "All Check-out Types" ||
        row.checkOutType === checkOutFilter;

      return (
        matchesFrom &&
        matchesTo &&
        matchesSearch &&
        matchesStatus &&
        matchesCheckIn &&
        matchesCheckOut
      );
    });
  }, [
    rows,
    fromDate,
    toDate,
    searchTerm,
    statusFilter,
    checkInFilter,
    checkOutFilter,
  ]);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    setCheckInFilter("All Check-in Types");
    setCheckOutFilter("All Check-out Types");
    setStatusFilter("All Statuses");
  };

  const exportCsv = () => {
    const headers = [
      "Employee No",
      "Employee Name",
      "Active Status",
      "Date",
      "Check-in Time",
      "Check-in Type",
      "Check-out Time",
      "Check-out Type",
      "Status",
      "OT",
    ];

    const csvRows = filteredRows.map((row) => [
      row.empNo,
      row.name,
      row.activeStatus,
      formatDateDisplay(row.date),
      row.checkInTime,
      row.checkInType,
      row.checkOutTime,
      row.checkOutType,
      row.status,
      row.ot,
    ]);

    const csv = [headers, ...csvRows]
      .map((r) => r.map((cell) => `"${cell ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checkin_checkout_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Time & Attendance", "Check In – Check Out Report"]}
        title="Check In – Check Out Report"
      />

      {/* Tabs */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`btn ${
              location.pathname === tab.path ? "btn-primary" : "btn-soft"
            }`}
            onClick={() => navigate(tab.path)}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Card */}
      <div className="card">
        <div
          className="grid-3"
          style={{ alignItems: "end", marginBottom: "12px" }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Date Range
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                className="input"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>to</span>
              <input
                className="input"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Check-in Type
            </label>
            <select
              className="select"
              value={checkInFilter}
              onChange={(e) => setCheckInFilter(e.target.value)}
            >
              <option>All Check-in Types</option>
              <option>Normal</option>
              <option>Late</option>
              <option>Short-in</option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Check-out Type
            </label>
            <select
              className="select"
              value={checkOutFilter}
              onChange={(e) => setCheckOutFilter(e.target.value)}
            >
              <option>All Check-out Types</option>
              <option>Normal</option>
              <option>Early-out</option>
            </select>
          </div>
        </div>

        <div
          className="grid-2"
          style={{ alignItems: "end", marginBottom: "12px" }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Search
            </label>
            <input
              className="input"
              placeholder="Search by Employee No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Status
            </label>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Present</option>
              <option>Leave</option>
              <option>Half Day</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", color: "var(--muted)" }}>
            {loading
              ? "Loading check-in/check-out records..."
              : `${filteredRows.length} record(s) found`}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-soft" onClick={clearFilters}>
              Clear Filters
            </button>
            <button
              className="btn btn-primary"
              onClick={exportCsv}
              disabled={filteredRows.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {err && (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "var(--danger)",
            }}
          >
            {err}
          </div>
        )}
      </div>

      {/* Check-in Check-out Report Table */}
      <div className="table-container">
        <div className="card" style={{ padding: 0 }}>
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: "700" }}>
              Check-in Check-out Report
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              {loading
                ? "Loading…"
                : `Showing ${filteredRows.length} of ${rows.length} records`}
            </div>
          </div>

          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee No</th>
                  <th>Employee Name</th>
                  <th>Active Status</th>
                  <th>Date</th>
                  <th>Check-in Time</th>
                  <th>Check-in Type</th>
                  <th>Check-out Time</th>
                  <th>Check-out Type</th>
                  <th>Status</th>
                  <th>OT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--muted)",
                      }}
                    >
                      Loading…
                    </td>
                  </tr>
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.empNo}</td>
                      <td
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div className="user-avatar" />
                        <div style={{ fontWeight: "600" }}>{row.name}</div>
                      </td>
                      <td>
                        <span
                          className={`pill ${
                            row.activeStatus === "Active"
                              ? "pill-ok"
                              : "pill-warn"
                          }`}
                        >
                          {row.activeStatus}
                        </span>
                      </td>
                      <td>{formatDateDisplay(row.date)}</td>
                      <td>{row.checkInTime || "-"}</td>
                      <td>
                        <span
                          className={`pill ${
                            row.checkInType === "Normal"
                              ? "pill-ok"
                              : row.checkInType === "Late"
                              ? "pill-warn"
                              : "pill-soft"
                          }`}
                        >
                          {row.checkInType || "-"}
                        </span>
                      </td>
                      <td>{row.checkOutTime || "-"}</td>
                      <td>
                        <span
                          className={`pill ${
                            row.checkOutType === "Normal"
                              ? "pill-ok"
                              : row.checkOutType === "Early-out"
                              ? "pill-warn"
                              : "pill-soft"
                          }`}
                        >
                          {row.checkOutType || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`pill ${
                            row.status === "Present"
                              ? "pill-ok"
                              : row.status === "Leave"
                              ? "pill-warn"
                              : "pill-soft"
                          }`}
                        >
                          {row.status || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`pill ${
                            row.ot && row.ot !== "0h" ? "pill-ok" : "pill-soft"
                          }`}
                        >
                          {row.ot}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--muted)",
                      }}
                    >
                      No check-in/check-out records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination (static for now) */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
          Showing 1 to {filteredRows.length} of {rows.length} results
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-soft" disabled>
            Previous
          </button>
          <button className="btn btn-soft" disabled>
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CheckinCheckoutReport;
