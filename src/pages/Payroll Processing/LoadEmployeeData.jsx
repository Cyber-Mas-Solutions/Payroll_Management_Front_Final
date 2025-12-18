// src/pages/LoadEmployeeData.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle, FiClock } from "react-icons/fi";

const LoadEmployeeData = () => {
   const navigate = useNavigate(); 
  const employees = [
    { id: "0001", name: "Rashmi Samadara", dept: "HR", status: "Processed" },
    { id: "0005", name: "Janith Perera", dept: "Finance", status: "Processed" },
    { id: "0006", name: "Malithi Gamage", dept: "HR", status: "Pending" },
    { id: "0008", name: "Raveen Silva", dept: "HR", status: "Processed" },
  ];

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
        {/* LEFT SIDE */}
        <div>
          <div className="card" style={{ padding: 24 }}>

            {/* Title */}
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              Process Payroll
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              Complete the steps below to process payroll for your employees.
            </p>

            {/* Step Tabs */}
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
              <span style={{ color: "#000", borderBottom: "2px solid #000" }}>
                Load Employee Data
              </span>
              <span style={{ color: "var(--muted)" }}>
                Review Salary Calculations
              </span>
              <span style={{ color: "var(--muted)" }}>Confirm Processing</span>
            </div>

            {/* Status Alert */}
            <div
              className="card"
              style={{
                padding: 16,
                background: "#e9f2ff",
                borderColor: "#bcd7ff",
                color: "#1952a3",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FiCheckCircle size={18} />
                <strong>Data Loaded Successfully</strong>
              </div>
              <p style={{ fontSize: 13, marginTop: 6 }}>
                127 employees found for April 2025
              </p>
            </div>

            {/* Table Title */}
            <h3 style={{ marginBottom: 12, fontWeight: 600 }}>
              Load Employee Data
            </h3>

            {/* TABLE */}
            <table className="table" style={{ marginBottom: 10 }}>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DEPARTMENT</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <strong>{emp.name}</strong>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        ID: {emp.id}
                      </div>
                    </td>

                    <td>{emp.dept}</td>

                    <td style={{ fontWeight: 600 }}>
                      {emp.status === "Processed" ? (
                        <span style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: 5 }}>
                          <FiCheckCircle /> Processed
                        </span>
                      ) : (
                        <span style={{ color: "#d97706", display: "flex", alignItems: "center", gap: 5 }}>
                          <FiClock /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Row */}
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "12px 0" }}>
              Showing 4 of 127 employees
            </p>

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <button className="btn btn-soft"
              onClick={() => navigate("/process-payroll")}
              >‹ Back</button>
             <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/process-payroll/review-salary")
              }
            >
              Next ▶
            </button>
            </div>

          </div>
        </div>

        {/* RIGHT SUMMARY (same as previous page) */}
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
              <p style={{ color: "#3B82F6", fontWeight: 600 }}>Total Employees</p>
              <h1 style={{ fontSize: 26 }}>127</h1>
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
              <p style={{ color: "#059669", fontWeight: 600 }}>Total Salary</p>
              <h1 style={{ fontSize: 26 }}>$42,542,000</h1>
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
              <p style={{ color: "#D97706", fontWeight: 600 }}>Pending Cases</p>
              <h1 style={{ fontSize: 26 }}>27</h1>
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
                  width: "50%",
                  height: "100%",
                  background: "#6366F1",
                  borderRadius: 6,
                }}
              ></div>
            </div>

            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
              Step 2 of 4 completed
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoadEmployeeData;

