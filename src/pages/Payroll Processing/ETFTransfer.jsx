import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";

export default function ETFTransfer() {
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  /* ================= DATA (Updated for ETF) ================= */
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTransfers([
        {
          id: 1,
          employee_name: "John Doe",
          etf_number: "ETF/001",
          month: "2024-12",
          employer_contribution: 1500, // 3% ETF Example
          total: 1500,
          status: "Completed",
        },
        {
          id: 2,
          employee_name: "Jane Smith",
          etf_number: "ETF/002",
          month: "2024-12",
          employer_contribution: 1800,
          total: 1800,
          status: "Pending",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  /* ================= CALCULATIONS ================= */
  const totalAmount = transfers.reduce((s, t) => s + t.total, 0);

  return (
    <Layout>
      {/* ================= PAGE HEADER ================= */}
      <PageHeader
        breadcrumb={["Payroll", "ETF Transfer"]}
        title="Payroll Processing & Disbursement"
      />

      {/* ================= TAB BAR (Centered logic) ================= */}
      <div className="card" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-start" }}>
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

      {/* ================= TOP SUMMARY (ETF Focused) ================= */}
      <div className="card" style={{ padding: 24 }}>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="card" style={{ margin: 0, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Employer Contribution (3%)
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              Rs. {totalAmount.toLocaleString()}
            </div>
            <small style={{ color: "green" }}>↑ 1.2% Last month</small>
          </div>

          <div className="card" style={{ margin: 0, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Eligible Employees
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {transfers.length}
            </div>
            <small style={{ color: "var(--muted)" }}>All active staff</small>
          </div>

          <div className="card" style={{ margin: 0, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Total ETF Disbursement
            </div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              Rs. {totalAmount.toLocaleString()}
            </div>
            <small style={{ color: "red" }}>↑ 2.1% Last month</small>
          </div>
        </div>

        {/* ================= ETF PROCESS STATUS ================= */}
        <div className="card" style={{ marginBottom: 20, background: "#fcfcfc" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 15 }}>ETF Status Overview</h3>

          <div className="grid-4" style={{ marginBottom: 20 }}>
            <div>
              <span className="pill pill-ok">Verification</span>
              <div style={{ height: 4, background: "green", marginTop: 6 }} />
              <small>Completed</small>
            </div>

            <div>
              <span className="pill pill-ok">Approval</span>
              <div style={{ height: 4, background: "green", marginTop: 6 }} />
              <small>Completed</small>
            </div>

            <div>
              <span className="pill pill-warn">ETF Transfer</span>
              <div style={{ height: 4, background: "orange", marginTop: 6 }} />
              <small>In Progress</small>
            </div>

            <div>
              <span className="pill">Filing</span>
              <div style={{ height: 4, background: "#ccc", marginTop: 6 }} />
              <small>Pending</small>
            </div>
          </div>

          <div className="grid-3">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/process-etf-transfer")}
            >
              Process ETF Transfer
            </button>
                      <button 
              className="btn btn-soft" 
              onClick={() => navigate("/etf-form-ii")}
            >
              Download ETF Form II
            </button>
            <button className="btn btn-soft">Submit to ETF Board</button>
          </div>
        </div>
      </div>

      {/* ================= DETAILS MODAL ================= */}
      {showDetailsModal && selectedTransfer && (
        <div className="modal-backdrop" onClick={() => setShowDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>ETF Contribution Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p><b>Employee:</b> {selectedTransfer.employee_name}</p>
              <p><b>ETF Registration No:</b> {selectedTransfer.etf_number}</p>
              <p><b>Contribution Period:</b> {selectedTransfer.month}</p>
              <p><b>Total Contribution:</b> Rs. {selectedTransfer.total.toLocaleString()}</p>
            </div>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button className="btn btn-primary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}