// src/pages/FinalizePayroll.jsx
import React, { useState } from "react"; // ✅ FIXED
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
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
              onClick={() => navigate("/process-payroll/confirm-processing")}
            >
              Finalize Payroll Processing
            </button>
          </div>
        </div>

        {/* RIGHT PANEL (unchanged) */}
      </div>
    </Layout>
  );
};

export default FinalizePayroll;
