import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";


const UserManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs navigation (same set as other admin pages)
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

  // --- State: User list ---
  const [users, setUsers] = useState([
    { name: "Rashmi Jayathunga", email: "rashmi.jayathunga@company.com", role: "HR Admin", status: "Active", lastLogin: "2023-09-15 09:32:41" },
    { name: "Kamal Perera", email: "kamal.perera@company.com", role: "Finance", status: "Active", lastLogin: "2023-09-15 09:32:41" },
    { name: "Nimesha Fernando", email: "nimesha.fernando@company.com", role: "IT Support", status: "Inactive", lastLogin: "2023-09-15 09:32:41" },
    { name: "Sajini Weerasinghe", email: "sajini.weerasinghe@company.com", role: "Operations Manager", status: "Active", lastLogin: "2023-09-15 09:32:41" },
    { name: "Chathura Ranasinghe", email: "chathura.ranasinghe@company.com", role: "Marketing Executive", status: "Inactive", lastLogin: "2023-09-15 09:32:41" },
  ]);

  // --- Filter states ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // --- Modal states ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "HR Admin",
    status: "Active",
  });

  // --- Filtering logic ---
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "All Status" || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // --- Add or Update user ---
  const handleSaveUser = (e) => {
    e.preventDefault();

    if (isEditing && editingIndex !== null) {
      const updated = [...users];
      updated[editingIndex] = { ...newUser, lastLogin: users[editingIndex].lastLogin };
      setUsers(updated);
    } else {
      setUsers([...users, { ...newUser, lastLogin: "Never" }]);
    }

    setShowModal(false);
    setIsEditing(false);
    setEditingIndex(null);
    setNewUser({ name: "", email: "", role: "HR Admin", status: "Active" });
  };

  // --- Edit user ---
  const handleEdit = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
    setNewUser({
      name: users[index].name,
      email: users[index].email,
      role: users[index].role,
      status: users[index].status,
    });
    setShowModal(true);
  };

  // --- Delete user ---
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((_, i) => i !== index));
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
              <span className="breadcrumb-item active">User Management</span>
            </div>
            <h1 className="page-title">User Management</h1>
            <p className="subtitle">Manage user accounts and their access levels</p>
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

          {/* Filter Bar */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              className="input"
              style={{ maxWidth: "220px" }}
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="select"
              style={{ maxWidth: "160px" }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option>All Roles</option>
              <option>HR Admin</option>
              <option>Finance</option>
              <option>IT Support</option>
              <option>Operations Manager</option>
              <option>Marketing Executive</option>
            </select>

            <select
              className="select"
              style={{ maxWidth: "150px" }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <button className="btn btn-primary" onClick={() => {
              setIsEditing(false);
              setNewUser({ name: "", email: "", role: "HR Admin", status: "Active" });
              setShowModal(true);
            }}>
              + Add User
            </button>
          </div>

          {/* Table */}
          <div className="table-container">
            {filteredUsers.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={i}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <span className={`pill ${u.status === "Active" ? "pill-ok" : "pill-warn"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>{u.lastLogin}</td>
                      <td style={{ textAlign: "center" }}>
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
                No users found matching your filters.
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
                  width: "400px",
                }}
              >
                <h2 style={{ marginBottom: "16px" }}>
                  {isEditing ? "Edit User" : "Add New User"}
                </h2>

                <form onSubmit={handleSaveUser}>
                  <label>
                    Full Name
                    <input
                      className="input"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Email Address
                    <input
                      className="input"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Role
                    <select
                      className="select"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option>HR Admin</option>
                      <option>Finance</option>
                      <option>IT Support</option>
                      <option>Operations Manager</option>
                      <option>Marketing Executive</option>
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      className="select"
                      value={newUser.status}
                      onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
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

export default UserManagement;
