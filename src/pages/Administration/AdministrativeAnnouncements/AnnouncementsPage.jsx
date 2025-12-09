import React, { useState } from "react";
import Layout from "../../../components/Layout";
import PageHeader from "../../../components/PageHeader";
import AdminTabs from "../AdminTabs";
import AnnouncementsTable from "./AnnouncementsTable";
import AddAnnouncementModal from "./AddAnnouncementModal";
import { useEffect } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../services/api";

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState({
    title: "",
    announcement_text: "",
    start_date: "",
    end_date: "",
    description: "",
    created_by: "",
    status: "Active",
  });


  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/announcements");
      console.log(res);
      setAnnouncements(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      console.error("Failed to load announcements", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };


  // GLOBAL SEARCH ACROSS ALL FIELDS
  const filteredAnnouncements = announcements.filter((a) =>
    Object.values(a).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ADD NEW
  const handleAddClick = () => {
    setCurrentAnnouncement({
      title: "", announcement_text: "", start_date: "", end_date: "",
      description: "", created_by: "", status: "Active",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // EDIT
  const handleEditClick = (announcement) => {
    setCurrentAnnouncement(announcement);
    setIsEditing(true);
    setShowModal(true);
  };

  // SAVE (ADD OR UPDATE)
  const handleSaveAnnouncement = async () => {
    try {
      console.log("Saving announcement:", currentAnnouncement);
      if (isEditing) {
        const res = await apiPut(`/announcements/${currentAnnouncement.announcement_id}`, currentAnnouncement);
        console.log(res);
      } else {
        const res = await apiPost(`/announcements`, currentAnnouncement);
        console.log(res);
      }

      setShowModal(false);
      loadAnnouncements(); // refresh table

    } catch (err) {
      console.error("Save failed", err);
      alert("Error saving announcement");
    }
  };

  // DELETE
  const handleDeleteClick = async (announcement) => {
    if (!window.confirm(`Delete announcement "${announcement.title}"?`)) return;

    try {
      await apiDelete(`/announcements/${announcement.announcement_id}`);
      loadAnnouncements();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Error deleting");
    }
  };


  const formatDate = (d) => {
    const date = new Date(d);
    if (Number.isNaN(date)) return d;
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${m}/${day}/${date.getFullYear()}`;
  };

  return (
    <Layout>
      <PageHeader breadcrumb={["Administrative", "Announcements"]} title="Announcements" />
      <AdminTabs />

      {/* Search + Add Button */}
      <div className="card p-3 mb-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search announcements, dates, creators..."
          style={{ width: "320px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleAddClick}>
          + Add Announcement
        </button>
      </div>

      <AnnouncementsTable
        announcements={filteredAnnouncements}
        onEdit={handleEditClick}
        formatDate={formatDate}
        onDelete={handleDeleteClick}
      />

      <AddAnnouncementModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleSaveAnnouncement}
        newAnnouncement={currentAnnouncement}
        setNewAnnouncement={setCurrentAnnouncement}
        isEditing={isEditing}
      />
    </Layout>
  );
};

export default AnnouncementsPage;
