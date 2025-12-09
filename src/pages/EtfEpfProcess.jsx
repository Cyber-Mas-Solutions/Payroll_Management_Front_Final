// src/pages/EtfEpfProcess.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
// Assuming etfEpfApi is correctly defined in api.js using apiGetWithParams
import { etfEpfApi } from "../services/api"; 

export default function EtfEpfProcess() {
  const navigate = useNavigate();

  // --- Tabs Configuration (No change needed here) ---
  const tabs = [
    { key: 'earnings', label: 'Earnings', path: '/earnings' },
    { key: 'deductions', label: 'Deductions', path: '/deductions' },
    { key: 'allowances', label: 'Allowances', path: '/allowances' },
    { key: 'overtime', label: 'Overtime & Adjustments', path: '/overtime-adjustments' },
    { key: 'compensation', label: 'Compensation Adjustment', path: '/compensation-adjustment' },
    { key: 'etf-epf', label: "ETF & EPF", path: "/etf-epf" },
    { key: 'etf-epf-process', label: "ETF/EPF Process", path: "/etf-epf-process" },
    { key: 'unpaid', label: "Unpaid Leaves", path: "/unpaid-leaves" },
    { key: 'summary', label: 'Net Salary Summary', path: '/net-salary-summary' }
  ];

  // --- State Hooks ---
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const defaultMonth = `${currentYear}-${currentMonth}`;
  
  const [period, setPeriod] = useState(defaultMonth);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState("");

  // --- Data Fetching Logic ---
  const fetchData = async () => {
    if (!period) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const [year, month] = period.split('-');
      
      // API call now uses the structured etfEpfApi.getProcessList
      const res = await etfEpfApi.getProcessList({ month, year });

      // Check for success status and ensure data is an array
      const data = res.ok && Array.isArray(res.data) ? res.data : [];
      
      setRows(data);
      
      // Default selection: Select all newly loaded and UNPROCESSED employees
      setSelectedIds(new Set(data.filter(r => !r.is_processed).map(r => r.employee_id)));
      
    } catch (e) {
      console.error("Fetch Error:", e);
      // Display the error message from the thrown exception
      setErrorMessage(e.message || "Failed to load ETF/EPF data. Check API endpoint and controller.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // --- Calculation Logic Helpers ---
  const calculateValues = (row) => {
    // Gross for EPF: uses gross_salary_for_epf provided by backend
    const gross = Number(row.gross_salary_for_epf || 0);
    
    // Rates from DB or defaults (8.00%, 12.00%, 3.00%)
    const epfEmpRate = Number(row.epf_contribution_rate || 8);
    const epfCompRate = Number(row.employer_epf_rate || 12);
    const etfRate = Number(row.etf_contribution_rate || 3);

    const epfEmployee = (gross * epfEmpRate) / 100;
    const epfEmployer = (gross * epfCompRate) / 100;
    const etfAmount = (gross * etfRate) / 100;

    return {
      gross: gross,
      epfEmployee,
      epfEmployer,
      totalEpf: epfEmployee + epfEmployer,
      etfAmount,
      // Fallbacks are important here
      epfNo: row.epf_number || row.employee_epf_no || 'N/A', 
      etfNo: row.etf_number || 'N/A', 
      is_processed: row.is_processed 
    };
  };

  // --- Formatting ---
  const formatCurrency = (n) => `Rs ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // --- Selection Handlers ---
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all visible and UNPROCESSED employees
      const allIds = rows.filter(r => !r.is_processed).map(r => r.employee_id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };
  
  const toggleSelect = (id, isProcessed) => {
    if (isProcessed) return; // Cannot select/unselect processed records

    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // --- Process Payment Action ---
  const handleProcessPayment = async () => {
    if (selectedIds.size === 0) return alert("Please select employees to process.");
    
    // Filter to ensure only employees with an EPF number AND are not already processed are included
    const eligibleIds = Array.from(selectedIds).filter(id => {
        const employee = rows.find(r => r.employee_id === id);
        return employee && (employee.epf_number || employee.employee_epf_no) && !employee.is_processed;
    });

    if(eligibleIds.length === 0) {
        return alert("Selected employees either lack EPF numbers or are already processed.");
    }

    if (!window.confirm(`Proceed to process ETF/EPF for ${eligibleIds.length} employees for ${period}?`)) return;

    setProcessing(true);
    setErrorMessage("");

    try {
      const [year, month] = period.split('-');
      const payload = {
        month: Number(month),
        year: Number(year),
        employee_ids: eligibleIds
      };
      
      const res = await etfEpfApi.processPayment(payload);
      
      if(res.ok) {
         alert(res.message || `Processing successful for ${res.processed_count} employees.`);
      } else {
         throw new Error(res.message || "Processing failed at the server.");
      }
      
      fetchData(); // Refresh data
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message || "Failed to process payment.");
      // alert(e.message || "Failed to process payment."); // Removed redundant alert
    } finally {
      setProcessing(false);
    }
  };

  // --- Totals for Summary (only for SELECTED items) ---
  const totals = useMemo(() => {
    let tGross = 0, tEpfEmp = 0, tEpfComp = 0, tEtf = 0;
    
    rows.forEach(r => {
        if (selectedIds.has(r.employee_id)) {
            const vals = calculateValues(r);
            tGross += vals.gross;
            tEpfEmp += vals.epfEmployee;
            tEpfComp += vals.epfEmployer;
            tEtf += vals.etfAmount;
        }
    });

    return { tGross, tEpfEmp, tEpfComp, tEtf };
  }, [rows, selectedIds]);


  // Count of UNPROCESSED items currently visible
  const pendingCount = useMemo(() => rows.filter(r => !r.is_processed).length, [rows]);
  
  return (
    <Layout>
      <div style={{ flexShrink: 0 }}>
        <PageHeader
          breadcrumb={["Salary & Compensation", "ETF/EPF Process"]}
          title="Salary & Compensation"
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
              className={`btn ${window.location.pathname === tab.path ? "btn-primary" : "btn-soft"}`}
              onClick={() => navigate(tab.path)}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Actions & Filters */}
        <div className="card" style={{borderRadius: "0 0 8px 8px"}}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                  Select Payroll Period
                </label>
                <input
                  type="month"
                  className="input"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
              <div style={{ marginTop: "20px", fontSize: "13px", color: "var(--muted)" }}>
                Showing **{rows.length}** eligible employee(s) based on joining date. 
                <span style={{fontWeight:'600', color: pendingCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  ({pendingCount} pending)
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ textAlign: "right", marginRight: "12px" }}>
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>Total EPF+ETF Payable (Selected)</div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--brand)" }}>
                  {formatCurrency(totals.tEpfEmp + totals.tEpfComp + totals.tEtf)}
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleProcessPayment} 
                disabled={processing || selectedIds.size === 0}
              >
                {processing ? "Processing..." : `Process for ${selectedIds.size} Emp`}
              </button>
            </div>
          </div>
        </div>
        
        {errorMessage && (
          <div className="card" style={{ color: "var(--danger)", background: "#fef2f2" }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* EPF SECTION */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", backgroundColor: "#f8f9fa" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "#333" }}>EPF Contributions (Employee & Employer)</h3>
          </div>
          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input 
                      type="checkbox" 
                      onChange={toggleSelectAll} 
                      // Check if all pending items are selected
                      checked={pendingCount > 0 && selectedIds.size === pendingCount}
                      disabled={loading || rows.length === 0}
                    />
                  </th>
                  <th>Employee</th>
                  <th>EPF No</th>
                  <th style={{textAlign: 'right'}}>Gross Salary for EPF</th>
                  <th style={{textAlign: 'right'}}>Emp. Share ({rows[0]?.epf_contribution_rate || 8.00}%)</th>
                  <th style={{textAlign: 'right'}}>Employer Share ({rows[0]?.employer_epf_rate || 12.00}%)</th>
                  <th style={{textAlign: 'right'}}>Total EPF</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{textAlign: "center", padding: "20px"}}>Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan="8" style={{textAlign: "center", padding: "20px"}}>No eligible employees found for this period.</td></tr>
                ) : (
                  rows.map(row => {
                    const vals = calculateValues(row);
                    const isSelected = selectedIds.has(row.employee_id);
                    const isDisabled = row.is_processed;
                    return (
                      <tr key={`epf-${row.employee_id}`} style={{ backgroundColor: isSelected ? "var(--soft)" : "transparent" }}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => toggleSelect(row.employee_id, isDisabled)}
                            disabled={isDisabled}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: "600" }}>{row.full_name}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{row.department_name} | {row.employee_code}</div>
                        </td>
                        <td>{vals.epfNo}</td>
                        <td style={{textAlign: 'right'}}>{formatCurrency(vals.gross)}</td>
                        <td style={{textAlign: 'right', color: "var(--danger)"}}>{formatCurrency(vals.epfEmployee)}</td>
                        <td style={{textAlign: 'right', color: "var(--success)"}}>{formatCurrency(vals.epfEmployer)}</td>
                        <td style={{textAlign: 'right', fontWeight: "700"}}>{formatCurrency(vals.totalEpf)}</td>
                        <td>
                          <span className={`pill ${isDisabled ? "pill-ok" : "pill-warn"}`}>
                            {isDisabled ? "Processed" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "700" }}>
                    <td colSpan="3" style={{ textAlign: "right" }}>Totals (All Employees in Period):</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(rows.reduce((sum, r) => sum + calculateValues(r).gross, 0))}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(rows.reduce((sum, r) => sum + calculateValues(r).epfEmployee, 0))}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(rows.reduce((sum, r) => sum + calculateValues(r).epfEmployer, 0))}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(rows.reduce((sum, r) => sum + calculateValues(r).totalEpf, 0))}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ETF SECTION */}
        <div className="card" style={{ padding: 0, marginBottom: "24px" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", backgroundColor: "#f8f9fa" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", margin: 0, color: "#333" }}>ETF Contributions (Employer Only)</h3>
          </div>
          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Employee</th>
                  <th>ETF No</th>
                  <th style={{textAlign: 'right'}}>Gross Salary for EPF</th>
                  <th style={{textAlign: 'right'}}>Employer Contribution ({rows[0]?.etf_contribution_rate || 3.00}%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{textAlign: "center", padding: "20px"}}>Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign: "center", padding: "20px"}}>No data.</td></tr>
                ) : (
                  rows.map(row => {
                    const vals = calculateValues(row);
                    const isSelected = selectedIds.has(row.employee_id);
                    const isDisabled = row.is_processed;
                    return (
                      <tr key={`etf-${row.employee_id}`} style={{ backgroundColor: isSelected ? "var(--soft)" : "transparent" }}>
                        <td>{row.employee_id}</td>
                        <td>
                          <div style={{ fontWeight: "600" }}>{row.full_name}</div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{row.department_name} | {row.employee_code}</div>
                        </td>
                        <td>{vals.etfNo}</td>
                        <td style={{textAlign: 'right'}}>{formatCurrency(vals.gross)}</td>
                        <td style={{textAlign: 'right', color: "var(--success)", fontWeight: "600"}}>
                          {formatCurrency(vals.etfAmount)}
                        </td>
                        <td>
                          <span className={`pill ${isDisabled ? "pill-ok" : "pill-warn"}`}>
                            {isDisabled ? "Processed" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "700" }}>
                    <td colSpan="3" style={{ textAlign: "right" }}>Totals (All Employees in Period):</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(rows.reduce((sum, r) => sum + calculateValues(r).gross, 0))}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(rows.reduce((sum, r) => sum + calculateValues(r).etfAmount, 0))}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}