import React, { useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";

const EmployeeSalaryDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Salary Transfer Overview", path: "/payroll-processing" },
    { label: "Employee Salary Details", path: "/employee-salary-details" },
    { label: "EPF Transfer", path: "/epf-transfer" },
    { label: "ETF Transfer", path: "/etf-transfer" },
    { label: "Income Tax Transfer", path: "/income-tax-transfer" },
    { label: "Insurance Payments", path: "/insurance-payments" },
  ];

  const employees = [
    { id: 1, name: "Rashmi Samadara", gross: 80000, net: 20000, deduction: 50000, phone: "0752897453", bankStatus: "Paid" },
    { id: 2, name: "Nadun Perera", gross: 50000, net: 30000, deduction: 60000, phone: "0914785623", bankStatus: "Processing" },
    { id: 3, name: "Malith Malinga", gross: 20000, net: 40000, deduction: 45000, phone: "0765849269", bankStatus: "Paid" },
    { id: 4, name: "Sumudu Perera", gross: 40000, net: 30000, deduction: 60000, phone: "0719545625", bankStatus: "Paid" },
    { id: 5, name: "Maneesha Perera", gross: 60000, net: 35000, deduction: 40000, phone: "0724895287", bankStatus: "Paid" },
  ];

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Employee Salary Details"]}
        title="Payroll Processing & Disbursement"
      />

      {/* ================= FIXED AREA ================= */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 170px)", // Adjust if header height differs
        }}
      >
        {/* ===== FIXED TABS ===== */}
        <div
          className="card"
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.path}
              className={`btn ${
                location.pathname === t.path ? "btn-primary" : "btn-soft"
              }`}
              onClick={() => navigate(t.path)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===== FIXED TABLE HEADER ===== */}
        <div
          className="card"
          style={{
            marginTop: 12,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <strong>Employee Salary Details</strong>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Showing {employees.length} records
          </span>
        </div>

        {/* ===== SCROLLABLE TABLE ONLY ===== */}
        <div
          className="card"
          style={{
            padding: 0,
            marginTop: 8,
            flex: 1,
            overflowY: "auto",
          }}
        >
          <table className="table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Gross Salary</th>
                <th>Net Salary</th>
                <th>Deduction</th>
                <th>Mobile Number</th>
                <th>Bank Transfer</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>${emp.gross.toLocaleString()}</td>
                  <td>${emp.net.toLocaleString()}</td>
                  <td>${emp.deduction.toLocaleString()}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.bankStatus}</td>
                  <td>
                    <button
                      className="btn btn-soft"
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {selectedEmployee && (
        <div
          onClick={() => setSelectedEmployee(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 420 }}
          >
            <h3>{selectedEmployee.name}</h3>
            <p>Gross: ${selectedEmployee.gross}</p>
            <p>Net: ${selectedEmployee.net}</p>
            <p>Deduction: ${selectedEmployee.deduction}</p>
            <p>Status: {selectedEmployee.bankStatus}</p>
            <button className="btn btn-soft" onClick={() => setSelectedEmployee(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EmployeeSalaryDetails;
