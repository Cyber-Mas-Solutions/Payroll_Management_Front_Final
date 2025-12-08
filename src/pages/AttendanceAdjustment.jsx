// src/pages/AttendanceAdjustment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, attendanceApi } from "../services/api";


const AttendanceAdjustment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Overview", path: "/attendance-overview" },
    { label: "Time Management", path: "/time-management" },
    { label: "Absence Report", path: "/absence-report" },
    { label: "Attendance Adjustment", path: "/attendance-adjustment" },
    { label: "Check In & Out Report", path: "/checkin-checkout-report" },
  ];

  // --- Employees (from backend) ------------------------------------
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setEmpLoading(true);
        setEmpError("");
        const data = await apiGet("/employees");
        const rows = Array.isArray(data) ? data : data?.data || [];
        const mapped = rows.map((e) => ({
          id: e.id,
          empNo: e.employee_code || e.id,
          name:
            e.full_name ||
            [e.first_name, e.last_name].filter(Boolean).join(" ") ||
            "Unknown",
          department: e.department_name || e.department || "Unassigned",
        }));
        setEmployees(mapped);
      } catch (e) {
        setEmpError(e.message || "Failed to load employees");
      } finally {
        setEmpLoading(false);
      }
    };
    run();
  }, []);

  // departments list from employees
  const departments = useMemo(
    () => ["All Departments", ...new Set(employees.map((emp) => emp.department).filter(Boolean))],
    [employees]
  );

  // --- Filters ------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) => {
        const matchesSearch = emp.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesDept =
          deptFilter === "All Departments" || emp.department === deptFilter;
        return matchesSearch && matchesDept;
      }),
    [employees, searchTerm, deptFilter]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setDeptFilter("All Departments");
  };

  // --- Modal & attendance details ----------------------------------
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [attendanceData, setAttendanceData] = useState([]);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState("");

  const handleViewAttendance = async (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
    setAttLoading(true);
    setAttError("");
    setAttendanceData([]);

    try {
      // You can add startDate/endDate filters later if needed
      const res = await attendanceApi.getEmployeeAttendance(employee.id, {});
      const rows = Array.isArray(res) ? res : res?.data || [];
      const mapped = rows.map((r) => ({
        date: r.date,
        checkIn: r.check_in_time || r.checkInTime || "",
        checkOut: r.check_out_time || r.checkOutTime || "",
        status: r.status || "",
        hours: r.total_hours || r.hours || "",
        overtime: r.overtime_hours || r.overtime || "",
        notes: r.notes || "",
      }));
      setAttendanceData(mapped);
    } catch (e) {
      setAttError(e.message || "Failed to load attendance records");
    } finally {
      setAttLoading(false);
    }
  };

  // --- Adjustment form ----------------------------------------------
  const [adjustmentDate, setAdjustmentDate] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("Check-in");
  const [adjustedTime, setAdjustedTime] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); 

  const handleAdjustmentSubmit = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee first.");
      return;
    }
    if (!adjustmentDate) {
      alert("Please select an adjustment date.");
      return;
    }
    // For Full Day / Half Day we can allow empty time
    if (
      (adjustmentType === "Check-in" || adjustmentType === "Check-out") &&
      !adjustedTime
    ) {
      alert("Please enter the adjusted time.");
      return;
    }

    const payload = {
      employee_id: selectedEmployee.id,
      adjustment_date: adjustmentDate,
      adjustment_type: adjustmentType,
      adjusted_time: adjustedTime || null,
      reason: adjustmentReason,
    };

    try {
      setSubmitLoading(true);


      const result = await attendanceApi.createAdjustment(payload);
      if (!result.ok) {
        throw new Error(result.message || "Failed to submit adjustment");
      }

      // Show success message 
      setSuccessMessage(
        result.message || "Attendance adjustment submitted successfully!"
      );

      // reset form fields

      
      setAdjustmentDate("");
      setAdjustedTime("");
      setAdjustmentReason("");

      //close modal = "exit edit tab" and show main attendance adjustment page
      setShowModal(false);

      // clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

    } catch (e) {
      alert(e.message || "Failed to submit adjustment");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Time & Attendance", "Attendance Adjustment"]}
        title="Attendance Adjustment"
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



      {/* Search & Filters */}
      <div className="card">
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "end",
            marginBottom: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
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
              placeholder="Search by Employee Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
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
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button className="btn btn-soft" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
          {empLoading
            ? "Loading employees..."
            : `${filteredEmployees.length} employee(s) found`}
        </div>
        {empError && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: "var(--danger)",
            }}
          >
            {empError}
          </div>
        )}
      </div>

      {successMessage && (
        <div 
          className="card"
          style={{ backgroundColor: "var(--success-soft)", color: "var(--success)", marginBottom: "16px" }}>
          {successMessage}
          
        </div>
      ) }

      {/* Employees table */}
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
            <div style={{ fontWeight: "700" }}>Employees</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              {empLoading
                ? "Loading..."
                : `Showing ${filteredEmployees.length} records`}
            </div>
          </div>

          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee No</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {empLoading ? (
                  <tr>
                    <td colSpan="4" style={{ padding: 40, textAlign: "center" }}>
                      Loading...
                    </td>
                  </tr>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.empNo}</td>
                      <td
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div className="user-avatar" />
                        <div style={{ fontWeight: "600" }}>{emp.name}</div>
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{ background: "var(--soft)", color: "var(--text)" }}
                        >
                          {emp.department}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-soft"
                          onClick={() => handleViewAttendance(emp)}
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                          View Attendance
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
                      No matching employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination (static) */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
          Showing {filteredEmployees.length} of {employees.length} results
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-soft" disabled>
            Previous
          </button>
          <button className="btn btn-soft" disabled>
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedEmployee && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--panel)",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "1000px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  Attendance Details - {selectedEmployee.name}
                </h2>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--muted)",
                    marginTop: "4px",
                  }}
                >
                  {selectedEmployee.department} • Employee No:{" "}
                  {selectedEmployee.empNo}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px" }}>
              {/* Attendance records */}
              <div style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "16px",
                  }}
                >
                  Recent Attendance Records
                </h3>
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    overflow: "hidden",
                  }}
                >
                  <table className="table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Status</th>
                        <th>Hours</th>
                        <th>Overtime</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attLoading ? (
                        <tr>
                          <td
                            colSpan="7"
                            style={{
                              textAlign: "center",
                              padding: "24px",
                              color: "var(--muted)",
                            }}
                          >
                            Loading attendance...
                          </td>
                        </tr>
                      ) : attError ? (
                        <tr>
                          <td
                            colSpan="7"
                            style={{
                              textAlign: "center",
                              padding: "24px",
                              color: "var(--danger)",
                            }}
                          >
                            {attError}
                          </td>
                        </tr>
                      ) : attendanceData.length ? (
                        attendanceData.map((record, i) => (
                          <tr key={i}>
                            <td>{formatDate(record.date)}</td>
                            <td>{record.checkIn || "-"}</td>
                            <td>{record.checkOut || "-"}</td>
                            <td>
                              <span
                                className={`pill ${
                                  record.status === "Present"
                                    ? "pill-ok"
                                    : record.status === "Late"
                                    ? "pill-warn"
                                    : "pill-soft"
                                }`}
                              >
                                {record.status || "-"}
                              </span>
                            </td>
                            <td>{record.hours ? `${record.hours}h` : "-"}</td>
                            <td>
                              {record.overtime ? `${record.overtime}h` : "-"}
                            </td>
                            <td
                              style={{
                                fontSize: "12px",
                                color: "var(--muted)",
                              }}
                            >
                              {record.notes || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            style={{
                              textAlign: "center",
                              padding: "24px",
                              color: "var(--muted)",
                            }}
                          >
                            No attendance records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Adjustment form */}
              <div
                style={{
                  padding: "16px",
                  background: "var(--soft)",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "16px",
                  }}
                >
                  Make Attendance Adjustment
                </h3>

                <div
                  className="grid-3"
                  style={{ gap: "12px", marginBottom: "12px" }}
                >
                  <div>
                    <label className="muted-label">Adjustment Date *</label>
                    <input
                      className="input"
                      type="date"
                      value={adjustmentDate}
                      onChange={(e) => setAdjustmentDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="muted-label">Adjustment Type *</label>
                    <select
                      className="select"
                      value={adjustmentType}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                    >
                      <option>Check-in</option>
                      <option>Check-out</option>
                      <option>Full Day</option>
                      <option>Half Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="muted-label">Adjusted Time *</label>
                    <input
                      className="input"
                      type="time"
                      value={adjustedTime}
                      onChange={(e) => setAdjustedTime(e.target.value)}
                      disabled={
                        adjustmentType === "Full Day" ||
                        adjustmentType === "Half Day"
                      }
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label className="muted-label">Reason for Adjustment</label>
                  <textarea
                    className="input"
                    placeholder="Enter reason for attendance adjustment..."
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    style={{
                      minHeight: "80px",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-soft"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleAdjustmentSubmit}
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Submitting..." : "Submit Adjustment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AttendanceAdjustment;
