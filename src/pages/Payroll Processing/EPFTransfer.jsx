import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";

export default function EPFTransfer() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= TABS ================= */
  const tabs = [
    { label: "Salary Transfer Overview", path: "/payroll-processing" },
    { label: "Employee Salary Details", path: "/employee-salary-details" },
    { label: "EPF Transfer", path: "/epf-transfer" },
    { label: "ETF Transfer", path: "/etf-transfer" },
    { label: "Income Tax Transfer", path: "/income-tax-transfer" },
    { label: "Insurance Payments", path: "/insurance-payments" },
  ];

  /* ================= STATE ================= */
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  /* ================= DATA ================= */
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTransfers([
        {
          id: 1,
          employee_name: "John Doe",
          epf_number: "EPF001",
          month: "2024-12",
          employer_contribution: 6000,
          employee_contribution: 4000,
          total: 10000,
          status: "Completed",
        },
        {
          id: 2,
          employee_name: "Jane Smith",
          epf_number: "EPF002",
          month: "2024-12",
          employer_contribution: 7200,
          employee_contribution: 4800,
          total: 12000,
          status: "Pending",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  /* ================= CALCULATIONS ================= */
  const totalEmployer = transfers.reduce(
    (s, t) => s + t.employer_contribution,
    0
  );
  const totalEmployee = transfers.reduce(
    (s, t) => s + t.employee_contribution,
    0
  );
  const totalAmount = transfers.reduce((s, t) => s + t.total, 0);

  const handleProcessTransfer = () => {
    setTransfers((prev) =>
      prev.map((t) =>
        t.status === "Pending" ? { ...t, status: "Completed" } : t
      )
    );
    setShowProcessModal(false);
  };

  return (
    <Layout>
      {/* ================= PAGE HEADER ================= */}
      <PageHeader
        breadcrumb={["Payroll", "Payroll Processing & Disbursement", "EPF Transfer"]}
        title="Payroll Processing & Disbursement"
      />

      {/* ================= TAB BAR ================= */}
      <div className="card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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

      {/* ================= TOP SUMMARY (SAME AS SALARY PAGE) ================= */}
      <div className="card" style={{ padding: 24 }}>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Employer Contribution (12%)
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              Rs. {totalEmployer.toLocaleString()}
            </div>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Employee Contribution (8%)
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              Rs. {totalEmployee.toLocaleString()}
            </div>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Total EPF Amount
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              Rs. {totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ================= EPF PROCESS STATUS (SALARY STYLE) ================= */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>EPF Transfer</h3>

          <div className="grid-4" style={{ marginBottom: 20 }}>
            <div>
              <span className="pill pill-ok">Calculation</span>
              <div style={{ height: 4, background: "green", marginTop: 6 }} />
              <small>Completed</small>
            </div>

            <div>
              <span className="pill pill-ok">Approval</span>
              <div style={{ height: 4, background: "green", marginTop: 6 }} />
              <small>Completed</small>
            </div>

            <div>
              <span className="pill pill-warn">EPF Transfer</span>
              <div style={{ height: 4, background: "orange", marginTop: 6 }} />
              <small>In Progress</small>
            </div>

            <div>
              <span className="pill">Completed</span>
              <div style={{ height: 4, background: "#ccc", marginTop: 6 }} />
              <small>Pending</small>
            </div>
          </div>

          <div className="grid-3">
            <button
              className="btn btn-primary"
              onClick={() => setShowProcessModal(true)}
            >
              Process EPF Transfer
            </button>

            <button className="btn btn-soft">Generate EPF Report</button>

            <button className="btn btn-soft">Send to EPF Department</button>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>EPF No</th>
                <th>Month</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td>{t.employee_name}</td>
                  <td>{t.epf_number}</td>
                  <td>{t.month}</td>
                  <td>Rs. {t.total.toLocaleString()}</td>
                  <td>
                    <span
                      className={`pill ${
                        t.status === "Completed" ? "pill-ok" : "pill-warn"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-soft"
                      onClick={() => {
                        setSelectedTransfer(t);
                        setShowDetailsModal(true);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {showProcessModal && (
        <div className="modal-backdrop" onClick={() => setShowProcessModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Process EPF Transfer</h3>
            <p>Total Amount: Rs. {totalAmount.toLocaleString()}</p>
            <div className="modal-actions">
              <button className="btn btn-soft" onClick={() => setShowProcessModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleProcessTransfer}>
                Process
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedTransfer && (
        <div className="modal-backdrop" onClick={() => setShowDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>EPF Details</h3>
            <p><b>Employee:</b> {selectedTransfer.employee_name}</p>
            <p><b>EPF No:</b> {selectedTransfer.epf_number}</p>
            <p><b>Total:</b> Rs. {selectedTransfer.total.toLocaleString()}</p>
            <button className="btn btn-soft" onClick={() => setShowDetailsModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
