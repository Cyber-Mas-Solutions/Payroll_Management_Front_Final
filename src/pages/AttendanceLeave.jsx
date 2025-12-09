// src/pages/AttendanceLeave.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function AttendanceLeave() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Date formatter function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const attendanceData = [
    {
      id: 1,
      employee: "Jeremy Neigh",
      department: "Support",
      date: "2018-09-23",
      attendanceStatus: "Present",
      leaveStatus: "-",
      details: "Check In: 09:00 AM\nCheck Out: 06:00 PM\nHours: 9h 0m",
    },
    {
      id: 2,
      employee: "Annette Black",
      department: "QA",
      date: "2013-07-27",
      attendanceStatus: "-",
      leaveStatus: "Approved",
      details: "Type: Annual Leave\nDuration: Full Day\nApproved by: Michael Wilson",
    },
    {
      id: 3,
      employee: "Theresa Webb",
      department: "People Ops",
      date: "2016-11-07",
      attendanceStatus: "Late",
      leaveStatus: "-",
      details: "Check In: 10:15 AM\nCheck Out: 06:30 PM\nHours: 8h 15m",
    },
    {
      id: 4,
      employee: "Kathryn Murphy",
      department: "IT",
      date: "2014-06-19",
      attendanceStatus: "Present",
      leaveStatus: "-",
      details: "Check In: 08:45 AM\nCheck Out: 05:30 PM\nHours: 8h 45m",
    },
    {
      id: 5,
      employee: "Courtney Henry",
      department: "Customer Success",
      date: "2019-07-11",
      attendanceStatus: "-",
      leaveStatus: "Pending",
      details: "Type: Sick Leave\nDuration: Half Day (AM)\nRequested: 2023-10-14",
    },
    {
      id: 6,
      employee: "Jane Cooper",
      department: "Product",
      date: "2019-08-02",
      attendanceStatus: "-",
      leaveStatus: "Approved",
      details: "Check In: 09:00 AM\nCheck Out: 06:00 PM\nHours: 9h 0m",
    },
  ];

  const handleRecordClick = (record) => {
    setSelectedRecord(record);
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Employee Information", "Attendance & Leave Records"]}
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
            <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
              Date Range
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                className="input"
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span style={{ color: "var(--muted)", fontSize: "12px" }}>to</span>
              <input
                className="input"
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
              Attendance Status
            </label>
            <select className="select">
              <option value="">All Status</option>
              <option>Present</option>
              <option>Late</option>
              <option>Absent</option>
              <option>Half Day</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
              Leave Status
            </label>
            <select className="select">
              <option value="">All Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {(startDate || endDate) && (
              <button 
                className="btn btn-soft" 
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear Dates
              </button>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/add-leave")}>
            + Add Leave
          </button>
        </div>
      </div>

      {/* Scrollable Table Section */}
      <div className="table-container">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
            <div style={{ fontWeight: "700" }}>Attendance & Leave Records</div>
            <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
              {attendanceData.length} record(s)
            </div>
          </div>

          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Attendance Status</th>
                  <th>Leave Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr
                    key={record.id}
                    className={selectedRecord?.id === record.id ? "selected" : ""}
                    onClick={() => handleRecordClick(record)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="user-avatar" />
                      <div>
                        <div style={{ fontWeight: "600" }}>{record.employee}</div>
                      </div>
                    </td>
                    <td>{record.department}</td>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span
                        className={`pill ${
                          record.attendanceStatus === "Present"
                            ? "pill-ok"
                            : record.attendanceStatus === "Late"
                            ? "pill-warn"
                            : ""
                        }`}
                      >
                        {record.attendanceStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`pill ${
                          record.leaveStatus === "Approved"
                            ? "pill-ok"
                            : record.leaveStatus === "Pending"
                            ? "pill-warn"
                            : ""
                        }`}
                      >
                        {record.leaveStatus}
                      </span>
                    </td>
                    <td>{record.details.split("\n")[0]}</td>
                  </tr>
                ))}
                {!attendanceData.length && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      No attendance records found.
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
}