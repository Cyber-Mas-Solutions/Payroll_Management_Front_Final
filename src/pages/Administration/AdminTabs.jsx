import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { label: "Roles", path: "/administrative" },
  { label: "Departments", path: "/administrative/departments" },
  { label: "Shifts", path: "/administrative/shifts" },
  { label: "Holiday", path: "/administrative/holidays" },
  { label: "Announcements", path: "/administrative/announcements" },
];

const AdminTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="card"
      style={{ display: "flex", gap: "8px", overflowX: "auto", whiteSpace: "nowrap" }}
    >
      {TABS.map((t) => (
        <button
          key={t.path}
          className={`btn ${location.pathname === t.path ? "btn-primary" : "btn-soft"}`}
          onClick={() => navigate(t.path)}
          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default AdminTabs;