import React, { useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCalendar, FiUsers, FiBriefcase, FiInfo, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ProcessEPFTransfer = () => {
  const navigate = useNavigate();

  // Current month & year
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
        breadcrumb={[
          "Payroll",
          "Payroll Processing & Disbursement",
          "EPF Transfer",
          "Process EPF",
        ]}
        title="Process EPF Transfer"
      />

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
          margin: "0 24px",
          alignItems: "start"
        }}
      >
        {/* LEFT PANEL */}
        <div>
          <div className="card" style={{ padding: 24, borderRadius: 20 }}>
            <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
              Complete the steps below to process EPF contributions for employees.
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
              <span style={{ color: "#4F46E5", borderBottom: "2px solid #4F46E5", paddingBottom: 12 }}>
                Select Month
              </span>
              <span style={{ color: "var(--muted)" }}>
                Load EPF Employee Data
              </span>
              <span style={{ color: "var(--muted)" }}>
                Review EPF Calculations
              </span>
              <span style={{ color: "var(--muted)" }}>
                Confirm EPF Transfer
              </span>
            </div>

            {/* INNER CARD */}
            <div className="card" style={{ padding: 24, border: "1px solid #F3F4F6" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
                Select EPF Contribution Month
              </h3>

              {/* YEAR SELECTOR */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <button
                  className="btn btn-soft"
                  style={{ borderRadius: 8, padding: "8px 12px" }}
                  onClick={() => setSelectedYear((y) => y - 1)}
                >
                  <FiChevronLeft />
                </button>

                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{selectedYear}</h2>

                <button
                  className="btn btn-soft"
                  style={{ borderRadius: 8, padding: "8px 12px" }}
                  onClick={() => setSelectedYear((y) => y + 1)}
                >
                  <FiChevronRight />
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
                    style={{
                      padding: "16px 10px",
                      textAlign: "center",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "0.2s",
                      border:
                        selectedMonth === month
                          ? "2px solid #4F46E5"
                          : "1px solid #E5E7EB",
                      background:
                        selectedMonth === month ? "#EEF2FF" : "#fff",
                      color: selectedMonth === month ? "#4F46E5" : "#4B5563"
                    }}
                  >
                    <FiCalendar size={16} style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
                    <div>{month}</div>
                  </div>
                ))}
              </div>

              {/* SELECTED TEXT */}
              <p style={{ marginTop: 24, fontSize: 14, color: "#6B7280" }}>
                <strong style={{ color: "#111827" }}>Selected EPF Month :</strong>{" "}
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
                  onClick={() => navigate("/epf-transfer")}
                >
                  ‹ Back
                </button>

                <button
                  className="btn btn-primary"
                  style={{ padding: "10px 24px" }}
                  onClick={() =>
                    navigate("/process-epf-transfer/load-data", {
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

        {/* RIGHT SUMMARY PANEL (STYLED LIKE IMAGE) */}
        <div>
          <div className="card" style={{ padding: 32, borderRadius: 32, border: "1px solid #E5E7EB" }}>
            <h3 style={{ fontWeight: 500, fontSize: 20, marginBottom: 32, color: "#868585ff" }}>
              EPF Transfer Summary 
            </h3>

            {/* Total Employees */}
            <div
              style={{
                background: "#EEF2FF",
                padding: "24px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={{ color: "#4F46E5", fontSize: "28px", display: "flex" }}>
                <FiUsers />
              </div>
              <div>
                <p style={{ color: "#4F46E5", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>
                  Total Employees
                </p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#4F46E5" }}>127</h1>
              </div>
            </div>

            {/* Total Salary */}
            <div
              style={{
                background: "#DCFCE7",
                padding: "24px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={{ color: "#16A34A", fontSize: "24px", display: "flex" }}>
                <FiBriefcase />
              </div>
              <div>
                <p style={{ color: "#16A34A", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>
                  Total Salary
                </p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#16A34A" }}>
                  $42,542,000
                </h1>
              </div>
            </div>

            {/* Pending Cases */}
            <div
              style={{
                background: "#FFEDD5",
                padding: "24px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div style={{ color: "#EA580C", fontSize: "20px", display: "flex" }}>
                <FiInfo />
              </div>
              <div>
                <p style={{ color: "#EA580C", fontWeight: 600, fontSize: 15, margin: "0 0 4px 0" }}>
                  Pending Cases
                </p>
                <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "#EA580C" }}>127</h1>
              </div>
            </div>

            <hr style={{ margin: "36px 0", border: "none", borderTop: "1px solid #E5E7EB" }} />

            <p style={{ fontWeight: 600, fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>
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
                  width: "25%",
                  height: "100%",
                  background: "#4F46E5",
                  borderRadius: 10,
                }}
              />
            </div>

            <p style={{ fontSize: 14, marginTop: 14, color: "#9CA3AF", fontWeight: 500 }}>
              Step 1 of 4 completed
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProcessEPFTransfer;