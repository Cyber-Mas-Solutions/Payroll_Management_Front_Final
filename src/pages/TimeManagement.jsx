// src/pages/TimeManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { attendanceApi } from "../services/api";

const TimeManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Overview", path: "/attendance-overview" },
    { label: "Time Management", path: "/time-management" },
    { label: "Absence Report", path: "/absence-report" },
    { label: "Attendance Adjustment", path: "/attendance-adjustment" },
    { label: "Check In & Check Out Report", path: "/checkin-checkout-report" },
  ];

  // data state
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ui state
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // modal state: create/edit
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);

  // form state
  const emptyForm = {
    name: "",
    checkInStart: "",
    checkInEnd: "",
    graceStart: "",
    graceEnd: "",
    checkOutStart: "",
    checkOutEnd: "",
    type: "Roster",
  };

  const [newTimetable, setNewTimetable] = useState(emptyForm);

  // helpers
  const onInput = (e) => {
    const { name, value } = e.target;
    setNewTimetable((s) => ({ ...s, [name]: value }));
  };

  // Convert values safely:
  // - time input gives "HH:mm"
  // - API might return "HH:mm:ss"
  const hhmmToHhmmss = (t) => (t ? `${t}:00` : "");
  const hhmmssToHhmm = (t) => {
    if (!t) return "";
    // handles "HH:mm:ss" or "HH:mm"
    const parts = String(t).split(":");
    return parts.length >= 2 ? `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}` : "";
  };

  // load timetables
  const fetchTimetables = () => {
    setLoading(true);
    setErr("");
    attendanceApi
      .getTimetables()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        const mapped = list.map((r) => ({
          id: r.id || r.timetable_id || r.ID,
          name: r.name,
          checkInStart: r.check_in_start || r.checkInStart,
          checkInEnd: r.check_in_end || r.checkInEnd,
          graceStart: r.grace_start || r.graceStart,
          graceEnd: r.grace_end || r.graceEnd,
          checkOutStart: r.check_out_start || r.checkOutStart,
          checkOutEnd: r.check_out_end || r.checkOutEnd,
          type: r.type || r.timetable_type || "Roster",
        }));
        setTimetables(mapped);
      })
      .catch((e) => setErr(e.message || "Failed to load timetables"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  // open create modal
  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setNewTimetable(emptyForm);
    setShowModal(true);
  };

  // open edit modal (prefill)
  const openEdit = (t) => {
    setMode("edit");
    setEditingId(t.id);
    setNewTimetable({
      name: t.name || "",
      checkInStart: hhmmssToHhmm(t.checkInStart),
      checkInEnd: hhmmssToHhmm(t.checkInEnd),
      graceStart: hhmmssToHhmm(t.graceStart),
      graceEnd: hhmmssToHhmm(t.graceEnd),
      checkOutStart: hhmmssToHhmm(t.checkOutStart),
      checkOutEnd: hhmmssToHhmm(t.checkOutEnd),
      type: t.type || "Roster",
    });
    setShowModal(true);
  };

  // validate required fields
  const validate = () => {
    if (
      !newTimetable.name ||
      !newTimetable.checkInStart ||
      !newTimetable.checkInEnd ||
      !newTimetable.checkOutStart ||
      !newTimetable.checkOutEnd
    ) {
      alert("Please fill in all required fields (*).");
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    name: newTimetable.name,
    check_in_start: hhmmToHhmmss(newTimetable.checkInStart),
    check_in_end: hhmmToHhmmss(newTimetable.checkInEnd),
    grace_start: hhmmToHhmmss(newTimetable.graceStart),
    grace_end: hhmmToHhmmss(newTimetable.graceEnd),
    check_out_start: hhmmToHhmmss(newTimetable.checkOutStart),
    check_out_end: hhmmToHhmmss(newTimetable.checkOutEnd),
    type: newTimetable.type, // "Roster" | "Fixed"
  });

  // create
  const handleCreateTimetable = async () => {
    if (!validate()) return;

    try {
      setErr("");
      await attendanceApi.createTimetable(buildPayload());
      setShowModal(false);
      setNewTimetable(emptyForm);
      fetchTimetables();
    } catch (e) {
      setErr(e.message || "Failed to create timetable");
    }
  };

  // update
  const handleUpdateTimetable = async () => {
    if (!editingId) return;
    if (!validate()) return;

    const payload = buildPayload();

    try {
      setErr("");

      // 1) call backend
      // IMPORTANT: adjust this function name to your API implementation
      await attendanceApi.updateTimetable(editingId, payload);

      // 2) update table immediately (optimistic UI)
      setTimetables((prev) =>
        prev.map((x) =>
          x.id === editingId
            ? {
                ...x,
                name: payload.name,
                checkInStart: payload.check_in_start,
                checkInEnd: payload.check_in_end,
                graceStart: payload.grace_start,
                graceEnd: payload.grace_end,
                checkOutStart: payload.check_out_start,
                checkOutEnd: payload.check_out_end,
                type: payload.type,
              }
            : x
        )
      );

      // 3) close + refresh to ensure synced with backend
      setShowModal(false);
      setEditingId(null);
      setNewTimetable(emptyForm);
      fetchTimetables();
    } catch (e) {
      setErr(e.message || "Failed to update timetable");
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this timetable?")) return;
    try {
      await attendanceApi.deleteTimetable(id);
      setTimetables((t) => t.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete timetable");
    }
  };

  const clearSearch = () => setSearchTerm("");

  const filteredTimetables = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return timetables;
    return timetables.filter((t) => (t.name || "").toLowerCase().includes(q));
  }, [timetables, searchTerm]);

  return (
    <Layout>
      <PageHeader breadcrumb={["Time & Attendance", "Time Management"]} title="Timetable Management" />

      {/* Tabs */}
      <div className="card" style={{ display: "flex", gap: 8, overflowX: "auto", whiteSpace: "nowrap", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`btn ${location.pathname === tab.path ? "btn-primary" : "btn-soft"}`}
            onClick={() => navigate(tab.path)}
            style={{ whiteSpace: "nowrap" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + create */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>
            <label className="muted-label">Search</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                placeholder="Search by Timetable Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
              {searchTerm && (
                <button className="btn btn-soft" onClick={clearSearch} style={{ whiteSpace: "nowrap" }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <button className="btn btn-primary" onClick={openCreate} style={{ whiteSpace: "nowrap" }}>
            + Create Timetable
          </button>
        </div>

        <div style={{ marginTop: 12, fontSize: 14, color: "var(--muted)" }}>
          {loading ? "Loading…" : `${filteredTimetables.length} timetable(s) found`}
        </div>
      </div>

      {/* error */}
      {err && (
        <div className="card" style={{ color: "var(--danger)" }}>
          {err}
        </div>
      )}

      {/* table */}
      <div className="table-container">
        <div className="card" style={{ padding: 0 }}>
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 700 }}>Timetables</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {loading ? "Loading…" : `Showing ${filteredTimetables.length} records`}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 980 }}>
              <thead>
                <tr>
                  <th>Timetable Name</th>
                  <th>Start Check-in Time</th>
                  <th>End Check-in Time</th>
                  <th>Start Check-out Time</th>
                  <th>End Check-out Time</th>
                  <th>Type</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 40 }}>
                      Loading…
                    </td>
                  </tr>
                ) : filteredTimetables.length ? (
                  filteredTimetables.map((t) => (
                    <tr key={t.id || t.name}>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>{t.checkInStart || "—"}</td>
                      <td>{t.checkInEnd || "—"}</td>
                      <td>{t.checkOutStart || "—"}</td>
                      <td>{t.checkOutEnd || "—"}</td>
                      <td>{t.type || "—"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn btn-soft"
                            style={{ fontSize: 12, padding: "4px 8px" }}
                            onClick={() => openEdit(t)}
                            disabled={!t.id}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-soft"
                            style={{ fontSize: 12, padding: "4px 8px", color: "var(--danger)" }}
                            onClick={() => handleDelete(t.id)}
                            disabled={!t.id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                      No timetables found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 12,
          }}
        >
          <div
            style={{
              background: "var(--panel)",
              borderRadius: 8,
              width: "100%",
              maxWidth: 800,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                {mode === "edit" ? "Edit Timetable" : "Create Timetable"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--muted)" }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Timetable Details</h3>

                <div style={{ marginBottom: 16 }}>
                  <label className="muted-label">Name *</label>
                  <input
                    className="input"
                    type="text"
                    name="name"
                    placeholder="Enter timetable name"
                    value={newTimetable.name}
                    onChange={onInput}
                  />
                </div>

                <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="muted-label">Check-In Start Time *</label>
                    <input className="input" type="time" name="checkInStart" value={newTimetable.checkInStart} onChange={onInput} />
                  </div>
                  <div>
                    <label className="muted-label">Check-In End Time *</label>
                    <input className="input" type="time" name="checkInEnd" value={newTimetable.checkInEnd} onChange={onInput} />
                  </div>
                  <div>
                    <label className="muted-label">Type *</label>
                    <select className="select" name="type" value={newTimetable.type} onChange={onInput}>
                      <option>Roster</option>
                      <option>Fixed</option>
                    </select>
                  </div>
                </div>

                <div className="grid-3" style={{ gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="muted-label">Grace Period Start</label>
                    <input className="input" type="time" name="graceStart" value={newTimetable.graceStart} onChange={onInput} />
                  </div>
                  <div>
                    <label className="muted-label">Grace Period End</label>
                    <input className="input" type="time" name="graceEnd" value={newTimetable.graceEnd} onChange={onInput} />
                  </div>
                  <div />
                </div>

                <div className="grid-2" style={{ gap: 12 }}>
                  <div>
                    <label className="muted-label">Check-Out Start Time *</label>
                    <input className="input" type="time" name="checkOutStart" value={newTimetable.checkOutStart} onChange={onInput} />
                  </div>
                  <div>
                    <label className="muted-label">Check-Out End Time *</label>
                    <input className="input" type="time" name="checkOutEnd" value={newTimetable.checkOutEnd} onChange={onInput} />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button className="btn btn-soft" onClick={() => setShowModal(false)}>
                  Cancel
                </button>

                {mode === "edit" ? (
                  <button className="btn btn-primary" onClick={handleUpdateTimetable}>
                    Update
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleCreateTimetable}>
                    Confirm
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TimeManagement;
