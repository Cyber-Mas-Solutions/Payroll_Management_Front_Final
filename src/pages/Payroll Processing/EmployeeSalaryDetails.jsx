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
    },
  ];

  // ✅ Modal state
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const closeModal = () => setSelectedEmployee(null);

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Payroll Processing & Disbursement"]}
        title="Payroll Processing & Disbursement"
      />

      {/* Tabs */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.path}
            className={`btn btn-soft ${
              location.pathname === t.path ? "btn-primary" : ""
            }`}
            onClick={() => navigate(t.path)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Employee Table */}
      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
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

                {/* ✅ Widget button */}
                <td>
                  <button
                    className="btn btn-soft"
                    onClick={() => setSelectedEmployee(emp)}
                    title="View employee details"
                  >
                 View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="card"
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          Showing {employees.length} of {employees.length} results
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-soft">Prev</button>
          <button className="btn btn-soft">Next</button>
        </div>
      </div>

      {/* ✅ MODAL WIDGET */}
      {selectedEmployee && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              padding: 18,
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>Employee Details</h3>
              <button className="btn btn-soft" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <small style={{ color: "var(--muted)" }}>Employee Name</small>
                <div style={{ fontWeight: 700 }}>{selectedEmployee.name}</div>
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <small style={{ color: "var(--muted)" }}>Gross Salary</small>
                  <div>${selectedEmployee.gross.toLocaleString()}</div>
                </div>

                <div>
                  <small style={{ color: "var(--muted)" }}>Net Salary</small>
                  <div>${selectedEmployee.net.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <small style={{ color: "var(--muted)" }}>Deduction</small>
                  <div>${selectedEmployee.deduction.toLocaleString()}</div>
                </div>

                <div>
                  <small style={{ color: "var(--muted)" }}>Bank Status</small>
                  <div style={{ fontWeight: 600 }}>{selectedEmployee.bankStatus}</div>
                </div>
              </div>

              <div>
                <small style={{ color: "var(--muted)" }}>Mobile Number</small>
                <div>{selectedEmployee.phone}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
              <button className="btn btn-soft" onClick={closeModal}>
                Close
              </button>
              {/* Optional: go to dedicated employee page */}
              {/* <button className="btn btn-primary" onClick={() => navigate(`/employee/${selectedEmployee.id}`)}>
                Open Profile
              </button> */}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EmployeeSalaryDetails;
