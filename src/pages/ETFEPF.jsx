// src/pages/ETFEPF.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet } from "../services/api";
import { etfEpfApi } from '../services/api';

export default function ETFEPF() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [employeeFilter, setEmployeeFilter] = useState("All Employees");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [epfFilter, setEpfFilter] = useState("");
  const [etfFilter, setEtfFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal (For quick edit from table row)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({});

  // Payment History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedEmployeeHistory, setSelectedEmployeeHistory] = useState(null);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState(""); // "EPF" or "ETF"
  const [paymentMonth, setPaymentMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Fetch data
  useEffect(() => {
    fetchETFEPFData();
  }, []);

  const fetchETFEPFData = async () => {
    try {
      setLoading(true);
      setError("");
      const resp = await apiGet("/salary/etf-epf");
      const data = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
      setRows(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load ETF/EPF data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter Logic ---
  const employeeOptions = useMemo(() => ["All Employees", ...Array.from(new Set(rows.map((r) => r.full_name))).filter(Boolean).sort()], [rows]);
  const departmentOptions = useMemo(() => ["All Departments", ...Array.from(new Set(rows.map((r) => r.department || ""))).filter(Boolean).sort()], [rows]);

  const filtered = useMemo(() => {
    let data = rows;
    
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(r => 
        r.full_name?.toLowerCase().includes(q) ||
        r.employee_id?.toString().includes(q) ||
        r.epf_number?.toLowerCase().includes(q) ||
        r.etf_number?.toLowerCase().includes(q)
      );
    }
    
    if (employeeFilter !== "All Employees") data = data.filter((r) => r.full_name === employeeFilter);
    if (departmentFilter !== "All Departments") data = data.filter((r) => (r.department || "") === departmentFilter);
    if (epfFilter.trim()) data = data.filter((r) => r.epf_number?.includes(epfFilter));
    if (etfFilter.trim()) data = data.filter((r) => r.etf_number?.includes(etfFilter));
    
    return data;
  }, [rows, searchTerm, employeeFilter, departmentFilter, epfFilter, etfFilter]);

  const handleResetFilters = () => {
    setEmployeeFilter("All Employees");
    setDepartmentFilter("All Departments");
    setEpfFilter("");
    setEtfFilter("");
    setSearchTerm("");
  };

  // --- Date Formatter ---
  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };
  
  // Handler for table row 'Edit' button
  const handleEdit = (employee) => {
    setEditingRecord(employee);
    setFormData({
      id: employee.id,
      epf_status: employee.epf_status || "Active",
      etf_status: employee.etf_status || "Active",
      epf_number: employee.epf_number,
      etf_number: employee.etf_number
    });
    setShowEditModal(true); 
  };

  // Handler for table row 'Edit' modal submission
  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await etfEpfApi.update(formData.id, formData);
      } else {
        // This case would typically be an 'Add' operation, 
        // but is retained here based on the original structure's update logic for safety.
        await etfEpfApi.create({ ...formData, employee_id: editingRecord.employee_id });
      }
      alert("Updated successfully");
      setShowEditModal(false);
      fetchETFEPFData();
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  // Handler for table row 'Delete' button
  const handleDelete = async (employee) => {
    if (!window.confirm(`Delete ETF/EPF details for ${employee.full_name}?`)) return;
    try {
      await etfEpfApi.delete(employee.id); 
      fetchETFEPFData();
      window.alert("ETF/EPF details deleted successfully");
    } catch (e) {
      console.error(e);
      window.alert("Failed to delete ETF/EPF details");
    }
  };
  
  // Handler for 'Export CSV' button
  const handleExport = () => {
     if (!filtered.length) {
       alert("No data to export.");
       return;
     }
     const csvRows = [];
     const header = [
       "Employee ID", "Employee Name", "Department", "EPF Number", "ETF Number", 
       "EPF Effective Date", "ETF Effective Date", "EPF Status", "ETF Status"
     ];
     csvRows.push(header.join(","));

     filtered.forEach((r) => {
       const row = [
         r.employee_id,
         r.full_name || "",
         r.department || "",
         r.epf_number || "",
         r.etf_number || "",
         r.epf_effective_date || "",
         r.etf_effective_date || "",
         r.epf_status || "",
         r.etf_status || "",
       ];
       csvRows.push(row.join(","));
     });

     const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = `ETF_EPF_Data_${new Date().toISOString().split('T')[0]}.csv`;
     a.click();
     window.URL.revokeObjectURL(url);
  };
  
  // Handler for table row 'View' button
  const handleViewHistory = async (employee) => {
    setSelectedEmployeeHistory(employee);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const resp = await apiGet(`/salary/etf-epf/${employee.employee_id}/history`);
      setHistoryData(resp.data || []);
    } catch (e) {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handler for 'Paid EPF/ETF' buttons
  const handlePaidClick = (type) => {
    setPaymentType(type);
    setShowPaymentModal(true);
  };

  // Handler for 'Process Payment' button in the modal
  const processPayment = () => {
    alert(`Proceeding to ${paymentType} payment for ${paymentMonth}`);
    setShowPaymentModal(false);
  };

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader breadcrumb={["Salary & Compensation", "ETF & EPF"]} title="Salary & Compensation" />

      {/* Fixed Tabs Section (from old code) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "var(--bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
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
          {[
            { label: "Earnings", path: "/earnings" },
            { label: "Deductions", path: "/deductions" },
            { label: "Allowances", path: "/allowances" },
            { label: "Overtime & Adjustments", path: "/overtime-adjustments" },
            { label: "Compensation Adjustment", path: "/compensation-adjustment" },
            { label: "ETF & EPF", path: "/etf-epf" },
            { label: "Unpaid Leaves", path: "/unpaid-leaves" },
            { label: "Net Salary Summary", path: "/net-salary-summary" },
          ].map((t) => (
            <button
              key={t.path}
              className={`btn ${location.pathname === t.path ? "btn-primary" : "btn-soft"}`}
              onClick={() => navigate(t.path)}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Fixed Filters Section (from old code) */}
      <div
        style={{
          position: "sticky",
          top: "56px", 
          zIndex: 90,
          backgroundColor: "var(--bg)",
        }}
      >
        <div className="card">
          <div className="grid-3" style={{ alignItems: "end", marginBottom: "12px" }}>
             {/* Employee Filter */}
             <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Employee
              </label>
              <select className="select" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
                {employeeOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
            
            {/* Department Filter */}
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Department
              </label>
              <select className="select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                {departmentOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* EPF Number Filter */}
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                EPF Number
              </label>
              <input
                className="input"
                placeholder="Filter by EPF number"
                value={epfFilter}
                onChange={(e) => setEpfFilter(e.target.value)}
              />
            </div>

            {/* ETF Number Filter */}
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                ETF Number
              </label>
              <input
                className="input"
                placeholder="Filter by ETF number"
                value={etfFilter}
                onChange={(e) => setEtfFilter(e.target.value)}
              />
            </div>

            {/* Search Input */}
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Search
              </label>
              <input
                className="input"
                placeholder="Name, ID, EPF, ETF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "end", gap: "8px" }}>
              <button className="btn btn-primary" onClick={handleExport} style={{ flex: 1 }}>
                Export CSV
              </button>
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(employeeFilter !== "All Employees" || departmentFilter !== "All Departments" || epfFilter || etfFilter || searchTerm) && (
                <button className="btn btn-soft" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              )}
            </div>
            {/* Payment buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-primary" style={{ backgroundColor: "#059669", borderColor: "#059669" }} onClick={() => handlePaidClick("EPF")}>Paid EPF</button>
              <button className="btn btn-primary" style={{ backgroundColor: "#059669", borderColor: "#059669" }} onClick={() => handlePaidClick("ETF")}>Paid ETF</button>
            </div>
            {/* + Add ETF/EPF button removed */}
          </div>
        </div>
      </div>
      
      {/* Scrollable Table Section */}
      <div className="table-container" style={{ flex: 1 }}>
        <div className="card" style={{ padding: 0 }}>
          {loading ? <div style={{ padding: 20 }}>Loading...</div> : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Dept</th>
                  <th>EPF No</th>
                  <th>ETF No</th>
                  <th>EPF Effective Date</th>
                  <th>ETF Effective Date</th>
                  <th>EPF Status</th>
                  <th>ETF Status</th>
                  <th style={{ width: "180px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.employee_id}> 
                    <td>{emp.employee_id}</td>
                    <td>
                      <div style={{fontWeight:'600'}}>{emp.full_name}</div>
                      <div style={{fontSize:'11px', color:'gray'}}>{emp.designation}</div>
                    </td>
                    <td>{emp.department || "-"}</td>
                    <td>{emp.epf_number || "-"}</td>
                    <td>{emp.etf_number || "-"}</td>
                    
                    <td>{formatDate(emp.epf_effective_date)}</td>
                    <td>{formatDate(emp.etf_effective_date)}</td>
                    
                    <td><span className={`pill ${emp.epf_status === "Active" ? "pill-ok" : "pill-warn"}`}>{emp.epf_status}</span></td>
                    <td><span className={`pill ${emp.etf_status === "Active" ? "pill-ok" : "pill-warn"}`}>{emp.etf_status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button className="btn btn-soft" style={{ fontSize: "12px", padding: "4px 8px" }} onClick={() => handleViewHistory(emp)}>View</button>
                        <button className="btn btn-soft" style={{ fontSize: "12px", padding: "4px 8px" }} onClick={() => handleEdit(emp)}>Edit</button>
                        <button 
                          className="btn btn-soft" 
                          style={{ fontSize: "12px", padding: "4px 8px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                          onClick={() => handleDelete(emp)}
                        >
                            Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="10" style={{textAlign:'center', padding:20}}>No records found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal (For quick edit from table row) */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Edit ETF/EPF Status</h3>
            <div style={{ marginBottom: 10, fontSize: 13, color: 'gray' }}>Employee: {editingRecord?.full_name}</div>
            <form onSubmit={submitEdit}>
              <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                <div><label>EPF Number</label><input className="input" name="epf_number" value={formData.epf_number || ''} onChange={e => setFormData({...formData, epf_number: e.target.value})} /></div>
                <div><label>ETF Number</label><input className="input" name="etf_number" value={formData.etf_number || ''} onChange={e => setFormData({...formData, etf_number: e.target.value})} /></div>
                <div>
                  <label>EPF Status</label>
                  <select className="select" name="epf_status" value={formData.epf_status} onChange={e => setFormData({...formData, epf_status: e.target.value})}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
                <div>
                  <label>ETF Status</label>
                  <select className="select" name="etf_status" value={formData.etf_status} onChange={e => setFormData({...formData, etf_status: e.target.value})}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-soft" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: "600px", width: "100%" }}>
            <h3>Payment History</h3>
            <div style={{ marginBottom: 15 }}>
              <strong>{selectedEmployeeHistory?.full_name}</strong>
            </div>
            {historyLoading ? <div>Loading history...</div> : (
              <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #eee", borderRadius: 4 }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f9fafb' }}>
                    <tr><th>Period</th><th>Paid Date</th><th style={{textAlign:'right'}}>Net Salary</th></tr>
                  </thead>
                  <tbody>
                    {historyData.length > 0 ? historyData.map((h, idx) => (
                      <tr key={idx}>
                        <td>{h.period_year} - {String(h.period_month).padStart(2, '0')}</td>
                        <td>{h.payment_date ? new Date(h.payment_date).toLocaleDateString() : '-'}</td>
                        <td style={{textAlign:'right'}}>{Number(h.net_salary || 0).toFixed(2)}</td>
                      </tr>
                    )) : <tr><td colSpan="3" style={{textAlign:'center', padding:15, color:'gray'}}>No history found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 15 }}>
              <button type="button" className="btn btn-primary" onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: "400px" }}>
            <h3>Process {paymentType} Payment</h3>
            <div style={{ marginBottom: 20 }}>
              <label>Select Month</label>
              <input type="month" className="input" value={paymentMonth} onChange={(e) => setPaymentMonth(e.target.value)} style={{ width: "100%" }} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-soft" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={processPayment}>Proceed</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}