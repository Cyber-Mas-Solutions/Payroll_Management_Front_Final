import React from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle, FiUsers, FiBriefcase, FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ConfirmEPFTransfer = () => {
  const navigate = useNavigate();

  const finish = () => {
    navigate("/"); 
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Payroll Processing & Disbursement", "EPF Transfer"]}
        title="Confirm EPF Transfer"
      />

      {/* 1. MAIN WRAPPER: Now Flex and Centered */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          padding: "0 24px",
          alignItems: "flex-start",
          maxWidth: "1400px", // Allows room for both panels while remaining centered
          margin: "0 auto"
        }}
      >
        {/* ================= LEFT PANEL ================= */}
        <div style={{ width: "100%", maxWidth: "900px" }}> 
      <div className="card" style={{ padding: 30 }}>
        <p style={{ color: "var(--muted)", marginBottom: 24, textAlign: 'center' }}>
              Complete the steps below to finalize EPF transfers for your employees.
            </p>

            {/* 2. STEP TABS: Now Centered with consistent Gaps */}
            <div
              style={{
                display: "flex",
                justifyContent: "center", // Centered
                gap: "40px",              // Consistent gap
                fontSize: 14,
                fontWeight: 600,
                borderBottom: "1px solid var(--border)",
                paddingBottom: 14,
                marginBottom: 24,
              }}
            >
              <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>Select Month</span>
              <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>Load EPF Employee Data</span>
              <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>Review EPF Calculations</span>
              <span 
                style={{ 
                  color: "#0c0c0cff", 
                  borderBottom: "2px solid #0c0c0cff", 
                  paddingBottom: 14,
                  marginBottom: -15, // Aligns perfectly with the border
                  whiteSpace: "nowrap" 
                }}
              >
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
                background: "#fcfcfcff",
                borderRadius: 16,
                border: "1px dashed #BBF7D0"
              }}
            >
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

        
      </div>
    </Layout>
  );
};

export default ConfirmEPFTransfer;