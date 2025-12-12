import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGetWithParams } from "../services/api";
import Spineer from "../components/Spineer";
import AuditLogViewModal from "./AuditLogViewModal";

const format = (d) => d.toISOString().slice(0, 10);

export default function AuditLogs() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [auditlogs, setAuditlogs] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState(null);


  // Set last 7 days as default date range for audit logs to optimize backend performance
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    setStartDate(format(lastWeek));
    setEndDate(format(today));
  }, []);

  // Fetch audit logs when date range is set, then only backend works
  useEffect(() => {
    if (!startDate || !endDate) return;
    fetchAuditLogs();
  }, [startDate, endDate]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = { start: startDate, end: endDate };
      const res = await apiGetWithParams("/auditlogs", params);
      const data = Array.isArray(res.data) ? res.data : [];
      setAuditlogs(data);

      setFiltered(data);
    } catch (err) {
      console.error(err);
      setAuditlogs([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };
      console.log(auditlogs)
  // Filtering
  useEffect(() => {
    let data = [...auditlogs];

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      data = data.filter(
        (x) =>
          x.action_type.toLowerCase().includes(q) ||
          x.name.toLowerCase().includes(q) ||
          x.email.toLowerCase().includes(q) ||
          x.target_table.toLowerCase().includes(q)
      );
    }

    setFiltered(data);
  }, [search, auditlogs]);

  const clearFilters = () => {
    setSearch("");
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    setStartDate(format(lastWeek));
    setEndDate(format(today));
  };

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Employee Information", "Audit Logs"]}
        title="Employee Information Management"
      />

      {/* Fixed Tabs Section */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="card" style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          marginBottom: 0,
          borderRadius: '0'
        }}>
          {[
            { label: "Overview", path: "/employee-info" },
            { label: "Add Employee", path: "/add-employee" },
            { label: "Attendance & Leave Records", path: "/attendance-leave" },
            { label: "Performance & Training", path: "/performance-training" },
            { label: "Documents & Contracts", path: "/documents-contracts" },
            { label: "Audit Logs", path: "/audit-logs" },
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

      {/* Scrollable Content Area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Filters Card */}
        <div className="card">
          <div className="grid-3" style={{ alignItems: "end", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Start Date
              </label>
              <input
                className="input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                End Date
              </label>
              <input
                className="input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--muted)", display: "block", marginBottom: "6px" }}>
                Search
              </label>
              <input
                className="input"
                type="text"
                placeholder="Search events, users, descriptions..."

                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {(startDate || endDate || search) && (
                <button className="btn btn-soft" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
              {filtered.length} audit record(s)
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Spineer />
        ) : (
          <div className="table-container">
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
                <div style={{ fontWeight: "700" }}>Audit Logs</div>
                <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
                  Showing {filtered.length} of {auditlogs.length} records
                </div>
              </div>

              <div style={{ overflowX: "auto", flex: 1 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                      <th>Status</th>
                      <th>User</th>
                      <th>Description</th>
                      <th></th>

                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.audit_id}>
                        <td>{new Date(row.action_time).toLocaleString()}</td>
                        <td>{row.action_type}</td>
                        <td><span style={{
                          padding: '4px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                          className={
                            row.status?.toLowerCase() === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >{row.status}</span></td>
                        <td>{row.name}<br />{row.email}</td>
                        <td>Table: {row.target_table}<br />ID: {row.target_id}</td>
                        <td>
                          <button
                            className="btn btn-soft"
                            onClick={() => {
                              setSelectedAuditId(row.audit_id);
                              setModalOpen(true);
                            }}
                          >
                            View
                          </button>
                        </td>

                      </tr>
                    ))}

                    {!filtered.length && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                          No audit records found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>


      <AuditLogViewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        auditId={selectedAuditId}
      />


    </Layout>
  );
}