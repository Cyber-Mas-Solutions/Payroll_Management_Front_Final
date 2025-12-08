// src/pages/LeaveRules.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { leaveApi, apiGet, apiPost } from "../services/api";

// Hardcoded grades for initial frontend structure,
// but should ideally be fetched from a dedicated 'grades' API or employee data.
const GRADES = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
  { id: 3, name: "C" },
];

const DEFAULT_RULES = {
  annual_limit: 14.0,
  medical_limit: 7.0,
};

const LeaveRules = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs structure inherited from other leave pages
  const tabs = [
    { label: "Overview", path: "/employee-leaves" },
    { label: "Leave Approval", path: "/leave-approval" },
    { label: "Calendar", path: "/leave-calendar" },
    { label: "Leave Request", path: "/leave-request" },
    { label: "Leave Rules", path: "/leave-rules" }, // 👈 New Tab
  ];

  const [rules, setRules] = useState([]); // Array of rules: [{grade_id, annual_limit, medical_limit}, ...]
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // State to hold local edits before saving
  const [localEdits, setLocalEdits] = useState({});

  /**
   * Fetches all existing leave rules from the backend.
   * On failure, it initializes with default rules for all grades.
   */
  const fetchRules = async () => {
    setLoading(true);
    setError("");
    try {
      // ⚠️ ASSUMPTION: You will create a new backend endpoint for this:
      // e.g., /leaves/rules
      const res = await apiGet("/leaves/rules"); 
      
      const fetchedRules = (res && res.data) || [];

      // Combine fetched rules with all possible grades, using default if missing
      const initialRules = GRADES.map(grade => {
        const existingRule = fetchedRules.find(r => r.grade_id === grade.id);
        return {
          grade_id: grade.id,
          grade_name: grade.name,
          annual_limit: existingRule?.annual_limit || DEFAULT_RULES.annual_limit,
          medical_limit: existingRule?.medical_limit || DEFAULT_RULES.medical_limit,
        };
      });

      setRules(initialRules);
      setLocalEdits(
        initialRules.reduce((acc, rule) => {
          acc[rule.grade_id] = { 
            annual_limit: rule.annual_limit, 
            medical_limit: rule.medical_limit 
          };
          return acc;
        }, {})
      );

    } catch (err) {
      console.error(err);
      setError("Failed to load leave rules. Using default values.");
      
      // Initialize with defaults if fetching fails
      const defaultState = GRADES.map(grade => ({
        grade_id: grade.id,
        grade_name: grade.name,
        ...DEFAULT_RULES,
      }));
      setRules(defaultState);
      setLocalEdits(
        defaultState.reduce((acc, rule) => {
          acc[rule.grade_id] = { 
            annual_limit: rule.annual_limit, 
            medical_limit: rule.medical_limit 
          };
          return acc;
        }, {})
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  /**
   * Handlers for local edits
   */
  const handleEditChange = (gradeId, field, value) => {
    // Ensure value is a non-negative number
    const numValue = Math.max(0, Number(value));
    
    setLocalEdits(prev => ({
      ...prev,
      [gradeId]: {
        ...prev[gradeId],
        [field]: numValue,
      }
    }));
  };
  
  /**
   * Saves the locally edited rules to the backend.
   */
  const handleSave = async (gradeId) => {
    setSaving(true);
    setError("");
    const gradeEdit = localEdits[gradeId];
    
    if (!gradeEdit || gradeEdit.annual_limit === undefined || gradeEdit.medical_limit === undefined) {
        alert("Invalid data to save.");
        setSaving(false);
        return;
    }

    try {
      // ⚠️ ASSUMPTION: You will create a new backend endpoint for this:
      // e.g., POST /leaves/rules
      const payload = {
          grade_id: gradeId,
          annual_limit: gradeEdit.annual_limit,
          medical_limit: gradeEdit.medical_limit,
      };

      const res = await apiPost("/leaves/rules", payload);

      if (!res.ok) {
        throw new Error(res.message || "Failed to save rule.");
      }
      
      // Update the main state with the saved data
      setRules(prev => prev.map(rule => 
        rule.grade_id === gradeId ? 
        { ...rule, annual_limit: payload.annual_limit, medical_limit: payload.medical_limit } : 
        rule
      ));

      alert(`Leave rule for Grade ${GRADES.find(g => g.id === gradeId)?.name} saved successfully.`);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save leave rule.");
      alert(err.message || "Failed to save leave rule.");
    } finally {
      setSaving(false);
    }
  };


  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Leave Management", "Leave Rules"]}
        title="Leave Rules"
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

      {/* Error / Loading */}
      {loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          Loading leave rules...
        </div>
      )}
      {error && (
        <div className="card" style={{ color: 'var(--danger)' }}>
          Error: {error}
        </div>
      )}

      {/* Rules Configuration */}
      <div className="grid-3" style={{ gap: "16px", marginBottom: "16px" }}>
        {rules.map((rule) => (
          <div key={rule.grade_id} className="card">
            <h3>Grade {rule.grade_name} Rules</h3>
            <hr style={{ margin: "10px 0" }} />

            {/* Rule Statement Card */}
            <div
                className="card"
                style={{
                  padding: "12px",
                  marginBottom: "12px",
                  background: "var(--soft)",
                  border: "1px solid var(--border)",
                  fontSize: "13px",
                }}
              >
                <p>
                  Employees in <strong>Grade {rule.grade_name}</strong> are entitled to:
                </p>
                <ul>
                  <li>
                    <strong>{rule.annual_limit} days</strong> of Annual Leave.
                  </li>
                  <li>
                    <strong>{rule.medical_limit} days</strong> of Medical Leave.
                  </li>
                </ul>
                <p style={{ marginTop: "8px", fontWeight: "600", color: "var(--danger)" }}>
                  Any further leave beyond these limits will be marked as Unpaid Leave.
                </p>
            </div>
            {/* End Rule Statement Card */}


            {/* Annual Leave Input */}
            <div style={{ marginBottom: "12px" }}>
              <label 
                style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Annual Leave Limit (Days)
              </label>
              <input
                className="input"
                type="number"
                step="0.5"
                min="0"
                value={localEdits[rule.grade_id]?.annual_limit ?? ''}
                onChange={(e) => handleEditChange(rule.grade_id, 'annual_limit', e.target.value)}
              />
            </div>

            {/* Medical Leave Input */}
            <div style={{ marginBottom: "16px" }}>
              <label 
                style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Medical Leave Limit (Days)
              </label>
              <input
                className="input"
                type="number"
                step="0.5"
                min="0"
                value={localEdits[rule.grade_id]?.medical_limit ?? ''}
                onChange={(e) => handleEditChange(rule.grade_id, 'medical_limit', e.target.value)}
              />
            </div>

            {/* Save Button */}
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => handleSave(rule.grade_id)}
              disabled={loading || saving}
            >
              {saving ? "Saving..." : "Save Rule"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ margin: "0 24px 24px 24px", fontSize: "12px", color: "var(--muted)" }}>
        *Note: The system automatically calculates any leave exceeding the Annual or Medical limit as Unpaid Leave for employees of this grade.
      </div>
    </Layout>
  );
};

export default LeaveRules;