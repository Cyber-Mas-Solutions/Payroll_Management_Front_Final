// src/pages/UnpaidLeaves.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiPost, apiPut, apiDelete } from "../services/api";

export default function UnpaidLeaves() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data states
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState("All Employees");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
    total_days: "",
    reason: "",
    status: "Pending",
    deduction_amount: ""
  });

  // Fetch data
  useEffect(() => {
    fetchUnpaidLeaves();
  }, []);

  const fetchUnpaidLeaves = async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await apiGet("/salary/unpaid-leaves"); 
      const data = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
      setRows(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load unpaid leaves data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Build filter options from data
  const employeeOptions = useMemo(() => {
    const names = Array.from(new Set(rows.map((r) => r.full_name))).filter(Boolean).sort();
    return ["All Employees", ...names];
  }, [rows]);

  const departmentOptions = useMemo(() => {
    const depts = Array.from(new Set(rows.map((r) => r.department || ""))).filter(Boolean).sort();
    return ["All Departments", ...depts];
  }, [rows]);

  const statusOptions = ["All Status", "Pending", "Approved", "Rejected", "Processed"];

  // Filter logic
  const filtered = useMemo(() => {
    let data = rows;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(q) ||
          r.employee_id?.toString().includes(q) ||
          r.reason?.toLowerCase().includes(q)
      );
    }

    if (employeeFilter !== "All Employees") {
      data = data.filter((r) => r.full_name === employeeFilter);
    }

    if (departmentFilter !== "All Departments") {
      data = data.filter((r) => (r.department || "") === departmentFilter);
    }

    if (statusFilter !== "All Status") {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (dateFrom) {
      data = data.filter((r) => r.start_date >= dateFrom);
    }

    if (dateTo) {
      data = data.filter((r) => r.end_date <= dateTo);
    }

    return data;
  }, [rows, searchTerm, employeeFilter, departmentFilter, statusFilter, dateFrom, dateTo]);

  const handleResetFilters = () => {
    setEmployeeFilter("All Employees");
    setDepartmentFilter("All Departments");
    setStatusFilter("All Status");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  // Modal handlers
  const openAddModal = () => {
    setEditingLeave(null);
    setFormData({
      employee_id: "",
      start_date: "",
      end_date: "",
      total_days: "",
      reason: "",
      status: "Pending",
      deduction_amount: ""
    });
    setShowModal(true);
  };

  const openEditModal = (leave) => {
    setEditingLeave(leave);
    setFormData({
      employee_id: leave.employee_id,
      start_date: leave.start_date || "",
      end_date: leave.end_date || "",
      total_days: leave.total_days || "",
      reason: leave.reason || "",
      status: leave.status || "Pending",
      deduction_amount: leave.deduction_amount || ""
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLeave(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate total days if both start and end dates are provided
    if ((name === "start_date" || name === "end_date") && formData.start_date && formData.end_date) {
      const start = new Date(name === "start_date" ? value : formData.start_date);
      const end = new Date(name === "end_date" ? value : formData.end_date);
      if (start && end && end >= start) {
        const timeDiff = end.getTime() - start.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
        setFormData(prev => ({
          ...prev,
          total_days: dayDiff.toString()
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLeave) {
        await apiPut(`/salary/unpaid-leaves/${editingLeave.id}`, formData);
      } else {
        await apiPost("/salary/unpaid-leaves", formData);
      }
      closeModal();
      fetchUnpaidLeaves();
      window.alert(editingLeave ? "Unpaid leave updated successfully" : "Unpaid leave added successfully");
    } catch (e) {
      console.error(e);
      window.alert("Failed to save unpaid leave");
    }
  };

  const handleDelete = async (leave) => {
    if (!window.confirm(`Delete unpaid leave record for ${leave.full_name}?`)) return;
    
    try {
      await apiDelete(`/salary/unpaid-leaves/${leave.id}`);
      fetchUnpaidLeaves();
      window.alert("Unpaid leave record deleted successfully");
    } catch (e) {
      console.error(e);
      window.alert("Failed to delete unpaid leave record");
    }
  };

  const handleProcessDeduction = async (leave) => {
    if (!window.confirm(`Process salary deduction for ${leave.full_name}'s unpaid leave? This will create a deduction entry in the payroll system.`)) return;
    
    try {
      // NOTE: This calls the new processing logic in salary.controller.js
      await apiPost(`/salary/unpaid-leaves/${leave.id}/process`, {});
      fetchUnpaidLeaves();
      window.alert("Salary deduction processed successfully and added to deductions.");
    } catch (e) {
      console.error(e);
      window.alert("Failed to process salary deduction");
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (!filtered.length) {
      alert("No data to export.");
      return;
    }
    const csvRows = [];
    const header = [
      "Employee ID", "Employee Name", "Department", "Start Date", "End Date", 
      "Total Days", "Reason", "Deduction Amount", "Status"
    ];
    csvRows.push(header.join(","));

    filtered.forEach((r) => {
      const row = [
        r.employee_id,
        r.full_name || "",
        r.department || "",
        r.start_date || "",
        r.end_date || "",
        r.total_days || "",
        r.reason || "",
        r.deduction_amount || "",
        r.status || "",
      ];
      csvRows.push(row.map(cell => `"${cell}"`).join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Unpaid_Leaves_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "-") return dateString;
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatCurrency = (n) => {
    const amount = Number(n || 0);
    return amount > 0 ? `Rs ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "-";
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader breadcrumb={["Salary & Compensation", "Unpaid Leaves"]} title="Salary & Compensation" />

      {/* Fixed Tabs Section (Corrected to exclude Leave Rules) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "var(--bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="card"
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            marginBottom: 0,
            borderRadius: "0",
          }}
        >
          {[
            { label: "Earnings", path: "/earnings" },
            { label: "Deductions", path: "/deductions" },
            { label: "Allowances", path: "/allowances" },
            { label: "Overtime & Adjustments", path: "/overtime-adjustments" },
            { label: "Compensation Adjustment", path: "/compensation-adjustment" },
            { label: "ETF & EPF", path: "/etf-epf" },
            { label: "ETF/EPF Process", path: "/etf-epf-process" },
            { label: "Unpaid Leaves", path: "/unpaid-leaves" },
            { label: "Net Salary Summary", path: "/net-salary-summary" },
            // Note: Leave Rules tab is intentionally excluded from the Salary navbar.
          ].map((t) => (
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
      </div>

      {/* Deduction Rule Card (Requested Explanation) */}
      <div className="card" style={{ 
          margin: "16px 24px 0 24px", 
          border: "1px solid var(--danger)", 
          background: "#fef2f2", 
          color: "var(--danger)" 
        }}>
          <h4 style={{ margin: 0, marginBottom: "8px" }}>Unpaid Leave Deduction Policy</h4>
          <p style={{ margin: 0, fontSize: "14px" }}>
            Unpaid leave records are created automatically when an employee's annual or medical leave usage exceeds their grade-specific limit (set in the Leave Management section).
          </p>
          <p style={{ margin: "8px 0 0 0", fontWeight: "600" }}>
            Deduction Amount (if manual amount is not set): 
            <span style={{ color: "var(--brand)", marginLeft: "5px" }}>
              (Basic Salary / 30 Days) &times; Total Unpaid Leave Days
            </span>
          </p>
      </div>

      {/* Fixed Filters Section */}
      <div
        style={{
          position: "sticky",
          top: "56px", 
          zIndex: 90,
          backgroundColor: "var(--bg)",
          paddingTop: "16px", 
        }}
      >
        {/* Filters Card */}
        <div className="card">
          <div className="grid-3" style={{ alignItems: "end", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Employee
              </label>
              <select className="select" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
                {employeeOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Department
              </label>
              <select className="select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                {departmentOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Status
              </label>
              <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {statusOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                From Date
              </label>
              <input
                type="date"
                className="input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                To Date
              </label>
              <input
                type="date"
                className="input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Search
              </label>
              <input
                className="input"
                placeholder="Name, ID, Reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(employeeFilter !== "All Employees" || departmentFilter !== "All Departments" || statusFilter !== "All Status" || dateFrom || dateTo || searchTerm) && (
                <button className="btn btn-soft" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={handleExport}>
                Export CSV
              </button>
              <button className="btn btn-primary" onClick={openAddModal}>
                + Add Unpaid Leave
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="card" style={{ color: "var(--danger)", background: "#fef2f2" }}>
            {error}
          </div>
        )}
      </div>

      {/* Scrollable Table Section */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="table-container" style={{ marginTop: 0, flex: 1, minHeight: 0 }}>
          <div className="card" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              padding: "12px 16px", 
              borderBottom: "1px solid var(--border)", 
              display: "flex", 
              alignItems: "center",
              flexShrink: 0
            }}>
              <div style={{ fontWeight: "700" }}>Unpaid Leaves Management</div>
              <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
                {loading ? "Loading..." : `${filtered.length} record(s)`}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "16px", flex: 1 }}>Loading unpaid leaves data...</div>
            ) : (
              <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
                <table className="table">
                  <thead style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "#f8f9fa",
                    zIndex: 10
                  }}>
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Total Days</th>
                      <th>Reason</th>
                      <th>Deduction Amount</th>
                      <th>Status</th>
                      <th style={{ width: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((leave) => (
                      <tr key={leave.id}>
                        <td>{leave.employee_id}</td>
                        <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="user-avatar" />
                          <div style={{ fontWeight: "600" }}>{leave.full_name || "-"}</div>
                        </td>
                        <td>{leave.department || "-"}</td>
                        <td>{formatDate(leave.start_date)}</td>
                        <td>{formatDate(leave.end_date)}</td>
                        <td>{leave.total_days}</td>
                        <td>{leave.reason || "-"}</td>
                        <td>
                          {/* Display status if amount is pending calculation */}
                          {leave.status === 'Approved' && !leave.deduction_amount
                            ? <span className="pill pill-warn">Pending Calc</span>
                            : formatCurrency(leave.deduction_amount)
                          }
                        </td>
                        <td>
                          <span className={`pill ${
                            leave.status === "Approved" ? "pill-ok" : 
                            leave.status === "Rejected" ? "pill-danger" : 
                            leave.status === "Processed" ? "pill-soft" :
                            "pill-warn"
                          }`}>
                            {leave.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {leave.status !== 'Processed' && (
                              <button 
                                className="btn btn-soft" 
                                onClick={() => openEditModal(leave)}
                                style={{ fontSize: "11px", padding: "4px 8px" }}
                              >
                                Edit
                              </button>
                            )}
                            {leave.status === "Approved" && (
                              <button 
                                className="btn btn-primary" 
                                onClick={() => handleProcessDeduction(leave)}
                                style={{ fontSize: "11px", padding: "4px 8px" }}
                              >
                                Process
                              </button>
                            )}
                            {leave.status !== 'Processed' && (
                              <button 
                                className="btn btn-soft" 
                                onClick={() => handleDelete(leave)}
                                style={{ 
                                  fontSize: "11px", 
                                  padding: "4px 8px",
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fecaca"
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                          No unpaid leave records found. Click "Add Unpaid Leave" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editingLeave ? "Edit Unpaid Leave" : "Add Unpaid Leave"}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label>Employee ID *</label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleFormChange}
                  required
                  disabled={!!editingLeave}
                />
              </div>

              <div className="grid-2" style={{ gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label>Total Days</label>
                  <input
                    type="number"
                    name="total_days"
                    value={formData.total_days}
                    onChange={handleFormChange}
                    min="1"
                    readOnly
                  />
                </div>
                <div>
                  <label>Deduction Amount (Manual Override)</label>
                  <input
                    type="number"
                    name="deduction_amount"
                    value={formData.deduction_amount}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  style={{ minHeight: "60px", resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleFormChange}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Processed">Processed</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-soft" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLeave ? "Update" : "Add"} Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}