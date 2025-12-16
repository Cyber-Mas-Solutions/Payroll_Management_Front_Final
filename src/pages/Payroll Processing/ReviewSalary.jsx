// src/pages/ReviewSalary.jsx
import React from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ReviewSalary = () => {
  const navigate = useNavigate();

  // Go to previous step
  const goBack = () => {
    navigate("/load-employee-data");
  };

  // Go to next step (Confirm Processing Page)
  const goNext = () => {
    navigate("/confirm-processing");
  };

  const summary = {
    base: "$398,450.00",
    bonus: "$29,442.00",
    total: "$427,892.00",
  };

  const employees = [
    { id: "0001", name: "Rashmi Samadara", dept: "HR", salary: "$5,200", status: "Processed" },
    { id: "0005", name: "Janith Perera", dept: "Finance", salary: "$5,200", status: "Processed" },
    { id: "0006", name: "Malithi Gamage", dept: "HR", salary: "$5,200", status: "Pending" },
    { id: "0008", name: "Raveen Silva", dept: "HR", salary: "$5,200", status: "Processed" },
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
        {/* LEFT PANEL */}
        <div>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}></h2>
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
              <span style={{ color: "var(--muted)" }}>Load Employee Data</span>
              <span style={{ color: "#000", borderBottom: "2px solid #000" }}>
                Review Salary Calculations
              </span>
              <span style={{ color: "var(--muted)" }}>Confirm Processing</span>
            </div>

            {/* TITLE */}
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>
              Review Salary Calculations
            </h3>

            {/* SALARY SUMMARY */}
            <div className="card" style={{ margin: "0", padding: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Salary Summary
              </div>

              <div
                className="grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                <div
                  className="card"
                  style={{
                    margin: 0,
                    padding: 16,
                    textAlign: "left",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    Base Salary
                  </div>
                  <h2 style={{ marginTop: 6 }}>{summary.base}</h2>
                </div>

                <div
                  className="card"
                  style={{
                    margin: 0,
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    Bonuses & Overtime
                  </div>
                  <h2 style={{ marginTop: 6 }}>{summary.bonus}</h2>
                </div>

                <div
                  className="card"
                  style={{
                    margin: 0,
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    Total Payroll
                  </div>
                  <h2 style={{ marginTop: 6, color: "#059669" }}>
                    {summary.total}
                  </h2>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <table className="table" style={{ marginTop: 20 }}>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DEPARTMENT</th>
                  <th>SALARY</th>
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

                    <td>{emp.salary}</td>

                    <td style={{ fontWeight: 600 }}>
                      {emp.status === "Processed" ? (
                        <span
                          style={{
                            color: "var(--success)",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <FiCheckCircle /> Processed
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#d97706",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <FiClock /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
              Showing 4 of 127 employees
            </p>

            {/* BUTTONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <button className="btn btn-soft"
              onClick={() => navigate("/process-payroll/load-data")}
              >‹ Back</button>

              
              <button className="btn btn-primary" onClick={() => navigate("/process-payroll/finalize-payroll")}
              >Next › </button>
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
              <p style={{ color: "#3B82F6", fontWeight: 600 }}>Total Employees</p>
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
              Step 3 of 4 completed
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewSalary;
