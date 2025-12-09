// src/pages/AbsenceReport.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { attendanceApi } from "../services/api";

const AbsenceReport = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Overview", path: "/attendance-overview" },
    { label: "Time Management", path: "/time-management" },
    { label: "Absence Report", path: "/absence-report" },
    { label: "Attendance Adjustment", path: "/attendance-adjustment" },
    { label: "Check In & Out Report", path: "/checkin-checkout-report" },
  ];

  // ✅ Filters
  const [selectedDate, setSelectedDate] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterOffice, setFilterOffice] = useState("");

  // ✅ Data from backend
  const [absenceData, setAbsenceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Normalize backend date to YYYY-MM-DD
  const normalizeDateOnly = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; // already date-only

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // ✅ Format date for display DD/MM/YYYY
  const formatDisplayDate = (value) => {
    const normalized = normalizeDateOnly(value);
    if (!normalized) return "";
    const [year, month, day] = normalized.split("-");
    return `${day}/${month}/${year}`;
  };

  // ✅ Fetch absence report from backend (with filters)
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        // Build params
        const params = {};
        if (selectedDate) {
          params.startDate = selectedDate;
          params.endDate = selectedDate;
        }
        if (filterDept) params.department = filterDept;

        const data = await attendanceApi.getAbsenceReport(params);

        //backend may return either {ok, data: [] } or directly []
        const rows = Array.isArray(data) ? data : data.data || [];
        const normalized = rows.map((item, idx) => ({
          empNo:
            item.employee_code ||
            item.empNo ||
            item.employee_id ||
            "",
          rowIndex: idx + 1,
          employeeName: item.full_name || item.employee_name || "",
          callingName: item.calling_name || "",
          department: item.department_name || item.department || "",
          designation: item.designation || "",
          workingOffice: item.working_office || "",
          branch: item.branch_name || "",
          status: item.status || "",
          notes: item.notes || "",
          date: item.date || item.absent_date || "",
        }));
        setAbsenceData(normalized);
      } catch (e) {
        setError(e.message || "Failed to load absence report");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedDate, filterDept]);

  // ✅ Client-side filters (employee search + office only)
  const filteredData = absenceData.filter((item) => {
    const matchesEmployee =
      (item.employeeName || "")
        .toLowerCase()
        .includes(searchEmployee.toLowerCase()) ||
      (item.callingName || "")
        .toLowerCase()
        .includes(searchEmployee.toLowerCase());

    const matchesOffice =
      !filterOffice ||
      (item.workingOffice || "")
        .toLowerCase()
        .includes(filterOffice.toLowerCase());

    return matchesEmployee && matchesOffice;
  });

  // ✅ Export CSV
  const handleExportCSV = () => {
    const csvHeaders = [
      "Employee No",  
      "Employee Name",
      "Calling Name",
      "Department",
      "Designation",
      "Working Office",
      "Branch",
      "Status",
      "Notes",
      "Date",
    ];
    const csvRows = filteredData.map((row) =>
      [
        row.empNo,
        row.employeeName,
        row.callingName,
        row.department,
        row.designation,
        row.workingOffice,
        row.branch,
        row.status,
        (row.notes || "").replace(/(\r\n|\n|\r)/g, " "),
        formatDisplayDate(row.date),
      ].join(",")
    );
    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "absence_report.csv";
    link.click();
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSearchEmployee("");
    setFilterDept("");
    setFilterOffice("");
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Time & Attendance", "Absence Report"]}
        title="Absence Report"
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
              Date
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
              Search Employee
            </label>
            <input
              className="input"
              placeholder="Search by employee name..."
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
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
              Department
            </label>
            <input
              className="input"
              placeholder="Filter by department (exact)..."
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
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
              Working Office
            </label>
            <input
              className="input"
              placeholder="Filter by office..."
              value={filterOffice}
              onChange={(e) => setFilterOffice(e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "14px", color: "var(--muted)" }}>
            {loading
              ? "Loading absence records..."
              : `${filteredData.length} absence record(s) found`}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-soft" onClick={clearFilters}>
              Clear Filters
            </button>
            <button
              className="btn btn-primary"
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Absence Report Table */}
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
            <div style={{ fontWeight: "700" }}>Absence Report</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              Showing {filteredData.length} records
            </div>
          </div>

          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee No</th>
                  <th>Employee Name</th>
                  <th>Calling Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Working Office</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--muted)",
                      }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <tr key={row.empNo || row.rowIndex || i}>
                      <td>{row.empNo || "-"}</td>
                      <td
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div className="user-avatar" />
                        <div>
                          <div style={{ fontWeight: "600" }}>
                            {row.employeeName}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--muted)",
                            }}
                          >
                            {row.designation || "-"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="pill pill-soft">
                          {row.callingName || "-"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background: "var(--soft)",
                            color: "var(--text)",
                          }}
                        >
                          {row.department || "-"}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                        }}
                      >
                        {row.designation || "-"}
                      </td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            background: "var(--soft)",
                            color: "var(--text)",
                          }}
                        >
                          {row.workingOffice || "-"}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                        }}
                      >
                        {row.branch || "-"}
                      </td>
                      <td>
                        <span className="pill pill-warn">
                          {row.status || "-"}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: "12px",
                          color: "var(--muted)",
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={row.notes}
                      >
                        {row.notes || "-"}
                      </td>
                      <td>
                        <span className="pill pill-warn">
                          {formatDisplayDate(row.date)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--muted)",
                      }}
                    >
                      No absence records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination (still static) */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "var(--muted)" }}>
          Showing {filteredData.length} of {absenceData.length} results
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
    </Layout>
  );
};

export default AbsenceReport;
