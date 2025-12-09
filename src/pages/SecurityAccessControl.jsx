import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/SecurityAccessControl.css"; // optional, if you use a specific style file

const SecurityAccessControl = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs navigation
  const tabs = [
    { label: "Security & Access Control", path: "/security-access-control" },
    { label: "User Manage", path: "/user-management" },
    { label: "Role Manage", path: "/role-management" },
    { label: "Access Control", path: "/access-control" },
    { label: "Security Logs", path: "/security-logs" },
    { label: "Audit Log", path: "/audit-log" },
    { label: "Encryption Status", path: "/encryption-status" },
    { label: "Backup & Recovery", path: "/backup-recovery" },
  ];

  const activities = [
    { name: "Kamal Perera", action: "Updated user permissions", time: "2023-09-15 14:32:41" },
    { name: "Maneesha Gamage", action: "Created new role", time: "2023-09-15 11:15:22" },
    { name: "Admin", action: "System backup completed", time: "2023-09-15 14:32:41" },
    { name: "Admin", action: "Login from unrecognized location", time: "2023-09-15 03:00:00" },
  ];

  const handleAddUser = () => navigate("/user-management");
  const handleAddRole = () => navigate("/role-management");
  const handleAccessControl = () => navigate("/access-control");

  return (
    <div className="app-shell">
      <div className="app-sidebar">
        <Sidebar />
      </div>

      <div className="app-main">
        <div className="app-topbar">
          <Header />
        </div>

        <div className="app-content">
          {/* ===== Page Header ===== */}
          <div className="page-header">
            <div className="breadcrumb">
              <span className="breadcrumb-item">Administration</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-item active">Security & Access Control</span>
            </div>
            <h1 className="page-title">Security & Access Control</h1>
            <p className="subtitle">
              Manage roles, user permissions, and monitor system security status.
            </p>
          </div>

          {/* ===== Tabs ===== */}
          <div className="card" style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {tabs.map((t) => (
              <button
                key={t.path}
                className={`btn ${location.pathname === t.path ? "btn-primary" : "btn-soft"}`}
                onClick={() => navigate(t.path)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ===== Overview Section ===== */}
          <div className="card grid-4">
            <div
              className="overview-box"
              onClick={() => navigate("/user-management")}
              style={{ cursor: "pointer" }}
            >
              <div className="box-icon">👤</div>
              <div>
                <div className="box-stat">58</div>
                <p className="muted">View all users →</p>
              </div>
            </div>

            <div
              className="overview-box active"
              onClick={() => navigate("/role-management")}
              style={{ cursor: "pointer" }}
            >
              <div className="box-icon">🧑‍💼</div>
              <div>
                <div className="box-stat">4</div>
                <p className="muted">Manage roles →</p>
              </div>
            </div>

            <div
              className="overview-box alert"
              onClick={() => navigate("/security-logs")}
              style={{ cursor: "pointer" }}
            >
              <div className="box-icon">⚠️</div>
              <div>
                <div className="box-stat">2</div>
                <p className="muted">View alerts →</p>
              </div>
            </div>

            <div
              className="overview-box encryption"
              onClick={() => navigate("/encryption-status")}
              style={{ cursor: "pointer" }}
            >
              <div className="box-icon">🔒</div>
              <div>
                <div className="box-stat pill pill-ok">Active</div>
                <p className="muted">View details →</p>
              </div>
            </div>
          </div>

          {/* ===== Quick Access ===== */}
          <div className="card">
            <h3 className="section-title">Quick Access</h3>
            <div className="grid-3" style={{ gap: "12px" }}>
              <div className="quick-card btn btn-soft" onClick={handleAddUser}>
                Add New User <span>Create user account</span>
              </div>
              <div className="quick-card btn btn-soft" onClick={handleAddRole}>
                Add New Role <span>Define Permissions</span>
              </div>
              <div className="quick-card btn btn-soft" onClick={handleAccessControl}>
                Access Control <span>Manage Permissions</span>
              </div>
            </div>
          </div>

          {/* ===== Recent Activities ===== */}
          <div className="card">
            <h3 className="section-title">Recent Activities</h3>
            <div>
              {activities.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <strong>{a.name}</strong> — <span>{a.action}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{a.time}</div>
                </div>
              ))}
              <div
                style={{
                  marginTop: "8px",
                  color: "var(--brand)",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                View all activities →
              </div>
            </div>
          </div>

          {/* ===== System Status ===== */}
          <div className="card">
            <h3 className="section-title">System Status</h3>
            <div className="grid-2">
              <div>
                <strong>Last System Backup:</strong> 2023-09-15 03:00:00
              </div>
              <div>
                <strong>Encryption Status:</strong>{" "}
                <span className="pill pill-ok">Active</span>
              </div>
              <div>
                <strong>Last Login Activity:</strong> 2023-09-15 14:32:41
              </div>
              <div>
                <strong>Firewall Status:</strong>{" "}
                <span className="pill pill-ok">Enabled</span>
              </div>
            </div>
          </div>

          {/* ===== Security Recommendations ===== */}
          <div className="card">
            <h3 className="section-title">Security Recommendations</h3>
            <ul style={{ fontSize: "14px", color: "var(--muted)", paddingLeft: "16px" }}>
              <li>Regularly update passwords for all admin accounts.</li>
              <li>Enable multi-factor authentication (MFA) for sensitive roles.</li>
              <li>Review role-based permissions monthly.</li>
              <li>Schedule automatic system backups every 24 hours.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAccessControl;
