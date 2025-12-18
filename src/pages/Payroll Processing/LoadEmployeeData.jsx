import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle, FiClock, FiUsers, FiBriefcase, FiInfo } from "react-icons/fi";

const LoadEmployeeData = () => {
  const navigate = useNavigate();
  const employees = [
    { id: "0001", name: "Rashmi Samadara", dept: "HR", status: "Processed" },
    { id: "0005", name: "Janith Perera", dept: "Finance", status: "Processed" },
    { id: "0006", name: "Malithi Gamage", dept: "HR", status: "Pending" },
    { id: "0008", name: "Raveen Silva", dept: "HR", status: "Processed" },
  ];

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Process Payroll"]}
        title="Process Payroll"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          margin: "0 24px",
          alignItems: "start",
        }}
      >
        {/* ================= LEFT SIDE ================= */}
        <div>
          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
              Complete the steps below to process payroll for your employees.
            </p>

            {/* Step Tabs */}
            <div
              style={{
                display: "flex",
                gap: 24,
                fontSize: 14,
                fontWeight: 600,
                borderBottom: "1px solid var(--border)",
                paddingBottom: 14,
                marginBottom: 24,
              }}
            >
              <span style={{ color: "var(--muted)" }}>Select Month</span>
              <span style={{ color: "#4F46E5", borderBottom: "2px solid #4F46E5", paddingBottom: 12 }}>
                Load Employee Data
              </span>
              <span style={{ color: "var(--muted)" }}>Review Salary Calculations</span>
              <span style={{ color: "var(--muted)" }}>Confirm Processing</span>
            </div>

            {/* Status Alert */}
            <div
              style={{
                padding: "16px 20px",
                background: "#EEF2FF",
                borderRadius: 12,
                border: "1px solid #C7D2FE",
                color: "#4338CA",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FiCheckCircle size={20} />
                <strong style={{ fontSize: 15 }}>Data Loaded Successfully</strong>
              </div>
              <p style={{ fontSize: 13, marginTop: 4, marginLeft: 30, opacity: 0.8 }}>
                127 employees found for April 2025
              </p>
            </div>

            {/* Table Title */}
            <h3 style={{ marginBottom: 16, fontWeight: 700, fontSize: 18 }}>
              Employee Payroll Records
            </h3>

            {/* TABLE */}
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ background: "#F9FAFB" }}>EMPLOYEE</th>
                    <th style={{ background: "#F9FAFB" }}>DEPARTMENT</th>
                    <th style={{ background: "#F9FAFB" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td style={{ padding: "16px 12px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{emp.name}</div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>ID: {emp.id}</div>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>{emp.dept}</td>
                      <td style={{ verticalAlign: "middle" }}>
                        {emp.status === "Processed" ? (
                          <span style={{ color: "#16A34A", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                            <FiCheckCircle /> Processed
                          </span>
                        ) : (
                          <span style={{ color: "#EA580C", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                            <FiClock /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Row */}
            <p style={{ fontSize: 13, color: "#6B7280", margin: "16px 0" }}>
              Showing <strong>4</strong> of 127 employees
            </p>

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid #F3F4F6",
              }}
            >
              <button className="btn btn-soft" onClick={() => navigate("/process-payroll")}>
                ‹ Back
              </button>
              <button className="btn btn-primary" onClick={() => navigate("/process-payroll/review-salary")}>
                Next ▶
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SUMMARY ================= */}
        <div>
          <div className="card" style={{ padding: 32, borderRadius: 32, border: "1px solid #E5E7EB" }}>
            <h3 style={{ fontWeight: 800, fontSize: 24, marginBottom: 32, color: "#000" }}>
              Payroll Summary
            </h3>

            {/* Total Employees */}
            <div style={{ background: "#EEF2FF", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#4F46E5", fontSize: "28px", display: "flex" }}>
                <FiUsers />
              </div>
              <div>
                <p style={{ color: "#4F46E5", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Total Employees</p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#4F46E5" }}>127</h1>
              </div>
            </div>

            {/* Total Salary */}
            <div style={{ background: "#DCFCE7", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#16A34A", fontSize: "28px", display: "flex" }}>
                <FiBriefcase />
              </div>
              <div>
                <p style={{ color: "#16A34A", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Total Salary</p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#16A34A" }}>$42,542,000</h1>
              </div>
            </div>

            {/* Pending Cases */}
            <div style={{ background: "#FFEDD5", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ color: "#EA580C", fontSize: "24px", display: "flex" }}>
                <FiInfo />
              </div>
              <div>
                <p style={{ color: "#EA580C", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Pending Cases</p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#EA580C" }}>27</h1>
              </div>
            </div>

            <hr style={{ margin: "36px 0", border: "none", borderTop: "1px solid #E5E7EB" }} />

            <p style={{ fontWeight: 600, fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Processing Status</p>
            <div style={{ height: 10, background: "#E5E7EB", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ width: "50%", height: "100%", background: "#4F46E5", borderRadius: 10 }} />
            </div>

            <p style={{ fontSize: 14, marginTop: 14, color: "#9CA3AF", fontWeight: 500 }}>
              Step 2 of 4 completed
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoadEmployeeData;