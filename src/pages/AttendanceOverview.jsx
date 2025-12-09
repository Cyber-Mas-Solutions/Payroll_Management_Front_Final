// src/pages/AttendanceOverview.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { attendanceApi } from "../services/api";

const AttendanceOverview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Overview", path: "/attendance-overview" },
    { label: "Time Management", path: "/time-management" },
    { label: "Absence Report", path: "/absence-report" },
    { label: "Attendance Adjustment", path: "/attendance-adjustment" },
    { label: "Check In & Out Report", path: "/checkin-checkout-report" },
  ];

  // server data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [filterDate, setFilterDate] = useState("");          // YYYY-MM-DD (native input)
  const [searchTerm, setSearchTerm] = useState("");
  const [checkInFilter, setCheckInFilter] = useState("All Check-in Types");
  const [checkOutFilter, setCheckOutFilter] = useState("All Check-out Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  // map UI filters -> query params the API understands
  const queryParams = useMemo(() => {
    const params = {};
    if (filterDate) params.date = filterDate;
    if (searchTerm) params.q = searchTerm;
    if (statusFilter !== "All Statuses") params.status = statusFilter;
    if (checkInFilter !== "All Check-in Types") params.check_in_type = checkInFilter;
    if (checkOutFilter !== "All Check-out Types") params.check_out_type = checkOutFilter;
    return params;
  }, [filterDate, searchTerm, statusFilter, checkInFilter, checkOutFilter]);

  

  // fetch on first load + whenever filters change
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    attendanceApi
      .getAttendanceRecords(queryParams)
      .then((data) => {
        if (!alive) return;
        // Expect either {data:[...]} or an array — normalize
        const list = Array.isArray(data) ? data : (data?.data || []);
        setRows(
          list.map((r) => ({
            empNo: r.employee_code || r.employee_id || r.empNo || "-",
            name: r.employee_name || r.name || r.full_name || "-",
            status: r.status || "Active",
            date: r.date || r.attendance_date,                   // ISO or 'YYYY-MM-DD'
            checkInType: r.check_in_type || r.checkInType || "N/A",
            checkInTime: r.check_in_time || r.checkInTime || "N/A",
            checkOutType: r.check_out_type || r.checkOutType || "N/A",
            checkOutTime: r.check_out_time || r.checkOutTime || "N/A",
          }))
        );
      })
      .catch((e) => setErr(e.message || "Failed to load attendance"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [queryParams]);

  const clearFilters = () => {
    setFilterDate("");
    setSearchTerm("");
    setCheckInFilter("All Check-in Types");
    setCheckOutFilter("All Check-out Types");
    setStatusFilter("All Statuses");
  };

  const countText = loading ? "Loading…" : `${rows.length} record(s) found`;

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Time & Attendance", "Overview"]}
        title="Time and Attendance - Overview"
      />

      {/* Tabs */}
      <div className="card" style={{ display: "flex", gap: 8, overflowX: "auto", whiteSpace: "nowrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`btn ${location.pathname === tab.path ? "btn-primary" : "btn-soft"}`}
            onClick={() => navigate(tab.path)}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid-3" style={{ alignItems: "end", marginBottom: 12 }}>
          <div>
            <label className="muted-label">Date</label>
            <input
              className="input"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div>
            <label className="muted-label">Check-in Type</label>
            <select className="select" value={checkInFilter} onChange={(e) => setCheckInFilter(e.target.value)}>
              <option>All Check-in Types</option>
              <option>Normal Check-in</option>
              <option>Late</option>
              <option>Short-in</option>
            </select>
          </div>

          <div>
            <label className="muted-label">Check-out Type</label>
            <select className="select" value={checkOutFilter} onChange={(e) => setCheckOutFilter(e.target.value)}>
              <option>All Check-out Types</option>
              <option>Normal Check-out</option>
              <option>Early-out</option>
            </select>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: "end", marginBottom: 12 }}>
          <div>
            <label className="muted-label">Search</label>
            <input
              className="input"
              placeholder="Search by Employee No or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="muted-label">Status</label>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All Statuses</option>
              <option>Active</option>
              <option>Leave</option>
              <option>Half day</option>
              <option>Normal day</option>
              <option>Short leave</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>{countText}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-soft" onClick={clearFilters} disabled={loading}>Clear Filters</button>
          </div>
        </div>
      </div>

      {/* Table */}
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
            <div style={{ fontWeight: 700 }}>Attendance Table</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {loading ? "Loading…" : `Showing ${rows.length} records`}
            </div>
          </div>

          {err && <div style={{ padding: 16, color: "var(--danger)" }}>{err}</div>}

          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee No</th>
                  <th>Employee Name</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Check-in Type</th>
                  <th>Check-in Time</th>
                  <th>Check-out Type</th>
                  <th>Check-out Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ padding: 40, textAlign: "center" }}>Loading…</td></tr>
                ) : rows.length ? (
                  rows.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.empNo}</td>
                      <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="user-avatar" />
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                      </td>
                      <td>
                        <span className={`pill ${
                          item.status === "Active" ? "pill-ok" :
                          item.status === "Leave" ? "pill-warn" :
                          "pill-soft"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <span className={`pill ${
                          item.checkInType === "Normal Check-in" ? "pill-ok" :
                          item.checkInType === "Short-in" ? "pill-warn" :
                          "pill-soft"
                        }`}>
                          {item.checkInType}
                        </span>
                      </td>
                      <td>{item.checkInTime}</td>
                      <td>
                        <span className={`pill ${
                          item.checkOutType === "Normal Check-out" ? "pill-ok" :
                          item.checkOutType === "Early-out" ? "pill-warn" :
                          "pill-soft"
                        }`}>
                          {item.checkOutType}
                        </span>
                      </td>
                      <td>{item.checkOutTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceOverview;
