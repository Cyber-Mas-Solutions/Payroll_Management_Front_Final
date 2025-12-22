import React from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";

export default function ETFFormII() {
  const navigate = useNavigate();

  // Mock data for the form
  const employerName = "ABC Pvt Ltd";
  const etfRegNo = "ETF/RE/12345";
  const month = "December 2025";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <PageHeader 
        breadcrumb={["Payroll", "ETF Transfer", "Form II"]} 
        title="ETF Form II Generation" 
      />

      {/* Control Bar - Hidden during print */}
      <div className="card no-print" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
        <button className="btn btn-soft" onClick={() => navigate("/etf-transfer")}>
          ← Back to Transfer List
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          Print / Download as PDF
        </button>
      </div>

      {/* The Actual Form Container */}
      <div className="card print-area" style={{ padding: "50px", minHeight: "800px", background: "#fff" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, textTransform: "uppercase" }}>Employees' Trust Fund Board</h2>
          <h3 style={{ fontSize: 18, margin: "10px 0" }}>FORM II</h3>
          <p style={{ fontSize: 14 }}>ADVICE OF REMITTANCE</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
          <div>
            <p style={{ margin: "5px 0" }}><b>Employer Name:</b> {employerName}</p>
            <p style={{ margin: "5px 0" }}><b>Address:</b> 123 Business Way, Colombo 03</p>
            <p style={{ margin: "5px 0" }}><b>ETF Reg No:</b> {etfRegNo}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "5px 0" }}><b>Remittance for:</b> {month}</p>
            <p style={{ margin: "5px 0" }}><b>Date:</b> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #000", borderTop: "2px solid #000" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Member No</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Employee Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>NIC Number</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Total Earnings</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Contribution (3%)</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row - usually mapped from state */}
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>001</td>
              <td style={{ padding: "10px" }}>Malithi Perera</td>
              <td style={{ padding: "10px" }}>199012345678</td>
              <td style={{ padding: "10px", textAlign: "right" }}>Rs. 50,000.00</td>
              <td style={{ padding: "10px", textAlign: "right" }}>Rs. 1,500.00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: "bold", borderTop: "2px solid #000" }}>
              <td colSpan="3" style={{ padding: "12px" }}>Grand Total</td>
              <td style={{ padding: "12px", textAlign: "right" }}>Rs. 50,000.00</td>
              <td style={{ padding: "12px", textAlign: "right" }}>Rs. 1,500.00</td>
            </tr>
          </tfoot>
        </table>

        {/* Signature Section */}
        <div style={{ marginTop: 100, display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "250px", borderTop: "1px solid #000", textAlign: "center", paddingTop: "10px" }}>
            Signature of Employer
          </div>
          <div style={{ width: "250px", borderTop: "1px solid #000", textAlign: "center", paddingTop: "10px" }}>
            Date & Company Stamp
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print, .sidebar, .header { display: none !important; }
          .print-area { margin: 0; padding: 0; border: none; box-shadow: none; }
          body { background: white; }
          .card { border: none !important; }
        }
      `}</style>
    </Layout>
  );
}