// src/pages/Payroll Processing/ProcessPayroll.jsx
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet, apiPost } from "../../services/api";

const ProcessPayroll = () => {
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

  // State variables
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState({
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
    employeeCount: 0
  });
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await apiGet('/salary/departments');
      setDepartments([{ id: 'all', name: 'All Departments' }, ...(res.data || [])]);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  // Fetch employees for the selected month - UPDATED
  const fetchEmployees = async () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    setLoading(true);
    
    try {
      // Use the optimized payroll transfer overview endpoint
      const res = await apiGet(`/payroll/payroll-transfer-overview?month=${month}&year=${year}&limit=1000`);
      
      if (res.ok && res.data) {
        console.log('Employee data loaded:', res.data);
        
        // Filter by department if needed
        let employeeData = res.data;
        if (selectedDepartment !== 'all') {
          employeeData = employeeData.filter(emp => 
            emp.department && emp.department.toLowerCase().includes(selectedDepartment.toLowerCase())
          );
        }
        
        // Transform data for display
        const transformedData = employeeData.map(item => ({
          id: item.id || item.employee_id,
          employee_code: item.employee_code,
          name: item.name || item.full_name,
          department: item.department || 'N/A',
          gross_salary: parseFloat(item.gross_salary || 0),
          deductions: parseFloat(item.deductions || 0),
          net_salary: parseFloat(item.net_salary || 0),
          bank_status: item.bank_status || 'Pending',
          selected: false
        }));
        
        setEmployees(transformedData);
        
        // Calculate summary
        const totalGross = transformedData.reduce((sum, emp) => sum + emp.gross_salary, 0);
        const totalDeductions = transformedData.reduce((sum, emp) => sum + emp.deductions, 0);
        const totalNet = transformedData.reduce((sum, emp) => sum + emp.net_salary, 0);
        
        setSummary({
          totalGross,
          totalDeductions,
          totalNet,
          employeeCount: transformedData.length
        });
      } else {
        console.error('API response error:', res);
        alert('Failed to load employee data. API returned error.');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Fallback: Try to get data from month summary endpoint
      try {
        const fallbackRes = await apiGet(`/salary/summary?month=${month}&year=${year}`);
        if (fallbackRes.ok && fallbackRes.data) {
          const employeeData = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
          
          const transformedData = employeeData.map(item => ({
            id: item.employee_id,
            employee_code: item.employee_code || `EMP${item.employee_id}`,
            name: item.full_name,
            department: item.department_name || 'N/A',
            gross_salary: parseFloat(item.gross || 0),
            deductions: parseFloat(item.totalDeductions || 0),
            net_salary: parseFloat(item.net || 0),
            bank_status: 'Pending',
            selected: false
          }));
          
          setEmployees(transformedData);
          
          const totalGross = transformedData.reduce((sum, emp) => sum + emp.gross_salary, 0);
          const totalDeductions = transformedData.reduce((sum, emp) => sum + emp.deductions, 0);
          const totalNet = transformedData.reduce((sum, emp) => sum + emp.net_salary, 0);
          
          setSummary({
            totalGross,
            totalDeductions,
            totalNet,
            employeeCount: transformedData.length
          });
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('Failed to load employee data from both endpoints');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, [selectedMonth, selectedDepartment]);

  // Handle employee selection
  const handleSelectEmployee = (id) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, selected: !emp.selected } : emp
    ));
    
    setSelectedEmployees(prev => 
      prev.includes(id) 
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = employees.map(emp => emp.id);
      setSelectedEmployees(allIds);
      setEmployees(prev => prev.map(emp => ({ ...emp, selected: true })));
    } else {
      setSelectedEmployees([]);
      setEmployees(prev => prev.map(emp => ({ ...emp, selected: false })));
    }
  };

  // Process payroll
  const handleProcessPayroll = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    const [year, month] = selectedMonth.split('-').map(Number);
    
    if (!window.confirm(`Process payroll for ${selectedEmployees.length} employees for ${month}/${year}?`)) {
      return;
    }

    setProcessing(true);
    
    try {
      const response = await apiPost('/payroll/process-salary-transfer', {
        employee_ids: selectedEmployees,
        month,
        year,
        payment_date: new Date().toISOString().slice(0, 10)
      });

      if (response.ok) {
        alert(`✅ Payroll processed successfully for ${response.processed_count || selectedEmployees.length} employees`);
        
        // Update employee status
        setEmployees(prev => prev.map(emp => 
          selectedEmployees.includes(emp.id) 
            ? { ...emp, bank_status: 'Processing' } 
            : emp
        ));
        
        setSelectedEmployees([]);
        setStep(4); // Move to completion step
      } else {
        alert(`❌ Failed to process payroll: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  // Generate payslips
  const handleGeneratePayslips = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees');
      return;
    }
    
    // Generate payslips for selected employees
    selectedEmployees.forEach(empId => {
      const [year, month] = selectedMonth.split('-');
      window.open(
        `${process.env.VITE_API_URL || 'http://localhost:4000'}/api/payroll/generate-payslip-pdf?employee_id=${empId}&month=${month}&year=${year}`,
        '_blank'
      );
    });
  };

  // Send salary to bank
  const handleSendToBank = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees');
      return;
    }

    const [year, month] = selectedMonth.split('-').map(Number);
    
    if (!window.confirm(`Initiate bank transfer for ${selectedEmployees.length} employees?`)) {
      return;
    }

    try {
      const response = await apiPost('/payroll/initiate-bank-transfer', {
        employee_ids: selectedEmployees,
        month,
        year
      });

      if (response.ok) {
        alert(`✅ Bank transfer initiated for ${response.processed_count || selectedEmployees.length} employees`);
        
        // Update employee bank status
        setEmployees(prev => prev.map(emp => 
          selectedEmployees.includes(emp.id) 
            ? { ...emp, bank_status: 'Processing' } 
            : emp
        ));
      } else {
        alert(`❌ Failed to initiate transfer: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error initiating bank transfer:', error);
      alert('Failed to initiate bank transfer');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs ${Number(amount || 0).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthName = date.toLocaleString('default', { month: 'long' });
    return {
      value: `${year}-${month}`,
      label: `${monthName} ${year}`
    };
  });

  // Render steps
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Step 1: Select Payroll Month</h3>
            
            <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                  Select Month
                </label>
                <select
                  className="select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>
                  Filter by Department
                </label>
                <select
                  className="select"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={() => setStep(2)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Next: Load Employee Data'}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Step 2: Review Employee Data</h3>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ fontSize: 14, fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    style={{ marginRight: 8 }}
                    checked={selectedEmployees.length === employees.length && employees.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={employees.length === 0}
                  />
                  Select All Employees
                </label>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {selectedEmployees.length} of {employees.length} selected
                </span>
              </div>
              
              {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  Loading employee data...
                </div>
              ) : employees.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                  No employee data found for selected period
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-soft" onClick={fetchEmployees}>
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ maxHeight: 400, overflow: "auto" }}>
                  <table className="table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}></th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Gross Salary</th>
                        <th>Deductions</th>
                        <th>Net Salary</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={emp.selected || false}
                              onChange={() => handleSelectEmployee(emp.id)}
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)" }}>{emp.employee_code}</div>
                          </td>
                          <td>{emp.department}</td>
                          <td>{formatCurrency(emp.gross_salary)}</td>
                          <td>{formatCurrency(emp.deductions)}</td>
                          <td style={{ fontWeight: 600 }}>{formatCurrency(emp.net_salary)}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '500',
                              backgroundColor: emp.bank_status === 'Completed' ? '#D1FAE5' : 
                                             emp.bank_status === 'Processing' ? '#FEF3C7' : 
                                             emp.bank_status === 'Pending' ? '#F3F4F6' : '#FEE2E2',
                              color: emp.bank_status === 'Completed' ? '#065F46' : 
                                     emp.bank_status === 'Processing' ? '#92400E' : 
                                     emp.bank_status === 'Pending' ? '#374151' : '#991B1B'
                            }}>
                              {emp.bank_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                className="btn btn-soft" 
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setStep(3)}
                disabled={selectedEmployees.length === 0}
              >
                Next: Review Calculations
              </button>
            </div>
          </div>
        );

      case 3:
        // Calculate selected summary
        const selectedSummary = employees
          .filter(emp => emp.selected)
          .reduce((acc, emp) => ({
            totalGross: acc.totalGross + emp.gross_salary,
            totalDeductions: acc.totalDeductions + emp.deductions,
            totalNet: acc.totalNet + emp.net_salary,
            count: acc.count + 1
          }), { totalGross: 0, totalDeductions: 0, totalNet: 0, count: 0 });
        
        return (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Step 3: Review Salary Calculations</h3>
            
            <div className="card" style={{ padding: 20, background: "#f8fafc", marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#374151" }}>
                Selected Employees Summary
              </h4>
              
              <div className="grid-2" style={{ gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Selected Employees</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedSummary.count}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Total Gross Salary</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>
                    {formatCurrency(selectedSummary.totalGross)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Total Deductions</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#dc2626" }}>
                    {formatCurrency(selectedSummary.totalDeductions)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Total Net Pay</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>
                    {formatCurrency(selectedSummary.totalNet)}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, marginBottom: 12 }}>Payroll Actions</h4>
              <div className="grid-3" style={{ gap: 12 }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleProcessPayroll}
                  disabled={processing || selectedSummary.count === 0}
                  style={{ backgroundColor: processing ? '#9CA3AF' : undefined }}
                >
                  {processing ? 'Processing...' : '✅ Process Payroll'}
                </button>
                <button 
                  className="btn btn-soft" 
                  onClick={handleGeneratePayslips}
                  disabled={selectedSummary.count === 0}
                >
                  📄 Generate Payslips
                </button>
                <button 
                  className="btn btn-soft" 
                  onClick={handleSendToBank}
                  disabled={selectedSummary.count === 0}
                >
                  💰 Send to Bank
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: 24, padding: 16, background: "#FEF3C7", borderRadius: 8 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#92400E" }}>
                Important Notes:
              </h4>
              <ul style={{ fontSize: 13, color: "#92400E", margin: 0, paddingLeft: 20 }}>
                <li>Deductions include EPF (8% of basic salary), unpaid leaves, and other statutory deductions</li>
                <li>Gross Salary = Basic Salary + Allowances + Overtime + Bonuses</li>
                <li>Net Salary = Gross Salary - Total Deductions</li>
                <li>Once processed, payroll records cannot be undone</li>
              </ul>
            </div>
            
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button 
                className="btn btn-soft" 
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setStep(4)}
              >
                Next: Completion
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 48, color: "#10b981", marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Payroll Processing Complete!</h3>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              Payroll has been processed for {selectedEmployees.length} employees.
            </p>
            
            <div style={{ 
              padding: 20, 
              background: "#F0FDF4", 
              borderRadius: 8,
              marginBottom: 24,
              textAlign: "left"
            }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#065F46" }}>
                Next Steps:
              </h4>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>Review generated payslips in employee records</li>
                <li style={{ marginBottom: 8 }}>Initiate bank transfers for processed salaries</li>
                <li style={{ marginBottom: 8 }}>Process ETF/EPF contributions for this period</li>
                <li>Generate payroll reports for accounting</li>
              </ol>
            </div>
            
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setStep(1);
                  setSelectedEmployees([]);
                  fetchEmployees(); // Refresh data
                }}
              >
                Process Another Payroll
              </button>
              <button 
                className="btn btn-soft" 
                onClick={() => navigate("/payroll-processing")}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Payroll Processing", "Process Payroll"]}
        title="Process Payroll"
      />

      {/* Tabs */}
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

      {/* Progress Steps */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="grid-4" style={{ textAlign: "center" }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: s <= step ? "#4f46e5" : "#e5e7eb",
                color: s <= step ? "#fff" : "#9ca3af",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                marginBottom: 8
              }}>
                {s}
              </div>
              <div style={{
                fontSize: 12,
                fontWeight: s === step ? 600 : 400,
                color: s === step ? "#4f46e5" : "var(--muted)"
              }}>
                {s === 1 && "Select Month"}
                {s === 2 && "Select Employees"}
                {s === 3 && "Review & Process"}
                {s === 4 && "Complete"}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          height: 4,
          background: "#e5e7eb",
          marginTop: 16,
          borderRadius: 2,
          position: "relative"
        }}>
          <div style={{
            width: `${((step - 1) / 3) * 100}%`,
            height: "100%",
            background: "#4f46e5",
            borderRadius: 2,
            transition: "width 0.3s ease"
          }} />
        </div>
      </div>

      {/* Main Content */}
      {renderStep()}

      {/* Summary Card - Only show for steps 1-3 */}
      {step < 4 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Summary</h3>
          
          <div className="grid-2" style={{ gap: 16 }}>
            <div style={{ padding: 16, background: "#f0f9ff", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#0369a1", marginBottom: 4 }}>Selected Period</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {months.find(m => m.value === selectedMonth)?.label || selectedMonth}
              </div>
            </div>
            
            <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#059669", marginBottom: 4 }}>Total Employees</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {employees.length}
              </div>
            </div>
            
            <div style={{ padding: 16, background: "#fef2f2", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 4 }}>Total Deductions</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {formatCurrency(summary.totalDeductions)}
              </div>
            </div>
            
            <div style={{ padding: 16, background: "#fefce8", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#ca8a04", marginBottom: 4 }}>Net Payable</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {formatCurrency(summary.totalNet)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProcessPayroll;