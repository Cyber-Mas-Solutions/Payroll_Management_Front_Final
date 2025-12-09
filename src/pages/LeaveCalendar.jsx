// src/pages/LeaveCalendar.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { leaveApi } from "../services/api";

/** Helpers */
const pad = (n) => String(n).padStart(2, "0");
const toKey = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const LeaveCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Overview", path: "/employee-leaves" },
    { label: "Leave Approval", path: "/leave-approval" },
    { label: "Calendar", path: "/leave-calendar" },
    { label: "Leave Request", path: "/leave-request" },
    { label: "Leave Rules", path: "/leave-rules" },
  ];

  const today = new Date();
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());

  // 🔹 Local "date restriction" assignments (your original feature)
  // 🔹 Date restriction assignments (now loaded from backend)
const [assigned, setAssigned] = useState([]);


  const [pickFor, setPickFor] = useState(null);
  const [reasonFor, setReasonFor] = useState(null);
  const [deleteFor, setDeleteFor] = useState(null);

  // 🔹 Backend leave events (employees on leave)
  const [leaveEvents, setLeaveEvents] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  /** Month Navigation **/
  const goToPrevMonth = () => {
    setDisplayMonth((prev) => {
      if (prev === 0) {
        setDisplayYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setDisplayMonth((prev) => {
      if (prev === 11) {
        setDisplayYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const goToToday = () => {
    setDisplayYear(today.getFullYear());
    setDisplayMonth(today.getMonth());
  };

  /** Grid Builder **/
  const grid = useMemo(() => {
    const first = new Date(displayYear, displayMonth, 1);
    const firstDay = first.getDay();
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const prevDays = new Date(displayYear, displayMonth, 0).getDate();
    const cells = [];

    // previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const prevMonth = displayMonth === 0 ? 11 : displayMonth - 1;
      const prevYear = displayMonth === 0 ? displayYear - 1 : displayYear;
      cells.push({ y: prevYear, m: prevMonth, d, other: true });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ y: displayYear, m: displayMonth, d, other: false });
    }
    // next month
    while (cells.length < 42) {
      const nextMonth = displayMonth === 11 ? 0 : displayMonth + 1;
      const nextYear = displayMonth === 11 ? displayYear + 1 : displayYear;
      const d = cells.length - (firstDay + daysInMonth) + 1;
      cells.push({ y: nextYear, m: nextMonth, d, other: true });
    }
    return cells;
  }, [displayYear, displayMonth]);

  /** Assigned map (restrictions) **/
  const assignedMap = useMemo(() => {
    const map = new Map();
    assigned.forEach((a) => map.set(a.date, a));
    return map;
  }, [assigned]);

  const getAssigned = (y, m, d) => assignedMap.get(toKey(y, m + 1, d));

  /** Fetch leave events from backend for visible month **/
useEffect(() => {
  let ignore = false;

  async function fetchCalendar() {
    setLeaveLoading(true);
    setLeaveError("");

    try {
      const firstDay = 1;
      const lastDay = new Date(displayYear, displayMonth + 1, 0).getDate();
      const from = `${displayYear}-${pad(displayMonth + 1)}-${pad(firstDay)}`;
      const to = `${displayYear}-${pad(displayMonth + 1)}-${pad(lastDay)}`;

      const res = await leaveApi.getCalendar({ from, to });
      if (ignore) return;

      // 👇 THIS was missing – define items before mapping
      const items =
        (res && (res.events || res.data)) ||
        (Array.isArray(res) ? res : []);

      const mapped = items.map((e) => ({
        id: e.id,
        // show real name
        name:
          e.full_name ||
          e.employee_name ||
          (e.title ? String(e.title).split(" - ")[0] : "Unknown"),

        // prefer employee_code, fall back to numeric employee_id if code is null / '_' / empty
        employeeCode:
          (e.employee_code && e.employee_code !== "_" ? e.employee_code : "") ||
          e.employee_id ||
          "",

        leaveType:
          e.leave_type ||
          e.type ||
          (e.title ? String(e.title).split(" - ")[1] : "Leave"),

        startDate: e.start_date || e.start || e.date || "",
        endDate: e.end_date || e.end || e.start_date || "",
        status: e.status || "APPROVED",
        hours: e.duration_hours ?? e.hours ?? null,
      }));

      setLeaveEvents(mapped);

      // 🔹 restrictions from backend (if present)
      const restrictions = res.restrictions || [];
      setAssigned(
        restrictions.map((r) => ({
          id: r.id,
          date: r.date, // 'YYYY-MM-DD'
          type: r.type, // 'special' or 'restricted'
          reason: r.reason || "-",
        }))
      );
    } catch (err) {
      if (!ignore) {
        console.error(err);
        setLeaveError(err.message || "Failed to load leave calendar");
      }
    } finally {
      if (!ignore) setLeaveLoading(false);
    }
  }

  fetchCalendar();
  return () => {
    ignore = true;
  };
}, [displayYear, displayMonth]);


  /** leaveEventsByDate: map dateKey -> list of events **/
  const leaveEventsByDate = useMemo(() => {
    const map = new Map();

    leaveEvents.forEach((ev) => {
      if (!ev.startDate || !ev.endDate) return;

      const start = new Date(ev.startDate);
      const end = new Date(ev.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

      const cur = new Date(start);
      while (cur <= end) {
        const key = toKey(
          cur.getFullYear(),
          cur.getMonth() + 1,
          cur.getDate()
        );
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    });

    return map;
  }, [leaveEvents]);

  const getLeaveEventsForCell = (y, m, d) => {
    const key = toKey(y, m + 1, d);
    return leaveEventsByDate.get(key) || [];
  };

  /** Click Handlers (keep your original restriction behaviour) **/
  const onCellClick = (cell) => {
    if (cell.other) return;
    const existing = getAssigned(cell.y, cell.m, cell.d);
    if (existing) setDeleteFor(cell);
    else setPickFor(cell);
  };

  const chooseType = (type) => {
    setReasonFor({ ...pickFor, type });
    setPickFor(null);
  };

  const saveReason = async (text) => {
  const { y, m, d, type } = reasonFor;
  const date = toKey(y, m + 1, d); // YYYY-MM-DD
  const reason = text || "-";

  try {
    // call backend
    const res = await leaveApi.saveRestriction({ date, type, reason });
    const row = (res && res.data) || res || { date, type, reason };

    setAssigned((prev) => [
      ...prev.filter((a) => a.date !== date),
      {
        id: row.id,
        date: row.date,
        type: row.type,
        reason: row.reason || reason,
      },
    ]);
  } catch (err) {
    console.error(err);
    alert("Failed to save date restriction: " + (err.message || err));
  } finally {
    setReasonFor(null);
  }
};


 const confirmDelete = async () => {
  const { y, m, d } = deleteFor;
  const date = toKey(y, m + 1, d);

  try {
    // find row for this date
    const row = assigned.find((a) => a.date === date);

    if (row?.id) {
      await leaveApi.deleteRestrictionById(row.id);
    } else {
      // fallback delete by date
      await leaveApi.deleteRestrictionByDate(date);
    }

    setAssigned((prev) => prev.filter((a) => a.date !== date));
  } catch (err) {
    console.error(err);
    alert("Failed to delete date restriction: " + (err.message || err));
  } finally {
    setDeleteFor(null);
  }
};


  /** Assigned Rows table (your original) **/
  const assignedRows = useMemo(() => {
    return assigned
      .filter((a) => {
        const d = new Date(a.date);
        return (
          d.getFullYear() === displayYear && d.getMonth() === displayMonth
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [assigned, displayYear, displayMonth]);

  /** Leave events table rows for this month **/
  const leaveRows = useMemo(
    () =>
      [...leaveEvents].sort((a, b) =>
        (a.startDate || "").localeCompare(b.startDate || "")
      ),
    [leaveEvents]
  );

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRange = (start, end) => {
    if (!start && !end) return "-";
    if (!end || start === end) return formatDate(start);
    return `${formatDate(start)} - ${formatDate(end)}`;
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
              <span className="breadcrumb-item">Leave Management</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-item active">Calendar</span>
            </div>
            <h1 className="page-title">Date Restrictions & Leave Calendar</h1>
          </div>

          {/* Tabs */}
          <div
            className="card"
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "16px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.path}
                className={`btn ${
                  location.pathname === t.path ? "btn-primary" : "btn-soft"
                }`}
                onClick={() => navigate(t.path)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Calendar Navigation */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <button className="btn btn-soft" onClick={goToPrevMonth}>
                  ◀ Prev
                </button>
                <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
                  {MONTHS[displayMonth]} {displayYear}
                </h2>
                <button className="btn btn-soft" onClick={goToNextMonth}>
                  Next ▶
                </button>
              </div>
              <button className="btn btn-primary" onClick={goToToday}>
                Today
              </button>
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginTop: "12px",
                fontSize: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: "var(--success)",
                    borderRadius: 2,
                  }}
                />
                Special Day
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: "var(--danger)",
                    borderRadius: 2,
                  }}
                />
                Restricted Date
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: "var(--brand)",
                    borderRadius: 2,
                  }}
                />
                Employee Leave
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: "var(--soft)",
                    borderRadius: 2,
                  }}
                />
                Other Month
              </span>
            </div>

            {leaveError && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "var(--danger)",
                }}
              >
                {leaveError}
              </div>
            )}
          </div>

          {/* Calendar Grid */}
          <div className="card" style={{ padding: 0 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
                background: "var(--soft)",
                fontWeight: "600",
                fontSize: "12px",
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  style={{
                    padding: "10px",
                    borderRight: "1px solid var(--border)",
                    textAlign: "center",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
              }}
            >
              {grid.map((cell, i) => {
                const assignedInfo = getAssigned(cell.y, cell.m, cell.d);
                const dayLeaveEvents = getLeaveEventsForCell(
                  cell.y,
                  cell.m,
                  cell.d
                );
                const isToday =
                  cell.y === today.getFullYear() &&
                  cell.m === today.getMonth() &&
                  cell.d === today.getDate();

                return (
                  <div
                    key={i}
                    onClick={() => onCellClick(cell)}
                    style={{
                      height: "80px",
                      padding: "8px",
                      borderRight: "1px solid var(--border)",
                      borderBottom: "1px solid var(--border)",
                      background: cell.other ? "var(--soft)" : "var(--panel)",
                      position: "relative",
                      cursor: cell.other ? "default" : "pointer",
                      ...(isToday && {
                        outline: "2px solid var(--brand)",
                      }),
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: cell.other ? "var(--muted)" : "var(--text)",
                      }}
                    >
                      {cell.d}
                    </div>

                    {/* Restriction badge (special / restricted) */}
                    {assignedInfo && (
                      <div
                        style={{
                          fontSize: "10px",
                          padding: "2px 4px",
                          borderRadius: "3px",
                          color: "#fff",
                          background:
                            assignedInfo.type === "special"
                              ? "var(--success)"
                              : "var(--danger)",
                          position: "absolute",
                          bottom: "6px",
                          left: "6px",
                        }}
                      >
                        {assignedInfo.type === "special"
                          ? "Special"
                          : "Restricted"}
                      </div>
                    )}

                    {/* Leave badge (employees on leave) */}
                    {dayLeaveEvents.length > 0 && !cell.other && (
                      <div
                        style={{
                          fontSize: "9px",
                          padding: "2px 4px",
                          borderRadius: "3px",
                          color: "#fff",
                          background: "var(--brand)",
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          maxWidth: "90%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                       {dayLeaveEvents.length === 1
                         ? `${dayLeaveEvents[0].employeeCode
                             ? dayLeaveEvents[0].employeeCode + " - "
                             : ""
                          }${dayLeaveEvents[0].name}`
                         : `${dayLeaveEvents.length} on leave`}

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Dates Table (same as your original feature) */}
          <div className="table-container">
            <div className="card" style={{ padding: 0 }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  fontWeight: "600",
                }}
              >
                Assigned Date Restrictions – {MONTHS[displayMonth]}{" "}
                {displayYear}
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedRows.length > 0 ? (
                    assignedRows.map((r) => (
                      <tr key={r.date}>
                        <td>{r.date}</td>
                        <td>
                          <span
                            className={`pill ${
                              r.type === "special"
                                ? "pill-ok"
                                : "pill-danger"
                            }`}
                          >
                            {r.type === "special"
                              ? "Special Day"
                              : "Restricted"}
                          </span>
                        </td>
                        <td>{r.reason}</td>
                        <td>
                          <button
                            className="btn btn-soft"
                            onClick={() => {
                              const date = new Date(r.date);
                              setDeleteFor({
                                y: date.getFullYear(),
                                m: date.getMonth(),
                                d: date.getDate(),
                              });
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "var(--muted)",
                        }}
                      >
                        No assigned dates
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Events Table (new, from backend) */}
          <div className="table-container">
            <div className="card" style={{ padding: 0 }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  Employee Leaves – {MONTHS[displayMonth]} {displayYear}
                </span>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {leaveLoading
                    ? "Loading..."
                    : `${leaveRows.length} record(s)`}
                </span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee No.</th>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveLoading && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "var(--muted)",
                        }}
                      >
                        Loading leave data...
                      </td>
                    </tr>
                  )}

                  {!leaveLoading && leaveRows.length === 0 && !leaveError && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "var(--muted)",
                        }}
                      >
                        No leave events for this month.
                      </td>
                    </tr>
                  )}

                  {!leaveLoading &&
                    leaveRows.map((e) => (
                      <tr key={e.id}>
                        <td>{e.employeeCode || "-"}</td>
                        <td>{e.name}</td>
                        <td>{e.leaveType}</td>
                        <td>{formatRange(e.startDate, e.endDate)}</td>
                        <td>
                          <span
                            className={`pill ${
                              e.status === "APPROVED"
                                ? "pill-ok"
                                : e.status === "PENDING"
                                ? "pill-warn"
                                : "pill-soft"
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td>{e.hours != null ? e.hours : "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modals (unchanged from your original, for restrictions) */}
          {pickFor && (
            <ModalWrapper>
              <div
                className="card"
                style={{ padding: "20px", maxWidth: "400px" }}
              >
                <h3>Select Date Type</h3>
                <p>
                  Choose type for {MONTHS[pickFor.m]} {pickFor.d},{" "}
                  {pickFor.y}
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="btn"
                    style={{
                      background: "var(--success)",
                      color: "#fff",
                      flex: 1,
                    }}
                    onClick={() => chooseType("special")}
                  >
                    Special
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: "var(--danger)",
                      color: "#fff",
                      flex: 1,
                    }}
                    onClick={() => chooseType("restricted")}
                  >
                    Restricted
                  </button>
                </div>
                <button
                  className="btn btn-soft"
                  style={{ marginTop: "10px", width: "100%" }}
                  onClick={() => setPickFor(null)}
                >
                  Cancel
                </button>
              </div>
            </ModalWrapper>
          )}

          {reasonFor && (
            <ModalWrapper>
              <div
                className="card"
                style={{ padding: "20px", maxWidth: "400px" }}
              >
                <h3>
                  {reasonFor.type === "special"
                    ? "Special Day"
                    : "Restricted Date"}
                </h3>
                <input
                  className="input"
                  placeholder="Enter reason..."
                  onKeyDown={(e) =>
                    e.key === "Enter" && saveReason(e.target.value)
                  }
                  autoFocus
                />
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  <button
                    className="btn btn-soft"
                    onClick={() => setReasonFor(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      saveReason(
                        document.querySelector(".input")?.value || ""
                      )
                    }
                  >
                    Save
                  </button>
                </div>
              </div>
            </ModalWrapper>
          )}

          {deleteFor && (
            <ModalWrapper>
              <div
                className="card"
                style={{ padding: "20px", maxWidth: "400px" }}
              >
                <h3 style={{ color: "var(--danger)" }}>Remove Date</h3>
                <p>Are you sure you want to remove this date?</p>
                <div
                  className="pill pill-danger"
                  style={{ textAlign: "center", margin: "8px 0" }}
                >
                  {MONTHS[deleteFor.m]} {deleteFor.d}, {deleteFor.y}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-soft"
                    onClick={() => setDeleteFor(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn"
                    style={{ background: "var(--danger)", color: "#fff" }}
                    onClick={confirmDelete}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </ModalWrapper>
          )}
        </div>
      </div>
    </div>
  );
};

function ModalWrapper({ children }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  );
}

export default LeaveCalendar;
