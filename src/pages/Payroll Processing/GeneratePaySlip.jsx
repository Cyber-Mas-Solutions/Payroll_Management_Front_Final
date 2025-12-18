import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";

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

  // Toggle: Employee / Department
  const [mode, setMode] = useState("employee"); // "employee" | "department"

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("1");
  const [employeeIdFilter, setEmployeeIdFilter] = useState(""); // ✅ NEW
  const [selectedMonth, setSelectedMonth] = useState("January 2025");

  // Generated payslip state
  const [generated, setGenerated] = useState(false);

  // Dummy data
  const employees = useMemo(
    () => [
      { id: "1", label: "Rashmi - HR", name: "Rashmi Samadara", position: "HR Manager", department: "HR Department" },
      { id: "2", label: "Nadun - HR", name: "Nadun Perera", position: "HR Executive", department: "HR Department" },
      { id: "3", label: "Malith - Finance", name: "Malith Malinga", position: "Accountant", department: "Finance Department" },
    ],
    []
  );

  const departments = useMemo(
    () => ["All Departments", "HR Department", "Finance Department", "IT Department"],
    []
  );

  const months = useMemo(
    () => [
      "January 2025", "February 2025", "March 2025", "April 2025", "May 2025", "June 2025",
      "July 2025", "August 2025", "September 2025", "October 2025", "November 2025", "December 2025",
    ],
    []
  );

  // Filter employees by department + employee ID
  const filteredEmployees = useMemo(() => {
    let list = employees;

    if (selectedDepartment !== "All Departments") {
      list = list.filter((e) => e.department === selectedDepartment);
    }

    if (employeeIdFilter.trim()) {
      list = list.filter((e) => e.id.includes(employeeIdFilter.trim()));
    }

    return list;
  }, [employees, selectedDepartment, employeeIdFilter]);

  // Ensure selected employee is valid
  useEffect(() => {
    if (!filteredEmployees.length) return;
    const exists = filteredEmployees.some((e) => e.id === selectedEmployeeId);
    if (!exists) setSelectedEmployeeId(filteredEmployees[0].id);
  }, [filteredEmployees, selectedEmployeeId]);

  const selectedEmployee = useMemo(
    () => filteredEmployees.find((e) => e.id === selectedEmployeeId) || filteredEmployees[0],
    [filteredEmployees, selectedEmployeeId]
  );

  // Payslip values
  const payPeriod = selectedMonth;
  const payDate = "April 5, 2025";

  const earnings = useMemo(
    () => [
      { desc: "Basic Salary", amount: 5000 },
      { desc: "Other", amount: 1000 },
      { desc: "Transportation", amount: 500 },
      { desc: "Medical", amount: 300 },
    ],
    []
  );

  const deductions = useMemo(
    () => [
      { desc: "Uupaid Leave", amount: 5000 },
      { desc: "Short Leave", amount: 1000 },
      { desc: "EPF Deduction", amount: 500 },
      { desc: "Loans", amount: 300 },
    ],
    []
  );

  const totalEarnings = earnings.reduce((sum, x) => sum + x.amount, 0);
  const totalDeductionsSummary = 1150;
  const netPay = totalEarnings - totalDeductionsSummary;

  const fmt = (n) => `$${Number(n).toLocaleString()}`;

  const handleGenerate = () => setGenerated(true);
  const handlePrint = () => window.print();
  const handleDownload = () => alert("Download action (wire this to PDF generation).");
  const handleDownloadAsPDF = () => alert("Download as PDF (wire this to PDF generation).");

  return (
    <Layout>
      <PageHeader breadcrumb={["Payroll", "Generate Pay Slip"]} title="Generate Pay Slip" />

      {/* ================= TAB BAR ================= */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
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

      {/* ================= PAYSLIP FILTERS + GENERATE ================= */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
          Select employee, department and month to generate pay slips
        </div>

        {/* Filters */}
        <div className="grid-3" style={{ gap: 16 }}>
          {/* Employee */}
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Filter by Employee ID</div>
            <input
              className="input"
              placeholder="Enter Employee ID"
              value={employeeIdFilter}
              onChange={(e) => setEmployeeIdFilter(e.target.value)}
              disabled={mode !== "employee"}
              style={{ marginBottom: 8 }}
            />
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Select Employee</div>
            <select
              className="select"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              disabled={mode !== "employee"}
            >
              {filteredEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} - {e.name} ({e.department})
                </option>
              ))}
            </select>
            {mode !== "employee" && (
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                Employee selection disabled in Department mode.
              </div>
            )}
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
                <option key={d} value={d}>
                  {d}
                </option>
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
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button className="btn btn-soft" onClick={handleGenerate} disabled={!filteredEmployees.length}>
            📄 Generate Pay slip
          </button>
        </div>

        {/* ================= PAYSLIP REVIEW ================= */}
        {generated && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Pay Slip Review</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button className="btn btn-soft" onClick={handleDownloadAsPDF}>⬇ Download as PDF</button>
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
                    Pay Month: {payPeriod}<br />
                    Pay Date: {payDate}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ marginTop: 18 }}>
                {/* Employee & Payment Summary */}
                <div className="grid-2" style={{ alignItems: "start" }}>
                  {/* Employee Details */}
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Employee Details</div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "#fafafa" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "110px 10px 1fr", rowGap: 10, columnGap: 8, fontSize: 13 }}>
                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Employee ID</div>
                        <div>:</div>
                        <div>{mode === "employee" ? selectedEmployeeId : "-"}</div>

                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Name</div>
                        <div>:</div>
                        <div>{mode === "employee" ? selectedEmployee?.name : "Department Payslip"}</div>

                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Position</div>
                        <div>:</div>
                        <div>{mode === "employee" ? selectedEmployee?.position : "-"}</div>

                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Department</div>
                        <div>:</div>
                        <div>{selectedDepartment === "All Departments" ? (selectedEmployee?.department || "-") : selectedDepartment}</div>

                        <div style={{ color: "var(--muted)", fontWeight: 600 }}>Month</div>
                        <div>:</div>
                        <div>{selectedMonth}</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>Payment Summary</div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "#fafafa" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                        <span style={{ color: "var(--muted)" }}>Total Earnings:</span>
                        <strong>{fmt(totalEarnings)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                        <span style={{ color: "var(--muted)" }}>Total Deductions:</span>
                        <strong>{fmt(totalDeductionsSummary)}</strong>
                      </div>
                      <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                        <span style={{ fontWeight: 700 }}>Net Pay:</span>
                        <strong style={{ color: "green" }}>{fmt(netPay)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings + Deductions tables */}
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
                          {earnings.map((row) => (
                            <tr key={row.desc}>
                              <td>{row.desc}</td>
                              <td style={{ textAlign: "right" }}>{fmt(row.amount)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td style={{ fontWeight: 800 }}>Total Earnings</td>
                            <td style={{ textAlign: "right", fontWeight: 800 }}>{fmt(totalEarnings)}</td>
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
                          {deductions.map((row) => (
                            <tr key={row.desc}>
                              <td>{row.desc}</td>
                              <td style={{ textAlign: "right" }}>{fmt(row.amount)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td style={{ fontWeight: 800 }}>Total Deduction</td>
                            <td style={{ textAlign: "right", fontWeight: 800 }}>{fmt(totalDeductionsSummary)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-soft" onClick={handlePrint}>🖨 Print</button>
                    <button className="btn btn-soft" onClick={handleDownload}>⬇ Download</button>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "green" }}>
                    Net Pay: {fmt(netPay)}
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
