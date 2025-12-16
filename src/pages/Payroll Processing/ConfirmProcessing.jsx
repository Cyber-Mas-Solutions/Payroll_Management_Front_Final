// src/pages/ConfirmProcessing.jsx
import React from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";


const ConfirmProcessing = () => {
  const navigate = useNavigate();

  const finish = () => {
    navigate("/"); // change this to whatever route you want after finishing
  };

  const goBack = () => {
    navigate("/review-salary"); // previous step route
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Process Payroll"]}
        title="Process Payroll"
      />

      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "16px",
          margin: "0 24px",
        }}
      >
        {/* LEFT PANEL */}
        <div>
          <div className="card" style={{ padding: 24 }}>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              Complete the steps below to process payroll for your employees.
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
              <span style={{ color: "var(--muted)" }}>Load Employee Data</span>
              <span style={{ color: "var(--muted)" }}>
                Review Salary Calculations
              </span>
              <span style={{ color: "#000", borderBottom: "2px solid #000" }}>
                Confirm Processing
              </span>
            </div>

            {/* MAIN CONFIRM CONTENT */}
            <div
              style={{
                padding: 40,
                minHeight: 350,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  width: "100%",
                  textAlign: "left",
                  fontSize: 22,
                  fontWeight: 700,
                  marginBottom: 60,
                }}
              >
                
              </h2>

              {/* Centered success icon */}
              <div style={{ marginBottom: 20 }}>
                <FiCheckCircle size={68} color="#10B981" />
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
                <button className="btn btn-soft"
              onClick={() => navigate("/finalize-payroll")}
              >‹ Back</button>


                <button className="btn btn-primary" onClick={finish}>
                  Finish ✓
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SUMMARY PANEL */}
        <div>
          <div
            className="card"
            style={{
              borderRadius: 16,
              padding: 28,
              height: "fit-content",
            }}
          >
            <h3 style={{ fontWeight: 700, fontSize: 18 }}>Payroll Summary</h3>

            {/* Total Employees */}
            <div
              className="card"
              style={{
                background: "#E8F0FF",
                border: "none",
                padding: 20,
                borderRadius: 12,
                marginTop: 20,
              }}
            >
              <p style={{ color: "#3B82F6", fontWeight: 600 }}>
                Total Employees
              </p>
              <h1 style={{ fontSize: 26 }}>127</h1>
            </div>

            {/* Total Salary */}
            <div
              className="card"
              style={{
                background: "#D9FCE1",
                border: "none",
                padding: 20,
                borderRadius: 12,
                margin: "20px 0",
              }}
            >
              <p style={{ color: "#059669", fontWeight: 600 }}>
                Total Salary
              </p>
              <h1 style={{ fontSize: 26 }}>$42,542,000</h1>
            </div>

            {/* Pending Cases */}
            <div
              className="card"
              style={{
                background: "#FFF5D6",
                border: "none",
                padding: 20,
                borderRadius: 12,
              }}
            >
              <p style={{ color: "#D97706", fontWeight: 600 }}>Pending Cases</p>
              <h1 style={{ fontSize: 26 }}>127</h1>
            </div>

            <hr style={{ margin: "28px 0" }} />

            <strong>Processing Status</strong>

            <div
              style={{
                height: 8,
                background: "#E5E7EB",
                borderRadius: 6,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#6366F1",
                  borderRadius: 6,
                }}
              ></div>
            </div>

            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
              Step 4 of 4 completed
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmProcessing;
