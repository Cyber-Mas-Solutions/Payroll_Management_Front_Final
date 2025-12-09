import React from 'react'

const ShiftsTable = ( { shifts, formatDate, onEdit, onDelete}) => {
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
          <div style={{ fontWeight: "700" }}>All Shifts</div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: "var(--muted)",
            }}
          >
            {shifts.length} result(s)
          </div>
        </div>

        <div style={{ overflowX: "auto", flex: 1 }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ width: "140px" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id}>
                  <td>{shift.id}</td>
                  <td>{formatDate(shift.start_date)}</td>
                  <td>{formatDate(shift.end_date)}</td>
                  <td>{shift.start_time}</td>
                  <td>{shift.end_time}</td>
                  <td style={{ fontWeight: "600" }}>{shift.type}</td>
                  <td>
                    <span
                      className={`pill ${String(shift.status).toLowerCase() === "active"
                          ? "pill-ok"
                          : "pill-warn"
                        }`}
                    >
                      {shift.status}
                    </span>
                  </td>
                  <td>{formatDate(shift.created_at)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-soft" onClick={() => onEdit(shift)}>Edit</button>
                      <button className="btn btn-soft" onClick={() => onDelete(shift)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}

              {!shifts.length && (
                <tr>
                  <td
                    colSpan="9"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No shifts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ShiftsTable
