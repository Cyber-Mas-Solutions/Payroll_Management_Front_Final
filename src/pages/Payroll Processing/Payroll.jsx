// src/pages/Payroll Processing/Payroll.jsx
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { payrollApi } from "../../services/api";

const PayrollProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs configuration
  const tabs = [
    { label: "Salary Transfer Overview", path: "/payroll-processing" },
    { label: "Employee Salary Details", path: "/employee-salary-details" },
    { label: "EPF Transfer", path: "/epf-transfer" },
    { label: "ETF Transfer", path: "/etf-transfer" },
    { label: "Income Tax Transfer", path: "/income-tax-transfer" },
    { label: "Insurance Payments", path: "/insurance-payments" },
  ];

  // State for real data
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    grossSalary: 0,
    netSalary: 0,
    totalDeductions: 0,
    grossChange: "0%",
    grossTrend: "up"
  });
  
  const [payrollStatus, setPayrollStatus] = useState({
    calculation: "Not Started",
    approval: "Not Started",
    bankTransfer: "Not Started",
    completion: "Not Started",
    step: 1,
    totalSteps: 4
  });
  
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);

  // Fetch real data on component mount
  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth, selectedYear]);

  const fetchPayrollData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching payroll data for:", selectedMonth, selectedYear);
      
      const [summaryRes, statusRes, employeesRes] = await Promise.all([
        payrollApi.getPayrollSummary({
          month: selectedMonth,
          year: selectedYear
        }).catch(err => ({ ok: false, error: err.message })),
        
        payrollApi.getPayrollStatus({
          month: selectedMonth,
          year: selectedYear
        }),
        
        payrollApi.getPayrollTransferOverview({
          month: selectedMonth,
          year: selectedYear,
          page: 1,
          limit: 10
        }).catch(err => ({ ok: false, error: err.message }))
      ]);

      if (summaryRes.ok && summaryRes.data) {
        const data = summaryRes.data;
        setSummary({
          totalEmployees: data.totalEmployees || 0,
          grossSalary: parseFloat(data.grossSalary) || 0,
          netSalary: parseFloat(data.netSalary) || 0,
          totalDeductions: parseFloat(data.totalDeductions) || 0,
          grossChange: data.grossChange || "0%",
          grossTrend: data.grossTrend || "up"
        });
      }

      if (statusRes.ok && statusRes.data) {
        const data = statusRes.data;
        setPayrollStatus({
          calculation: data.calculation || "Not Started",
          approval: data.approval || "Not Started",
          bankTransfer: data.bankTransfer || "Not Started",
          completion: data.completion || "Not Started",
          step: data.step || 1,
          totalSteps: data.totalSteps || 4
        });
      }

      if (employeesRes.ok && employeesRes.data) {
        const employeeData = Array.isArray(employeesRes.data) ? employeesRes.data : [];
        const transformedEmployees = employeeData.map(emp => ({
          id: emp.id || emp.employee_id,
          name: emp.name || emp.full_name || "Unknown Employee",
          gross: parseFloat(emp.gross_salary || emp.gross || 0),
          net: parseFloat(emp.net_salary || emp.net || 0),
          deduction: parseFloat(emp.deductions || emp.total_deductions || 0),
          phone: emp.phone || "N/A",
          bankStatus: emp.bank_status || "Pending",
          employee_code: emp.employee_code || "N/A",
          department: emp.department || "N/A"
        }));
        setEmployees(transformedEmployees);
      } else {
        setEmployees([]);
      }

    } catch (error) {
      console.error("Failed to fetch payroll data:", error);
      setError("Failed to load payroll data. Please try again.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Only one handleSendToBank function remains, and it passes data.
  const handleSendToBank = () => {
    if (employees.length === 0) {
      alert("No employees to process");
      return;
    }
    
    navigate("/send-salary-to-bank", {
      state: { 
        employees: employees,
        totalAmount: summary.netSalary, 
        employeeCount: summary.totalEmployees,
        month: selectedMonth,
        year: selectedYear
      }
    });
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `LKR ${num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const handleProcessPayroll = () => {
    navigate("/process-payroll", {
      state: { month: selectedMonth, year: selectedYear }
    });
  };

  const handleGeneratePaySlip = () => {
    navigate("/generate-pay-slip", {
      state: { month: selectedMonth, year: selectedYear }
    });
  };

  const getStatusColor = (status) => {
    if (!status) return '#ccc';
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return '#10B981';
    if (statusLower === 'processing' || statusLower.includes('progress')) return '#F59E0B';
    if (statusLower === 'not started') return '#9CA3AF';
    return '#6B7280';
  };

  const getPillClass = (status) => {
    if (!status) return 'pill';
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'pill pill-ok';
    if (statusLower === 'processing' || statusLower.includes('progress')) return 'pill pill-warn';
    if (statusLower === 'paid') return 'pill pill-ok';
    return 'pill';
  };

  const renderStatusBar = () => {
    const steps = [
      { key: 'calculation', label: 'Calculation' },
      { key: 'approval', label: 'Approval' },
      { key: 'bankTransfer', label: 'Bank Transfer' },
      { key: 'completion', label: 'Completed' }
    ];
    
    return (
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {steps.map((step) => (
          <div key={step.key}>
            <span className={getPillClass(payrollStatus[step.key])}>
              {step.label}
            </span>
            <div style={{ 
              height: 4, 
              background: getStatusColor(payrollStatus[step.key]), 
              marginTop: 6 
            }} />
            <small style={{ display: "block", marginTop: 4, fontSize: 11, color: "var(--muted)" }}>
              {payrollStatus[step.key] || "Not Started"}
            </small>
          </div>
        ))}
      </div>
    );
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString('default', { month: 'long' });
      options.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        label: `${monthName} ${year}`,
        year: year,
        month: month
      });
    }
    return options;
  };

  const monthOptions = generateMonthOptions();
  const currentMonthValue = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-').map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll", "Salary Transfer Overview"]}
        title="Payroll Processing & Disbursement"
      />

      {/* Tab Navigation */}
      <div className="card" style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.path}
            className={`btn ${location.pathname === t.path ? "btn-primary" : "btn-soft"}`}
            onClick={() => navigate(t.path)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date Selector */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>
              Select Payroll Period
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select 
                className="select" 
                value={currentMonthValue}
                onChange={handleMonthChange}
                style={{ flex: 1 }}
                disabled={loading}
              >
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button 
                className="btn btn-soft"
                onClick={fetchPayrollData}
                disabled={loading}
                style={{ whiteSpace: "nowrap" }}
              >
                {loading ? "Loading..." : "🔄 Refresh"}
              </button>
            </div>
          </div>
          
          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
            <div>Processing Period</div>
            <div style={{ fontWeight: 600, color: "var(--brand)" }}>
              {monthOptions.find(opt => opt.value === currentMonthValue)?.label || currentMonthValue}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="card" style={{ margin: 0, padding: 16, background: "#F0F9FF" }}>
            <div style={{ fontSize: 13, color: "#0369A1", marginBottom: 8, fontWeight: 600 }}>Total Employees</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0C4A6E" }}>{summary.totalEmployees.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Active employees for this period</div>
          </div>

          <div className="card" style={{ margin: 0, padding: 16, background: "#F0FDF4" }}>
            <div style={{ fontSize: 13, color: "#059669", marginBottom: 8, fontWeight: 600 }}>Total Gross Salary</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#065F46" }}>{formatCurrency(summary.grossSalary)}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
              {summary.grossTrend === 'up' ? '📈' : '📉'} {summary.grossChange} from last month
            </div>
          </div>

          <div className="card" style={{ margin: 0, padding: 16, background: "#FEF2F2" }}>
            <div style={{ fontSize: 13, color: "#DC2626", marginBottom: 8, fontWeight: 600 }}>Total Deductions</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#991B1B" }}>{formatCurrency(summary.totalDeductions)}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Includes EPF, Loans & Unpaid Leaves</div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
          <div className="card" style={{ margin: 0, padding: 16, background: "#FEFCE8" }}>
            <div style={{ fontSize: 13, color: "#CA8A04", marginBottom: 8, fontWeight: 600 }}>Total Net Salary</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#854D0E" }}>{formatCurrency(summary.netSalary)}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>After all deductions</div>
          </div>

          <div className="card" style={{ margin: 0, padding: 16, background: "#F5F3FF" }}>
            <div style={{ fontSize: 13, color: "#7C3AED", marginBottom: 8, fontWeight: 600 }}>Status</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#5B21B6" }}>
              {payrollStatus.completion === 'Completed' ? '✅ Complete' : '🔄 In Progress'}
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Step {payrollStatus.step} of {payrollStatus.totalSteps}</div>
          </div>
        </div>

        {/* Progress Bar and Action Buttons */}
        <div className="card" style={{ marginBottom: 20, padding: 20, background: "#F8FAFC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Salary Transfer Status</h3>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Step {payrollStatus.step} of {payrollStatus.totalSteps}</div>
          </div>

          {renderStatusBar()}

          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 8, background: "#E2E8F0", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div style={{ 
                width: `${(payrollStatus.step / payrollStatus.totalSteps) * 100}%`, 
                height: "100%", 
                background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                transition: "width 0.5s ease",
                position: "absolute",
                top: 0,
                left: 0
              }} />
            </div>
          </div>

          <div className="grid-3" style={{ gap: 12 }}>
            <button className="btn btn-primary" onClick={handleProcessPayroll} style={{ padding: "12px 16px", fontSize: 14 }}>
              🚀 Process Payroll
            </button>
            
            <button className="btn btn-soft" onClick={handleGeneratePaySlip} style={{ padding: "12px 16px", fontSize: 14 }}>
              📄 Generate Pay Slips
            </button>
            
            <button 
              className="btn btn-soft" 
              onClick={handleSendToBank} 
              style={{ padding: "12px 16px", fontSize: 14 }}
            >
              📄 Send Salary To Bank
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PayrollProcessing;