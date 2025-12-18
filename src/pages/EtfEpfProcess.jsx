// src/pages/ETFEPFProcess.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet } from "../services/api";
import { formatCurrency } from "../utils/helpers";

export default function ETFEPFProcess() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [grades, setGrades] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [gradeId, setGradeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [period, setPeriod] = useState(defaultMonth);

  const tabs = [
    { label: "Earnings", path: "/earnings" },
    { label: "Deductions", path: "/deductions" },
    { label: "Allowances", path: "/allowances" },
    { label: "Overtime & Adjustments", path: "/overtime-adjustments" },
    { label: "Compensation Adjustment", path: "/compensation-adjustment" },
    { label: "ETF & EPF", path: "/etf-epf" },
    { label: "ETF/EPF Process", path: "/etf-epf-process" },
    { label: "Unpaid Leaves", path: "/unpaid-leaves" },
    { label: "Net Salary Summary", path: "/net-salary-summary" }
  ];

  // Load filters (grades + departments) once
  useEffect(() => {
    (async () => {
      try {
        const [g, d] = await Promise.all([
          apiGet('/salary/grades'),
          apiGet('/salary/departments'),
        ]);
        setGrades(Array.isArray(g) ? g : (g?.data || []));
        setDepartments(Array.isArray(d?.data) ? d.data : (d?.data || []));
      } catch (e) {
        console.error(e);
        setGrades([]);
        setDepartments([]);
      }
    })();
  }, []);

  // Fetch ETF/EPF process data - SIMILAR TO NET SALARY SUMMARY
  const fetchETFEPFData = async () => {
    const [y, m] = period.split('-').map(Number);
    const qs = new URLSearchParams();
    qs.set('month', m);
    qs.set('year', y);
    if (searchTerm.trim()) qs.set('q', searchTerm.trim());
    if (gradeId) qs.set('grade_id', gradeId);
    if (departmentId) qs.set('department_id', departmentId);

    setLoading(true);
    try {
      // Use the same pattern as NetSalarySummary
      const res = await apiGet(`/salary/etf-epf/process-list?${qs.toString()}`);
      
      // Handle response similar to NetSalarySummary
      const data = Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.data || []);
      
      // If data is empty or not in expected format, try alternative
      if (!data.length && res?.ok !== false) {
        // Fallback: Get data from summary endpoint and calculate ETF/EPF
        const summaryRes = await apiGet(`/salary/summary?${qs.toString()}`);
        const summaryData = Array.isArray(summaryRes?.data) ? summaryRes.data : 
                          (summaryRes?.data?.data || summaryRes?.data || []);
        
        // Calculate ETF/EPF from summary data
        const calculatedData = summaryData.map(employee => {
          const basic = Number(employee.basic || 0);
          const epfEmployee = (basic * 8) / 100; // 8% employee EPF
          const epfEmployer = (basic * 12) / 100; // 12% employer EPF
          const etfEmployer = (basic * 3) / 100; // 3% employer ETF
          
          return {
            employee_id: employee.employee_id,
            full_name: employee.full_name,
            employee_code: employee.employee_code || employee.employee_id,
            department_name: employee.department_name || '',
            grade_name: employee.grade_name || '',
            basic_salary: basic,
            epf_employee_amount: epfEmployee,
            epf_employer_share: epfEmployer,
            etf_employer_contribution: etfEmployer,
            total_statutory: epfEmployee + epfEmployer + etfEmployer
          };
        });
        
        setRows(calculatedData);
      } else {
        setRows(data);
      }
    } catch (e) {
      console.error('ETF/EPF fetch error:', e);
      
      // Fallback: Try to get basic employee data
      try {
        const employeesRes = await apiGet('/salary/employees');
        const employeesData = Array.isArray(employeesRes?.data) ? employeesRes.data : 
                            (employeesRes?.data?.data || employeesRes?.data || []);
        
        // Calculate with basic salary (fallback to 0 if not available)
        const fallbackData = employeesData.map(emp => {
          const basic = Number(emp.basic_salary || emp.salary || 0);
          const epfEmployee = (basic * 8) / 100;
          const epfEmployer = (basic * 12) / 100;
          const etfEmployer = (basic * 3) / 100;
          
          return {
            employee_id: emp.employee_id || emp.id,
            full_name: emp.full_name,
            employee_code: emp.employee_code || `EMP${emp.employee_id || emp.id}`,
            department_name: emp.department || emp.department_name || '',
            basic_salary: basic,
            epf_employee_amount: epfEmployee,
            epf_employer_share: epfEmployer,
            etf_employer_contribution: etfEmployer,
            total_statutory: epfEmployee + epfEmployer + etfEmployer
          };
        });
        
        setRows(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setRows([]);
        window.alert('Failed to load ETF/EPF data. Please check if the endpoint exists.');
      }
    } finally {
      setLoading(false);
    }
  };

  // First load
  useEffect(() => { 
    fetchETFEPFData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.filter(r => 
      r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.employee_code?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, curr) => ({
      basic: acc.basic + Number(curr.basic_salary || 0),
      epf_emp: acc.epf_emp + Number(curr.epf_employee_amount || 0),
      epf_employer: acc.epf_employer + Number(curr.epf_employer_share || 0),
      etf: acc.etf + Number(curr.etf_employer_contribution || 0)
    }), { basic: 0, epf_emp: 0, epf_employer: 0, etf: 0 });
  }, [filtered]);

  const handleFilter = () => {
    fetchETFEPFData();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setGradeId("");
    setDepartmentId("");
    setPeriod(defaultMonth);
  };

  // Export CSV similar to NetSalarySummary
  const exportCsv = () => {
    if (!rows.length) return window.alert('No data to export.');
    const headers = ['Employee', 'ID', 'Department', 'Basic Salary', 'EPF (8%)', 'EPF (12%)', 'ETF (3%)', 'Total Statutory'];
    const csvRows = rows.map(r => ([
      r.full_name,
      r.employee_code || r.employee_id,
      r.department_name || '',
      r.basic_salary,
      r.epf_employee_amount,
      r.epf_employer_share,
      r.etf_employer_contribution,
      r.total_statutory,
    ]));
    const csv = [headers, ...csvRows]
      .map(arr => arr.map(v => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const [y, m] = period.split('-');
    a.href = url; a.download = `etf_epf_process_${y}_${m}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      {/* Fixed Header Section - Not Scrollable */}
      <div style={{ flexShrink: 0 }}>
        <PageHeader
          breadcrumb={["Salary & Compensation", "ETF/EPF Process"]}
          title="Salary & Compensation"
        />

        {/* Tabs - Not Scrollable */}
        <div className="card" style={{ display: "flex", gap: "8px", overflowX: "auto", whiteSpace: "nowrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab.path}
              className={`btn ${location.pathname === tab.path ? "btn-primary" : "btn-soft"}`}
              onClick={() => navigate(tab.path)}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters Card - Not Scrollable */}
        <div className="card">
          <div className="grid-3" style={{ alignItems: "end", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Month</label>
              <input
                className="input"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Department</label>
              <select 
                className="select" 
                value={departmentId} 
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Grade</label>
              <select 
                className="select" 
                value={gradeId} 
                onChange={(e) => setGradeId(e.target.value)}
              >
                <option value="">All Grades</option>
                {grades.map(g => (
                  <option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ alignItems: "end", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Search</label>
              <input
                className="input"
                placeholder="Search by name, code, or department…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="btn btn-soft" onClick={clearFilters}>
                Clear Filters
              </button>
              <button className="btn btn-primary" onClick={handleFilter} disabled={loading}>
                {loading ? 'Loading…' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        {/* Summary Cards - Scrollable */}
        <div className="grid-4" style={{ margin: "16px 0", gap: "16px" }}>
          <div className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Basic Salary</div>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>{formatCurrency(totals.basic)}</div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #ef4444" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>EPF (Emp 8%)</div>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>{formatCurrency(totals.epf_emp)}</div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>EPF (Employer 12%)</div>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>{formatCurrency(totals.epf_employer)}</div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>ETF (Employer 3%)</div>
            <div style={{ fontSize: "18px", fontWeight: "700" }}>{formatCurrency(totals.etf)}</div>
          </div>
        </div>

        {/* Action Buttons - Scrollable */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ fontWeight: "700", fontSize: "16px" }}>ETF/EPF Actions</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button className="btn btn-soft" onClick={fetchETFEPFData} disabled={loading}>
                {loading ? 'Validating…' : 'Validate'}
              </button>
              <button className="btn btn-soft" onClick={exportCsv}>
                Export Report
              </button>
              <button className="btn btn-primary" onClick={() => window.alert('Process ETF/EPF payment functionality to be implemented')}>
                Process Payment
              </button>
            </div>
          </div>
        </div>

        {/* ETF/EPF Table - Scrollable */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ 
              padding: "12px 16px", 
              borderBottom: "1px solid var(--border)", 
              display: "flex", 
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0
            }}>
              <div style={{ fontWeight: "700" }}>ETF/EPF Contributions</div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                {loading ? "Loading…" : `${filtered.length} employee(s)`}
              </div>
            </div>

            <div style={{ overflow: 'auto', flex: 1 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Basic Salary</th>
                    <th style={{ textAlign: 'right' }}>EPF (8%)</th>
                    <th style={{ textAlign: 'right' }}>EPF (12%)</th>
                    <th style={{ textAlign: 'right' }}>ETF (3%)</th>
                    <th style={{ textAlign: 'right' }}>Total Statutory</th>
                  </tr>
                </thead>
                <tbody>
                  {!filtered.length && !loading && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                        No ETF/EPF data available for the selected period/filters
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                        Loading ETF/EPF data...
                      </td>
                    </tr>
                  )}
                  {filtered.map(r => (
                    <tr key={r.employee_id}>
                      <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="user-avatar" />
                        <div>
                          <div style={{ fontWeight: "600" }}>{r.full_name}</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>{r.grade_name || "-"}</div>
                        </div>
                      </td>
                      <td>{r.employee_code || r.employee_id}</td>
                      <td>{r.department_name || '-'}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(r.basic_salary)}</td>
                      <td style={{ textAlign: 'right', color: "#dc2626" }}>{formatCurrency(r.epf_employee_amount)}</td>
                      <td style={{ textAlign: 'right', color: "#059669" }}>{formatCurrency(r.epf_employer_share)}</td>
                      <td style={{ textAlign: 'right', color: "#f59e0b" }}>{formatCurrency(r.etf_employer_contribution)}</td>
                      <td style={{ textAlign: 'right', fontWeight: "700" }}>{formatCurrency(r.total_statutory)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}