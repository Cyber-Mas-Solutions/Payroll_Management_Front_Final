import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const RoleManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Role Data ---
  const [roles, setRoles] = useState([
    {
      name: "HR",
      description: "Full access to HR functions and user management",
      users: 3,
      permissions: "View Employee Data, Edit Employee Data",
    },
    {
      name: "Admin",
      description: "Access to financial data and payroll processing",
      users: 2,
      permissions: "View Employee Data, Approve Payroll",
    },
    {
      name: "Employee",
      description: "Limited access to personal information only",
      users: 2,
      permissions: "View Personal Data",
    },
    {
      name: "Auditor",
      description: "Read-only access to all system data for audit purposes",
      users: 3,
      permissions: "View Employee Data, View Reports, Export Data",
    },
  ]);

  // --- Tabs ---
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

  // --- Search + Modal States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [roleData, setRoleData] = useState({
    name: "",
    description: "",
    users: 0,
    permissions: "",
  });

  const filteredRoles = roles.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      r.permissions.toLowerCase().includes(term)
    );
  });

  // --- Save Role ---
  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleData.name.trim()) return;

    if (isEditing && editingIndex !== null) {
      const updated = [...roles];
      updated[editingIndex] = roleData;
      setRoles(updated);
    } else {
      setRoles([...roles, roleData]);
    }

    setShowModal(false);
    setIsEditing(false);
    setEditingIndex(null);
    setRoleData({ name: "", description: "", users: 0, permissions: "" });
  };

  const handleEdit = (i) => {
    setRoleData(roles[i]);
    setEditingIndex(i);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (i) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
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
          <div className="page-header">
            <div className="breadcrumb">
              <span className="breadcrumb-item">Administration</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-item active">Role Management</span>
            </div>
            <h1 className="page-title">Role Management</h1>
            <p className="subtitle">Manage system roles and their permissions</p>
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

          {/* Search + Add */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              className="input"
              style={{ maxWidth: "300px" }}
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowModal(true);
                setIsEditing(false);
                setRoleData({ name: "", description: "", users: 0, permissions: "" });
              }}
            >
              + Add Role
            </button>
          </div>

          {/* Table */}
          <div className="table-container">
            {filteredRoles.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Users</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.description}</td>
                      <td>{r.users}</td>
                      <td>{r.permissions}</td>
                      <td>
                        <button className="btn btn-soft" onClick={() => handleEdit(i)}>
                          Edit
                        </button>{" "}
                        <button className="btn btn-soft" style={{ color: "red" }} onClick={() => handleDelete(i)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)" }}>
                No roles found matching your filters.
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "8px",
                  padding: "24px",
                  width: "420px",
                }}
              >
                <h2 style={{ marginBottom: "16px" }}>
                  {isEditing ? "Edit Role" : "Add New Role"}
                </h2>

                <form onSubmit={handleSaveRole}>
                  <label>
                    Role Name
                    <input
                      className="input"
                      value={roleData.name}
                      onChange={(e) => setRoleData({ ...roleData, name: e.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      className="input"
                      rows="3"
                      value={roleData.description}
                      onChange={(e) => setRoleData({ ...roleData, description: e.target.value })}
                      required
                    ></textarea>
                  </label>

                  <label>
                    Users (Count)
                    <input
                      className="input"
                      type="number"
                      value={roleData.users}
                      onChange={(e) => setRoleData({ ...roleData, users: Number(e.target.value) })}
                    />
                  </label>

                  <label>
                    Permissions (comma-separated)
                    <input
                      className="input"
                      value={roleData.permissions}
                      onChange={(e) => setRoleData({ ...roleData, permissions: e.target.value })}
                    />
                  </label>

                  <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                    <button type="button" className="btn btn-soft" onClick={() => setShowModal(false)}>
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

export default RoleManagement;
