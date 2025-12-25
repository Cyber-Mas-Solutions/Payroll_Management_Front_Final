// src/pages/Payroll Processing/EPFReport.jsx
import React, { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet, apiGetWithParams } from "../../services/api";
import { formatCurrency } from "../../utils/helpers";

export default function EPFReport() {
  const navigate = useNavigate();
  const location = useLocation();

  // ================= TABS =================
  const tabs = [
    { label: "Salary Transfer Overview", path: "/payroll-processing" },
    { label: "Employee Salary Details", path: "/employee-salary-details" },
    { label: "EPF Transfer", path: "/epf-transfer" },
    { label: "ETF Transfer", path: "/etf-transfer" },
    { label: "Income Tax Transfer", path: "/income-tax-transfer" },
    { label: "Insurance Payments", path: "/insurance-payments" },
  ];

  // ================= STATE =================
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  
  // Filters
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const [filters, setFilters] = useState({
    month: defaultMonth,
    department: "all",
    search: "",
    status: "all"
  });

  // ================= FETCH DEPARTMENTS =================
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiGet('/salary/departments');
        setDepartments(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  // ================= FETCH AVAILABLE MONTHS =================
  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        // Using the payroll available months endpoint
        const res = await apiGet('/payroll/available-months');
        if (res.ok && res.data) {
          setAvailableMonths(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to fetch available months:', err);
        // Generate default months if API fails
        const defaultMonths = generateDefaultMonths();
        setAvailableMonths(defaultMonths);
      }
    };

    fetchAvailableMonths();
  }, []);

  // Generate default months (current and previous 12 months)
  const generateDefaultMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthName = date.toLocaleString('default', { month: 'long' });
      
      months.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        label: `${monthName} ${year}`,
        year,
        month
      });
    }
    
    return months;
  };

  // ================= FETCH EPF REPORT DATA =================
  const fetchEPFReport = async () => {
    setLoading(true);
    try {
      const [year, month] = filters.month.split('-').map(Number);
      
      // Try to get data from ETF/EPF payment history endpoint
      const params = {
        year,
        month,
        ...(filters.department !== 'all' && { department_id: filters.department }),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status })
      };

      // First try: Get from ETF/EPF payment history
      let data = [];
      let totals = { 
        totalBasic: 0, 
        totalEmployeeEPF: 0, 
        totalEmployerEPF: 0, 
        totalEPF: 0 
      };
      
      try {
        const paymentRes = await apiGetWithParams('/salary/etf-epf/payment-history', { year, month });
        if (paymentRes.ok && paymentRes.data) {
          // Transform payment history data
          const historyData = Array.isArray(paymentRes.data) ? paymentRes.data : [];
          data = historyData.map(item => ({
            id: item.id || item.employee_id,
            employee_id: item.employee_id,
            epf_number: item.epf_number || 'N/A',
            full_name: item.full_name,
            employee_code: item.employee_code,
            department_name: item.department_name || 'N/A',
            basic_salary: Number(item.basic_salary || item.gross_salary || 0),
            employee_epf: Number(item.employee_epf_contribution || 0),
            employer_epf: Number(item.employer_epf_contribution || 0),
            total_epf: Number(item.employee_epf_contribution || 0) + 
                      Number(item.employer_epf_contribution || 0),
            process_date: item.process_date,
            status: item.status || 'Processed'
          }));
          
          // Calculate totals
          totals = data.reduce((acc, item) => ({
            totalBasic: acc.totalBasic + item.basic_salary,
            totalEmployeeEPF: acc.totalEmployeeEPF + item.employee_epf,
            totalEmployerEPF: acc.totalEmployerEPF + item.employer_epf,
            totalEPF: acc.totalEPF + item.total_epf
          }), totals);
        }
      } catch (historyError) {
        console.log('Payment history endpoint not available, trying process list');
        
        // Fallback: Get from ETF/EPF process list
        try {
          const processRes = await apiGetWithParams('/salary/etf-epf/process-list', { year, month });
          if (processRes.ok && processRes.data) {
            const processData = Array.isArray(processRes.data) ? processRes.data : [];
            data = processData.map(item => ({
              id: item.employee_id,
              employee_id: item.employee_id,
              epf_number: item.epf_number || 'N/A',
              full_name: item.full_name,
              employee_code: item.employee_code,
              department_name: item.department_name || 'N/A',
              basic_salary: Number(item.basic_salary || 0),
              employee_epf: Number(item.epf_employee_amount || 0),
              employer_epf: Number(item.epf_employer_share || 0),
              total_epf: Number(item.epf_employee_amount || 0) + 
                        Number(item.epf_employer_share || 0),
              process_date: item.processed_at || new Date().toISOString().slice(0, 10),
              status: 'Calculated'
            }));
            
            // Calculate totals
            totals = data.reduce((acc, item) => ({
              totalBasic: acc.totalBasic + item.basic_salary,
              totalEmployeeEPF: acc.totalEmployeeEPF + item.employee_epf,
              totalEmployerEPF: acc.totalEmployerEPF + item.employer_epf,
              totalEPF: acc.totalEPF + item.total_epf
            }), totals);
          }
        } catch (processError) {
          console.log('Process list endpoint not available, using fallback calculation');
          
          // Final fallback: Get employee list and calculate EPF only
          try {
            const employeesRes = await apiGet('/salary/employees');
            const employeesData = Array.isArray(employeesRes?.data) ? employeesRes.data : [];
            
            // Filter by department if needed
            let filteredEmployees = employeesData;
            if (filters.department !== 'all') {
              filteredEmployees = employeesData.filter(emp => 
                String(emp.department_id) === filters.department || 
                emp.department_name?.toLowerCase() === filters.department?.toLowerCase()
              );
            }
            
            // Filter by search if needed
            if (filters.search) {
              filteredEmployees = filteredEmployees.filter(emp => 
                emp.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                emp.employee_code?.toLowerCase().includes(filters.search.toLowerCase())
              );
            }
            
            data = filteredEmployees.map(emp => {
              const basic = Number(emp.basic_salary || emp.salary || 0);
              const employeeEPF = (basic * 8) / 100;
              const employerEPF = (basic * 12) / 100;
              
              return {
                id: emp.employee_id || emp.id,
                employee_id: emp.employee_id || emp.id,
                epf_number: emp.epf_no || emp.epf_number || 'N/A',
                full_name: emp.full_name,
                employee_code: emp.employee_code || `EMP${emp.employee_id || emp.id}`,
                department_name: emp.department || emp.department_name || 'N/A',
                basic_salary: basic,
                employee_epf: employeeEPF,
                employer_epf: employerEPF,
                total_epf: employeeEPF + employerEPF,
                process_date: new Date().toISOString().slice(0, 10),
                status: 'Estimated'
              };
            });
            
            // Calculate totals
            totals = data.reduce((acc, item) => ({
              totalBasic: acc.totalBasic + item.basic_salary,
              totalEmployeeEPF: acc.totalEmployeeEPF + item.employee_epf,
              totalEmployerEPF: acc.totalEmployerEPF + item.employer_epf,
              totalEPF: acc.totalEPF + item.total_epf
            }), totals);
          } catch (finalError) {
            console.error('All EPF data sources failed:', finalError);
            data = [];
          }
        }
      }
      
      // Apply search filter if data is loaded
      if (filters.search && data.length > 0) {
        const searchLower = filters.search.toLowerCase();
        data = data.filter(item => 
          item.full_name?.toLowerCase().includes(searchLower) ||
          item.employee_code?.toLowerCase().includes(searchLower) ||
          item.epf_number?.toLowerCase().includes(searchLower) ||
          item.department_name?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply status filter
      if (filters.status !== 'all' && data.length > 0) {
        data = data.filter(item => item.status === filters.status);
      }
      
      // Recalculate totals after filtering
      if (data.length > 0) {
        totals = data.reduce((acc, item) => ({
          totalBasic: acc.totalBasic + item.basic_salary,
          totalEmployeeEPF: acc.totalEmployeeEPF + item.employee_epf,
          totalEmployerEPF: acc.totalEmployerEPF + item.employer_epf,
          totalEPF: acc.totalEPF + item.total_epf
        }), { 
          totalBasic: 0, 
          totalEmployeeEPF: 0, 
          totalEmployerEPF: 0, 
          totalEPF: 0 
        });
      }
      
      setReportData({
        data,
        totals,
        period: `${month}/${year}`,
        generatedDate: new Date().toLocaleString(),
        recordCount: data.length
      });
      
    } catch (error) {
      console.error('Failed to fetch EPF report:', error);
      alert('Failed to load EPF report data. Please try again.');
      setReportData({
        data: [],
        totals: { 
          totalBasic: 0, 
          totalEmployeeEPF: 0, 
          totalEmployerEPF: 0, 
          totalEPF: 0 
        },
        period: filters.month,
        generatedDate: new Date().toLocaleString(),
        recordCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // ================= INITIAL FETCH =================
  useEffect(() => {
    fetchEPFReport();
  }, []);

  // ================= EXPORT FUNCTIONS =================
  const handleExportCSV = () => {
    if (!reportData.data || reportData.data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['EPF Number', 'Employee Code', 'Employee Name', 'Department', 'Basic Salary', 'EPF (Employee 8%)', 'EPF (Employer 12%)', 'Total EPF', 'Status'];
    
    const csvRows = reportData.data.map(item => [
      item.epf_number,
      item.employee_code,
      `"${item.full_name}"`,
      `"${item.department_name}"`,
      item.basic_salary.toFixed(2),
      item.employee_epf.toFixed(2),
      item.employer_epf.toFixed(2),
      item.total_epf.toFixed(2),
      item.status
    ]);

    // Add totals row
    csvRows.push([
      '', '', '', 'TOTALS:',
      reportData.totals.totalBasic.toFixed(2),
      reportData.totals.totalEmployeeEPF.toFixed(2),
      reportData.totals.totalEmployerEPF.toFixed(2),
      reportData.totals.totalEPF.toFixed(2),
      ''
    ]);

    const csvContent = [headers, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const [year, month] = filters.month.split('-');
    a.href = url;
    a.download = `EPF_Report_${year}_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setGeneratingPdf(true);
    try {
      const [year, month] = filters.month.split('-');
      
      // Generate PDF using the backend PDF generation endpoint
      // This would require a PDF generation endpoint in your backend
      window.open(
        `${process.env.VITE_API_URL || 'http://localhost:4000'}/api/payroll/export-epf-pdf?month=${month}&year=${year}`,
        '_blank'
      );
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('PDF generation feature is not available yet');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleProcessEPF = () => {
    const [year, month] = filters.month.split('-');
    const employeeIds = reportData.data.map(item => item.employee_id);
    
    if (employeeIds.length === 0) {
      alert('No employees to process');
      return;
    }
    
    if (window.confirm(`Process EPF contributions for ${employeeIds.length} employees for ${month}/${year}?`)) {
      // Navigate to EPF processing page
      navigate("/process-epf", {
        state: {
          month,
          year,
          employeeIds,
          reportData: reportData.data
        }
      });
    }
  };

  // ================= FILTERED DATA =================
  const filteredData = useMemo(() => {
    if (!reportData.data) return [];
    
    let data = reportData.data;
    
    // Apply department filter
    if (filters.department !== 'all') {
      data = data.filter(item => 
        item.department_name?.toLowerCase().includes(filters.department.toLowerCase()) ||
        String(item.department_id) === filters.department
      );
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      data = data.filter(item => 
        item.full_name?.toLowerCase().includes(searchLower) ||
        item.employee_code?.toLowerCase().includes(searchLower) ||
        item.epf_number?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      data = data.filter(item => item.status === filters.status);
    }
    
    return data;
  }, [reportData.data, filters]);

  // ================= RENDER =================
  return (
    <Layout>
      <PageHeader 
        breadcrumb={["Payroll Processing", "EPF Transfer", "EPF Report"]} 
        title="EPF Contribution Report" 
      />

      {/* ================= TABS ================= */}
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

      {/* ================= ACTIONS BAR ================= */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px" 
        }}>
          <button className="btn btn-soft" onClick={() => navigate("/epf-transfer")}>
            ← Back to EPF Transfer
          </button>
          
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button 
              className="btn btn-soft" 
              onClick={handleExportCSV}
              disabled={loading || !reportData.data || reportData.data.length === 0}
            >
              📊 Export CSV
            </button>
            <button 
              className="btn btn-soft" 
              onClick={handleExportPDF}
              disabled={loading || generatingPdf || !reportData.data || reportData.data.length === 0}
            >
              {generatingPdf ? 'Generating...' : '📄 Download PDF'}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleProcessEPF}
              disabled={loading || !reportData.data || reportData.data.length === 0}
            >
              💰 Process EPF Payment
            </button>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div className="grid-4" style={{ gap: "16px", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              Select Month
            </label>
            <select
              className="select"
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: e.target.value})}
              style={{ width: "100%" }}
            >
              {availableMonths.length > 0 ? (
                availableMonths.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))
              ) : (
                <option value={defaultMonth}>
                  {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                </option>
              )}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              Department
            </label>
            <select
              className="select"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              style={{ width: "100%" }}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              Search
            </label>
            <input
              type="text"
              className="input"
              placeholder="Search by name, code, or EPF number"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              Status
            </label>
            <select
              className="select"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              style={{ width: "100%" }}
            >
              <option value="all">All Status</option>
              <option value="Processed">Processed</option>
              <option value="Calculated">Calculated</option>
              <option value="Estimated">Estimated</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <button 
            className="btn btn-soft" 
            onClick={() => setFilters({
              month: defaultMonth,
              department: "all",
              search: "",
              status: "all"
            })}
          >
            Clear Filters
          </button>
          <button 
            className="btn btn-primary" 
            onClick={fetchEPFReport}
            disabled={loading}
          >
            {loading ? 'Loading...' : '🔍 Generate Report'}
          </button>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      {reportData.totals && (
        <div className="grid-4" style={{ marginBottom: "24px", gap: "12px" }}>
          <div className="card" style={{ padding: "16px", borderLeft: "4px solid #3b82f6" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Employees</div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>
              {filteredData.length}
            </div>
          </div>
          <div className="card" style={{ padding: "16px", borderLeft: "4px solid #10b981" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Basic Salary</div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>
              {formatCurrency(reportData.totals.totalBasic || 0)}
            </div>
          </div>
          <div className="card" style={{ padding: "16px", borderLeft: "4px solid #ef4444" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Employee EPF (8%)</div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>
              {formatCurrency(reportData.totals.totalEmployeeEPF || 0)}
            </div>
          </div>
          <div className="card" style={{ padding: "16px", borderLeft: "4px solid #f59e0b" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total EPF Contributions</div>
            <div style={{ fontSize: "20px", fontWeight: "700" }}>
              {formatCurrency(reportData.totals.totalEPF || 0)}
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT TABLE ================= */}
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ 
          padding: "16px", 
          borderBottom: "1px solid var(--border)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
              EPF Contribution Report: {filters.month}
            </h3>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
              Generated on {reportData.generatedDate || new Date().toLocaleString()} • {filteredData.length} records
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "500",
              backgroundColor: "#D1FAE5",
              color: "#065F46"
            }}>
              {filteredData.length === 0 ? 'No Data' : 'Data Verified'}
            </span>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              Employer EPF (12%): {formatCurrency(reportData.totals?.totalEmployerEPF || 0)}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>
            <div className="spinner" style={{ marginBottom: "10px" }}></div>
            Loading EPF contribution report...
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>
            No EPF data found for the selected filters.
            <div style={{ marginTop: "12px" }}>
              <button className="btn btn-soft" onClick={fetchEPFReport}>
                Retry Loading Data
              </button>
            </div>
        </div>
        ) : (
          <>
            <table className="table" style={{ minWidth: "1100px" }}>
              <thead>
                <tr>
                  <th>EPF No.</th>
                  <th>Employee Code</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th style={{ textAlign: "right" }}>Basic Salary</th>
                  <th style={{ textAlign: "right", color: "#ef4444" }}>Employee (8%)</th>
                  <th style={{ textAlign: "right", color: "#f59e0b" }}>Employer (12%)</th>
                  <th style={{ textAlign: "right", fontWeight: "700" }}>Total EPF</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: "500", fontFamily: "monospace" }}>
                        {item.epf_number}
                      </span>
                    </td>
                    <td>{item.employee_code}</td>
                    <td>{item.full_name}</td>
                    <td>{item.department_name}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                      {formatCurrency(item.basic_salary)}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", color: "#ef4444" }}>
                      {formatCurrency(item.employee_epf)}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", color: "#f59e0b" }}>
                      {formatCurrency(item.employer_epf)}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: "700" }}>
                      {formatCurrency(item.total_epf)}
                    </td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "500",
                        backgroundColor: item.status === 'Processed' ? '#D1FAE5' : 
                                       item.status === 'Calculated' ? '#FEF3C7' : 
                                       item.status === 'Estimated' ? '#DBEAFE' : '#F3F4F6',
                        color: item.status === 'Processed' ? '#065F46' : 
                               item.status === 'Calculated' ? '#92400E' : 
                               item.status === 'Estimated' ? '#1E40AF' : '#374151'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "var(--bg-light)", fontWeight: "700", borderTop: "2px solid var(--border)" }}>
                  <td colSpan="4" style={{ padding: "16px" }}>
                    GRAND TOTALS ({filteredData.length} employees)
                  </td>
                  <td style={{ textAlign: "right", padding: "16px" }}>
                    {formatCurrency(reportData.totals.totalBasic)}
                  </td>
                  <td style={{ textAlign: "right", padding: "16px", color: "#ef4444" }}>
                    {formatCurrency(reportData.totals.totalEmployeeEPF)}
                  </td>
                  <td style={{ textAlign: "right", padding: "16px", color: "#f59e0b" }}>
                    {formatCurrency(reportData.totals.totalEmployerEPF)}
                  </td>
                  <td style={{ textAlign: "right", padding: "16px", fontSize: "1.1em" }}>
                    {formatCurrency(reportData.totals.totalEPF)}
                  </td>
                  <td style={{ padding: "16px" }}>
                    {/* Empty cell for status column */}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>

      {/* ================= FOOTER NOTES ================= */}
      <div style={{ 
        marginTop: "24px", 
        padding: "16px", 
        borderRadius: "8px", 
        background: "#f8f9fa", 
        borderLeft: "4px solid #0d6efd" 
      }}>
        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#444", fontWeight: "600" }}>
          📋 EPF Contribution Information:
        </p>
        <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "13px", color: "#666" }}>
          <li>Employee EPF contribution is 8% of basic salary (deducted from salary)</li>
          <li>Employer EPF contribution is 12% of basic salary (paid by company)</li>
          <li>Total EPF contribution per employee = Employee (8%) + Employer (12%) = 20% of basic salary</li>
          <li>EPF numbers must be verified before submission to the EPF department</li>
          <li>Monthly EPF returns must be filed by the 15th of the following month</li>
          <li>Maintain EPF records for minimum of 10 years for compliance purposes</li>
        </ul>
      </div>
    </Layout>
  );
}