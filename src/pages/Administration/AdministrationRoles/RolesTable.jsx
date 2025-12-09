import React from 'react';

const RolesTable = ({ roles, onEdit, onDelete }) => {
    const formatDate = (d) => {
        const date = new Date(d);
        if (Number.isNaN(date)) return d;
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${m}/${day}/${date.getFullYear()}`;
    };

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
                    <div style={{ fontWeight: "700" }}>All Roles</div>
                    <div
                        style={{ marginLeft: "auto", fontSize: "12px", color: "var(--muted)" }}
                    >
                        {roles.length} result(s)
                    </div>
                </div>

                <div style={{ overflowX: "auto", flex: 1 }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>ID</th>
                                <th>Status</th>
                                <th>Permissions</th>
                                <th>Created Date</th>
                                <th style={{ width: "140px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td style={{ fontWeight: "600" }}>{role.role_name}</td>
                                    <td>{role.id}</td>
                                    <td>
                                        <span
                                            className={`pill ${String(role.status).toLowerCase() === "active"
                                                ? "pill-ok"
                                                : "pill-warn"
                                                }`}
                                        >
                                            {role.status}
                                        </span>
                                    </td>
                                    <td>{role.permissions}</td>
                                    <td>{formatDate(role.created_at)}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button className="btn btn-soft" onClick={() => onEdit(role)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-danger" onClick={() => onDelete(role)} style={{
                                                fontSize: "12px",
                                                padding: "6px 12px",
                                                background: "#fef2f2",
                                                color: "#dc2626",
                                                border: "1px solid #fecaca"
                                            }}>


                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!roles.length && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                        No roles found.
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

export default RolesTable;
