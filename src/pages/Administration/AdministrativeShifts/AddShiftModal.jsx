import React from "react";

const AddShiftModal = ({ show, onClose, newShift, setNewShift, onSave, isEditing}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[450px] max-w-[90%] relative" style={{ padding: "24px" }}>
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: "16px" }}>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Shift" : "Add New Shift"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Start Date</label>
              <input
                type="date"
                value={newShift.start_date}
                onChange={(e) => setNewShift({ ...newShift, start_date: e.target.value })}
                style={{ padding: "12px 8px" }}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>End Date</label>
              <input
                type="date"
                value={newShift.end_date}
                onChange={(e) => setNewShift({ ...newShift, end_date: e.target.value })}
                style={{ padding: "12px 8px" }}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Start Time</label>
              <input
                type="time"
                value={newShift.start_time}
                onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                style={{ padding: "12px 8px" }}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>End Time</label>
              <input
                type="time"
                value={newShift.end_time}
                onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                style={{ padding: "12px 8px" }}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Type</label>
            <input
              type="text"
              value={newShift.type}
              onChange={(e) => setNewShift({ ...newShift, type: e.target.value })}
              style={{ padding: "12px 8px" }}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter shift type"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Status</label>
            <select
              value={newShift.status}
              onChange={(e) => setNewShift({ ...newShift, status: e.target.value })}
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
            onClick={onSave}
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

export default AddShiftModal;