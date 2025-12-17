import React, { useEffect, useMemo, useState, useRef } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import { apiGet } from "../../services/api"; // Corrected path assumption



// Utility function for formatting currency (Rs/LKR format)
const formatCurrency = (n) => `Rs ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

// Utility function to convert YYYY-MM to a display label
const formatMonthLabel = (yyyyMM) => {
    if (!yyyyMM) return 'N/A';
    try {
        const [year, month] = yyyyMM.split('-');
        const date = new Date(year, month - 1, 1);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    } catch {
        return yyyyMM;
    }
}

const GeneratePaySlip = () => {
    const payslipRef = useRef(null);
    const fmt = formatCurrency;

    // --- State Management ---
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    
    // Use YYYY-MM format for state
    const today = new Date();
    const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth); 

    // Payslip Data
    const [generated, setGenerated] = useState(false);
    const [payslipData, setPayslipData] = useState(null); 

    /* ----------------------------------------------------
    // 1. Initial Data Fetch: Employees and Departments
    ---------------------------------------------------- */
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch Employees and Departments in parallel
                const [empResp, deptResp] = await Promise.all([
                    apiGet('/salary/employees'), 
                    apiGet('/salary/departments'), 
                ]);
                
                // Use robust null checks on API response structure
                const empList = empResp?.data || [];
                const deptList = deptResp?.data || [];

                const formattedEmployees = empList.map(e => ({
                    id: String(e.employee_id),
                    label: `${e.full_name} - ${e.department_name}`,
                    name: e.full_name,
                    // Use robust property access with fallback
                    position: e.position || 'N/A', 
                    department: e.department_name || 'N/A',
                    department_id: e.department_id,
                    employee_code: e.employee_code,
                }));

                setEmployees(formattedEmployees);
                setDepartments(deptList);

                // Set the default employee ID only if we successfully got employees
                if (formattedEmployees.length > 0) {
                    setSelectedEmployeeId(String(formattedEmployees[0].id));
                }

            } catch (e) {
                console.error("Failed to fetch initial setup data:", e);
                setEmployees([]);
                setDepartments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    /* ----------------------------------------------------
    // 2. Filtered Employee List
    ---------------------------------------------------- */
    const filteredEmployees = useMemo(() => {
        if (!selectedDepartmentId) return employees;
        return employees.filter((e) => String(e.department_id) === String(selectedDepartmentId));
    }, [employees, selectedDepartmentId]);

    // Update selected employee ID if the filter removes the currently selected one
    useEffect(() => {
        if (!filteredEmployees.length) {
            setSelectedEmployeeId("");
            return;
        }
        const exists = filteredEmployees.some((e) => e.id === selectedEmployeeId);
        if (!exists) {
            setSelectedEmployeeId(filteredEmployees[0].id);
        }
    }, [filteredEmployees, selectedEmployeeId]);

    const selectedEmployee = useMemo(
        () => employees.find((e) => e.id === selectedEmployeeId),
        [employees, selectedEmployeeId]
    );

    /* ----------------------------------------------------
    // 3. API Call Handler (Generate Payslip)
    ---------------------------------------------------- */
    const handleGeneratePayslip = async () => {
        if (!selectedEmployeeId || !selectedMonth) {
            alert("Please select an employee and a month.");
            return;
        }

        setLoading(true);
        setGenerated(false);
        setPayslipData(null);
        
        const [year, month] = selectedMonth.split('-');

        try {
            const response = await apiGet(`/salary/payslip/${selectedEmployeeId}/${year}/${month}`);
            
            if (response.ok && response.data) {
                setPayslipData(response.data);
                setGenerated(true);
            } else {
                // If response is NOT ok, display the message returned by the backend
                alert(response.message || "Failed to fetch payslip data. Ensure salary and earnings data exists for the period.");
                setPayslipData(null);
            }
        } catch (error) {
            console.error("Error fetching payslip:", error);
            alert("An error occurred while fetching the payslip: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    /* ----------------------------------------------------
    // 4. Data Mapping and Calculation
    ---------------------------------------------------- */
    
    const employeeDetails = payslipData?.employee || {};
    const payroll = payslipData?.payslip || { earnings: [], deductions: [], totals: {} };
    
    // Earnings: Filter out Basic Salary as it's displayed separately
    const earningsList = payroll.earnings.filter(e => e.name !== 'Basic Salary' && Number(e.amount) > 0);
    const basicSalary = payroll.earnings.find(e => e.name === 'Basic Salary')?.amount || 0;
    const deductionsList = payroll.deductions.filter(d => Number(d.amount) > 0);

    const totalEarnings = payroll.totals.grossSalary || 0;
    const totalDeductions = payroll.totals.totalDeductions || 0;
    const netPay = payroll.totals.netSalary || Number(totalEarnings) - Number(totalDeductions);
    
    const displayMonthLabel = formatMonthLabel(selectedMonth);
    const payDate = `${displayMonthLabel} (End of Period)`; 
    
    /* ----------------------------------------------------
    // 5. Action Handlers (Print/PDF)
    ---------------------------------------------------- */

    const handlePrint = () => {
        if (!payslipRef.current) return;
        window.print();
    };

    const handleDownloadAsPDF = async () => {
        if (!payslipData || !selectedEmployeeId) {
            alert("Please generate a payslip first.");
            return;
        }
        
        const [year, month] = selectedMonth.split('-');
        
        try {
            const url = `/api/salary/payslip?employee_id=${selectedEmployeeId}&month=${month}&year=${year}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error("Failed to generate PDF on server. Status: " + response.status);
            
            const blob = await response.blob();
            
            const disposition = response.headers.get('Content-Disposition');
            let filename = `payslip_${employeeDetails.full_name || 'employee'}_${year}_${month}.pdf`;
            if (disposition && disposition.indexOf('filename=') !== -1) {
                filename = disposition.split('filename=')[1].replace(/"/g, '');
            }

            const href = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = href;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
            
        } catch (error) {
            console.error("PDF download error:", error);
            alert("Error downloading PDF: " + error.message);
        }
    };


    /* ----------------------------------------------------
    // 6. Payslip Display Component
    ---------------------------------------------------- */
    
    const PayslipContent = () => (
        <div ref={payslipRef} className="payslip-card-inner-content">
            
            {/* Header */}
            <div style={{ padding: 18, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 16 }}>
                <div>
                    <div style={{ fontWeight: 800 }}>ABC Corporation</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                        123 Business Ave, Galle road,<br />Colombo 03
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>PAY SLIP</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                        Pay Period: {displayMonthLabel}
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
                                
                                <div style={{ color: "var(--muted)", fontWeight: 600 }}>Employee Code</div>
                                <div>:</div>
                                <div>{employeeDetails.employee_code || selectedEmployee?.employee_code || 'N/A'}</div>

                                <div style={{ color: "var(--muted)", fontWeight: 600 }}>Name</div>
                                <div>:</div>
                                <div>{employeeDetails.full_name || selectedEmployee?.name || 'N/A'}</div>

                                <div style={{ color: "var(--muted)", fontWeight: 600 }}>Position</div>
                                <div>:</div>
                                <div>{employeeDetails.position || selectedEmployee?.position || 'N/A'}</div>

                                <div style={{ color: "var(--muted)", fontWeight: 600 }}>Department</div>
                                <div>:</div>
                                <div>{employeeDetails.department_name || selectedEmployee?.department || 'N/A'}</div>

                                <div style={{ color: "var(--muted)", fontWeight: 600 }}>NIC</div>
                                <div>:</div>
                                <div>{employeeDetails.nic || 'N/A'}</div>
                                
                                <div style={{ color: "var(--muted)", fontWeight: 600 }}>EPF/ETF No</div>
                                <div>:</div>
                                <div>{employeeDetails.epf_no || 'N/A'} / {employeeDetails.etf_no || 'N/A'}</div>
                                
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 10 }}>Payment Summary</div>
                        <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "#fafafa" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                                <span style={{ color: "var(--muted)" }}>Gross Earnings:</span>
                                <strong>{fmt(totalEarnings)}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                                <span style={{ color: "var(--muted)" }}>Total Deductions:</span>
                                <strong>{fmt(totalDeductions)}</strong>
                            </div>
                            <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                                <span style={{ fontWeight: 700 }}>NET PAYABLE:</span>
                                <strong style={{ color: "var(--success)" }}>{fmt(netPay)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Earnings + Deductions tables */}
                <div className="grid-2" style={{ marginTop: 18 }}>
                    
                    {/* Earnings */}
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 10 }}>Earnings</div>

                        <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                            <table className="table" style={{ margin: 0 }}>
                                <thead>
                                    <tr>
                                        <th>DESCRIPTION</th>
                                        <th style={{ textAlign: "right" }}>AMOUNT (Rs)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Basic Salary (Separate line) */}
                                    <tr>
                                        <td>Basic Salary</td>
                                        <td style={{ textAlign: "right" }}>{fmt(basicSalary)}</td>
                                    </tr>
                                    
                                    {/* Other Earnings (Allowances, OT, Bonus) */}
                                    {earningsList.length === 0 && basicSalary === 0 && (
                                        <tr><td colSpan={2} style={{ color: "var(--muted)", textAlign: "center" }}>No recorded earnings this month.</td></tr>
                                    )}
                                    {earningsList.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.name || row.reason || row.type}</td>
                                            <td style={{ textAlign: "right" }}>{fmt(row.amount)}</td>
                                        </tr>
                                    ))}
                                    
                                    <tr>
                                        <td style={{ fontWeight: 800 }}>Total Gross Earnings</td>
                                        <td style={{ textAlign: "right", fontWeight: 800 }}>{fmt(totalEarnings)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div>
                        <div style={{ fontWeight: 700, marginBottom: 10 }}>Deductions</div>

                        <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                            <table className="table" style={{ margin: 0 }}>
                                <thead>
                                    <tr>
                                        <th>DESCRIPTION</th>
                                        <th style={{ textAlign: "right" }}>AMOUNT (Rs)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deductionsList.length === 0 && (
                                        <tr><td colSpan={2} style={{ color: "var(--muted)", textAlign: "center" }}>No recorded deductions this month.</td></tr>
                                    )}
                                    {deductionsList.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.name}</td>
                                            <td style={{ textAlign: "right", color: 'var(--danger)' }}>{fmt(row.amount)}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td style={{ fontWeight: 800 }}>Total Deductions</td>
                                        <td style={{ textAlign: "right", fontWeight: 800, color: 'var(--danger)' }}>{fmt(totalDeductions)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Employer Contributions (EPF/ETF) */}
                        <div style={{ fontWeight: 700, marginTop: 20, marginBottom: 10 }}>Employer Contributions (Not Deducted)</div>
                        <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                            <table className="table" style={{ margin: 0 }}>
                                <tbody>
                                    <tr>
                                        <td>Employer EPF Contribution (12%)</td>
                                        <td style={{ textAlign: "right" }}>{fmt(payroll.totals.employerEPF || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td>Employer ETF Contribution (3%)</td>
                                        <td style={{ textAlign: "right" }}>{fmt(payroll.totals.employerETF || 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                    </div>
                </div>
                
                {/* Footer net pay */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "var(--success)" }}>
                        Net Pay: {fmt(netPay)}
                    </div>
                </div>
            </div>
        </div>
    );


    return (
        <Layout>
            <PageHeader breadcrumb={["Salary & Compensation", "Generate Pay Slip"]} title="Generate Pay Slip" />

            <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    
                    {/* Left: Selection Options */}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Selection Options</div>
                        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
                            Select employee and month to generate the pay slip.
                        </div>

                        {/* Mode button for consistency */}
                        <div style={{ display: "flex", justifyContent: "flex-start", gap: 10, marginBottom: 14 }}>
                            <button type="button" className="btn btn-primary" style={{ cursor: 'default' }}>
                                Employee Mode
                            </button>
                        </div>

                        {/* Filters row: Employee + Department + Month */}
                        <div className="grid-3" style={{ gap: 16 }}>
                            {/* Employee */}
                            <div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Select Employee</div>
                                <select
                                    className="select"
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    disabled={loading || !filteredEmployees.length}
                                >
                                    {loading && <option value="">Loading...</option>}
                                    {!loading && !filteredEmployees.length && <option value="">No Employees</option>}
                                    {filteredEmployees.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.name} ({e.department})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Department */}
                            <div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Filter by Department</div>
                                <select
                                    className="select"
                                    value={selectedDepartmentId}
                                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Month */}
                            <div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>Select Month</div>
                                <input
                                    className="input"
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: 18 }}>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleGeneratePayslip} 
                                disabled={!selectedEmployeeId || loading || !selectedMonth}
                            >
                                {loading ? 'Processing...' : '📄 Generate Pay slip'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Review + Actions */}
                <div style={{ marginTop: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>Pay Slip Review</div>

                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <button className="btn btn-soft" onClick={handlePrint} disabled={!generated}>
                                🖨 Print
                            </button>
                            <button className="btn btn-soft" onClick={handleDownloadAsPDF} disabled={!generated}>
                                ⬇ Download as PDF
                            </button>
                        </div>
                    </div>

                    {/* Payslip Card */}
                    <div className="card" style={{ margin: "14px 0 0 0", padding: 0, overflow: "hidden" }}>
                        {generated && payslipData ? (
                            <PayslipContent />
                        ) : (
                            <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>
                                {loading ? 'Loading payroll data...' : 'Select criteria and click "Generate Pay slip" to view the payslip.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default GeneratePaySlip;