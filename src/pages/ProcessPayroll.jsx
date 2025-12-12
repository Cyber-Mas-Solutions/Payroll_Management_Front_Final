// src/pages/ProcessPayroll.jsx
import React, { useState } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; 

const ProcessPayroll = () => {
    const navigate = useNavigate();  //
  const [selectedMonth, setSelectedMonth] = useState("April 2025");

  const months = ["April 2025", "June 2025", "July 2025"];


  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Process Payroll"]}
        title="Process Payroll"
      />

      {/* MAIN GRID (70% left, 30% right) */}
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
            {/* --- Title Text --- */}
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>
              
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
              Complete the steps below to process payroll for your employees.
            </p>

            {/* TOP TAB BAR */}
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
              <span style={{ color: "#000", borderBottom: "2px solid #000" }}>
                Select Month
              </span>
              <span style={{ color: "var(--muted)" }}>Load Employee Data</span>
              <span style={{ color: "var(--muted)" }}>
                Review Salary Calculations
              </span>
              <span style={{ color: "var(--muted)" }}>Confirm Processing</span>
            </div>

            {/* INNER CARD */}
            <div className="card" style={{ padding: 24, margin: 0 }}>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                Select Payroll Month
              </h3>

              {/* MONTH BUTTONS */}
              <div style={{ display: "flex", gap: 16 }}>
                {months.map((month) => (
                  <div
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 8,
                      border:
                        selectedMonth === month
                          ? "2px solid var(--brand)"
                          : "1px solid var(--border)",
                      background:
                        selectedMonth === month ? "#eef6ff" : "white",
                      cursor: "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    className="hover-card"
                  >
                    <FiCalendar size={16} />
                    {month}
                  </div>
                ))}
              </div>

              {/* SELECTED MONTH TEXT */}
              <p style={{ marginTop: 20, fontSize: 14 }}>
                <strong>Select month :</strong> {selectedMonth}
              </p>

              {/* ACTION BUTTONS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 40,
                }}
              >
                <button className="btn btn-soft">‹ Back</button>
                <button
                className="btn btn-primary"
                onClick={() => navigate("/process-payroll/load-data")}
                >
                Next ▶
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
              <p style={{ color: "#3B82F6", fontWeight: 600, fontSize: 14 }}>
                Total Employees
              </p>
              <h1 style={{ fontSize: 26, margin: 0 }}>127</h1>
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
              <p style={{ color: "#059669", fontWeight: 600, fontSize: 14 }}>
                Total Salary
              </p>
              <h1 style={{ fontSize: 26, margin: 0 }}>$42,542,000</h1>
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
              <p style={{ color: "#D97706", fontWeight: 600, fontSize: 14 }}>
                Pending Cases
              </p>
              <h1 style={{ fontSize: 26, margin: 0 }}>127</h1>
            </div>

            <hr style={{ margin: "28px 0" }} />

            <p style={{ fontWeight: 600, fontSize: 14 }}>Processing Status</p>

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
                  width: "25%",
                  height: "100%",
                  background: "#6366F1",
                  borderRadius: 6,
                }}
              ></div>
            </div>

            <p style={{ fontSize: 12, marginTop: 8, color: "var(--muted)" }}>
              Step 1 of 4 completed
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProcessPayroll;
