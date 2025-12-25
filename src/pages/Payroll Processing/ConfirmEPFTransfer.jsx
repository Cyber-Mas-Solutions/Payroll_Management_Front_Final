// src/pages/Payroll Processing/ConfirmEPFTransfer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { FiCheckCircle, FiPrinter, FiDownload, FiArrowLeft } from "react-icons/fi";

const ConfirmEPFTransfer = () => {
  const navigate = useNavigate();

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    alert("Receipt downloaded successfully!");
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={[
          "Payroll",
          "Payroll Processing & Disbursement",
          "EPF Transfer",
        ]}
        title="EPF Transfer Confirmation"
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
        {/* Success Card */}
        <div className="card" style={{
          padding: 40,
          borderRadius: 20,
          textAlign: "center",
          background: "linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)",
          border: "1px solid #BBF7D0",
          marginBottom: 30
        }}>
          <div style={{
            width: 80,
            height: 80,
            background: "#22C55E",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 36,
            color: "white"
          }}>
            <FiCheckCircle />
          </div>
          
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#166534", marginBottom: 10 }}>
            EPF Transfer Completed Successfully!
          </h1>
          
          <p style={{ fontSize: 16, color: "#4B5563", marginBottom: 25 }}>
            The EPF contributions have been processed and transferred to the EPF department.
          </p>
          
          <div style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#22C55E",
            color: "white",
            borderRadius: 20,
            fontWeight: 600,
            fontSize: 14
          }}>
            Transaction ID: EPF-2025-04-001245
          </div>
        </div>

        {/* Receipt Card */}
        <div className="card" style={{ padding: 30, borderRadius: 16, marginBottom: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111827" }}>Transfer Receipt</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-soft"
                onClick={handlePrintReceipt}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FiPrinter /> Print
              </button>
              <button
                className="btn btn-soft"
                onClick={handleDownloadReceipt}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <FiDownload /> Download
              </button>
            </div>
          </div>

          {/* Receipt Details */}
          <div style={{
            background: "#F9FAFB",
            borderRadius: 12,
            padding: 25,
            marginBottom: 20
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", marginBottom: 12 }}>Transfer Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6B7280" }}>Transaction ID:</span>
                    <span style={{ fontWeight: 600 }}>EPF-2025-04-001245</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6B7280" }}>Date & Time:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6B7280" }}>Period:</span>
                    <span>April 2025</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", marginBottom: 12 }}>Amount Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6B7280" }}>Total Employees:</span>
                    <span>127</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6B7280" }}>Employee EPF (8%):</span>
                    <span>Rs. 2,043,500.00</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6B7280" }}>Employer EPF (12%):</span>
                    <span>Rs. 2,044,500.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div style={{
            background: "#DCFCE7",
            border: "1px solid #BBF7D0",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 14, color: "#166534", marginBottom: 4 }}>Total Amount Transferred</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#166534" }}>Rs. 4,088,000.00</div>
            </div>
            <div style={{ fontSize: 14, color: "#166534", background: "#BBF7D0", padding: "6px 12px", borderRadius: 8 }}>
              ✅ Transaction Successful
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card" style={{ padding: 25, borderRadius: 16, marginBottom: 30 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 15, color: "#111827" }}>Next Steps</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
            <div style={{ padding: 15, background: "#F0F9FF", borderRadius: 8, borderLeft: "4px solid #3B82F6" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1E40AF", marginBottom: 4 }}>Generate EPF Report</div>
              <div style={{ fontSize: 12, color: "#4B5563" }}>Create detailed EPF report for records</div>
            </div>
            <div style={{ padding: 15, background: "#FEF2F2", borderRadius: 8, borderLeft: "4px solid #EF4444" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#991B1B", marginBottom: 4 }}>Submit to EPF Department</div>
              <div style={{ fontSize: 12, color: "#4B5563" }}>Submit C-Form to government department</div>
            </div>
            <div style={{ padding: 15, background: "#FEFCE8", borderRadius: 8, borderLeft: "4px solid #F59E0B" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#92400E", marginBottom: 4 }}>Update Records</div>
              <div style={{ fontSize: 12, color: "#4B5563" }}>Update employee EPF payment records</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 15, justifyContent: "center" }}>
          <button
            className="btn btn-soft"
            onClick={() => navigate("/epf-transfer")}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <FiArrowLeft /> Back to EPF Transfer
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/generate-epf-report")}
          >
            Generate EPF Report
          </button>
          <button
            className="btn btn-soft"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: 30,
          padding: 20,
          background: "#F8FAFC",
          borderRadius: 12,
          borderLeft: "4px solid #0D6EFD",
          fontSize: 13,
          color: "#4B5563"
        }}>
          <div style={{ fontWeight: 600, marginBottom: 5, color: "#1E40AF" }}>Important Notes:</div>
          <div style={{ marginBottom: 3 }}>• The EPF transfer has been recorded in the system audit log</div>
          <div style={{ marginBottom: 3 }}>• Keep this receipt for your financial records</div>
          <div>• Submit the C-Form to the EPF department within 15 days</div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmEPFTransfer;