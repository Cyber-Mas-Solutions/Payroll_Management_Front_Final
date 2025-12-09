import React from "react";

const AddAnnouncementModal = ({ show, onClose, onAdd, newAnnouncement, setNewAnnouncement, isEditing }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[450px] max-w-[90%] relative" style={{ padding: "24px" }}>
        {/* Header */}
        <div className="flex justify-between items-center" style={{ marginBottom: "16px" }}>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Announcement" : "Add Announcement"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Title</label>
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              style={{ padding: "12px 8px" }}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter announcement title"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Announcement</label>
            <textarea
              value={newAnnouncement.announcement_text}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, announcement_text: e.target.value })}
              style={{ padding: "12px 8px" }}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter announcement message"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Start Date</label>
              <input
                type="date"
                value={newAnnouncement.start_date}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, start_date: e.target.value })}
                style={{ padding: "12px 8px" }}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>End Date</label>
              <input
                type="date"
                value={newAnnouncement.end_date}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, end_date: e.target.value })}
                style={{ padding: "12px 8px" }}
                className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Description</label>
            <textarea
              value={newAnnouncement.description}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
              style={{ padding: "12px 8px" }}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" style={{ marginBottom: "4px" }}>Created By</label>
            <input
              type="text"
              value={newAnnouncement.created_by}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, created_by: e.target.value })}
              style={{ padding: "12px 8px" }}
              className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Creator name"
            />
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

export default AddAnnouncementModal;
