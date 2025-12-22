import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../../components/Layout";
import { payrollApi } from "../../services/api";

const SendSalaryToBank = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data passed from the previous page (Payroll.jsx)
  const { totalAmount, employeeCount, employees, month, year } = location.state || {
    totalAmount: 18550.00,
    employeeCount: 5,
    employees: [],
    month: 12,
    year: 2025
  };

  const [isValidating, setIsValidating] = useState(false);
  const [validatedCount, setValidatedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Function to simulate or call bank validation API
  const handleValidate = async () => {
    setIsValidating(true);
    // Simulate API delay for bank validation
    setTimeout(() => {
      setValidatedCount(employeeCount);
      setIsValidating(false);
      setIsReady(true);
      alert("✅ All bank accounts validated successfully.");
    }, 1500);
  };

  const handleSendToBank = async () => {
    try {
      // Call your actual backend API
      const response = await payrollApi.initiateBankTransfer({
        month,
        year,
        employee_ids: employees.map(emp => emp.id)
      });

      if (response.ok) {
        alert("💰 Salaries have been sent to the bank successfully!");
        navigate("/payroll-processing");
      }
    } catch (error) {
      alert("Failed to process bank transfer.");
    }
  };

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <h2>Send Salary to Bank</h2>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          Transfer employee salaries securely to their bank accounts
        </p>

        {/* ================= SUMMARY CARDS ================= */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
          <div style={{ padding: "24px", background: "#F0FDF4", borderRadius: "12px", border: "1px solid #DCFCE7" }}>
            <div style={{ color: "#166534", fontSize: "14px", marginBottom: "8px" }}>Total Transfer Amount</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#15803D" }}>
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ padding: "24px", background: "#EFF6FF", borderRadius: "12px", border: "1px solid #DBEAFE" }}>
            <div style={{ color: "#1E40AF", fontSize: "14px", marginBottom: "8px" }}>Employees</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#1D4ED8" }}>{employeeCount}</div>
          </div>

          <div style={{ padding: "24px", background: "#FDF2F8", borderRadius: "12px", border: "1px solid #FCE7F3" }}>
            <div style={{ color: "#9D174D", fontSize: "14px", marginBottom: "8px" }}>Validated Accounts</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#BE185D" }}>
              {validatedCount}/{employeeCount}
            </div>
          </div>
        </div>

        {/* ================= DATA TABLE ================= */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ marginBottom: "4px" }}>Employee Salary Details</h3>
          <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "20px" }}>
            Review and validate account information before proceeding
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#F8FAFC", color: "#64748B", fontSize: "12px", textTransform: "uppercase" }}>
                <th style={{ padding: "12px" }}>Description</th>
                <th style={{ padding: "12px" }}>Account Number</th>
                <th style={{ padding: "12px" }}>Bank</th>
                <th style={{ padding: "12px" }}>Net Salary</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Validation</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "16px", fontWeight: "500" }}>{emp.name}</td>
                  <td style={{ padding: "16px" }}>{emp.accountNumber || "1234567890"}</td>
                  <td style={{ padding: "16px" }}>{emp.bankName || "BOC"}</td>
                  <td style={{ padding: "16px" }}>${emp.net.toLocaleString()}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ color: "#64748B" }}>Pending</span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: isReady ? "#10B981" : "#64748B" }}>
                      {isReady ? "✅ Validated" : "ⓧ Pending"}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No employee data available</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= FOOTER ACTIONS ================= */}
        <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn btn-soft" onClick={() => navigate(-1)}>
            ‹ Back
          </button>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {!isReady && (
              <span style={{ color: "#F59E0B", fontSize: "14px" }}>
                ⚠ Validate accounts before proceeding
              </span>
            )}
            <button 
              className="btn btn-soft" 
              style={{ border: "1px solid #4F46E5", color: "#4F46E5" }}
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? "Validating..." : "Validate Accounts"}
            </button>
            <button 
              className="btn btn-primary" 
              disabled={!isReady}
              onClick={handleSendToBank}
            >
              Send to Bank →
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SendSalaryToBank;