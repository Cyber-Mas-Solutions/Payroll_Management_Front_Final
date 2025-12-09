import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/AuditLogDetails.css";

const AuditLogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);

  useEffect(() => {
    // Simulated API call to fetch details
    const mockLogs = [
      {
        recordId: "EMP-01",
        action: "Edited Employee Salary",
        user: "rashmi@company.com",
        timestamp: "2023-09-15 09:32:41",
        details: "Changed salary for employee ID: EMP-1023 from $65,000 to $68,000",
        ip: "192.168.1.45",
        ipChain: "203.0.113.5, 198.51.100.7",
        status: "success",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    ];

    const found = mockLogs.find((l) => l.recordId === id);
    setLog(found || null);
  }, [id]);

  if (!log) {
    return (
      <div className="audit-details-container">
        <Sidebar />
        <div className="audit-details-content">
          <Header />
          <p className="loading">No details found for record ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-details-container">
      <Sidebar />
      <div className="audit-details-content">
        <Header />

        <div className="details-header">
          <h1>Audit Log Details</h1>
          <button className="back-btn" onClick={() => navigate("/audit-log")}>
            ← Back to Audit Log
          </button>
        </div>

        <div className="log-card">
          <h2>
            {log.status === "success" ? "✅" : "❌"} {log.action}
          </h2>

          <div className="log-info">
            <p><strong>User:</strong> {log.user}</p>
            <p><strong>Timestamp:</strong> {log.timestamp}</p>
            <p><strong>Record ID:</strong> {log.recordId}</p>
            <p><strong>Details:</strong> {log.details}</p>
          </div>

          <hr />

          <div className="security-info">
            <h3>Security Information</h3>
            <p><strong>IP Address:</strong> <code>{log.ip}</code></p>
            <p><strong>Proxy Chain:</strong> <code>{log.ipChain}</code></p>
            <p><strong>User Agent:</strong> {log.userAgent}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-badge ${log.status}`}>
                {log.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetails;
