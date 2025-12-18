import React from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle, FiUsers, FiBriefcase, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ConfirmEPFTransfer = () => {
  const navigate = useNavigate();

  const finish = () => {
    navigate("/"); // Redirect to dashboard
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Payroll Processing & Disbursement", "EPF Transfer"]}
        title="Confirm EPF Transfer"
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
            <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
              Complete the steps below to finalize EPF transfers for your employees.
            </p>

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
              <span style={{ color: "var(--muted)" }}>Load EPF Employee Data</span>
              <span style={{ color: "var(--muted)" }}>Review EPF Calculations</span>
              <span style={{ color: "#10B981", borderBottom: "2px solid #10B981", paddingBottom: 12 }}>
                Confirm EPF Transfer
              </span>
            </div>

            {/* MAIN CONFIRM CONTENT */}
            <div
              style={{
                padding: "60px 40px",
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                background: "#F0FDF4",
                borderRadius: 16,
                border: "1px dashed #BBF7D0"
              }}
            >
              {/* Centered success icon */}
              <div style={{ 
                marginBottom: 24, 
                background: "#DCFCE7", 
                width: 120, 
                height: 120, 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <FiCheckCircle size={60} color="#10B981" />
              </div>

              <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 12, color: "#111827" }}>
                EPF Transfer Successfully Completed!
              </h1>

              <p style={{ color: "#4B5563", maxWidth: 480, fontSize: 16, lineHeight: "1.6" }}>
                EPF contributions for <strong style={{color: "#111827"}}>April 2025</strong> have been successfully 
                processed and transferred for <strong style={{color: "#111827"}}>127 employees</strong>.
              </p>

              {/* BUTTONS */}
              <div
                style={{
                  marginTop: 48,
                  width: "100%",
                  display: "flex",
                  gap: 16,
                  justifyContent: "center",
                }}
              >
                <button
                  className="btn btn-soft"
                  style={{ padding: "12px 32px" }}
                  onClick={() => navigate("/process-epf-transfer/confirm")}
                >
                  ‹ Back
                </button>

                <button 
                  className="btn btn-primary" 
                  style={{ padding: "12px 48px", fontWeight: 700, fontSize: 16 }} 
                  onClick={finish}
                >
                  Finish & Return ✓
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SUMMARY PANEL ================= */}
        <div>
          <div className="card" style={{ padding: 32, borderRadius: 32, border: "1px solid #E5E7EB" }}>
            <h3 style={{ fontWeight: 500, fontSize: 22, marginBottom: 32, color: "#868585ff" }}>
              EPF Transfer Summary
            </h3>

            {/* Total Employees */}
            <div style={{ background: "#EEF2FF", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#4F46E5", fontSize: "28px", display: "flex" }}><FiUsers /></div>
              <div>
                <p style={{ color: "#4F46E5", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Total Employees</p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#4F46E5" }}>127</h1>
              </div>
            </div>

            {/* Total EPF */}
            <div style={{ background: "#DCFCE7", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#16A34A", fontSize: "28px", display: "flex" }}><FiBriefcase /></div>
              <div>
                <p style={{ color: "#16A34A", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Total EPF Amount</p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#16A34A" }}>Rs. 4,088,000</h1>
              </div>
            </div>

            {/* Pending */}
            <div style={{ background: "#FFEDD5", padding: "24px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ color: "#EA580C", fontSize: "24px", display: "flex" }}><FiInfo /></div>
              <div>
                <p style={{ color: "#EA580C", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>Pending Employees</p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#EA580C" }}>0</h1>
              </div>
            </div>

            <hr style={{ margin: "36px 0", border: "none", borderTop: "1px solid #E5E7EB" }} />

            <p style={{ fontWeight: 600, fontSize: 18, color: "#9CA3AF", marginBottom: 16 }}>Processing Status</p>

            <div style={{ height: 10, background: "#E5E7EB", borderRadius: 10, overflow: "hidden" }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#4632f5ff", // Success green bar for final step
                  borderRadius: 10,
                }}
              />
            </div>

            <p style={{ fontSize: 12, marginTop: 14, color: "#10B981", fontWeight: 500 }}>
              Process Complete ✓
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmEPFTransfer;