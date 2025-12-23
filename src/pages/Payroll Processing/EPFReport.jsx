import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";

export default function EPFReport() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: "2025-12",
    department: "All",
  });

  /* ================= MOCK DATA FETCH ================= */
  const fetchReport = () => {
    setLoading(true);
    setTimeout(() => {
      setReportData([
        { id: 1, name: "Rashmi Samadara", epfNo: "EPF001", basic: 50000, employer12: 6000, employee8: 4000, total: 10000 },
        { id: 2, name: "Dilshan Maliyadda", epfNo: "EPF002", basic: 60000, employer12: 7200, employee8: 4800, total: 12000 },
        { id: 3, name: "Maneesha Perera", epfNo: "EPF003", basic: 45000, employer12: 5400, employee8: 3600, total: 9000 },
      ]);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExport = (type) => {
    alert(`Exporting EPF Report as ${type}...`);
  };

  return (
    <Layout>
      <PageHeader 
        breadcrumb={["Payroll", "EPF Transfer", "EPF Report"]} 
        title="EPF Contribution Report" 
      />

      {/* ================= ACTIONS BAR ================= */}
      {/* Wrapped in a card or a div with controlled width to keep it inline with table */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "15px" 
      }}>
        <button className="btn btn-soft" onClick={() => navigate("/epf-transfer")}>
          ← Back to EPF Transfer
        </button>
        
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-soft" onClick={() => handleExport("Excel")}>
            Export Excel
          </button>
          <button className="btn btn-soft" onClick={() => handleExport("PDF")}>
            Download PDF
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px", 
          alignItems: "end" 
        }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-main)" }}>
              Select Month
            </label>
            <input 
              type="month" 
              className="form-control" 
              style={{ width: "100%" }}
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--text-main)" }}>
              Department
            </label>
            <select 
              className="form-control"
              style={{ width: "100%" }}
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Human Resources</option>
              <option>Marketing</option>
            </select>
          </div>

          <div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={fetchReport}>
              Generate Preview
            </button>
          </div>
        </div>
      </div>

      {/* ================= REPORT PREVIEW TABLE ================= */}
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
            Report Preview: {filters.month}
          </h3>
          <span className="pill pill-ok">Data Verified</span>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>
            <div className="spinner" style={{ marginBottom: 10 }}></div>
            Generating detailed EPF report...
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>EPF No.</th>
                <th>Employee Name</th>
                <th style={{ textAlign: "right" }}>Basic Salary</th>
                <th style={{ textAlign: "right" }}>Employer (12%)</th>
                <th style={{ textAlign: "right" }}>Employee (8%)</th>
                <th style={{ textAlign: "right" }}>Total Contribution</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.id}>
                  <td><span style={{ fontWeight: 500 }}>{row.epfNo}</span></td>
                  <td>{row.name}</td>
                  <td style={{ textAlign: "right" }}>{row.basic.toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>{row.employer12.toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>{row.employee8.toLocaleString()}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--primary)" }}>
                    {row.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--bg-light)", fontWeight: 700, borderTop: "2px solid var(--border)" }}>
                <td colSpan="2" style={{ padding: "15px" }}>Grand Totals (LKR)</td>
                <td style={{ textAlign: "right" }}>
                  {reportData.reduce((acc, curr) => acc + curr.basic, 0).toLocaleString()}
                </td>
                <td style={{ textAlign: "right" }}>
                  {reportData.reduce((acc, curr) => acc + curr.employer12, 0).toLocaleString()}
                </td>
                <td style={{ textAlign: "right" }}>
                  {reportData.reduce((acc, curr) => acc + curr.employee8, 0).toLocaleString()}
                </td>
                <td style={{ textAlign: "right", fontSize: "1.1em" }}>
                  {reportData.reduce((acc, curr) => acc + curr.total, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <div style={{ marginTop: 24, padding: "15px", borderRadius: "8px", background: "#f8f9fa", borderLeft: "4px solid #0d6efd" }}>
        <p style={{ margin: "0 0 5px 0", fontSize: 13, color: "#444", fontWeight: 600 }}>Important Notes:</p>
        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>• This report is generated based on the finalized payroll data for the selected period.</p>
        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>• Ensure all employee EPF numbers are verified before submitting the C-Form to the department.</p>
      </div>
    </Layout>
  );
}