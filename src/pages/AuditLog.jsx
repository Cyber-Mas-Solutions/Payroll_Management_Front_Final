import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/AuditLog.css";

const AuditLog = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Security & Access Control", path: "/security-access-control" },
    { label: "User Management", path: "/user-management" },
    { label: "Role Management", path: "/role-management" },
    { label: "Access Control", path: "/access-control" },
    { label: "Security Logs", path: "/security-logs" },
    { label: "Audit Log", path: "/audit-log" },
    { label: "Encryption Status", path: "/encryption-status" },
    { label: "Backup & Recovery", path: "/backup-recovery" },
  ];

  const [auditData, setAuditData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // Simulated API data
    const logs = [
      {
        action: "Edited Employee Salary",
        user: "rashmi@company.com",
        timestamp: "2023-09-15 09:32:41",
        details:
          "Changed salary for employee ID: EMP-1023 from $65,000 to $68,000",
        recordId: "EMP-01",
        ip: "192.168.1.45",
        status: "success",
      },
      {
        action: "Attempted Unauthorized Access",
        user: "malith@company.com",
        timestamp: "2023-09-15 09:32:41",
        details:
          "Attempted to access payroll records without proper permissions",
        recordId: "N/A",
        ip: "45.123.45.67",
        status: "failed",
      },
      {
        action: "Added New User",
        user: "admin@company.com",
        timestamp: "2023-09-15 08:47:22",
        details:
          "Created new user account for Michael Brown with Employee role",
        recordId: "USR-0458",
        ip: "45.123.45.67",
        status: "success",
      },
      {
        action: "Deleted Timesheet Entry",
        user: "admin@company.com",
        timestamp: "2023-09-14 14:22:18",
        details:
          "Deleted incorrect timesheet entry for employee ID: EMP-3091",
        recordId: "TS-5923",
        ip: "192.168.1.65",
        status: "failed",
      },
      {
        action: "System Backup",
        user: "admin@company.com",
        timestamp: "2023-09-15 09:32:41",
        details: "Automated system backup completed successfully",
        recordId: "BKP-20230910",
        ip: "45.123.45.67",
        status: "success",
      },
    ];
    setAuditData(logs);
  }, []);

  // Filtering Logic
  const filteredData = auditData.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ? true : log.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="audit-container">
      <Sidebar />
      <div className="audit-content">
        <Header />

        <header className="audit-header">
          <h1 className="page-title">Audit Log</h1>
          <p className="subtitle">
            Comprehensive record of all system activities
          </p>
        </header>

        <div className="access-tabs">
          {tabs.map((t) => (
            <button
              key={t.path}
              className={`tab-btn ${
                location.pathname === t.path ? "active" : ""
              }`}
              onClick={() => navigate(t.path)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <section className="audit-section">
          <div className="table-actions">
            <input
              type="text"
              placeholder="Search by user or action..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="success">✅ Success</option>
              <option value="failed">❌ Failed</option>
            </select>

            <button
              className="refresh-btn"
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
            >
              🔄 Clear
            </button>
          </div>

          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Timestamp</th>
                <th>Details</th>
                <th>Record ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((log, index) => (
                  <tr key={index}>
                    <td
                      className={
                        log.status === "success" ? "success" : "failed"
                      }
                    >
                      {log.status === "success" ? "✔" : "✖"} {log.action}
                    </td>
                    <td>{log.user}</td>
                    <td>{log.timestamp}</td>
                    <td>{log.details}</td>
                    <td>{log.recordId}</td>
                    <td>
                      <button
                        className="details-btn"
                        onClick={() => navigate(`/audit-log/${log.recordId}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <p className="results-text">
            Showing {filteredData.length} of {auditData.length} records
          </p>
        </section>
      </div>
    </div>
  );
};

export default AuditLog;
