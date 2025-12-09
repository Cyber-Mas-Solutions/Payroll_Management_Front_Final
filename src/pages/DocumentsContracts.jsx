// src/pages/DocumentsContracts.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiUpload, apiDelete } from "../services/api";

const DOC_CATEGORIES = [
  "Employment Contract",
  "NDA Agreement",
  "HR Document",
  "Performance Improvement Plan",
  "Resignation Letter",
  "Offer Letter",
  "Probation Letter",
  "Warning Letter",
  "Others",
];

export default function DocumentsContracts() {
  const navigate = useNavigate();
  const location = useLocation();

  const [employeeFilter, setEmployeeFilter] = useState("All Employees");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("All Document Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload form state
  const [uploadEmployeeId, setUploadEmployeeId] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const uploadBoxRef = useRef(null);

  // Load employees + documents on mount
  useEffect(() => {
    let isMounted = true;

    async function loadAll() {
      try {
        setLoading(true);
        setError("");

        const [empRes, docsRes] = await Promise.all([
          apiGet("/employees"),
          apiGet("/contracts-docs"),
        ]);

        if (!isMounted) return;

        const empList = empRes.data || [];
        setEmployees(empList);

        const docsRows = docsRes.data || [];
        const mappedDocs = docsRows.map((r) => ({
          id: r.id,
          name: r.file_name,
          employeeName: r.employee_name,
          employeeCode: r.employee_code,
          employeeLabel: `${r.employee_name}${r.employee_code ? " " + r.employee_code : ""}`,
          type: r.category || "Other",
          uploadedDate: r.uploaded_at,
          status: r.status || "Active",
          url: r.url,
        }));
        setDocuments(mappedDocs);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAll();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter options
  const employeeOptions = useMemo(
    () => [
      "All Employees",
      ...new Set(documents.map((doc) => doc.employeeName).filter(Boolean)),
    ],
    [documents]
  );

  const documentTypeOptions = useMemo(
    () => [
      "All Document Types",
      ...new Set(documents.map((doc) => doc.type).filter(Boolean)),
    ],
    [documents]
  );

  const statusOptions = useMemo(
    () => [
      "All Statuses",
      ...new Set(documents.map((doc) => doc.status || "Active").filter(Boolean)),
    ],
    [documents]
  );

  // Apply filters
  const filteredDocuments = documents.filter((doc) => {
    const matchesEmployee =
      employeeFilter === "All Employees" || doc.employeeName === employeeFilter;
    const matchesDocumentType =
      documentTypeFilter === "All Document Types" || doc.type === documentTypeFilter;
    const matchesStatus =
      statusFilter === "All Statuses" || (doc.status || "Active") === statusFilter;

    return matchesEmployee && matchesDocumentType && matchesStatus;
  });

  // MM/DD/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleResetFilters = () => {
    setEmployeeFilter("All Employees");
    setDocumentTypeFilter("All Document Types");
    setStatusFilter("All Statuses");
  };

  const openUploadBox = () => {
    if (uploadBoxRef.current) {
      uploadBoxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!uploadEmployeeId) {
      alert("Please select an employee for the documents.");
      return;
    }
    if (!uploadCategory) {
      alert("Please select a document type/category.");
      return;
    }
    if (!selectedFiles.length) {
      alert("Please select at least one file to upload.");
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("employee_id", uploadEmployeeId);
      fd.append("category", uploadCategory);
      selectedFiles.forEach((file) => fd.append("files", file));

      const res = await apiUpload("/contracts-docs", fd);
      if (!res.ok) {
        throw new Error(res.message || "Upload failed");
      }

      // reload documents list
      const docsRes = await apiGet("/contracts-docs");
      const docsRows = docsRes.data || [];
      const mappedDocs = docsRows.map((r) => ({
        id: r.id,
        name: r.file_name,
        employeeName: r.employee_name,
        employeeCode: r.employee_code,
        employeeLabel: `${r.employee_name}${r.employee_code ? " " + r.employee_code : ""}`,
        type: r.category || "Other",
        uploadedDate: r.uploaded_at,
        status: r.status || "Active",
        url: r.url,
      }));
      setDocuments(mappedDocs);

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete document "${doc.name}"?`)) return;
    try {
      const res = await apiDelete(`/contracts-docs/${doc.id}`);
      if (!res.ok) {
        throw new Error(res.message || "Delete failed");
      }
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete document");
    }
  };

  const handleView = (doc) => {
    if (doc.url) {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = (doc) => {
    if (!doc.url) return;
    const a = document.createElement("a");
    a.href = doc.url;
    a.download = doc.name || "document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout>
      {/* Header */}
      <PageHeader
        breadcrumb={["Employee Information", "Documents & Contracts"]}
        title="Employee Information Management"
      />

      {/* Tabs */}
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
            { label: "Overview", path: "/employee-info" },
            { label: "Add Employee", path: "/add-employee" },
            { label: "Attendance & Leave Records", path: "/attendance-leave" },
            { label: "Performance & Training", path: "/performance-training" },
            { label: "Documents & Contracts", path: "/documents-contracts" },
            { label: "Audit Logs", path: "/audit-logs" },
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

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Filters Card */}
        <div className="card">
          <div className="grid-3" style={{ alignItems: "end", marginBottom: "12px" }}>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Employee
              </label>
              <select
                className="select"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                {employeeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
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
                Document Type
              </label>
              <select
                className="select"
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
              >
                {documentTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
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
                Status
              </label>
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(employeeFilter !== "All Employees" ||
                documentTypeFilter !== "All Document Types" ||
                statusFilter !== "All Statuses") && (
                <button className="btn btn-soft" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
            <button className="btn btn-primary" onClick={openUploadBox}>
              Upload Documents
            </button>
          </div>
        </div>

        {/* Error / loading */}
        {error && (
          <div className="card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
            {error}
          </div>
        )}
        {loading && !error && (
          <div className="card">
            <span>Loading...</span>
          </div>
        )}

        {/* Documents Table */}
        <div className="table-container">
          <div className="card" style={{ padding: 0 }}>
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: "700" }}>Documents & Contracts</div>
              <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
                {filteredDocuments.length} document(s)
              </div>
            </div>

            <div style={{ overflowX: "auto", flex: 1 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Uploaded Date</th>
                    <th>Status</th>
                    <th style={{ width: "220px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: "600" }}>{item.name}</td>
                      <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="user-avatar" />
                        <div>
                          <div style={{ fontWeight: "600" }}>{item.employeeName}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                            {item.employeeCode || ""}
                          </div>
                        </div>
                      </td>
                      <td>{item.type}</td>
                      <td>{formatDate(item.uploadedDate)}</td>
                      <td>
                        <span
                          className={`pill ${
                            (item.status || "Active") === "Active"
                              ? "pill-ok"
                              : (item.status || "Active") === "Expiring Soon"
                              ? "pill-warn"
                              : ""
                          }`}
                        >
                          {item.status || "Active"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            className="btn btn-soft"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                            onClick={() => handleView(item)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-soft"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                            onClick={() => handleDownload(item)}
                          >
                            Download
                          </button>
                          <button
                            className="btn btn-soft"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                            onClick={() => handleDelete(item)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredDocuments.length && !loading && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                        No documents found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="card" ref={uploadBoxRef} id="contracts-upload-box">
          <div className="grid-3" style={{ marginBottom: "16px", gap: "12px" }}>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Employee *
              </label>
              <select
                className="select"
                value={uploadEmployeeId}
                onChange={(e) => setUploadEmployeeId(e.target.value)}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                    {emp.employee_code ? ` (${emp.employee_code})` : ""}
                  </option>
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
                Document Type / Category *
              </label>
              <select
                className="select"
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
              >
                <option value="">Select type</option>
                {DOC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
              marginBottom: "16px",
              cursor: "pointer",
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <p style={{ marginBottom: "8px", color: "var(--text)" }}>
              Drag and drop files here, or click to browse
            </p>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Accepted formats: PDF, XLSX, CSV (Max 10MB)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={handleFilesSelected}
            />
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--muted)" }}>
                {selectedFiles.length} file(s) selected
              </div>
            )}
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Documents"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
