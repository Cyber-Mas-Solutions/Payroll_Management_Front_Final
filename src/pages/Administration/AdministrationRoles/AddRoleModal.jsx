import React from "react";

const AddRoleModal = ({ show, onClose, onAdd, newRole, setNewRole, isEditing }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-[90%] relative" style={{ padding: "24px" }}>
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: "16px" }}>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Role" : "Add New Role"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Role Name</label>
            <input
              type="text"
              value={newRole.role_name}
              onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value })}
              style={{ padding: "12px 8px" }}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter role name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Permissions</label>
            <textarea
              value={newRole.permissions}
              onChange={(e) => setNewRole({ ...newRole, permissions: e.target.value })}
              style={{ padding: "12px 8px" }}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter permissions"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Status</label>
            <select
              value={newRole.status}
              onChange={(e) => setNewRole({ ...newRole, status: e.target.value })}
              style={{ padding: "12px 8px" }}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            style={{ padding: "12px 8px" }}
            className="rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            style={{ padding: "12px 8px" }}
            className="rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoleModal;
