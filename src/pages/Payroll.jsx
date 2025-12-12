// src/pages/PayrollProcessing.jsx
import React from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { useNavigate } from "react-router-dom";


const PayrollProcessing = () => {
  const navigate = useNavigate();

  const employees = [
    {
      id: 1,
      name: "Rashmi Samadara",
      gross: 80000,
      net: 20000,
      deduction: 50000,
      phone: "0752897453",
      bankStatus: "Paid",
    },
    {
      id: 2,
      name: "Nadun Perera",
      gross: 50000,
      net: 30000,
      deduction: 60000,
      phone: "0914785623",
      bankStatus: "Processing",
    },
    {
      id: 3,
      name: "Malith Malinga",
      gross: 20000,
      net: 40000,
      deduction: 45000,
      phone: "0765849269",
      bankStatus: "Paid",
    },
    {
      id: 4,
      name: "Sumudu Perera",
      gross: 40000,
      net: 30000,
      deduction: 60000,
      phone: "0719545625",
      bankStatus: "Paid",
    },
    {
      id: 5,
      name: "Maneesha Perera",
      gross: 60000,
      net: 35000,
      deduction: 40000,
      phone: "0724895287",
      bankStatus: "Paid",
    }
  ];

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Payroll Processing & Disbursement"]}
        title="Payroll Processing & Disbursement"
      />

      {/* OUTER BIG WRAPPER */}
      <div className="card" style={{ padding: 24 }}>

        {/* TOP SUMMARY CARDS */}
        <div className="grid-3" style={{ marginBottom: 20 }}>
          
          {/* Gross Salary */}
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Gross Salary</div>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>
              $254,896.00
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "green",
                fontSize: 12
              }}
            >
              <span>↑</span> 3.2% Last month
            </div>
          </div>

          {/* Net Salary */}
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Net Salary</div>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>
              $324,456.00
            </div>
            <div style={{ color: "green", fontSize: 12 }}>
              ↑ 2.8% Last month
            </div>
          </div>

          {/* Deductions */}
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Total Deductions</div>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>
              $678,238.00
            </div>
            <div style={{ color: "red", fontSize: 12 }}>
              ↑ 4.5% Last month
            </div>
          </div>

        </div>

        {/* PAYROLL STATUS */}
        <div className="card" style={{ margin: "0 0 20px 0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Payroll Status
          </h3>

          {/* STATUS ROW */}
          <div className="grid-4" style={{ marginBottom: 20 }}>
            <div>
              <span className="pill pill-ok">Calculation</span>
              <div style={{ height: 4, background: "green", marginTop: 6 }}></div>
              <small style={{ color: "var(--muted)" }}>Completed</small>
            </div>

            <div>
              <span className="pill pill-ok">Approval</span>
              <div style={{ height: 4, background: "green", marginTop: 6 }}></div>
              <small style={{ color: "var(--muted)" }}>Completed</small>
            </div>

            <div>
              <span className="pill pill-warn">Bank Transfer</span>
              <div style={{ height: 4, background: "orange", marginTop: 6 }}></div>
              <small style={{ color: "var(--muted)" }}>In Progress</small>
            </div>

            <div>
              <span className="pill" style={{ background: "#eee" }}>Completed</span>
              <div style={{ height: 4, background: "#ccc", marginTop: 6 }}></div>
              <small style={{ color: "var(--muted)" }}>Completed</small>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid-3">
             <button
              className="btn btn-primary"
              onClick={() => navigate("/process-payroll")}>Process Payroll
             </button>

                        <button
              className="btn btn-soft"
              onClick={() => navigate("/generate-pay-slip")}
            >
              Generate Pay slip
            </button>

            <button className="btn btn-soft">Send Salary to Bank</button>
          </div>
        </div>

      </div>

      {/* EMPLOYEE TABLE + PIE CHART SECTION */}
      <div className="grid-2" style={{ margin: "0 24px" }}>
        
        {/* TABLE CARD */}
        <div className="card" style={{ padding: 0 }}>
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <div style={{ fontWeight: 700 }}>Employee Salary Details</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Showing {employees.length} records
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Gross Salary</th>
                <th>Net Salary</th>
                <th>Deduction</th>
                <th>Mobile Number</th>
                <th>Bank Transfer</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  
                  {/* NAME ONLY — IMAGE REMOVED */}
                  <td>{emp.name}</td>

                  <td>${emp.gross.toLocaleString()}</td>
                  <td>${emp.net.toLocaleString()}</td>
                  <td>${emp.deduction.toLocaleString()}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.bankStatus}</td>
                  <td>
                    <button className="btn btn-soft">👁</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        {/* PIE CHART CARD */}
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Deductions Breakdown</h3>
        </div>

      </div>

      {/* Pagination */}
      <div
        className="card"
        style={{
          margin: "24px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Showing {employees.length} of {employees.length} results</span>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-soft">Prev</button>
          <button className="btn btn-soft">Next</button>
        </div>
      </div>

    </Layout>
  );
};

export default PayrollProcessing;

