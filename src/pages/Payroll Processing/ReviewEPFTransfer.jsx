import React from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle, FiClock, FiUsers, FiBriefcase, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ReviewEPFTransfer = () => {
  const navigate = useNavigate();

  const summary = {
    employee: "Rs. 2,043,500.00",
    employer: "Rs. 2,044,500.00",
    total: "Rs. 4,088,000.00",
  };

  const employees = [
    { id: "0001", name: "Rashmi Samadara", dept: "HR", epf: "Rs. 32,000", status: "Processed" },
    { id: "0005", name: "Janith Perera", dept: "Finance", epf: "Rs. 35,500", status: "Processed" },
    { id: "0006", name: "Malithi Gamage", dept: "HR", epf: "Rs. 28,000", status: "Pending" },
    { id: "0008", name: "Raveen Silva", dept: "HR", epf: "Rs. 30,000", status: "Processed" },
  ];

  return (
    <Layout>
      <PageHeader
        breadcrumb={[
          "Payroll",
          "Payroll Processing & Disbursement",
          "EPF Transfer",
        ]}
        title="Process EPF Transfer"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          margin: "0 24px",
          alignItems: "start"
        }}
      >
        {/* ================= LEFT PANEL ================= */}
        <div>
          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
              Review EPF contributions before final submission to the EPF department.
            </p>

            {/* STEP INDICATOR */}
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
              <span style={{ color: "var(--muted)" }}>Load EPF Employee Data</span>
              <span style={{ color: "#4F46E5", borderBottom: "2px solid #4F46E5", paddingBottom: 12 }}>
                Review EPF Calculations
              </span>
              <span style={{ color: "var(--muted)" }}>Confirm EPF Transfer</span>
            </div>

            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
              Review EPF Calculations
            </h3>

            {/* EPF CONTRIBUTION SUMMARY BOXES */}
            <div className="card" style={{ margin: "0 0 24px 0", padding: 20, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 15, color: "#374151" }}>
                EPF Contribution Breakdown
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div className="card" style={{ margin: 0, padding: 16, border: "1px solid #E5E7EB" }}>
                  <div style={{ color: "#6B7280", fontSize: 12, fontWeight: 500 }}>
                    Employee (8%)
                  </div>
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 500, color: "#111827" }}>
                    {summary.employee}
                  </div>
                </div>

                <div className="card" style={{ margin: 0, padding: 16, border: "1px solid #E5E7EB" }}>
                  <div style={{ color: "#6B7280", fontSize: 12, fontWeight: 500 }}>
                    Employer (12%)
                  </div>
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 500, color: "#111827" }}>
                    {summary.employer}
                  </div>
                </div>

                <div className="card" style={{ margin: 0, padding: 16, background: "#DCFCE7", border: "1px solid #BBF7D0" }}>
                  <div style={{ color: "#166534", fontSize: 12, fontWeight: 400 }}>
                    Total Transfer
                  </div>
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 500, color: "#15803d" }}>
                    {summary.total}
                  </div>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ background: "#F9FAFB" }}>EMPLOYEE</th>
                    <th style={{ background: "#F9FAFB" }}>DEPARTMENT</th>
                    <th style={{ background: "#F9FAFB" }}>EPF AMOUNT</th>
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
                      <td style={{ verticalAlign: "middle", fontWeight: 600 }}>{emp.epf}</td>
                      <td style={{ verticalAlign: "middle" }}>
                        {emp.status === "Processed" ? (
                          <span style={{ color: "#16A34A", display: "flex", alignItems: "center", gap: 6, fontWeight: 300 }}>
                            <FiCheckCircle /> Processed
                          </span>
                        ) : (
                          <span style={{ color: "#EA580C", display: "flex", alignItems: "center", gap: 6, fontWeight: 300 }}>
                            <FiClock /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid #F3F4F6"
              }}
            >
              <button className="btn btn-soft" onClick={() => navigate("/process-epf-transfer/load-data")}>
                ‹ Back
              </button>
              <button className="btn btn-primary" style={{ padding: "10px 24px" }} onClick={() => navigate("/process-epf-transfer/confirm")}>
                Next ›
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SUMMARY PANEL ================= */}
        <div>
          <div className="card" style={{ padding: 32, borderRadius: 32, border: "1px solid #E5E7EB" }}>
            <h3 style={{ fontWeight: 500, fontSize: 20, marginBottom: 32, color: "#868585ff" }}>
              EPF Transfer Summary
            </h3>

            <div style={{ background: "#EEF2FF", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#4F46E5", fontSize: "28px", display: "flex" }}><FiUsers /></div>
              <div>
                <p style={{ color: "#4F46E5", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Total Employees</p>
                <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "#4F46E5" }}>127</h1>
              </div>
            </div>

            <div style={{ background: "#DCFCE7", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#16A34A", fontSize: "28px", display: "flex" }}><FiBriefcase /></div>
              <div>
                <p style={{ color: "#16A34A", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Total EPF Amount</p>
                <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "#16A34A" }}>Rs. 4,088,000</h1>
              </div>
            </div>

            <div style={{ background: "#FFEDD5", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ color: "#EA580C", fontSize: "24px", display: "flex" }}><FiInfo /></div>
              <div>
                <p style={{ color: "#EA580C", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Pending Employees</p>
                <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "#EA580C" }}>27</h1>
              </div>
            </div>

            <hr style={{ margin: "36px 0", border: "none", borderTop: "1px solid #E5E7EB" }} />

            <p style={{ fontWeight: 600, fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Processing Status</p>
            <div style={{ height: 10, background: "#E5E7EB", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ width: "75%", height: "100%", background: "#4F46E5", borderRadius: 10 }} />
            </div>
            <p style={{ fontSize: 14, marginTop: 14, color: "#9CA3AF", fontWeight: 500 }}>Step 3 of 4 completed</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewEPFTransfer;