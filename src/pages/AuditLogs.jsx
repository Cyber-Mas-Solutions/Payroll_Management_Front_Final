// src/pages/AuditLogs.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function AuditLogs() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const auditData = [
    { 
      id: 1, 
      time: "2023-10-15 09:23:45", 
      event: "Employee Created", 
      user: "HR Admin (admin@company.com)", 
      description: "Created new employee record for John Doe (EMPO01)", 
      module: "Employee" 
    },
    { 
      id: 2, 
      time: "2023-10-15 10:45:12", 
      event: "Document Uploaded", 
      user: "HR Admin (admin@company.com)", 
      description: "Uploaded Employment Contract for John Doe (EMPO01)", 
      module: "Document" 
    },
    { 
      id: 3, 
      time: "2023-10-16 11:32:08", 
      event: "Leave Approved", 
      user: "Michael Wilson (manager@company.com)", 
      description: "Approved annual leave request for Jane Smith (EMPO02)", 
      module: "Leave Management" 
    },
    { 
      id: 4, 
      time: "2023-10-17 14:15:30", 
      event: "Performance Review Added", 
      user: "Michael Wilson (manager@company.com)", 
      description: "Added performance review for Robert Johnson (EMPO03)", 
      module: "Performance" 
    },
    { 
      id: 5, 
      time: "2023-10-18 08:45:22", 
      event: "Employee Updated", 
      user: "HR Admin (admin@company.com)", 
      description: "Updated contact information for Emily Davis (EMPO04)", 
      module: "Employee" 
    },
    { 
      id: 6, 
      time: "2023-10-18 16:30:05", 
      event: "Document Deleted", 
      user: "HR Admin (admin@company.com)", 
      description: "Deleted outdated contract for Emily Davis (EMPO04)", 
      module: "Documents" 
    },
    { 
      id: 7, 
      time: "2023-10-19 10:05:18", 
      event: "Failed Login Attempt", 
      user: "Unknown", 
      description: "Multiple failed login attempts from unrecognized IP", 
      module: "Security" 
    }
  ];

  // Format datetime
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Filtered data
  const filteredData = auditData.filter((item) => {
    const itemDate = new Date(item.time);

    const matchesStartDate = startDate ? itemDate >= new Date(startDate) : true;
    const matchesEndDate = endDate ? itemDate <= new Date(endDate) : true;

    const matchesSearch = searchTerm
      ? item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.module.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesStartDate && matchesEndDate && matchesSearch;
  });

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Employee Information", "Audit Logs"]}
        title="Employee Information Management"
      />

      {/* Fixed Tabs Section */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="card" style={{ 
          display: "flex", 
          gap: "8px", 
          overflowX: "auto", 
          whiteSpace: "nowrap",
          marginBottom: 0,
          borderRadius: '0'
        }}>
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
      </div>

      {/* Scrollable Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Filters Card */}
        <div className="card">
          <div className="grid-3" style={{ alignItems: "end", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Start Date
              </label>
              <input
                className="input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                End Date
              </label>
              <input
                className="input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Search
              </label>
              <input
                className="input"
                type="text"
                placeholder="Search events, users, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(startDate || endDate || searchTerm) && (
                <button className="btn btn-soft" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              {filteredData.length} audit record(s)
            </div>
          </div>
        </div>

        {/* Audit Logs Table Section */}
        <div className="table-container">
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
              <div style={{ fontWeight: "700" }}>Audit Logs</div>
              <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
                Showing {filteredData.length} of {auditData.length} records
              </div>
            </div>

            <div style={{ overflowX: "auto", flex: 1 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>User</th>
                    <th>Description</th>
                    <th>Module</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontSize: "11px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                        {formatDateTime(item.time)}
                      </td>
                      <td>
                        <span style={{ fontWeight: "600" }}>{item.event}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="user-avatar" />
                          <div>
                            <div style={{ fontWeight: "600", fontSize: "12px" }}>
                              {item.user.split(" (")[0]}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                              {item.user.includes("(") ? item.user.split("(")[1].replace(")", "") : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: "12px", lineHeight: "1.4" }}>{item.description}</td>
                      <td>
                        <span className="pill" style={{ background: "var(--soft)", color: "var(--text)" }}>
                          {item.module}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!filteredData.length && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                        No audit records found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}