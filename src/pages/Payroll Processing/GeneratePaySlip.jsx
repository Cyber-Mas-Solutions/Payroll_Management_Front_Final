import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";

const GeneratePaySlip = () => {
  // Toggle: Employee / Department
  const [mode, setMode] = useState("employee"); // "employee" | "department"

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("1");
  const [selectedMonth, setSelectedMonth] = useState("January 2025");

  // Generated payslip state
  const [generated, setGenerated] = useState(false);

  // Dummy data (replace with your API/data later)
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
      "January 2025",
      "February 2025",
      "March 2025",
      "April 2025",
      "May 2025",
      "June 2025",
      "July 2025",
      "August 2025",
      "September 2025",
      "October 2025",
      "November 2025",
      "December 2025",
    ],
    []
  );

  // ✅ Filter employees by department
  const filteredEmployees = useMemo(() => {
    if (selectedDepartment === "All Departments") return employees;
    return employees.filter((e) => e.department === selectedDepartment);
  }, [employees, selectedDepartment]);

  // ✅ Ensure selectedEmployeeId is valid after department changes
  useEffect(() => {
    if (!filteredEmployees.length) return;
    const exists = filteredEmployees.some((e) => e.id === selectedEmployeeId);
    if (!exists) setSelectedEmployeeId(filteredEmployees[0].id);
  }, [filteredEmployees, selectedEmployeeId]);

  const selectedEmployee = useMemo(
    () => filteredEmployees.find((e) => e.id === selectedEmployeeId) || filteredEmployees[0],
    [filteredEmployees, selectedEmployeeId]
  );

  // Payslip mock values (keep your original layout)
  const payPeriod = selectedMonth; // you wanted month filter
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

  const totalEarnings = earnings.reduce((sum, x) => sum + x.amount, 0); // 6800
  const totalDeductionsSummary = 1150; // for the summary box
  const netPay = totalEarnings - totalDeductionsSummary; // 5650

  const fmt = (n) => `$${Number(n).toLocaleString()}`;

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Placeholder: wire to your PDF generator later
    alert("Download action (wire this to PDF generation).");
  };

  const handleDownloadAsPDF = () => {
    // Placeholder
    alert("Download as PDF (wire this to PDF generation).");
  };

  return (
    <Layout>
      <PageHeader breadcrumb={["Payroll", "Generate Pay Slip"]} title="Generate Pay Slip" />

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          {/* Left: Selection Options */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Selection Options</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
              Select employee, department and month to generate pay slips
            </div>

            {/* Mode toggle */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => setMode("employee")}
                style={{
                  border: mode === "employee" ? "1px solid var(--brand)" : "1px solid var(--border)",
                  background: mode === "employee" ? "rgba(25,118,210,0.08)" : "var(--soft)",
                }}
              >
                Employee
              </button>
              <button
                type="button"
                className="btn btn-soft"
                onClick={() => setMode("department")}
                style={{
                  border: mode === "department" ? "1px solid var(--brand)" : "1px solid var(--border)",
                  background: mode === "department" ? "rgba(25,118,210,0.08)" : "var(--soft)",
                }}
              >
                Department
              </button>
            </div>

            {/* ✅ Filters row: Employee + Department + Month */}
            <div className="grid-3" style={{ gap: 16 }}>
              {/* Employee */}
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Select Employee</div>
                <select
                  className="select"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  disabled={mode !== "employee"}
                >
                  {filteredEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
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
                {selectedDepartment !== "All Departments" && filteredEmployees.length === 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "red" }}>
                    No employees found in {selectedDepartment}
                  </div>
                )}
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
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <button className="btn btn-soft" onClick={handleGenerate} disabled={!filteredEmployees.length}>
                📄 Generate Pay slip
              </button>
            </div>
          </div>
        </div>

        {/* Review + Actions */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Pay Slip Review</div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn btn-soft" onClick={handleDownloadAsPDF}>
                ⬇ Download as PDF
              </button>
            </div>
          </div>

          {/* Payslip Card */}
          <div className="card" style={{ margin: "14px 0 0 0", padding: 0, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: 18, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontWeight: 800 }}>ABC Corporation</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  123 Business Ave, Galle road,
                  <br />
                  Colombo 03
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>PAY SLIP</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                  Pay Period: {payPeriod}
                  <br />
                  Pay Date: {payDate}
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: 18 }}>
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
                      <div>
                        {selectedDepartment === "All Departments"
                          ? (selectedEmployee?.department || "-")
                          : selectedDepartment}
                      </div>

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
                          {/* keeping your original (even though logically it should be total deductions) */}
                          <td style={{ textAlign: "right", fontWeight: 800 }}>{fmt(totalEarnings)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer net pay + action buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-soft" onClick={handlePrint}>
                    🖨 Print
                  </button>
                  <button className="btn btn-soft" onClick={handleDownload}>
                    ⬇ Download
                  </button>
                </div>

                <div style={{ fontSize: 22, fontWeight: 900, color: "green" }}>
                  Net Pay: {fmt(netPay)}
                </div>
              </div>

              {!generated && (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                  Tip: Select <strong>Department</strong> to filter employees, choose <strong>Month</strong>, then click{" "}
                  <strong>Generate Pay slip</strong>.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GeneratePaySlip;
