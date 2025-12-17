import React from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";

const PayrollProcessing = () => {
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

  return (
    <Layout>
      {/* ================= PAGE HEADER ================= */}
      <PageHeader
        breadcrumb={["Payroll", "Payroll Processing & Disbursement"]}
        title="Payroll Processing & Disbursement"
      />

      {/* ================= TAB BAR ================= */}
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
            className={`btn ${
              location.pathname === t.path ? "btn-primary" : "btn-soft"
            }`}
            onClick={() => navigate(t.path)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ================= TOP SUMMARY ================= */}
      <div className="card" style={{ padding: 24 }}>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Gross Salary</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>$254,896.00</div>
            <small style={{ color: "green" }}>↑ 3.2% Last month</small>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Net Salary</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>$324,876.00</div>
            <small style={{ color: "green" }}>↑ 2.8% Last month</small>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Total Deductions</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>$678,238.00</div>
            <small style={{ color: "red" }}>↑ 4.5% Last month</small>
          </div>
        </div>

        {/* ================= PAYROLL STATUS ================= */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Salary Transfer</h3>

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
              <span className="pill pill-warn">Bank Transfer</span>
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
              onClick={() => navigate("/process-payroll")}
            >
              Process Payroll
            </button>

            <button
              className="btn btn-soft"
              onClick={() => navigate("/generate-pay-slip")}
            >
              Generate Pay Slip
            </button>

            <button className="btn btn-soft">Send Salary to Bank</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PayrollProcessing;