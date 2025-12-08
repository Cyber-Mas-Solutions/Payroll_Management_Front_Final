import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet } from "../services/api";

const isImage = (t = "") => t.startsWith("image/");
const isPdf = (t = "") => t === "application/pdf";

// Choose best possible profile image

/* 
const profilePhotoUrl =
  employee.profile_photo_url ||
  (employee.documents || []).find(
    (d) =>
      (d.doc_category || d.category || "").toLowerCase() === "profile photo" ||
      (d.file_type || "").startsWith("image/")
  )?.url || null;
*/



export default function ViewEmployee() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet(`/employees/${id}`);
        setEmployee(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <PageHeader breadcrumb={["Employee Information"]} title="Registered Member Profile" />
        <div className="card">Loading employee details…</div>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout>
        <PageHeader breadcrumb={["Employee Information"]} title="Registered Member Profile" />
        <div className="card" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>{error}</div>
      </Layout>
    );
  }
  if (!employee) {
    return (
      <Layout>
        <PageHeader breadcrumb={["Employee Information"]} title="Registered Member Profile" />
        <div className="card">No employee data found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader breadcrumb={["Employee Information", "Profile"]} title="Registered Member Profile" />

      <div className="grid-2">
        {/* Left profile card */}
        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>

            <div className="user-avatar" style={{ width: 96, height: 96, overflow: "hidden" }}>
              {employee.profile_photo_url && (
                <img src={employee.profile_photo_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              )}
            </div>
            
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {(employee.first_name || "") + " " + (employee.last_name || "")}
              </div>
              <div style={{ color: "var(--muted)" }}>{employee.calling_name}</div>
            </div>

            <div style={{ width: "100%", marginTop: 6 }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 8 }}>
                <div style={{ color: "var(--muted)" }}>Email</div><div>{employee.email || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Contact</div><div>{employee.country_code} {employee.phone}</div>
                <div style={{ color: "var(--muted)" }}>Status</div>
                <div>
                  <span className={`pill ${employee.status === "Active" ? "pill-ok" : "pill-warn"}`}>{employee.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: tabs + content */}
        <div className="card">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {[
              { key: "personal", label: "Personal" },
              { key: "official", label: "Official" },
              { key: "kin", label: "Relatives" },
              { key: "bank", label: "Bank & Documents" },
              { key: "documents", label: "Personal Documents" },
            ].map((t) => (
              <button
                key={t.key}
                className={`btn ${activeTab === t.key ? "btn-primary" : "btn-soft"}`}
                onClick={() => setActiveTab(t.key)}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* tab body */}
          <div className="card" style={{ background: "var(--soft)" }}>
            {activeTab === "personal" && (
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 10 }}>
                <div style={{ color: "var(--muted)" }}>Employee No</div><div>{employee.id}</div>
                <div style={{ color: "var(--muted)" }}>Full Name</div><div>{(employee.first_name || "") + " " + (employee.last_name || "")}</div>
                <div style={{ color: "var(--muted)" }}>Initials</div><div>{employee.initials || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Preferred Name</div><div>{employee.calling_name || "-"}</div>
                <div style={{ color: "var(--muted)" }}>NIC</div><div>{employee.nic || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Date of Birth</div><div>{employee.dob || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Gender</div><div>{employee.gender || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Marital Status</div><div>{employee.marital_status || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Permanent Address</div><div>{employee.address_permanent || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Temporary Address</div><div>{employee.address_temporary || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Nationality</div><div>{employee.nationality || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Religion</div><div>{employee.religion || "-"}</div>
              </div>
            )}

            {activeTab === "official" && (
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 10 }}>
                <div style={{ color: "var(--muted)" }}>Department</div><div>{employee.department_name || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Designation</div><div>{employee.designation || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Working Office</div><div>{employee.working_office || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Branch</div><div>{employee.branch || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Employment Type</div><div>{employee.employment_type || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Appointment Date</div><div>{employee.appointment_date || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Supervisor</div><div>{employee.supervisor || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Basic Salary</div><div>{employee.basic_salary ?? "-"}</div>
                <div style={{ color: "var(--muted)" }}>Grade</div><div>{employee.grade || "-"}</div>

                <div style={{ color: "var(--muted)" }}>EPF No</div><div>{employee.epf_no || "-"}</div>
                <div style={{ color: "var(--muted)" }}>ETF No</div><div>{employee.etf_no || "-"}</div>
                

              </div>
            )}

            {activeTab === "kin" && (
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 10 }}>
                <div style={{ color: "var(--muted)" }}>Relatives Name</div><div>{employee.kin?.kin_name || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Relationship</div><div>{employee.kin?.relationship || "-"}</div>
                <div style={{ color: "var(--muted)" }}>NIC</div><div>{employee.kin?.kin_nic || "-"}</div>
                <div style={{ color: "var(--muted)" }}>Date of Birth</div><div>{employee.kin?.kin_dob || "-"}</div>
              </div>
            )}

            

                {activeTab === "bank" && (
                  <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", rowGap: 10 }}>
                    <div style={{ color: "var(--muted)" }}>Account Name</div>
                    <div>{employee.bank_account?.account_name || "-"}</div>

                    <div style={{ color: "var(--muted)" }}>Account Number</div>
                    <div>{employee.bank_account?.account_number || "-"}</div>

                    <div style={{ color: "var(--muted)" }}>Bank</div>
                    <div>{employee.bank_account?.bank_name || "-"}</div>

                    <div style={{ color: "var(--muted)" }}>Branch</div>
                    <div>{employee.bank_account?.branch_name || "-"}</div>

                    <div style={{ color: "var(--muted)" }}>Bank Document</div>
                    <div>
                      {(() => {
                        const bankDoc = (employee.documents || []).find(
                          (d) =>
                            d.doc_category === "Bank Document" ||
                            d.category === "Bank Document" ||
                            /^BANK[-\s]/i.test(d.file_name || "")
                        );

                        if (!bankDoc) return "No document uploaded";

                        const label = bankDoc.doc_category || bankDoc.category || "Bank Document";

                        return (
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <span className="pill pill-ok">{label}</span>
                            <a
                              className="btn btn-soft"
                              href={bankDoc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open
                            </a>
                            <a className="btn btn-soft" href={bankDoc.url} download>
                              Download
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                  {activeTab === "documents" && (
                    <div>
                      {/* Profile photo as part of personal documents */}
                      {employee.profile_photo_url && (
                        <div className="card" style={{ marginBottom: 16 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                            }}
                          >
                            <div
                              className="user-avatar"
                              style={{ width: 64, height: 64, overflow: "hidden" }}
                            >
                              <img
                                src={employee.profile_photo_url}
                                alt="Profile"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                }}
                              />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>Profile Photo</div>
                              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                                {employee.full_name || `${employee.first_name || ""} ${employee.last_name || ""}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {(employee.documents && employee.documents.length) ? (
                        <div className="grid-auto">
                          {employee.documents
                            // Optional: do not repeat bank doc here
                            .filter(
                              (doc) =>
                                doc.doc_category !== "Bank Document" &&
                                doc.category !== "Bank Document"
                            )
                            .map((doc) => (
                              <div key={doc.id} className="card">
                                <div
                                  style={{
                                    height: 140,
                                    background: "#f3f4f6",
                                    borderRadius: 6,
                                    overflow: "hidden",
                                    marginBottom: 10,
                                  }}
                                >
                                  {isImage(doc.file_type) ? (
                                    <img
                                      src={doc.url}
                                      alt={doc.file_name}
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : isPdf(doc.file_type) ? (
                                    <iframe
                                      src={`${doc.url}#view=FitH&navpanes=0&toolbar=0`}
                                      title={doc.file_name}
                                      style={{ width: "100%", height: "100%" }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      📄
                                    </div>
                                  )}
                                </div>
                                <div style={{ fontWeight: 700 }}>{doc.file_name}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                                  <strong>{doc.doc_category || doc.category || "Document"}</strong>{" "}
                                  • {doc.file_type || "file"} •{" "}
                                  {doc.uploaded_at?.slice(0, 10) || ""}
                                </div>
                                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                  <a
                                    className="btn btn-soft"
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Open
                                  </a>
                                  <a className="btn btn-soft" href={doc.url} download>
                                    Download
                                  </a>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div>No documents uploaded</div>
                      )}
                    </div>
                  )}

          </div>
        </div>
      </div>
    </Layout>
  );
}
