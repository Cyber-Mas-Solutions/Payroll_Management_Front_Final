import React from "react";

const AddDepartmentModal = ({ show, onClose, newDept, setNewDept,onSave, isEditing }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" style={{}}>
      <div className="bg-white rounded-2xl shadow-xl w-[400px] max-w-[90%] relative" style={{padding: "24px"}}>
        {/* Header */}
        <div className="flex justify-between items-center" style={{marginBottom:'16px'}}>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Department" : "Add Department"}
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
            <label className="block text-gray-700 font-medium" style={{marginBottom : '4px'}}>Department Name</label>
            <input
              type="text"
              value={newDept.name}
              onChange={(e) =>
                setNewDept({ ...newDept, name: e.target.value })
              }
              style={{padding:'12px 8px'}}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter department name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{marginBottom : '4px'}}>Manager Name</label>
            <input
              type="text"
              value={newDept.manager_name}
              onChange={(e) =>
                setNewDept({ ...newDept, manager_name: e.target.value })
              }
              style={{padding:'12px 8px'}}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter manager name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{marginBottom : '4px'}}>Description</label>
            <textarea
              value={newDept.description}
              onChange={(e) =>
                setNewDept({ ...newDept, description: e.target.value })
              }
              style={{padding:'12px 8px'}}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{marginBottom : '4px'}}>Status</label>
            <select
              value={newDept.status}
              onChange={(e) =>
                setNewDept({ ...newDept, status: e.target.value })
              }
              style={{padding:'12px 8px'}}
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
            style={{padding:'12px 8px'}}
            className="rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{padding:'12px 8px'}}
            className="rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDepartmentModal;