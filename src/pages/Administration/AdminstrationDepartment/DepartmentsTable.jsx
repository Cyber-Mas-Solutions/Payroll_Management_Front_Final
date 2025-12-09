import React from "react";

const DepartmentsTable = ({ departments, formatDate , onEdit, onDelete}) => {
  return (
    <div className="table-container">
      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: "700" }}>All Departments</div>
          <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}>
            {departments.length} result(s)
          </div>
        </div>

        <div style={{ overflowX: "auto", flex: 1 }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Department Name</th>
                <th>Manager Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ width: "140px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td>{dept.id}</td>
                  <td style={{ fontWeight: "600" }}>{dept.name}</td>
                  <td>{dept.manager_name}</td>
                  <td>{dept.description}</td>
                  <td>
                    <span
                      className={`pill ${
                        String(dept.status).toLowerCase() === "active"
                          ? "pill-ok"
                          : "pill-warn"
                      }`}
                    >
                      {dept.status}
                    </span>
                  </td>
                  <td>{formatDate(dept.created_at)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-soft" onClick={() => onEdit(dept)}>Edit</button>
                      <button className="btn btn-soft" onClick={() => onDelete(dept)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}

              {!departments.length && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsTable;
