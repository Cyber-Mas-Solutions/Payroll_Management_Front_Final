import React, { useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUsers, FiBriefcase, FiInfo } from "react-icons/fi";

const FinalizeEPF = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { month, year } = location.state || { month: "April", year: "2025" };
  const [agree, setAgree] = useState(false);

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Payroll Processing & Disbursement", "EPF Transfer"]}
        title="Process EPF Transfer"
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
        {/* ================= LEFT PANEL ================= */}
        <div>
          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            {/* STEP TABS */}
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
              <span style={{ color: "var(--muted)" }}>Load Employee Data</span>
              <span style={{ color: "var(--muted)" }}>Review EPF Calculations</span>
              <span style={{ color: "#4F46E5", borderBottom: "2px solid #4F46E5", paddingBottom: 12 }}>
                Confirm EPF Transfer
              </span>
            </div>

            <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>
              Finalize EPF Transfer
            </h2>

            {/* MAIN SUMMARY BOX */}
            <div
              className="card"
              style={{
                padding: 24,
                borderRadius: 16,
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                marginBottom: 24,
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "#111827" }}>
                EPF Transfer Summary for {month} {year}
              </h3>

              <table style={{ width: "100%", fontSize: 14, borderCollapse: "separate", borderSpacing: "0 12px" }}>
                <tbody>
                  <tr>
                    <td style={{ color: "#6B7280" }}>Total Employees</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>127</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#6B7280" }}>Total Employee Contribution (8%)</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>LKR 398,450.00</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#6B7280" }}>Total Employer Contribution (12%)</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>LKR 29,442.00</td>
                  </tr>
                  <tr>
                    <td style={{ color: "#6B7280" }}>Pending Cases</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "#EA580C" }}>3</td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ borderTop: "1px solid #E5E7EB", paddingTop: 16 }}></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, fontSize: 16 }}>Total EPF Amount</td>
                    <td style={{ textAlign: "right", fontWeight: 700, fontSize: 18, color: "#16A34A" }}>
                      LKR 427,892.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CONFIRMATION CHECKBOX */}
            <div 
              style={{ 
                background: agree ? "#EEF2FF" : "#FDF2F2", 
                padding: "16px", 
                borderRadius: "12px", 
                border: agree ? "1px solid #C7D2FE" : "1px solid #FEE2E2",
                transition: "0.3s"
              }}
            >
              <label
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 14,
                  cursor: "pointer",
                  alignItems: "center",
                  color: agree ? "#4338CA" : "#111827",
                  fontWeight: 500
                }}
              >
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                I confirm that all information is correct and I want to process
                payroll
              </label>
            </div>

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
              <button
                className="btn btn-soft"
                style={{ flex: 1 }}
                onClick={() => navigate("/process-epf-transfer/review")}
              >
                ‹ Back to Review
              </button>
              <button
                className="btn btn-primary"
                style={{ 
                  flex: 2, 
                  padding: "14px 0", 
                  fontSize: 16, 
                  fontWeight: 700,
                  opacity: agree ? 1 : 0.6
                }}
                disabled={!agree}
                onClick={() => navigate("/process-epf/confirm-transfer")}
              >
                Finalize EPF Transfer
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SUMMARY PANEL ================= */}
        <div>
          <div className="card" style={{ padding: 28, borderRadius: 24, border: "1px solid #E5E7EB" }}>
            <h3 style={{ fontWeight: 500, fontSize: 20, marginBottom: 24, color: "#868585ff" }}>
              EPF Transfer Summary
            </h3>

            {/* Total Employees */}
            <div
              style={{
                background: "#EEF2FF",
                padding: "20px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div style={{ color: "#4F46E5", fontSize: "24px" }}>
                <FiUsers />
              </div>
              <div>
                <p style={{ color: "#4F46E5", fontWeight: 600, fontSize: 14, margin: 0 }}>
                  Total Employees
                </p>
                <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#4F46E5" }}>127</h1>
              </div>
            </div>

            {/* Total Salary/Amount */}
            <div
              style={{
                background: "#DCFCE7",
                padding: "20px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div style={{ color: "#16A34A", fontSize: "24px" }}>
                <FiBriefcase />
              </div>
              <div>
                <p style={{ color: "#16A34A", fontWeight: 600, fontSize: 14, margin: 0 }}>
                  Total Salary
                </p>
                <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#16A34A" }}>
                  $42,542,000
                </h1>
              </div>
            </div>

            {/* Pending Cases */}
            <div
              style={{
                background: "#FFEDD5",
                padding: "20px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div style={{ color: "#EA580C", fontSize: "20px" }}>
                <FiInfo />
              </div>
              <div>
                <p style={{ color: "#EA580C", fontWeight: 600, fontSize: 14, margin: 0 }}>
                  Pending Cases
                </p>
                <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#EA580C" }}>127</h1>
              </div>
            </div>

            <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #E5E7EB" }} />

            <p style={{ fontWeight: 600, fontSize: 16, color: "#9CA3AF", marginBottom: 16 }}>
              Processing Status
            </p>

            <div
              style={{
                height: 10,
                background: "#E5E7EB",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%", // Step 4 of 4
                  height: "100%",
                  background: "#4F46E5",
                  borderRadius: 10,
                }}
              />
            </div>

            <p style={{ fontSize: 14, marginTop: 12, color: "#9CA3AF", fontWeight: 500 }}>
              Step 4 of 4 completed
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FinalizeEPF;