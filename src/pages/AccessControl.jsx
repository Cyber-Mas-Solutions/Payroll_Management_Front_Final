import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const AccessControl = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [permissions, setPermissions] = useState([
    { name: "View Employee Data", hr: true, finance: false, employee: false, auditor: true },
    { name: "Edit Employee Data", hr: false, finance: true, employee: false, auditor: false },
    { name: "Approve Payroll", hr: true, finance: true, employee: false, auditor: false },
    { name: "Delete Records", hr: true, finance: false, employee: false, auditor: false },
    { name: "Manage User Accounts", hr: true, finance: false, employee: false, auditor: false },
    { name: "Export Data", hr: true, finance: false, employee: false, auditor: true },
  ]);

  const [roles, setRoles] = useState([
    { name: "HR Admin", desc: "Full access to HR functions and user management" },
    { name: "Finance", desc: "Access to financial data and payroll processing" },
    { name: "Employee", desc: "Limited access to personal information only" },
    { name: "Auditor", desc: "Read-only access to all system data for audit purposes" },
  ]);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newPermission, setNewPermission] = useState({
    name: "",
    hr: false,
    finance: false,
    employee: false,
    auditor: false,
  });
  const [newRole, setNewRole] = useState({ name: "", desc: "" });

  const handleToggle = (permIndex, role) => {
    const updated = [...permissions];
    updated[permIndex][role] = !updated[permIndex][role];
    setPermissions(updated);
  };

  const handleSave = () => alert("Changes saved successfully!");

  const handleAddPermission = (e) => {
    e.preventDefault();
    if (!newPermission.name.trim()) return alert("Enter permission name");
    setPermissions([...permissions, newPermission]);
    setNewPermission({ name: "", hr: false, finance: false, employee: false, auditor: false });
    setShowPermissionModal(false);
  };

  const handleAddOrEditRole = (e) => {
    e.preventDefault();
    if (!newRole.name.trim() || !newRole.desc.trim()) return alert("Please fill in all fields.");

    const updated = [...roles];
    if (isEditing && editIndex !== null) updated[editIndex] = newRole;
    else updated.push(newRole);

    setRoles(updated);
    setNewRole({ name: "", desc: "" });
    setShowRoleModal(false);
    setIsEditing(false);
  };

  const handleEditRole = (i) => {
    setNewRole(roles[i]);
    setEditIndex(i);
    setIsEditing(true);
    setShowRoleModal(true);
  };

  const handleDeleteRole = (i) => {
    if (window.confirm(`Delete role "${roles[i].name}"?`)) {
      setRoles(roles.filter((_, index) => index !== i));
    }
  };

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
          {/* Page Header */}
          <div className="page-header">
            <div className="breadcrumb">
              <span className="breadcrumb-item">Administration</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-item active">Access Control</span>
            </div>
            <h1 className="page-title">Access Control</h1>
            <p className="subtitle">Manage role-based permissions for system access</p>
          </div>

          {/* Tabs */}
          <div className="card" style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {tabs.map((t) => (
              <button
                key={t.path}
                className={`btn btn-soft ${location.pathname === t.path ? "btn-primary" : ""}`}
                onClick={() => navigate(t.path)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Permission Matrix */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <h3 className="section-title">Role Permissions</h3>
                <p>Configure what each role can access and modify.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowPermissionModal(true)}>
                + Add Permission
              </button>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Permission / Role</th>
                  <th>HR</th>
                  <th>Finance</th>
                  <th>Employee</th>
                  <th>Auditor</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    {["hr", "finance", "employee", "auditor"].map((role) => (
                      <td key={role} style={{ textAlign: "center" }}>
                        <label className="switch small">
                          <input
                            type="checkbox"
                            checked={p[role]}
                            onChange={() => handleToggle(i, role)}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: "right", marginTop: "12px" }}>
              <button className="btn btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>

          {/* Role Management */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <h3 className="section-title">Role Management</h3>
                <p>Create and modify system roles.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowRoleModal(true)}>
                + Add New Role
              </button>
            </div>

            {roles.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #eee",
                  padding: "8px 0",
                }}
              >
                <div>
                  <strong>{r.name}</strong>
                  <p style={{ margin: "4px 0", color: "#666", fontSize: "13px" }}>{r.desc}</p>
                </div>
                <div>
                  <button className="btn btn-soft" onClick={() => handleEditRole(i)}>
                    Edit
                  </button>{" "}
                  <button className="btn btn-soft" style={{ color: "red" }} onClick={() => handleDeleteRole(i)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* === Add Permission Modal === */}
          {showPermissionModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Add New Permission</h2>
                <form onSubmit={handleAddPermission}>
                  <label>
                    Permission Name
                    <input
                      className="input"
                      value={newPermission.name}
                      onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Assign to Roles:
                    <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                      {["hr", "finance", "employee", "auditor"].map((r) => (
                        <label key={r}>
                          <input
                            type="checkbox"
                            checked={newPermission[r]}
                            onChange={() =>
                              setNewPermission({ ...newPermission, [r]: !newPermission[r] })
                            }
                          />{" "}
                          {r.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </label>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                    <button type="button" className="btn btn-soft" onClick={() => setShowPermissionModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* === Add/Edit Role Modal === */}
          {showRoleModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>{isEditing ? "Edit Role" : "Add New Role"}</h2>
                <form onSubmit={handleAddOrEditRole}>
                  <label>
                    Role Name
                    <input
                      className="input"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      className="input"
                      rows="3"
                      value={newRole.desc}
                      onChange={(e) => setNewRole({ ...newRole, desc: e.target.value })}
                      required
                    ></textarea>
                  </label>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                    <button type="button" className="btn btn-soft" onClick={() => setShowRoleModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
