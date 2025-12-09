// src/pages/PerformanceTraining.jsx
import React, { useEffect, useState } from "react";
import { performanceApi } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function PerformanceTraining() {
  const navigate = useNavigate();
  const location = useLocation();

  const [performanceData, setPerformanceData] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- Modal state & form state ---------------------------------
  const [showPerfModal, setShowPerfModal] = useState(false);
  const [showTrainModal, setShowTrainModal] = useState(false);

  const [perfForm, setPerfForm] = useState({
    employee_id: "",
    reviewer_name: "",
    rating: "",
    strengths: "",
    improvements: "",
  });

  const [trainingForm, setTrainingForm] = useState({
    employee_id: "",
    training_course: "",
    status: "Scheduled",
    start_date: "",
    end_date: "",
    score: "",
    certificate: "Not Available",
  });

  // ---- Load overview data ---------------------------------------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const [pRes, tRes] = await Promise.all([
          performanceApi.getPerformanceOverview(),
          performanceApi.getTrainingOverview(),
        ]);

        setPerformanceData(pRes.data || []);
        setTrainingData(tRes.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load performance & training data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Helper to format dates into MM/DD/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    if (dateStr.includes("to")) {
      const [start, end] = dateStr.split("to").map((d) => d.trim());
      return `${formatDate(start)} to ${formatDate(end)}`;
    }

    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  };

  // ✅ Helper to show an Employee No (code or fallback)
  const getEmployeeNo = (item) => {
    if (item.employee_code) return item.employee_code;
    if (!item.employee_id) return "-";
    return `EMP${String(item.employee_id).padStart(3, "0")}`;
  };

  // ---- Open modals ----------------------------------------------
  const handleAddPerformanceReview = () => {
    setPerfForm({
      employee_id: "",
      reviewer_name: "",
      rating: "",
      strengths: "",
      improvements: "",
    });
    setShowPerfModal(true);
  };

  const handleScheduleTraining = () => {
    setTrainingForm({
      employee_id: "",
      training_course: "",
      status: "Scheduled",
      start_date: "",
      end_date: "",
      score: "",
      certificate: "Not Available",
    });
    setShowTrainModal(true);
  };

  // ---- Save Performance Review ----------------------------------
  const savePerformanceReview = async () => {
    try {
      if (!perfForm.employee_id || !perfForm.rating) {
        alert("Employee ID and Rating are required");
        return;
      }

      const payload = {
        ...perfForm,
        employee_id: Number(perfForm.employee_id),
        rating: Number(perfForm.rating),
        review_date: new Date().toISOString().slice(0, 10),
      };

      const res = await performanceApi.addPerformanceReview(payload);
      if (!res.ok) throw new Error(res.message || "Failed to save review");

      const updated = await performanceApi.getPerformanceOverview();
      setPerformanceData(updated.data || []);
      setShowPerfModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save performance review");
    }
  };

  // ---- Save Training Record -------------------------------------
  const saveTrainingRecord = async () => {
    try {
      if (!trainingForm.employee_id || !trainingForm.training_course) {
        alert("Employee ID and Training Course are required");
        return;
      }

      const payload = {
        ...trainingForm,
        employee_id: Number(trainingForm.employee_id),
        start_date: trainingForm.start_date || null,
        end_date: trainingForm.end_date || null,
        score: trainingForm.score || null,
      };

      const res = await performanceApi.addTrainingRecord(payload);
      if (!res.ok) throw new Error(res.message || "Failed to save training");

      const updated = await performanceApi.getTrainingOverview();
      setTrainingData(updated.data || []);
      setShowTrainModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save training record");
    }
  };

  // ----------------------------------------------------------------
  //  RENDER
  // ----------------------------------------------------------------
  return (
    <Layout>
      {/* PERFORMANCE MODAL */}
      {showPerfModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Add Performance Review</h3>

            <label>Employee ID</label>
            <input
              type="number"
              value={perfForm.employee_id}
              onChange={(e) =>
                setPerfForm({ ...perfForm, employee_id: e.target.value })
              }
            />

            <label>Reviewer Name</label>
            <input
              type="text"
              value={perfForm.reviewer_name}
              onChange={(e) =>
                setPerfForm({ ...perfForm, reviewer_name: e.target.value })
              }
            />

            <label>Rating (0–5)</label>
            <input
              type="number"
              step="0.1"
              value={perfForm.rating}
              onChange={(e) =>
                setPerfForm({ ...perfForm, rating: e.target.value })
              }
            />

            <label>Strengths</label>
            <textarea
              rows={3}
              value={perfForm.strengths}
              onChange={(e) =>
                setPerfForm({ ...perfForm, strengths: e.target.value })
              }
            />

            <label>Improvements</label>
            <textarea
              rows={3}
              value={perfForm.improvements}
              onChange={(e) =>
                setPerfForm({ ...perfForm, improvements: e.target.value })
              }
            />

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={savePerformanceReview}>
                Save
              </button>
              <button
                className="btn btn-soft"
                onClick={() => setShowPerfModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRAINING MODAL */}
      {showTrainModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Assign New Training</h3>

            <label>Employee ID</label>
            <input
              type="number"
              value={trainingForm.employee_id}
              onChange={(e) =>
                setTrainingForm({ ...trainingForm, employee_id: e.target.value })
              }
            />

            <label>Training Course</label>
            <input
              type="text"
              value={trainingForm.training_course}
              onChange={(e) =>
                setTrainingForm({
                  ...trainingForm,
                  training_course: e.target.value,
                })
              }
            />

            <label>Status</label>
            <select
              value={trainingForm.status}
              onChange={(e) =>
                setTrainingForm({ ...trainingForm, status: e.target.value })
              }
            >
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>

            <label>Start Date</label>
            <input
              type="date"
              value={trainingForm.start_date}
              onChange={(e) =>
                setTrainingForm({ ...trainingForm, start_date: e.target.value })
              }
            />

            <label>End Date</label>
            <input
              type="date"
              value={trainingForm.end_date}
              onChange={(e) =>
                setTrainingForm({ ...trainingForm, end_date: e.target.value })
              }
            />

            <label>Score</label>
            <input
              type="text"
              value={trainingForm.score}
              onChange={(e) =>
                setTrainingForm({ ...trainingForm, score: e.target.value })
              }
            />

            <label>Certificate</label>
            <select
              value={trainingForm.certificate}
              onChange={(e) =>
                setTrainingForm({
                  ...trainingForm,
                  certificate: e.target.value,
                })
              }
            >
              <option>Available</option>
              <option>Not Available</option>
            </select>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveTrainingRecord}>
                Save
              </button>
              <button
                className="btn btn-soft"
                onClick={() => setShowTrainModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Employee Information", "Performance & Training"]}
        title="Employee Information Management"
      />

      {/* Fixed Tabs Section - Won't scroll away */}
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
              className={`btn ${
                location.pathname === t.path ? "btn-primary" : "btn-soft"
              }`}
              onClick={() => navigate(t.path)}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional error display */}
      {error && (
        <div className="card" style={{ marginTop: "12px", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {/* Scrollable Content Area */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Performance Section */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
              Performance Ratings
            </h3>
            <button
              className="btn btn-primary"
              onClick={handleAddPerformanceReview}
            >
              + Add Performance Review
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee No</th>
                  <th>Department / Position</th>
                  <th>Rating</th>
                  <th>Last Review</th>
                  <th>Strengths</th>
                  <th>Improvements</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((item) => (
                  <tr key={item.employee_id}>
                    <td
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div className="user-avatar" />
                      <div style={{ fontWeight: "600" }}>{item.full_name}</div>
                    </td>
                    <td>{getEmployeeNo(item)}</td>
                    <td>
                      {item.department_name || "-"}
                      {item.designation ? ` - ${item.designation}` : ""}
                    </td>
                    <td>
                      <span className="pill pill-ok">
                        {item.rating != null
                          ? `${Number(item.rating).toFixed(1)} ★`
                          : "N/A"}
                      </span>
                    </td>
                    <td>
                      {item.review_date
                        ? `${formatDate(item.review_date)}${
                            item.reviewer_name
                              ? ` by ${item.reviewer_name}`
                              : ""
                          }`
                        : "-"}
                    </td>
                    <td style={{ fontSize: "11px", lineHeight: "1.4" }}>
                      {item.strengths || "-"}
                    </td>
                    <td style={{ fontSize: "11px", lineHeight: "1.4" }}>
                      {item.improvements || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Training Section */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
              Training Records
            </h3>
            <button className="btn btn-primary" onClick={handleScheduleTraining}>
              + Assign New Training
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee No</th>
                  <th>Training Course</th>
                  <th>Status</th>
                  <th>Date Range</th>
                  <th>Score</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {trainingData.map((item) => (
                  <tr key={item.employee_id}>
                    <td
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div className="user-avatar" />
                      <div style={{ fontWeight: "600" }}>{item.full_name}</div>
                    </td>
                    <td>{getEmployeeNo(item)}</td>
                    <td>{item.training_course || "-"}</td>
                    <td>
                      <span
                        className={`pill ${
                          item.status === "Completed"
                            ? "pill-ok"
                            : item.status === "In Progress"
                            ? "pill-warn"
                            : ""
                        }`}
                      >
                        {item.status || "-"}
                      </span>
                    </td>
                    <td>
                      {item.start_date || item.end_date
                        ? `${item.start_date ? formatDate(item.start_date) : "-"} to ${
                            item.end_date ? formatDate(item.end_date) : "-"
                          }`
                        : "-"}
                    </td>
                    <td>{item.score || "N/A"}</td>
                    <td>
                      <span
                        className={`pill ${
                          item.certificate === "Available" ? "pill-ok" : ""
                        }`}
                      >
                        {item.certificate || "Not Available"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
