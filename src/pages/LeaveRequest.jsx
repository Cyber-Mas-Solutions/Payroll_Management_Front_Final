// src/pages/LeaveRequest.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { leaveApi, apiDelete, apiGet } from "../services/api";

const LEAVE_TYPE_OPTIONS = [
  { id: 1, name: "Personal", label: "Personal (Annual)" },
  { id: 2, name: "Sick", label: "Sick" },
  { id: 5, name: "Unpaid", label: "Unpaid" },
  { id: 6, name: "Medical", label: "Medical" },
  { id: 7, name: "Bereavement", label: "Bereavement" },
];

const LeaveRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /** Tabs */
  const tabs = [
    { label: "Overview", path: "/employee-leaves" },
    { label: "Leave Approval", path: "/leave-approval" },
    { label: "Calendar", path: "/leave-calendar" },
    { label: "Leave Request", path: "/leave-request" },
    { label: "Leave Rules", path: "/leave-rules" },
  ];

  /** Filters */
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  /** Data from backend */
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /** Employees for new request */
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  /** Modal State for processing existing request */
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("Approve");
  const [comment, setComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");

  /** Modal State for creating new request */
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newReq, setNewReq] = useState({
    employeeId: "",
    leaveTypeId: LEAVE_TYPE_OPTIONS[0]?.id || "",
    startDate: "",
    endDate: "",
    dayType: "Full Day",
    reason: "",
  });

  /** Fetch leave requests from backend */
  const loadRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await leaveApi.listRequests({
        page: 1,
        pageSize: 500,
      });

      const items = (res && res.data) || [];

      const mapped = items.map((r) => ({
        id: r.id,
        empCode: r.employee_code || "",
        name: r.full_name || r.employee_name || "Unknown",
        department: r.department_name || r.department || "N/A",
        appliedDate: (r.created_at || r.applied_date || "").slice(0, 10),
        requestedDate: (r.start_date || "").slice(0, 10),
        category: r.leave_type || r.category || "Leave",
        // rough guess: half-day if <= 4h; full-day otherwise
        dayType:
          r.day_type ||
          (r.duration_hours != null
            ? r.duration_hours <= 4
              ? "Half Day"
              : "Full Day"
            : "Full Day"),
        reason: r.reason || "",
        status: r.status || "PENDING", // PENDING / APPROVED / REJECTED / CANCELLED
      }));

      setRequests(mapped);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  /** Fetch employees for new request (once, on first open) */
  const ensureEmployeesLoaded = async () => {
    if (employees.length || employeesLoading) return;
    try {
      setEmployeesLoading(true);
      const res = await apiGet("/employees");
      const list = (res && res.data) || (Array.isArray(res) ? res : []);
      setEmployees(list);
    } catch (err) {
      console.error(err);
      // ignore - user can still type manually if needed in future
    } finally {
      setEmployeesLoading(false);
    }
  };

  /** Filtering logic */
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        !searchTerm ||
        (r.empCode || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (r.name || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !dateFilter || r.appliedDate === dateFilter;

      const matchesCategory =
        categoryFilter === "All Categories" || r.category === categoryFilter;

      const matchesDept =
        deptFilter === "All Departments" || r.department === deptFilter;

      const matchesStatus =
        statusFilter === "All Statuses" || r.status === statusFilter;

      return (
        matchesSearch &&
        matchesDate &&
        matchesCategory &&
        matchesDept &&
        matchesStatus
      );
    });
  }, [requests, searchTerm, dateFilter, categoryFilter, deptFilter, statusFilter]);

  /** Stats */
  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    };
  }, [requests]);

  /** Handlers */
  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setCategoryFilter("All Categories");
    setDeptFilter("All Departments");
    setStatusFilter("All Statuses");
  };

  const closeModal = () => {
    setSelected(null);
    setAction("Approve");
    setComment("");
    setRejectComment("");
  };

  const updateRequestStatusLocal = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleSend = async () => {
    if (!selected) return;

    if (action === "Reject" && !rejectComment.trim()) {
      alert("Please enter a reject comment before sending.");
      return;
    }

    const payload =
      action === "Approve"
        ? { action: "APPROVE", note: comment || null }
        : action === "Reject"
        ? { action: "REJECT", note: rejectComment }
        : { action: "RESPOND", note: comment || null }; // Communicate

    try {
      setActionLoadingId(selected.id);
      setError("");
      const res = await leaveApi.decideRequest(selected.id, payload);
      if (!res.ok) {
        throw new Error(res.message || "Failed to process leave");
      }

      if (action === "Approve") {
        updateRequestStatusLocal(selected.id, "APPROVED");
      } else if (action === "Reject") {
        updateRequestStatusLocal(selected.id, "REJECTED");
      }

      alert(
        `Action: ${action} for ${selected.name}\n${
          action === "Reject"
            ? `Reject Reason: ${rejectComment}`
            : `Comment: ${comment || "N/A"}`
        }`
      );
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to process leave");
      alert(err.message || "Failed to process leave");
    } finally {
      setActionLoadingId(null);
    }
  };

  /** Delete request */
  const handleDelete = async (reqItem) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) {
      return;
    }
    try {
      setActionLoadingId(reqItem.id);
      setError("");
      const res = await apiDelete(`/leaves/requests/${reqItem.id}`);
      if (!res.ok) {
        throw new Error(res.message || "Failed to delete leave request");
      }
      setRequests((prev) => prev.filter((r) => r.id !== reqItem.id));
      alert("Leave request deleted.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete leave request");
      alert(err.message || "Failed to delete leave request");
    } finally {
      setActionLoadingId(null);
    }
  };

  /** Export */
  const onExportCSV = () => {
    const headers = [
      "Employee Code",
      "Name",
      "Department",
      "Applied Date",
      "Requested Date",
      "Category",
      "Day Type",
      "Reason",
      "Status",
    ];
    const csvRows = filtered.map((r) => [
      r.empCode,
      r.name,
      r.department,
      r.appliedDate,
      r.requestedDate,
      r.category,
      r.dayType,
      r.reason,
      r.status,
    ]);
    const csv = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${cell ?? ""}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leave_requests.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const prettyStatus = (status) => {
    if (!status) return "";
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  /** New Request modal helpers */
  const openCreateModal = async () => {
    setCreateOpen(true);
    setNewReq((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
      reason: "",
    }));
    await ensureEmployeesLoaded();
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    setCreateLoading(false);
    setNewReq({
      employeeId: "",
      leaveTypeId: LEAVE_TYPE_OPTIONS[0]?.id || "",
      startDate: "",
      endDate: "",
      dayType: "Full Day",
      reason: "",
    });
  };

  const handleCreateChange = (field, value) => {
    setNewReq((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "startDate" && !prev.endDate
        ? { endDate: value }
        : null),
    }));
  };

  const handleCreateSubmit = async () => {
    if (!newReq.employeeId || !newReq.leaveTypeId || !newReq.startDate) {
      alert("Employee, leave type and start date are required.");
      return;
    }

    try {
      setCreateLoading(true);
      setError("");

      const body = {
        employee_id: Number(newReq.employeeId),
        leave_type_id: Number(newReq.leaveTypeId),
        start_date: newReq.startDate,
        end_date: newReq.endDate || newReq.startDate,
        reason: newReq.reason || null,
      };

      const res = await leaveApi.createRequest(body);
      if (!res.ok) {
        throw new Error(res.message || "Failed to create leave request");
      }

      await loadRequests();
      alert("Leave request created.");
      closeCreateModal();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create leave request");
      alert(err.message || "Failed to create leave request");
      setCreateLoading(false);
    }
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
          {/* Breadcrumb + Header */}
          <div className="page-header">
            <div className="breadcrumb">
              <span className="breadcrumb-item">Leave Management</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-item active">Leave Request</span>
            </div>
            <h1 className="page-title">Leave Request</h1>
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

          {/* Statistics */}
          <div className="grid-4" style={{ marginBottom: "16px" }}>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Total Requests
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "var(--brand)",
                }}
              >
                {stats.total}
              </div>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Pending
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#f59e0b",
                }}
              >
                {stats.pending}
              </div>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Approved
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "var(--success)",
                }}
              >
                {stats.approved}
              </div>
            </div>
            <div className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                Rejected
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "var(--danger)",
                }}
              >
                {stats.rejected}
              </div>
            </div>
          </div>

          {/* Filters + buttons */}
          <div className="card">
            <div
              className="grid-4"
              style={{ alignItems: "end", marginBottom: "12px" }}
            >
              <div>
                <label>Search</label>
                <input
                  className="input"
                  placeholder="Search by Employee or Code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label>Applied Date</label>
                <input
                  className="input"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div>
                <label>Category</label>
                <select
                  className="select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All Categories">All Categories</option>
                  {LEAVE_TYPE_OPTIONS.map((lt) => (
                    <option key={lt.id} value={lt.name}>
                      {lt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Department</label>
                <select
                  className="select"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option>All Departments</option>
                  <option>Finance</option>
                  <option>HR</option>
                  <option>IT</option>
                  <option>Marketing</option>
                  <option>Operations</option>
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ alignItems: "end" }}>
              <div>
                <label>Status</label>
                <select
                  className="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <button className="btn btn-soft" onClick={clearFilters}>
                  Clear
                </button>
                <button className="btn btn-soft" onClick={onExportCSV}>
                  Export CSV
                </button>
                <button className="btn btn-primary" onClick={openCreateModal}>
                  + Leave Request
                </button>
              </div>
            </div>

            {loading && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "var(--muted)",
                }}
              >
                Loading leave requests...
              </div>
            )}
            {error && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "var(--danger)",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="table-container">
            <div className="card" style={{ padding: 0 }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  fontWeight: "700",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Leave Requests</span>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {loading
                    ? "Loading..."
                    : `${filtered.length} request(s) found`}
                </span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Applied Date</th>
                    <th>Requested Date</th>
                    <th>Category</th>
                    <th>Day Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.name}</strong>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--muted)",
                            }}
                          >
                            {r.empCode}
                          </div>
                        </td>
                        <td>{r.department}</td>
                        <td>{formatDate(r.appliedDate)}</td>
                        <td>{formatDate(r.requestedDate)}</td>
                        <td>{r.category}</td>
                        <td>{r.dayType}</td>
                        <td>{r.reason}</td>
                        <td>
                          <span
                            className={`pill ${
                              r.status === "APPROVED"
                                ? "pill-ok"
                                : r.status === "PENDING"
                                ? "pill-warn"
                                : r.status === "REJECTED"
                                ? "pill-danger"
                                : "pill-soft"
                            }`}
                          >
                            {prettyStatus(r.status)}
                          </span>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              className="btn btn-soft"
                              onClick={() => setSelected(r)}
                              disabled={actionLoadingId === r.id}
                            >
                              {actionLoadingId === r.id
                                ? "Processing..."
                                : "Process"}
                            </button>
                            {r.status === "PENDING" && (
                              <button
                                className="btn btn-soft"
                                style={{ color: "var(--danger)" }}
                                onClick={() => handleDelete(r)}
                                disabled={actionLoadingId === r.id}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                          color: "var(--muted)",
                        }}
                      >
                        No leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Process Modal (existing behaviour) */}
          {selected && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "8px",
                  width: "90%",
                  maxWidth: "600px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  padding: "20px",
                }}
              >
                <h2 style={{ marginBottom: "12px" }}>Process Leave Request</h2>
                <div className="grid-2" style={{ gap: "12px" }}>
                  <div>
                    <label>Employee</label>
                    <div>{selected.name}</div>
                  </div>
                  <div>
                    <label>Department</label>
                    <div>{selected.department}</div>
                  </div>
                  <div>
                    <label>Requested Date</label>
                    <div>{formatDate(selected.requestedDate)}</div>
                  </div>
                  <div>
                    <label>Leave Type</label>
                    <div>{selected.category}</div>
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label>Reason</label>
                  <div
                    style={{
                      background: "var(--soft)",
                      padding: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    {selected.reason}
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label>Action</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginTop: "4px",
                    }}
                  >
                    {["Approve", "Communicate", "Reject"].map((a) => (
                      <label key={a}>
                        <input
                          type="radio"
                          name="action"
                          checked={action === a}
                          onChange={() => setAction(a)}
                        />{" "}
                        {a}
                      </label>
                    ))}
                  </div>
                </div>

                {action === "Reject" ? (
                  <div style={{ marginTop: "16px" }}>
                    <label>Reject Comment *</label>
                    <textarea
                      className="input"
                      rows="3"
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                    />
                  </div>
                ) : (
                  <div style={{ marginTop: "16px" }}>
                    <label>Approver’s Comment</label>
                    <input
                      className="input"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  <button className="btn btn-soft" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSend}
                    disabled={actionLoadingId === selected.id}
                  >
                    {actionLoadingId === selected.id
                      ? "Sending..."
                      : `Send ${action}`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Leave Request Modal */}
          {createOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "8px",
                  width: "90%",
                  maxWidth: "600px",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  padding: "20px",
                }}
              >
                <h2 style={{ marginBottom: "12px" }}>New Leave Request</h2>

                <div className="grid-2" style={{ gap: "12px" }}>
                  <div>
                    <label>Employee *</label>
                    <select
                      className="select"
                      value={newReq.employeeId}
                      onChange={(e) =>
                        handleCreateChange("employeeId", e.target.value)
                      }
                    >
                      <option value="">Select employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name}{" "}
                          {emp.employee_code
                            ? `(${emp.employee_code})`
                            : ""}
                        </option>
                      ))}
                    </select>
                    {employeesLoading && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--muted)",
                          marginTop: "2px",
                        }}
                      >
                        Loading employees...
                      </div>
                    )}
                  </div>

                  <div>
                    <label>Leave Type *</label>
                    <select
                      className="select"
                      value={newReq.leaveTypeId}
                      onChange={(e) =>
                        handleCreateChange(
                          "leaveTypeId",
                          Number(e.target.value)
                        )
                      }
                    >
                      {LEAVE_TYPE_OPTIONS.map((lt) => (
                        <option key={lt.id} value={lt.id}>
                          {lt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Start Date *</label>
                    <input
                      className="input"
                      type="date"
                      value={newReq.startDate}
                      onChange={(e) =>
                        handleCreateChange("startDate", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label>End Date</label>
                    <input
                      className="input"
                      type="date"
                      value={newReq.endDate}
                      onChange={(e) =>
                        handleCreateChange("endDate", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label>Day Type</label>
                    <select
                      className="select"
                      value={newReq.dayType}
                      onChange={(e) =>
                        handleCreateChange("dayType", e.target.value)
                      }
                    >
                      <option>Full Day</option>
                      <option>Half Day</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label>Reason</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={newReq.reason}
                    onChange={(e) =>
                      handleCreateChange("reason", e.target.value)
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  <button className="btn btn-soft" onClick={closeCreateModal}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateSubmit}
                    disabled={createLoading}
                  >
                    {createLoading ? "Saving..." : "Save Request"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;
