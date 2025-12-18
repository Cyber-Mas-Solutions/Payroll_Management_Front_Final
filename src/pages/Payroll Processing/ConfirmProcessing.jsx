// src/pages/ConfirmProcessing.jsx
import React from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ConfirmProcessing = () => {
  const navigate = useNavigate();

  const finish = () => {
    navigate("/"); 
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Process Payroll"]}
        title="Process Payroll"
      />

      <div
        style={{
          display: "flex",         // Changed from grid to flex
          justifyContent: "center", // Centers horizontally
          padding: "0 24px",
          marginTop: "20px"
        }}
      >
        {/* MAIN PANEL (Now Centered) */}
        <div style={{ width: "100%", maxWidth: "900px" }}> 
      <div className="card" style={{ padding: 30 }}>
        <p style={{ color: "var(--muted)", marginBottom: 24, textAlign: 'center' }}>
          Complete the steps below to process payroll for your employees.
        </p>

           {/* STEP TABS - Now Centered */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center", // Centers the tabs
                  gap: "40px",              // Increased and consistent gap between tabs
                  fontSize: 14,
                  fontWeight: 600,
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: 14,
                  marginBottom: 24,
                }}
              >
                <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                  Select Month
                </span>
                <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                  Load Employee Data
                </span>
                <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                  Review Salary Calculations
                </span>
                <span 
                  style={{ 
                    color: "#000", 
                    borderBottom: "2px solid #000", 
                    paddingBottom: 14, // Aligns the border with the container bottom
                    marginBottom: -15, // Overlays the border on the container's bottom border
                    whiteSpace: "nowrap" 
                  }}
                >
                  Confirm Processing
                </span>
              </div>

            {/* MAIN CONFIRM CONTENT */}
            <div
              style={{
                padding: "40px 20px",
                minHeight: 350,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
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
              <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
                Payroll Successfully Processed!
              </h1>

              <p style={{ color: "var(--muted)", maxWidth: 480 }}>
                Payroll for April 2025 has been processed successfully for 127
                employees.
              </p>

              {/* BUTTONS */}
              <div
                style={{
                  marginTop: 40,
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button 
                  className="btn btn-soft"
                  onClick={() => navigate("/finalize-payroll")}
                >
                  ‹ Back
                </button>

                <button className="btn btn-primary" onClick={() => navigate("/payroll-processing")}
                >
                  Finish ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmProcessing;