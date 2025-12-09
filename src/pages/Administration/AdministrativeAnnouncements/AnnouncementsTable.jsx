import React from 'react'

const AnnouncementsTable = ({ announcements,onEdit, formatDate, onDelete}) => {
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
          <div style={{ fontWeight: "700" }}>All Announcements</div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: "var(--muted)",
            }}
          >
            {announcements.length} result(s)
          </div>
        </div>

        <div style={{ overflowX: "auto", flex: 1 }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Announcement</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th style={{ width: "140px" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {announcements.map((a) => (
                <tr key={a.announcement_id}>
                  <td>{a.announcement_id}</td>
                  <td style={{ fontWeight: "600" }}>{a.title}</td>
                  <td>{a.announcement_text}</td>
                  <td>{formatDate(a.start_date)}</td>
                  <td>{formatDate(a.end_date)}</td>
                  <td>{a.description}</td>
                  <td>{a.created_by}</td>
                  <td>{formatDate(a.created_date)}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-soft" onClick={() => onEdit(a)}>Edit</button>
                      <button className="btn btn-soft" onClick={() => onDelete(a)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}

              {!announcements.length && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                    No announcements found.
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

export default AnnouncementsTable
