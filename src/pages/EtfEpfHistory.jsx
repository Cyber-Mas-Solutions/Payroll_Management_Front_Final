// src/pages/EtfEpfHistory.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { etfEpfApi } from "../services/api"; 
import { formatCurrency, showToast } from "../utils/helpers"; 



export default function EtfEpfHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Tabs Configuration ---
  const tabs = [
    { key: 'etf-epf', label: "ETF & EPF", path: "/etf-epf" },
    { key: 'etf-epf-process', label: "ETF/EPF Process", path: "/etf-epf-process" },
    { key: 'etf-epf-history', label: "ETF/EPF History", path: "/etf-epf-history" },
    { key: 'earnings', label: 'Earnings', path: '/earnings' },
    { key: 'deductions', label: 'Deductions', path: '/deductions' },
    { key: 'allowances', label: 'Allowances', path: '/allowances' },
    { key: 'overtime', label: 'Overtime & Adjustments', path: '/overtime-adjustments' },
    { key: 'compensation', label: 'Compensation Adjustment', path: '/compensation-adjustment' },
    { key: 'unpaid', label: "Unpaid Leaves", path: "/unpaid-leaves" },
    { key: 'summary', label: 'Net Salary Summary', path: '/net-salary-summary' }
  ];

  const [period, setPeriod] = useState('');
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ 
    totalEmployeeEpf: 0, 
    totalEmployerEpf: 0, 
    totalEmployerEtf: 0 
  });

  // Fetch payment summary
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await etfEpfApi.getPaymentSummary();
      if (res.ok) {
        setSummary(res.data || []);
      }
    } catch (e) {
      console.error("Error fetching summary:", e);
      showToast('error', 'Failed to load payment summary');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment history for selected period
  const fetchHistory = async (year, month) => {
    if (!year || !month) return;
    
    setLoading(true);
    try {
      const res = await etfEpfApi.getPaymentHistory({ year, month });
      if (res.ok) {
        setHistory(res.data || []);
        setTotals(res.totals || { 
          totalEmployeeEpf: 0, 
          totalEmployerEpf: 0, 
          totalEmployerEtf: 0 
        });
      }
    } catch (e) {
      console.error("Error fetching history:", e);
      showToast('error', 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (period) {
      const [year, month] = period.split('-');
      fetchHistory(year, month);
    }
  }, [period]);

  return (
    <Layout>
      <div style={{ flexShrink: 0 }}>
        <PageHeader
          breadcrumb={["Salary & Compensation", "ETF/EPF History"]}
          title="ETF/EPF Payment History"
        />

        {/* Navigation Tabs */}
        <div 
          className="card" 
          style={{ 
            display: "flex", 
            gap: "8px", 
            overflowX: "auto", 
            whiteSpace: "nowrap",
            marginBottom: 0,
            borderRadius: "0",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`btn ${location.pathname === tab.path ? "btn-primary" : "btn-soft"}`}
              onClick={() => navigate(tab.path)}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{borderRadius: "0 0 8px 8px", marginBottom: "16px"}}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Filter by Period
                </label>
                <input
                  type="month"
                  className="input"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Select month"
                />
              </div>
              <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                {period ? `Showing history for ${period}` : 'Select a month to view history'}
              </div>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total Processed Records</div>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--brand)" }}>
                {summary.reduce((sum, s) => sum + (s.employee_count || 0), 0)}
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                {summary.length} month(s)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Summary Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", backgroundColor: "#f8f9fa" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "#333" }}>Processed Payments Summary</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Employees</th>
                  <th style={{textAlign: 'right'}}>Total Basic Salary</th>
                  <th style={{textAlign: 'right'}}>Employee EPF</th>
                  <th style={{textAlign: 'right'}}>Employer EPF</th>
                  <th style={{textAlign: 'right'}}>Employer ETF</th>
                  <th style={{textAlign: 'right'}}>Total Payable</th>
                  <th>Last Processed</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{textAlign: "center", padding: "20px"}}>Loading...</td></tr>
                ) : summary.length === 0 ? (
                  <tr><td colSpan="8" style={{textAlign: "center", padding: "20px"}}>No processed records found.</td></tr>
                ) : (
                  summary.map((item, index) => (
                    <tr key={`summary-${index}`}>
                      <td>{item.period_year}-{String(item.period_month).padStart(2, '0')}</td>
                      <td>{item.employee_count || 0}</td>
                      <td style={{textAlign: 'right'}}>{formatCurrency(item.total_basic_salary || 0)}</td>
                      <td style={{textAlign: 'right'}}>{formatCurrency(item.total_employee_epf || 0)}</td>
                      <td style={{textAlign: 'right'}}>{formatCurrency(item.total_employer_epf || 0)}</td>
                      <td style={{textAlign: 'right'}}>{formatCurrency(item.total_employer_etf || 0)}</td>
                      <td style={{textAlign: 'right', fontWeight: "700"}}>
                        {formatCurrency((item.total_employee_epf || 0) + (item.total_employer_epf || 0) + (item.total_employer_etf || 0))}
                      </td>
                      <td>{item.last_processed_date ? new Date(item.last_processed_date).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed History (when period selected) */}
        {period && (
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", backgroundColor: "#f8f9fa" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "#333" }}>
                Detailed History for {period}
                <span style={{ fontSize: "12px", fontWeight: "normal", marginLeft: "8px", color: "var(--muted)" }}>
                  {history.length} records
                </span>
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>EPF No</th>
                    <th>ETF No</th>
                    <th style={{textAlign: 'right'}}>Basic Salary</th>
                    <th style={{textAlign: 'right'}}>Employee EPF</th>
                    <th style={{textAlign: 'right'}}>Employer EPF</th>
                    <th style={{textAlign: 'right'}}>Employer ETF</th>
                    <th style={{textAlign: 'right'}}>Total</th>
                    <th>Processed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="10" style={{textAlign: "center", padding: "20px"}}>Loading...</td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan="10" style={{textAlign: "center", padding: "20px"}}>No records found for {period}.</td></tr>
                  ) : (
                    history.map((item) => (
                      <tr key={`history-${item.id}`}>
                        <td>
                          <div style={{ fontWeight: "600" }}>{item.full_name}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{item.employee_code}</div>
                        </td>
                        <td>{item.department_name || 'N/A'}</td>
                        <td>{item.epf_number || 'N/A'}</td>
                        <td>{item.etf_number || 'N/A'}</td>
                        <td style={{textAlign: 'right'}}>{formatCurrency(item.basic_salary || 0)}</td>
                        <td style={{textAlign: 'right', color: "var(--danger)"}}>{formatCurrency(item.employee_epf_contribution || 0)}</td>
                        <td style={{textAlign: 'right', color: "var(--success)"}}>{formatCurrency(item.employer_epf_contribution || 0)}</td>
                        <td style={{textAlign: 'right', color: "var(--success)"}}>{formatCurrency(item.employer_etf_contribution || 0)}</td>
                        <td style={{textAlign: 'right', fontWeight: "700"}}>
                          {formatCurrency(
                            (item.employee_epf_contribution || 0) + 
                            (item.employer_epf_contribution || 0) + 
                            (item.employer_etf_contribution || 0)
                          )}
                        </td>
                        <td>{item.process_date ? new Date(item.process_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {history.length > 0 && (
                  <tfoot>
                    <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "700" }}>
                      <td colSpan="4" style={{ textAlign: "right" }}>Period Totals:</td>
                      <td style={{ textAlign: "right" }}>{formatCurrency(history.reduce((sum, h) => sum + (h.basic_salary || 0), 0))}</td>
                      <td style={{ textAlign: "right" }}>{formatCurrency(totals.totalEmployeeEpf)}</td>
                      <td style={{ textAlign: "right" }}>{formatCurrency(totals.totalEmployerEpf)}</td>
                      <td style={{ textAlign: "right" }}>{formatCurrency(totals.totalEmployerEtf)}</td>
                      <td style={{ textAlign: "right" }}>
                        {formatCurrency(totals.totalEmployeeEpf + totals.totalEmployerEpf + totals.totalEmployerEtf)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}