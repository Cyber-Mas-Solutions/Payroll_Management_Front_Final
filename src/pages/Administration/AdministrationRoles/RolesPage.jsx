import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import PageHeader from '../../../components/PageHeader';
import AdminTabs from '../AdminTabs';
import RolesTable from './RolesTable';
import AddRoleModal from './AddRoleModal';

const RolesPage = () => {
  const [roles, setRoles] = useState([
    { id: 1, role_name: "HR Manager", permissions: "Employee Management, Leave Approval", status: "Active", created_at: "2024-05-12" },
    { id: 2, role_name: "Accountant", permissions: "Payroll, Finance Reports", status: "Inactive", created_at: "2023-11-01" },
    { id: 3, role_name: "Admin", permissions: "Full System Access", status: "Active", created_at: "2022-03-18" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [currentRole, setCurrentRole] = useState({ role_name: "", permissions: "", status: "Active" });
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter roles by ANY field
  const filteredRoles = roles.filter((role) =>
    Object.values(role)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Add Modal
  const handleAddClick = () => {
    setCurrentRole({ role_name: "", permissions: "", status: "Active" });
    setIsEditing(false);
    setShowModal(true);
  };

  // Edit Modal
  const handleEditClick = (role) => {
    setCurrentRole(role);
    setIsEditing(true);
    setShowModal(true);
  };

  // Save Role
  const handleSaveRole = () => {
    if (isEditing) {
      setRoles(roles.map(r => r.id === currentRole.id ? currentRole : r));
    } else {
      const id = Math.floor(Math.random() * 1000) + 200;
      setRoles([...roles, { ...currentRole, id, created_at: new Date().toISOString().split("T")[0] }]);
    }
    setShowModal(false);
  };

  // Delete Role
  const handleDeleteClick = (role) => {
    if (window.confirm(`Are you sure you want to delete "${role.role_name}"?`)) {
      setRoles(roles.filter(r => r.id !== role.id));
    }
  };

  return (
    <Layout>
      <PageHeader breadcrumb={["Administrative", "Roles"]} title="Roles" />
      <AdminTabs />

      <div className="card p-3 mb-3 flex justify-between" style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search roles, permissions, status, date..."
          className="form-control"
          style={{ width: "300px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add Role
        </button>
      </div>

      <RolesTable
        roles={filteredRoles}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <AddRoleModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleSaveRole}
        newRole={currentRole}
        setNewRole={setCurrentRole}
        isEditing={isEditing}
      />
    </Layout>
  );
};

export default RolesPage;
