// src/pages/NetSalarySummary.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiPost } from "../services/api";

export default function NetSalarySummary() {
  const navigate = useNavigate();

  // Tabs configuration
  const tabs = [
    { key: 'earnings', label: 'Earnings', path: '/earnings' },
    { key: 'deductions', label: 'Deductions', path: '/deductions' },
    { key: 'allowances', label: 'Allowances', path: '/allowances' },
    { key: 'overtime', label: 'Overtime & Adjustments', path: '/overtime-adjustments' },
    { key: 'compensation', label: 'Compensation Adjustment', path: '/compensation-adjustment' },
    { label: "ETF & EPF", path: "/etf-epf" },
    { label: "Unpaid Leaves", path: "/unpaid-leaves" },
    { key: 'summary', label: 'Net Salary Summary', path: '/net-salary-summary' }
  ];

  // Filters
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [period, setPeriod] = useState(defaultMonth);
  const [searchTerm, setSearchTerm] = useState('');
  const [grades, setGrades] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [gradeId, setGradeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const fetchSummary = async () => {
    const [y, m] = period.split('-').map(Number);
    const qs = new URLSearchParams();
    qs.set('month', m);
    qs.set('year', y);
    if (searchTerm.trim()) qs.set('q', searchTerm.trim());
    if (gradeId) qs.set('grade_id', gradeId);
    if (departmentId) qs.set('department_id', departmentId);

    setLoading(true);
    try {
      const res = await apiGet(`/salary/summary?${qs.toString()}`);
      const data = Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.data || []);
      setRows(data);
    } catch (e) {
      console.error(e);
      setRows([]);
      window.alert('Failed to load month summary');
    } finally {
      setLoading(false);
    }
  };

  // First load
  useEffect(() => { 
    fetchSummary(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Currency formatter
  const formatCurrency = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

  // Chart values (top 10 by net)
  const top10 = useMemo(() => {
    const sorted = [...rows].sort((a, b) => Number(b.net) - Number(a.net));
    return sorted.slice(0, 10);
  }, [rows]);

  // All Employee Net Salary Summary Statistics
  const salaryStats = useMemo(() => {
    if (!rows.length) return null;
    
    const totalEmployees = rows.length;
    const totalNetSalary = rows.reduce((sum, r) => sum + Number(r.net || 0), 0);
    const totalGrossSalary = rows.reduce((sum, r) => sum + Number(r.gross || 0), 0);
    const totalDeductions = rows.reduce((sum, r) => sum + Number(r.totalDeductions || 0), 0);
    const avgNetSalary = totalNetSalary / totalEmployees;
    const avgGrossSalary = totalGrossSalary / totalEmployees;
    
    return {
      totalEmployees,
      totalNetSalary,
      totalGrossSalary,
      totalDeductions,
      avgNetSalary,
      avgGrossSalary
    };
  }, [rows]);

  // Export CSV for current table
  const exportCsv = () => {
    if (!rows.length) return window.alert('No data to export.');
    const headers = ['Employee', 'ID', 'Department', 'Grade', 'Basic', 'Allowances', 'Overtime', 'Bonus', 'Gross', 'Deductions', 'Net'];
    const csvRows = rows.map(r => ([
      r.full_name,
      r.employee_code || r.employee_id,
      r.department_name || '',
      r.grade_name || '',
      r.basic,
      r.allowances,
      r.overtime,
      r.bonus,
      r.gross,
      r.totalDeductions,
      r.net,
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
    a.href = url; a.download = `net_salary_summary_${y}_${m}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Finalize payroll
  const finalizeMonth = async () => {
    const [y, m] = period.split('-').map(Number);
    if (!m || !y) return window.alert('Pick a valid month.');
    if (!window.confirm(`Finalize payroll for ${y}/${String(m).padStart(2, '0')}?`)) return;
    try {
      const res = await apiPost('/salary/run', { month: m, year: y });
      window.alert(res?.message || 'Payroll finalized.');
    } catch (e) {
      console.error(e);
      window.alert('Failed to finalize payroll');
    }
  };

  const handleFilter = () => {
    fetchSummary();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGradeId('');
    setDepartmentId('');
    setPeriod(defaultMonth);
  };

  return (
    <Layout>
      {/* Fixed Header Section - Not Scrollable */}
      <div style={{ flexShrink: 0 }}>
        <PageHeader
          breadcrumb={["Salary & Compensation", "Net Salary Summary"]}
          title="Salary & Compensation"
        />

        {/* Tabs - Not Scrollable */}
        <div className="card" style={{ display: "flex", gap: "8px", overflowX: "auto", whiteSpace: "nowrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`btn ${window.location.pathname === tab.path ? "btn-primary" : "btn-soft"}`}
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
                placeholder="Search by name, code, or ID…"
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

      {/* Scrollable Content Area - Charts, Actions, and Table */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0 // Important for proper scrolling
      }}>
        {/* Summary Charts - Scrollable */}
        <div className="grid-2" style={{ gap: "16px", marginBottom: "16px" }}>
          {/* All Employee Net Salary Summary Chart */}
          <div className="card">
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>
              Salary Summary
            </h3>
            
            {salaryStats && (
              <>
                <div className="grid-3" style={{ marginBottom: "20px" }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--soft)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Total Employees</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--brand)' }}>
                      {salaryStats.totalEmployees}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--soft)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Total Net Salary</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                      {formatCurrency(salaryStats.totalNetSalary)}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--soft)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Avg Net Salary</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--brand)' }}>
                      {formatCurrency(salaryStats.avgNetSalary)}
                    </div>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--soft)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Total Gross</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>
                      {formatCurrency(salaryStats.totalGrossSalary)}
                    </div>
                  </div>
                  
                  <div style={{ padding: '12px', background: 'var(--soft)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Total Deductions</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--danger)' }}>
                      {formatCurrency(salaryStats.totalDeductions)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Net Salary Chart (Top 10) */}
          <div className="card">
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>
              Top 10 Net Salaries
            </h3>
            
            {!rows.length && (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>
                No data available
              </div>
            )}
            
            {rows.length > 0 && (
              <div>
                {top10.map((r, i) => {
                  const maxNet = top10[0]?.net || 1;
                  const widthPct = Math.max(2, Math.round((Number(r.net) / maxNet) * 100));
                  return (
                    <div 
                      key={r.employee_id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        margin: '8px 0',
                        padding: '4px 0'
                      }}
                    >
                      <div style={{ 
                        width: '120px', 
                        fontSize: '12px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        fontWeight: '500'
                      }}>
                        {r.full_name}
                      </div>
                      <div style={{ 
                        flex: 1, 
                        background: 'var(--soft)', 
                        borderRadius: '6px', 
                        height: '20px', 
                        position: 'relative' 
                      }}>
                        <div 
                          style={{ 
                            width: `${widthPct}%`, 
                            height: '100%', 
                            borderRadius: '6px',
                            background: 'var(--brand)',
                            opacity: 0.7
                          }} 
                        />
                      </div>
                      <div style={{ 
                        width: '100px', 
                        textAlign: 'right', 
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {formatCurrency(r.net)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Scrollable */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ fontWeight: "700", fontSize: "16px" }}>Payroll Actions</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button className="btn btn-soft" onClick={fetchSummary} disabled={loading}>
                {loading ? 'Validating…' : 'Validate'}
              </button>
              <button className="btn btn-soft" onClick={exportCsv}>
                Export Report
              </button>
              <button className="btn btn-primary" onClick={finalizeMonth}>
                Finalize Month
              </button>
            </div>
          </div>
        </div>

        {/* All Employee Salary Summary Table - Scrollable */}
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
              <div style={{ fontWeight: "700" }}>All Employee Salary Summary</div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                {loading ? "Loading…" : `${rows.length} employee(s)`}
              </div>
            </div>

            <div style={{ overflow: 'auto', flex: 1 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Department</th>
                    
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Overtime</th>
                    <th>Bonus</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {!rows.length && !loading && (
                    <tr>
                      <td colSpan={11} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                        No salary data available for the selected period/filters
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={11} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                        Loading salary data...
                      </td>
                    </tr>
                  )}
                  {rows.map(r => (
                    <tr key={r.employee_id}>
                      <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="user-avatar" />
                        <div>
                          <div style={{ fontWeight: "600" }}>{r.full_name}</div>
                          <div style={{ fontSize: "12px", color: "var(--muted)" }}>{r.email || "-"}</div>
                        </div>
                      </td>
                      <td>{r.employee_code || r.employee_id}</td>
                      <td>{r.department_name || '-'}</td>
                      
                      <td>{formatCurrency(r.basic)}</td>
                      <td style={{ color: "var(--success)" }}>{formatCurrency(r.allowances)}</td>
                      <td style={{ color: "var(--success)" }}>{formatCurrency(r.overtime)}</td>
                      <td style={{ color: "var(--success)" }}>{formatCurrency(r.bonus)}</td>
                      <td style={{ fontWeight: "600" }}>{formatCurrency(r.gross)}</td>
                      <td style={{ color: "var(--danger)" }}>{formatCurrency(r.totalDeductions)}</td>
                      <td style={{ fontWeight: "700", color: "var(--success)" }}>{formatCurrency(r.net)}</td>
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