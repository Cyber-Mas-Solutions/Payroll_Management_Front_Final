// src/pages/Payroll Processing/GeneratePaySlip.jsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet, apiPost } from "../../services/api";

const GeneratePaySlip = () => {
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

  // State variables
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Fetch departments and employees on mount
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const res = await apiGet('/salary/departments');
      setDepartments([{ id: 'all', name: 'All Departments' }, ...(res.data || [])]);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const params = {};
      if (selectedDepartment !== 'all') {
        params.department_id = selectedDepartment;
      }
      const res = await apiGet('/salary/employees', { params });
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  // ================= FILTER LOGIC =================
  // Filters employees by Code, ID, or Name
  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (employeeIdFilter.trim()) {
      const search = employeeIdFilter.toLowerCase();
      list = list.filter(e => 
        String(e.employee_code || "").toLowerCase().includes(search) ||
        String(e.employee_id || "").includes(search) ||
        String(e.full_name || "").toLowerCase().includes(search)
      );
    }
    return list;
  }, [employees, employeeIdFilter]);

  // AUTO-SELECT: When the filtered list changes, update selection to the first match
  useEffect(() => {
    if (filteredEmployees.length > 0) {
      const isStillVisible = filteredEmployees.find(e => String(e.employee_id) === String(selectedEmployeeId));
      if (!isStillVisible) {
        setSelectedEmployeeId(filteredEmployees[0].employee_id);
      }
    } else {
      setSelectedEmployeeId("");
    }
  }, [filteredEmployees, selectedEmployeeId]);

  const fetchPayrollData = async () => {
    if (!selectedEmployeeId || !selectedMonth) return;
    const [year, month] = selectedMonth.split('-');
    setLoading(true);
    try {
      const res = await apiGet(`/payroll/employee-payroll-data?employee_id=${selectedEmployeeId}&month=${month}&year=${year}`);
      if (res.ok) {
        setPayrollData(transformPayrollData(res));
      } else {
        setPayrollData(null);
      }
    } catch (err) {
      console.error('Error:', err);
      setPayrollData(null);
    } finally {
      setLoading(false);
    }
  };

  const transformPayrollData = (apiResponse) => {
    if (!apiResponse || !apiResponse.data) return null;
    const data = apiResponse.data;
    return {
      employee: { ...data.employee, basic_salary: data.employee.basic_salary || 0 },
      period: data.period,
      earnings: data.earnings,
      deductions: data.deductions,
      employer_contributions: data.employer_contributions,
      summary: data.summary
    };
  };

  const handleGenerate = () => {
    if (!selectedEmployeeId || !selectedMonth) {
      alert('Please select an employee and month');
      return;
    }
    setGenerated(true);
    fetchPayrollData();
  };

  const handleDownloadPDF = async () => {
    const [year, month] = selectedMonth.split('-');
    window.open(`${process.env.VITE_API_URL || 'http://localhost:4000'}/api/payroll/generate-payslip-pdf?employee_id=${selectedEmployeeId}&month=${month}&year=${year}`, '_blank');
  };

  const handlePrint = () => window.print();

  const formatCurrency = (amount) => {
    return `Rs ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleString('default', { month: 'long' });
      result.push({ value: `${year}-${month}`, label: `${monthName} ${year}` });
    }
    return result;
  }, []);

  return (
    <Layout>
      <PageHeader breadcrumb={["Payroll", "Generate Pay Slip"]} title="Generate Pay Slip" />

      {/* ================= TAB BAR ================= */}
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

      {/* ================= PAYSLIP FILTERS ================= */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
          Select employee, department and month to generate pay slips
        </div>

        <div className="grid-3" style={{ gap: 16 }}>
          {/* Employee Filter & Select */}
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Search Employee ID/Name</div>
            <input
              className="input"
              placeholder="Enter Employee ID or Name"
              value={employeeIdFilter}
              onChange={(e) => setEmployeeIdFilter(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Select Employee</div>
            <select
              className="select"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={filteredEmployees.length === 0}
            >
              {filteredEmployees.length === 0 ? (
                <option value="">No employees found</option>
              ) : (
                filteredEmployees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.employee_code} - {e.full_name} ({e.department_name || 'No Dept'})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Department */}
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Select Department</div>
            <select
              className="select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Select Month</div>
            <select
              className="select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate} 
            disabled={!selectedEmployeeId || loading}
          >
            {loading ? 'Loading...' : '📄 Generate Payslip'}
          </button>
        </div>

        {/* ================= PAYSLIP REVIEW (RESTORED) ================= */}
        {generated && payrollData && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Pay Slip Review</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button className="btn btn-primary" onClick={handleDownloadPDF}>⬇ Download as PDF</button>
                <button className="btn btn-soft" onClick={handlePrint}>🖨 Print</button>
              </div>
            </div>

            <div className="card" style={{ margin: "14px 0 0 0", padding: 18, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ paddingBottom: 18, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>ABC Corporation</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                    123 Business Ave, Galle road,<br />
                    Colombo 03
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>PAY SLIP</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                    Pay Month: {payrollData.period.month_name} {payrollData.period.year}<br />
                    Pay Date: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ marginTop: 18 }}>
                <div className="grid-2" style={{ alignItems: "start" }}>
                  {/* Employee Details */}
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Employee Details</div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "#fafafa" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "110px 10px 1fr", rowGap: 10, columnGap: 8, fontSize: 13 }}>
                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Employee ID</div>
                        <div>:</div>
                        <div>{payrollData.employee.employee_code}</div>

                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Name</div>
                        <div>:</div>
                        <div>{payrollData.employee.full_name}</div>

                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Position</div>
                        <div>:</div>
                        <div>{payrollData.employee.designation || '-'}</div>

                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Department</div>
                        <div>:</div>
                        <div>{payrollData.employee.department || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Payment Summary</div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "#fafafa" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                        <span style={{ color: "var(--muted)" }}>Total Earnings:</span>
                        <strong>{formatCurrency(payrollData.summary.gross_salary)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                        <span style={{ color: "var(--muted)" }}>Total Deductions:</span>
                        <strong>{formatCurrency(payrollData.summary.total_deductions)}</strong>
                      </div>
                      <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span style={{ fontWeight: 700 }}>Net Pay:</span>
                        <strong style={{ color: "green" }}>{formatCurrency(payrollData.summary.net_salary)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions tables */}
                <div className="grid-2" style={{ marginTop: 18 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Earnings</div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                      <table className="table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th>DESCRIPTION</th>
                            <th style={{ textAlign: "right" }}>AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payrollData.earnings.breakdown.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.description}</td>
                              <td style={{ textAlign: "right" }}>{formatCurrency(row.amount)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td style={{ fontWeight: 800 }}>Total Earnings</td>
                            <td style={{ textAlign: "right", fontWeight: 800 }}>{formatCurrency(payrollData.earnings.total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Deductions</div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                      <table className="table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th>DESCRIPTION</th>
                            <th style={{ textAlign: "right" }}>AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payrollData.deductions.breakdown.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.description}</td>
                              <td style={{ textAlign: "right" }}>{formatCurrency(row.amount)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td style={{ fontWeight: 800 }}>Total Deductions</td>
                            <td style={{ textAlign: "right", fontWeight: 800 }}>{formatCurrency(payrollData.deductions.total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Employer Contributions */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Employer Contributions</div>
                  <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "#fafafa" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
                      <div>
                        <div style={{ color: "var(--muted)", marginBottom: 4 }}>EPF (Employer):</div>
                        <div>{formatCurrency(payrollData.employer_contributions.epf)}</div>
                      </div>
                      <div>
                        <div style={{ color: "var(--muted)", marginBottom: 4 }}>ETF:</div>
                        <div>{formatCurrency(payrollData.employer_contributions.etf)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    Generated on {new Date().toLocaleString()}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "green" }}>
                    Net Pay: {formatCurrency(payrollData.summary.net_salary)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GeneratePaySlip;