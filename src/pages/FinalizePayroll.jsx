// src/pages/FinalizePayroll.jsx
import React, { useState } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { useNavigate } from "react-router-dom";

const FinalizePayroll = () => {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);

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
                Finalize Payroll
              </span>
            </div>

            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>
              Finalize Payroll Processing
            </h2>

            {/* SUMMARY BOX */}
            <div
              className="card"
              style={{
                padding: 24,
                borderRadius: 12,
                marginBottom: 20,
                width: "100%",
              }}
            >
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>
                Payroll Summary for June 2023
              </h3>

              <table style={{ width: "100%", fontSize: 15 }}>
                <tbody>
                  <tr>
                    <td>Total Employees</td>
                    <td style={{ textAlign: "right" }}>127</td>
                  </tr>
                  <tr>
                    <td>Total Base Salary</td>
                    <td style={{ textAlign: "right" }}>$398,450.00</td>
                  </tr>
                  <tr>
                    <td>Total Bonuses & Overtime</td>
                    <td style={{ textAlign: "right" }}>$29,442.00</td>
                  </tr>
                  <tr>
                    <td>Pending Cases</td>
                    <td style={{ textAlign: "right", color: "#D97706" }}>3</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, paddingTop: 12 }}>
                      Total Payroll Amount
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        paddingTop: 12,
                        fontWeight: 700,
                        color: "#059669",
                      }}
                    >
                      $427,892.00
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* CHECKBOX */}
              <label
                style={{
                  marginTop: 20,
                  display: "flex",
                  gap: 8,
                  fontSize: 14,
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

            {/* FINALIZE BUTTON */}
            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: 20,
                padding: "12px 0",
                fontSize: 15,
                fontWeight: 600,
              }}
              disabled={!agree}
              onClick={() => navigate("/confirm-processing")}
            >
              Finalize Payroll Processing
            </button>
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
              <p style={{ color: "#059669", fontWeight: 600 }}>Total Salary</p>
              <h1 style={{ fontSize: 26 }}>$42,542,000</h1>
            </div>

            {/* Pending */}
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
                  width: "75%",
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

export default FinalizePayroll;
