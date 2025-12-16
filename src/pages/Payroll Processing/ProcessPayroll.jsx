import React, { useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ProcessPayroll = () => {
  const navigate = useNavigate();

  // Current month & year as default
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    today.toLocaleString("default", { month: "long" })
  );

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Process Payroll"]}
        title="Process Payroll"
      />

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          margin: "0 24px",
        }}
      >
        {/* LEFT PANEL */}
        <div>
          <div className="card" style={{ padding: 24 }}>
            <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
              Complete the steps below to process payroll for your employees.
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
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                Select Payroll Month
              </h3>

              {/* YEAR SELECTOR */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <button
                  className="btn btn-soft"
                  onClick={() => setSelectedYear((y) => y - 1)}
                >
                  ‹
                </button>

                <h2 style={{ margin: 0 }}>{selectedYear}</h2>

                <button
                  className="btn btn-soft"
                  onClick={() => setSelectedYear((y) => y + 1)}
                >
                  ›
                </button>
              </div>

              {/* MONTH GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {months.map((month) => (
                  <div
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className="hover-card"
                    style={{
                      padding: "14px 10px",
                      textAlign: "center",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      border:
                        selectedMonth === month
                          ? "2px solid var(--brand)"
                          : "1px solid var(--border)",
                      background:
                        selectedMonth === month ? "#EEF2FF" : "#fff",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <FiCalendar size={14} style={{ marginBottom: 6 }} />
                    <div>{month}</div>
                  </div>
                ))}
              </div>

              {/* SELECTED TEXT */}
              <p style={{ marginTop: 20, fontSize: 14 }}>
                <strong>Selected Month :</strong>{" "}
                {selectedMonth} {selectedYear}
              </p>

              {/* ACTION BUTTONS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 40,
                }}
              >
                <button
                  className="btn btn-soft"
                  onClick={() => navigate("/process-payroll")}
                >
                  ‹ Back
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate("/process-payroll/load-data", {
                      state: { month: selectedMonth, year: selectedYear },
                    })
                  }
                >
                  Next ▶
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SUMMARY PANEL */}
        <div>
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18 }}>Payroll Summary</h3>

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

            <p style={{ fontWeight: 600, fontSize: 14 }}>
              Processing Status
            </p>

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
              />
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
