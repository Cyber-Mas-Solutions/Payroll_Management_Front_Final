import React, { useEffect, useState } from "react";
import { apiGet } from "../services/api";

const AuditLogViewModal = ({ isOpen, onClose, auditId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !auditId) return;

    const fetchAuditLogById = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/auditlogs/${auditId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogById();
  }, [isOpen, auditId]);

  if (!isOpen) return null;

  const statusClass =
    data?.status?.toLowerCase() === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow-lg max-w-md w-full"
        style={{ padding: "24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div>Loading...</div>
        ) : data ? (
          <>
            <h2 className="text-xl font-bold" style={{marginBottom:'16px'}}> 
              Audit Log Detail of {auditId}
            </h2>

            <div style={{margintBottom:'8px'}}>
              <strong>Time:</strong> {new Date(data.action_time).toLocaleString()}
            </div>

            <div style={{margintBottom:'8px'}}>
              <strong>Event:</strong> {data.action_type}
            </div>

            <div style={{margintBottom:'8px'}}>
              <strong>Status:</strong>{" "}
              <span className={`px-2 py-1 rounded ${statusClass}`}>
                {data.status}
              </span>
            </div>

            <div style={{margintBottom:'8px'}}>
              <strong>User:</strong> {data.name} ({data.email})
            </div>

            <div style={{margintBottom:'8px'}}>
              <strong>Table:</strong> {data.target_table}
            </div>

            <div style={{margintBottom:'8px'}}>
              <strong>Target ID:</strong> {data.target_id}
            </div>

            <div style={{margintBottom:'8px'}}>
              <strong>Description:</strong>
              <br />
              {data.status === "SUCCESS" ? (
                <>
                  <div style={{marginBottom:'4px'}}>
                    <strong>Before State:</strong>
                    <div className="bg-gray-100 rounded" style={{padding:'4px'}}>{JSON.stringify(JSON.parse(data.before_state, null))}</div>
                  </div>
                  <div style={{marginBottom:'4px'}}>
                    <strong>After State:</strong>
                    <div className="bg-gray-100 rounded" style={{padding:'4px'}}>{JSON.stringify(JSON.parse(data.after_state, null))}</div>
                  </div>
                  <div>
                    <strong>Changes:</strong>
                    <div className="bg-gray-100 rounded" style={{padding:'4px'}}>{JSON.stringify(JSON.parse(data.different, null))}</div>
                  </div>
                </>
              ) : (
                <div className="text-red-600">{data.error_message}</div>
              )}
            </div>

            <div className="flex justify-end" style={{marginTop:'16px'}}>
              <button className="btn btn-soft" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <div>No data found.</div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewModal;

