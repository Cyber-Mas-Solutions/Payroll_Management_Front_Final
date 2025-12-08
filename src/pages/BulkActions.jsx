// src/pages/BulkActions.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

export default function BulkActions() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([
    { id: 'A1', name: 'Jeremy Neil', dept: 'Support', checked: false },
    { id: 'A2', name: 'Annette Biz', dept: 'QA', checked: false },
    { id: 'A3', name: 'Theresa Wu', dept: 'People Ops', checked: false }
  ]);
  
  const [action, setAction] = useState('Bonus');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const toggleEmployee = (index) => {
    setEmployees(list => {
      const updated = [...list];
      updated[index].checked = !updated[index].checked;
      return updated;
    });
  };

  const handleApply = () => {
    // Handle bulk action application logic here
    console.log('Applying', action, 'Amount:', amount, 'Reason:', reason, 'to:', employees.filter(e => e.checked));
    // Reset form
    setAmount('');
    setReason('');
  };

  const selectedCount = employees.filter(e => e.checked).length;

  return (
    <Layout>
      {/* Fixed Header Section */}
      <PageHeader
        breadcrumb={["Administration", "Bulk Actions"]}
        title="Bulk Actions"
      />

      {/* Tabs - Single Line */}
      <div className="card" style={{ display: "flex", gap: "8px", overflowX: "auto", whiteSpace: "nowrap" }}>
        {[
          { label: "User Management", path: "/user-management" },
          { label: "System Settings", path: "/system-settings" },
          { label: "Bulk Actions", path: "/bulk-actions" },
          { label: "Data Management", path: "/data-management" },
          { label: "Audit Logs", path: "/admin-audit-logs" },
        ].map((t) => (
          <button
            key={t.path}
            className={`btn ${window.location.pathname === t.path ? "btn-primary" : "btn-soft"}`}
            onClick={() => navigate(t.path)}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Action Configuration Card */}
      <div className="card">
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px" }}>Configure Bulk Action</h3>
          
          <div className="grid-3" style={{ alignItems: "end", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Action Type</label>
              <select 
                className="select" 
                value={action} 
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="Bonus">Bonus</option>
                <option value="Allowance">Allowance</option>
                <option value="Deduction">Deduction</option>
                <option value="Salary Adjustment">Salary Adjustment</option>
                <option value="Status Change">Status Change</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Amount / Value</label>
              <input
                className="input"
                placeholder="Enter amount or percentage"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>Reason</label>
              <input
                className="input"
                placeholder="Enter reason for action"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "14px", color: "var(--muted)" }}>
            {selectedCount} employee(s) selected
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleApply}
            disabled={selectedCount === 0 || !amount || !reason}
          >
            Apply Bulk Action
          </button>
        </div>
      </div>

      {/* Employees Table Section */}
      <div className="table-container">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ 
            padding: "12px 16px", 
            borderBottom: "1px solid var(--border)", 
            display: "flex", 
            alignItems: "center" 
          }}>
            <div style={{ fontWeight: "700" }}>Select Employees</div>
            <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
              {employees.length} employee(s) total
            </div>
          </div>

          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEmployees(employees.map(emp => ({ ...emp, checked })));
                      }}
                      checked={employees.length > 0 && employees.every(emp => emp.checked)}
                    />
                  </th>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => (
                  <tr key={emp.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={emp.checked} 
                        onChange={() => toggleEmployee(index)} 
                      />
                    </td>
                    <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="user-avatar" />
                      <div style={{ fontWeight: "600" }}>{emp.name}</div>
                    </td>
                    <td>{emp.id}</td>
                    <td>{emp.dept}</td>
                    <td>
                      <span className="pill pill-ok">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}