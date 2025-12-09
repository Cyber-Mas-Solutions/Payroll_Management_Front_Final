import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiGet, apiUpload, apiDelete } from "../services/api";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const DocCard = ({ doc, onReplace, onDelete, busyId }) => (
  <li className="card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div style={{ width: 80, height: 80, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
      {doc.kind === "image" ? (
        <img src={doc.url} alt={doc.file_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : doc.kind === "pdf" ? (
        <iframe title={doc.file_name} src={`${doc.url}#view=FitH&navpanes=0&toolbar=0`} style={{ width: "100%", height: "100%" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>📄</div>
      )}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700 }}>{doc.file_name}</div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>
        <strong>{doc.category}</strong> • {doc.file_type}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <a className="btn btn-soft" href={doc.url} target="_blank" rel="noopener noreferrer">Open</a>
        <button className="btn btn-soft" onClick={() => onReplace(doc)} disabled={busyId === doc.id}>Replace</button>
        <button className="btn btn-danger" onClick={() => onDelete(doc)} disabled={busyId === doc.id}>Delete</button>
      </div>
    </div>
  </li>
);

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyDoc, setBusyDoc] = useState(null);
  const [error, setError] = useState("");

  const [existingDocs, setExistingDocs] = useState([]);
  const [existingBankDocs, setExistingBankDocs] = useState([]);

  const [formData, setFormData] = useState({
    first_name: "", last_name: "", initials: "", calling_name: "",
    email: "", personal_email: "", country_code: "+94", phone: "",
    gender: "", dob: "", marital_status: "", nationality: "", religion: "", nic: "",
    address_permanent: "", address_temporary: "",
    appointment_date: "", department: "", designation: "",
    working_office: "", branch: "", employment_type: "",
    basic_salary: "", status: "Active", supervisor: "", grade: "", designated_emails: "", epf_no: "",
    kin_name: "", kin_relationship: "", kin_nic: "", kin_dob: "",
    account_number: "", account_name: "", bank_name: "", branch_name: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [document, setDocument] = useState(null);
  const [bankDocument, setBankDocument] = useState(null);
  const [documentType, setDocumentType] = useState("");

  const replaceInputRef = useRef(null);
  const replaceTargetRef = useRef(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await apiGet(`/employees/${id}`);
        const e = res.data || {};

        setFormData((prev) => ({
          ...prev,
          first_name: e.first_name || "",
          last_name: e.last_name || "",
          initials: e.initials || "",
          calling_name: e.calling_name || "",
          email: e.email || "",
          personal_email: e.personal_email || "",
          country_code: e.country_code || "",
          phone: e.phone || "",
          gender: e.gender || "",
          dob: e.dob || "",
          marital_status: e.marital_status || "",
          nationality: e.nationality || "",
          religion: e.religion || "",
          nic: e.nic || "",
          address_permanent: e.address_permanent || "",
          address_temporary: e.address_temporary || "",
          appointment_date: e.appointment_date || "",
          department: e.department_name || "",
          designation: e.designation || "",
          working_office: e.working_office || "",
          branch: e.branch || "",
          employment_type: e.employment_type || "",
          basic_salary: e.basic_salary ?? "",
          status: e.status || "Active",
          supervisor: e.supervisor || "",
          grade: e.grade || "",
          designated_emails: e.designated_emails || "",
          epf_no: e.epf_no || "",
          kin_name: e.kin?.kin_name || "",
          kin_relationship: e.kin?.relationship || "",
          kin_nic: e.kin?.kin_nic || "",
          kin_dob: e.kin?.kin_dob || "",
          account_number: e.bank_account?.account_number || "",
          account_name: e.bank_account?.account_name || "",
          bank_name: e.bank_account?.bank_name || "",
          branch_name: e.bank_account?.branch_name || "",
        }));

        const docs = e.documents || [];
        setExistingBankDocs(docs.filter((d) => d.category === "Bank Document" || d.file_name?.startsWith("BANK -")));
        setExistingDocs(docs.filter((d) => !(d.category === "Bank Document" || d.file_name?.startsWith("BANK -"))));
      } catch (err) {
        console.error(err);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const validateFiles = () => {
    if (profilePhoto && !["image/jpeg", "image/jpg", "image/png"].includes(profilePhoto.type)) {
      setError("Profile photo must be JPG/JPEG/PNG.");
      return false;
    }
    if (document && !["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(document.type)) {
      setError("Document must be PDF/JPG/JPEG/PNG.");
      return false;
    }
    return true;
  };

  const refreshDocs = async () => {
    const fresh = await apiGet(`/employees/${id}`);
    const docs = fresh.data.documents || [];
    setExistingBankDocs(docs.filter((d) => d.category === "Bank Document" || d.file_name?.startsWith("BANK -")));
    setExistingDocs(docs.filter((d) => !(d.category === "Bank Document" || d.file_name?.startsWith("BANK -"))));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateFiles()) return;
    setSaving(true);
    setError("");

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (profilePhoto) fd.append("profilePhoto", profilePhoto);
      if (document) fd.append("documents", document);
      if (bankDocument) fd.append("bankDocument", bankDocument);
      if (document) fd.append("document_type", documentType || "Other");

      await apiUpload(`/employees/${id}`, fd, "PUT");
      await refreshDocs();
      setDocument(null);
      setBankDocument(null);
      alert("Employee updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async (doc) => {
    if (!window.confirm(`Delete "${doc.file_name}"?`)) return;
    try {
      setBusyDoc(doc.id);
      await apiDelete(`/employees/${id}/documents/${doc.id}`);
      await refreshDocs();
    } catch (e) {
      console.error(e);
      alert("Failed to delete document");
    } finally {
      setBusyDoc(null);
    }
  };

  const handleReplaceDoc = (doc) => {
    replaceTargetRef.current = doc;
    replaceInputRef.current?.click();
  };

  const onPickReplacement = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const okTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!okTypes.includes(file.type)) {
      alert("File must be PDF/JPG/JPEG/PNG.");
      return;
    }

    const doc = replaceTargetRef.current;
    if (!doc) return;

    try {
      setBusyDoc(doc.id);
      const fd = new FormData();
      fd.append("file", file);
      await apiUpload(`/employees/${id}/documents/${doc.id}`, fd, "PUT");
      await refreshDocs();
    } catch (e2) {
      console.error(e2);
      alert("Failed to replace document");
    } finally {
      setBusyDoc(null);
      replaceTargetRef.current = null;
    }
  };

  if (loading) return <Layout><PageHeader breadcrumb={["Employee Information"]} title="Edit Employee" /><div className="card">Loading…</div></Layout>;

  const Field = (props) => <input className="input" {...props} />;
  const Select = (props) => <select className="select" {...props} />;

  const StepWrap = ({ title, sub, children }) => (
    <div className="card">
      <h2 style={{ margin: 0 }}>{title}</h2>
      {sub && <div style={{ color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
      <div style={{ height: 12 }} />
      {children}
    </div>
  );

  return (
    <Layout>
      <PageHeader breadcrumb={["Employee Information", "Edit"]} title="Edit Employee" />

      {/* stepper */}
      <div className="card" style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Personal", "Official", "Next of Kin", "Bank", "Documents"].map((label, index) => (
          <button
            key={label}
            className={`btn ${step === index + 1 ? "btn-primary" : "btn-soft"}`}
            onClick={() => setStep(index + 1)}
            type="button"
          >
            {index + 1}. {label}
          </button>
        ))}
      </div>

      {error && <div className="card" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>{error}</div>}

      {/* hidden file input for Replace */}
      <input
        ref={replaceInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: "none" }}
        onChange={onPickReplacement}
      />

      <form onSubmit={handleSave}>
        {step === 1 && (
          <StepWrap title="Personal Details" sub="Edit employee personal details">
            <div className="grid-2">
              <Field name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleInputChange} />
              <Field name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleInputChange} />
              <Field name="initials" placeholder="Initials" value={formData.initials} onChange={handleInputChange} />
              <Field name="calling_name" placeholder="Preferred Name" value={formData.calling_name} onChange={handleInputChange} />
              <div>
                <PhoneInput
                  country={"lk"}
                  value={formData.phone}
                  onChange={(phone, countryData) =>
                    setFormData((prev) => ({ ...prev, phone, country_code: `+${countryData.dialCode}` }))
                  }
                  inputStyle={{ width: "100%", height: "42px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14 }}
                />
              </div>
              <Select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="">Select Gender</option><option>Male</option><option>Female</option>
              </Select>
              <Field type="date" name="dob" value={formData.dob?.slice(0, 10) || ""} onChange={handleInputChange} />
              <Field name="nic" placeholder="NIC" value={formData.nic} onChange={handleInputChange} />
              <Field name="email" type="email" placeholder="Work Email" value={formData.email} onChange={handleInputChange} />
              <Field name="personal_email" type="email" placeholder="Personal Email" value={formData.personal_email} onChange={handleInputChange} />
              <Field name="address_permanent" placeholder="Permanent Address" value={formData.address_permanent} onChange={handleInputChange} />
              <Field name="address_temporary" placeholder="Temporary Address" value={formData.address_temporary} onChange={handleInputChange} />
              <Select name="nationality" value={formData.nationality} onChange={handleInputChange}>
                <option value="">Select Nationality</option><option>Sri Lankan</option><option>Indian</option>
              </Select>
              <Select name="religion" value={formData.religion} onChange={handleInputChange}>
                <option value="">Select Religion</option><option>Buddhism</option><option>Hinduism</option><option>Christianity</option><option>Islam</option>
              </Select>
            </div>
          </StepWrap>
        )}

        {step === 2 && (
          <StepWrap title="Official Details">
            <div className="grid-2">
              <Field type="date" name="appointment_date" value={formData.appointment_date?.slice(0, 10) || ""} onChange={handleInputChange} />
              <Select name="department" value={formData.department} onChange={handleInputChange}>
                <option value="">Select Department</option><option>IT</option><option>Finance</option><option>HR</option>
              </Select>
              <Select name="designation" value={formData.designation} onChange={handleInputChange}>
                <option value="">Select Designation</option><option>Executive</option><option>Manager</option><option>Assistant</option>
              </Select>
              <Select name="employment_type" value={formData.employment_type} onChange={handleInputChange}>
                <option value="">Select Employment Type</option><option>Permanent</option><option>Contract</option>
              </Select>
              <Field name="basic_salary" type="number" placeholder="Basic Salary" value={formData.basic_salary} onChange={handleInputChange} />
              <Select name="status" value={formData.status} onChange={handleInputChange}>
                <option>Active</option><option>Inactive</option>
              </Select>
              <Field name="supervisor" placeholder="Supervisor" value={formData.supervisor} onChange={handleInputChange} />
              <Field name="epf_no" placeholder="EPF No" value={formData.epf_no} onChange={handleInputChange} />
            </div>
          </StepWrap>
        )}

        {step === 3 && (
          <StepWrap title="Relatives Details">
            <div className="grid-2">
              <Field name="kin_name" placeholder="Name" value={formData.kin_name} onChange={handleInputChange} />
              <Field name="kin_relationship" placeholder="Relationship" value={formData.kin_relationship} onChange={handleInputChange} />
              <Field name="kin_nic" placeholder="NIC" value={formData.kin_nic} onChange={handleInputChange} />
              <Field type="date" name="kin_dob" value={formData.kin_dob?.slice(0, 10) || ""} onChange={handleInputChange} />
            </div>
          </StepWrap>
        )}

        {step === 4 && (
          <StepWrap title="Bank Details">
            <div className="grid-2">
              <Field name="account_number" placeholder="Account Number" value={formData.account_number} onChange={handleInputChange} />
              <Field name="account_name" placeholder="Account Holder Name" value={formData.account_name} onChange={handleInputChange} />
              <Field name="bank_name" placeholder="Bank Name" value={formData.bank_name} onChange={handleInputChange} />
              <Field name="branch_name" placeholder="Branch Name" value={formData.branch_name} onChange={handleInputChange} />
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Existing Bank Documents</div>
              {existingBankDocs.length ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                  {existingBankDocs.map((d) => (
                    <DocCard key={d.id} doc={d} onReplace={handleReplaceDoc} onDelete={handleDeleteDoc} busyId={busyDoc} />
                  ))}
                </ul>
              ) : (
                <div style={{ color: "var(--muted)" }}>No bank document uploaded</div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                Upload Bank Document (Optional)
              </label>
              <input className="input" type="file" onChange={(e) => setBankDocument(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
            </div>
          </StepWrap>
        )}

        {step === 5 && (
          <StepWrap title="Documents Upload" sub="Upload and manage personal documents">
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Already Uploaded Documents</div>
              {existingDocs.length ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                  {existingDocs.map((d) => (
                    <DocCard key={d.id} doc={d} onReplace={handleReplaceDoc} onDelete={handleDeleteDoc} busyId={busyDoc} />
                  ))}
                </ul>
              ) : (
                <div style={{ color: "var(--muted)" }}>No personal documents uploaded</div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                Profile Photo (JPG/JPEG/PNG)
              </label>
              <input className="input" type="file" onChange={(e) => setProfilePhoto(e.target.files[0])} accept=".jpg,.jpeg,.png" />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                Document Type
              </label>
              <select className="select" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                <option value="">Select Document Type</option>
                <option>NIC Copy</option><option>Birth Certificate</option><option>Educational Certificates</option>
                <option>Appointment Letter</option><option>Experience Letter</option><option>Passport Copy</option><option>Other</option>
              </select>
              <label style={{ display: "block", fontSize: 12, color: "var(--muted)", margin: "10px 0 6px" }}>
                Upload Supporting Document (PDF/JPG/JPEG/PNG)
              </label>
              <input className="input" type="file" onChange={(e) => setDocument(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
            </div>
          </StepWrap>
        )}

        <div style={{ height: 16 }} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {step > 1 && (
            <button type="button" className="btn btn-soft" onClick={prevStep}>
              Previous
            </button>
          )}
          {step < 5 && (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          )}
          {step === 5 && (
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm("Delete this employee?")) {
                apiGet(`/employees/${id}`, { method: "DELETE" })
                  .then(() => {
                    alert("Employee deleted");
                    navigate("/employee-info");
                  })
                  .catch(() => alert("Failed to delete employee"));
              }
            }}
          >
            Delete
          </button>
          <button type="button" className="btn btn-soft" onClick={() => navigate("/employee-info")}>
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
