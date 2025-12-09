import React, { useState } from "react";
import Layout from "../../../components/Layout";
import PageHeader from "../../../components/PageHeader";
import AdminTabs from "../AdminTabs";
import AddShiftModal from "./AddShiftModal";
import ShiftsTable from "./ShiftsTable";

const ShiftsPage = () => {
  const [shifts, setShifts] = useState([
    { id: 201, start_date: "2024-01-10", end_date: "2024-01-10", start_time: "09:00 AM", end_time: "05:00 PM", type: "Regular", status: "Active", created_at: "2024-01-05" },
    { id: 202, start_date: "2024-02-01", end_date: "2024-02-01", start_time: "08:00 PM", end_time: "04:00 AM", type: "Night", status: "Inactive", created_at: "2024-01-20" },
    { id: 203, start_date: "2024-03-05", end_date: "2024-03-05", start_time: "10:00 AM", end_time: "06:00 PM", type: "Flexible", status: "Active", created_at: "2024-02-28" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentShift, setCurrentShift] = useState({
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    type: "",
    status: "Active",
  });

  // FILTERING
  const filteredShifts = shifts.filter((shift) =>
    Object.values(shift).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Add Modal
  const handleAddClick = () => {
    setCurrentShift({ start_date: "", end_date: "", start_time: "", end_time: "", type: "", status: "Active" });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleEditClick = (shift) => {
    setCurrentShift(shift);
    setIsEditing(true);
    setShowModal(true);
  };

  // Save (Add/Edit) Shift
  const handleSaveShift = () => {
    if (isEditing) {
      setShifts(shifts.map((s) => (s.id === currentShift.id ? currentShift : s)));
    } else {
      const id = Math.floor(Math.random() * 1000) + 200;
      setShifts([...shifts, { ...currentShift, id, created_at: new Date().toISOString().split("T")[0] }]);
    }
    setShowModal(false);
  };

  // Delete Shift
  const handleDeleteClick = (shift) => {
    if (window.confirm(`Are you sure you want to delete this shift from ${shift.start_date}?`)) {
      setShifts(shifts.filter((s) => s.id !== shift.id));
    }
  };

  // FORMAT DATE
  const formatDate = (d) => {
    const date = new Date(d);
    if (Number.isNaN(date)) return d;
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${m}/${day}/${date.getFullYear()}`;
  };

  return (
    <Layout>
      <PageHeader breadcrumb={["Administrative", "Shifts"]} title="Shifts" />
      <AdminTabs />

      {/* Search + Add button */}
      <div className="card p-3 mb-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search shifts, type, status, dates..."
          style={{ width: "300px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add Shift
        </button>
      </div>

      <ShiftsTable
        shifts={filteredShifts}
        formatDate={formatDate}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <AddShiftModal
        show={showModal}
        onClose={() => setShowModal(false)}
        newShift={currentShift}
        setNewShift={setCurrentShift}
        onSave={handleSaveShift}
        isEditing={isEditing}
      />
    </Layout>
  );
};

export default ShiftsPage;
