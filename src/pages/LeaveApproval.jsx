// src/pages/LeaveApproval.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { leaveApi } from "../services/api";

const LeaveApproval = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs same as other leave pages
  const tabs = [
    { label: "Overview", path: "/employee-leaves" },
    { label: "Leave Approval", path: "/leave-approval" },
    { label: "Calendar", path: "/leave-calendar" },
    { label: "Leave Request", path: "/leave-request" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  // ---- Fetch requests from backend ---------------------------------
  useEffect(() => {
    let ignore = false;

    async function fetchRequests() {
      setLoading(true);
      setError("");

      try {
        // Fetch a "big enough" page; filters are applied on the client for now
        const res = await leaveApi.listRequests({
          page: 1,
          pageSize: 500,
        });

        if (ignore) return;

        const items = (res && res.data) || [];

        // Map API shape to UI shape
        const mapped = items.map((r, index) => ({
          id: r.id,
          empNo:
            (r.employee_code != null && String(r.employee_code)) ||
            (r.empNo != null && String(r.empNo)) ||
            "",
          // fallback name fields just in case
          name: r.full_name || r.employee_name || "Unknown",
          department: r.department_name || r.department || "N/A",
          appliedDate: (r.created_at || r.applied_date || "").slice(0, 10),
          category: r.leave_type || r.category || "Leave",
          requestedDate: (r.start_date || r.requested_date || "").slice(0, 10),
          reason: r.reason || "",
          status: r.status || "PENDING",
          no: index + 1,
        })); 

        setRequests(mapped);
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setError(err.message || "Failed to load leave requests");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchRequests();
    return () => {
      ignore = true;
    };
  }, []);

  // ---- Dynamic dropdown options ------------------------------------
  const departments = useMemo(() => {
    const s = new Set(["All Departments"]);
    requests.forEach((r) => s.add(r.department));
    return Array.from(s);
  }, [requests]);

  const categories = useMemo(() => {
    const s = new Set(["All Categories"]);
    requests.forEach((r) => s.add(r.category));
    return Array.from(s);
  }, [requests]);

  // ---- Filtering ----------------------------------------------------
  const filteredData = useMemo(() => {
    return requests.filter((item) => {
      const matchesName =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate =
        !selectedDate || item.appliedDate === selectedDate;

      const matchesCategory =
        categoryFilter === "All Categories" ||
        item.category === categoryFilter;

      const matchesDept =
        deptFilter === "All Departments" ||
        item.department === deptFilter;

      const matchesStatus =
        statusFilter === "All Statuses" ||
        item.status === statusFilter;

      return (
        matchesName &&
        matchesDate &&
        matchesCategory &&
        matchesDept &&
        matchesStatus
      );
    });
  }, [requests, searchTerm, selectedDate, categoryFilter, deptFilter, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate("");
    setCategoryFilter("All Categories");
    setDeptFilter("All Departments");
    setStatusFilter("All Statuses");
  };

  // ---- Approve / Reject actions ------------------------------------
  const updateRequestStatusLocal = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleApprove = async (request) => {
    try {
      setActionLoadingId(request.id);
      setError("");
      const res = await leaveApi.decideRequest(request.id, {
        action: "APPROVE",
      });
      if (!res.ok) {
        throw new Error(res.message || "Failed to approve leave");
      }
      updateRequestStatusLocal(request.id, "APPROVED");
      alert(`Leave request for ${request.name} approved successfully.`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to approve leave");
      alert(err.message || "Failed to approve leave");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (request) => {
    try {
      setActionLoadingId(request.id);
      setError("");
      const res = await leaveApi.decideRequest(request.id, {
        action: "REJECT",
      });
      if (!res.ok) {
        throw new Error(res.message || "Failed to reject leave");
      }
      updateRequestStatusLocal(request.id, "REJECTED");
      alert(`Leave request for ${request.name} rejected.`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to reject leave");
      alert(err.message || "Failed to reject leave");
    } finally {
      setActionLoadingId(null);
    }
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

  // ---- Summary counts (all requests, not just filtered) ------------
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  // ---- Render ------------------------------------------------------
  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Leave Management", "Leave Approval"]}
        title="Leave Approval"
      />

      {/* Tabs */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`btn ${
              location.pathname === tab.path ? "btn-primary" : "btn-soft"
            }`}
            onClick={() => navigate(tab.path)}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Card */}
      <div className="card">
        <div
          className="grid-4"
          style={{ alignItems: "end", marginBottom: "12px" }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Search Employee
            </label>
            <input
              className="input"
              placeholder="Search by Employee Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Applied Date
            </label>
            <input
              className="input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Category
            </label>
            <select
              className="select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Department
            </label>
            <select
              className="select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="grid-2"
          style={{ alignItems: "end", marginBottom: "12px" }}
        >
          <div>
            <label
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Status
            </label>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>PENDING</option>
              <option>APPROVED</option>
              <option>REJECTED</option>
              <option>CANCELLED</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
            }}
          >
            <button className="btn btn-soft" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
          {loading
            ? "Loading leave requests..."
            : `${filteredData.length} leave request(s) found`}
        </div>
        {error && (
          <div
            style={{
              marginTop: "6px",
              fontSize: "12px",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Leave Approval Table */}
      <div className="table-container">
        <div className="card" style={{ padding: 0 }}>
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: "700" }}>Leave Approval Requests</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              {loading
                ? "Loading..."
                : `Showing ${filteredData.length} record(s)`}
            </div>
          </div>

          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee No</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Applied Date</th>
                  <th>Category</th>
                  <th>Requested Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--muted)",
                      }}
                    >
                      Loading leave requests...
                    </td>
                  </tr>
                )}

                {!loading && filteredData.length === 0 && !error && (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--muted)",
                      }}
                    >
                      No leave requests found matching your filters.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.empNo || "-"}</td>
                      <td
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div className="user-avatar" />
                        <div style={{ fontWeight: "600" }}>{item.name}</div>
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background: "var(--soft)",
                            color: "var(--text)",
                          }}
                        >
                          {item.department}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        {formatDate(item.appliedDate)}
                      </td>
                      <td>
                        <span className="pill pill-soft">{item.category}</span>
                      </td>
                      <td
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {formatDate(item.requestedDate)}
                      </td>
                      <td
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          maxWidth: "220px",
                        }}
                      >
                        {item.reason}
                      </td>
                      <td>
                        <span
                          className={`pill ${
                            item.status === "APPROVED"
                              ? "pill-ok"
                              : item.status === "PENDING"
                              ? "pill-warn"
                              : item.status === "REJECTED"
                              ? "pill-danger"
                              : "pill-soft"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {item.status === "PENDING" ? (
                            <>
                              <button
                                className="btn btn-soft"
                                disabled={actionLoadingId === item.id}
                                onClick={() => handleApprove(item)}
                                style={{
                                  fontSize: "11px",
                                  padding: "4px 8px",
                                  background: "var(--success)",
                                  color: "white",
                                }}
                              >
                                {actionLoadingId === item.id
                                  ? "Saving..."
                                  : "Approve"}
                              </button>
                              <button
                                className="btn btn-soft"
                                disabled={actionLoadingId === item.id}
                                onClick={() => handleReject(item)}
                                style={{
                                  fontSize: "11px",
                                  padding: "4px 8px",
                                  background: "var(--danger)",
                                  color: "white",
                                }}
                              >
                                {actionLoadingId === item.id
                                  ? "Saving..."
                                  : "Reject"}
                              </button>
                            </>
                          ) : (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--muted)",
                              }}
                            >
                              Processed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div
        className="grid-3"
        style={{ gap: "16px", marginTop: "16px" }}
      >
        <div className="card" style={{ textAlign: "center", padding: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              marginBottom: "4px",
            }}
          >
            Pending Requests
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--warn)",
            }}
          >
            {pendingCount}
          </div>
        </div>

        <div className="card" style={{ textAlign: "center", padding: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              marginBottom: "4px",
            }}
          >
            Approved
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--success)",
            }}
          >
            {approvedCount}
          </div>
        </div>

        <div className="card" style={{ textAlign: "center", padding: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              marginBottom: "4px",
            }}
          >
            Rejected
          </div>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--danger)",
            }}
          >
            {rejectedCount}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LeaveApproval;
