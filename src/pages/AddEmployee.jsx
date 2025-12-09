import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiUpload } from "../services/api";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    first_name: "", 
    last_name: "",
    initials: "",
    calling_name: "",
    email: "",
    personal_email: "",
    country_code: "+94",
    phone: "",
    gender: "",
    dob: "",
    marital_status: "",
    nationality: "",
    religion: "",
    nic: "",
    address_permanent: "",
    address_temporary: "",
    appointment_date: "",
    department: "",
    designation: "",
    working_office: "",
    branch: "",
    employment_type: "",
    basic_salary: "",
    status: "Active",
    supervisor: "",
    grade: "",
    grade_id: "",
    designated_emails: "",

    epf_no: "",
    etf_no: "",

    kin_name: "",
    relationship: "",
    kin_nic: "",
    kin_dob: "",
    account_number: "",
    account_name: "",
    bank_name: "",
    branch_name: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [documents, setDocuments] = useState([]); // Array for multiple documents
  const [bankDocument, setBankDocument] = useState(null);
  const [currentDocumentType, setCurrentDocumentType] = useState("");
  const [currentDocumentFile, setCurrentDocumentFile] = useState(null);

  // Input handler - maintains typing functionality
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGradeChange = (e) => {
    const grade = e.target.value;
    const gradeMap = { 'A': 1, 'B': 2, 'C': 3 };
    setFormData(prev => ({
      ...prev,
      grade: grade,
      grade_id: gradeMap[grade] || null
    }));
  };

  // File upload handler with status
  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    setUploadStatus(prev => ({ ...prev, [type]: 'uploading' }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadStatus(prev => ({ ...prev, [type]: 'success' }));
      return true;
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [type]: 'error' }));
      return false;
    }
  };

  // Profile photo handler
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      await handleFileUpload(file, 'profile');
    }
  };

  // Bank document handler
  const handleBankDocumentChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setBankDocument(file);
      await handleFileUpload(file, 'bank');
    }
  };

  // Add document to the documents array
  const handleAddDocument = async () => {
    if (!currentDocumentType || !currentDocumentFile) {
      setError("Please select both document type and file");
      return;
    }

    const uploadKey = `doc_${Date.now()}`;
    const uploadSuccess = await handleFileUpload(currentDocumentFile, uploadKey);
    
    if (uploadSuccess) {
      const newDocument = {
        id: Date.now(),
        type: currentDocumentType,
        file: currentDocumentFile,
        name: currentDocumentFile.name,
        uploadKey: uploadKey
      };
      
      setDocuments(prev => [...prev, newDocument]);
      setCurrentDocumentType("");
      setCurrentDocumentFile(null);
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"][accept=".pdf,.jpg,.jpeg"]');
      if (fileInput) fileInput.value = "";
    }
  };

  // Remove document from the array
  const handleRemoveDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const validateFiles = () => {
    if (profilePhoto && !["image/jpeg", "image/jpg", "image/png"].includes(profilePhoto.type)) {
      setError("Profile photo must be JPG/JPEG/PNG.");
      return false;
    }
    if (documents.length === 0) {
      setError("Please upload at least one supporting document.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFiles()) return;
    setSubmitting(true);
    setError("");

    try {
      const fd = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          fd.append(key, value.toString());
        }
      });
      
      // Append profile photo
      if (profilePhoto) fd.append("profilePhoto", profilePhoto);
      
      // Append all documents with their types
      documents.forEach((doc, index) => {
        fd.append("documents", doc.file);
        fd.append(`document_type_${index}`, doc.type);
      });
      
      // Append bank document
      if (bankDocument) fd.append("bankDocument", bankDocument);

      // Send total documents count
      fd.append("total_documents", documents.length.toString());

      const response = await apiUpload("/employees", fd, "POST");
      
      if (response.ok) {
        alert("Employee registered successfully!");
        navigate("/employee-info");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to register employee");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="card">
            <h2 style={{ margin: 0 }}>Personal Details</h2>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Enter employee personal details</div>
            <div style={{ height: 12 }} />
            
            <div className="grid-2">
              <input
                className="input"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
              <input
                className="input"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
              <input
                className="input"
                name="initials"
                placeholder="Initials"
                value={formData.initials}
                onChange={handleInputChange}
              />
              <input
                className="input"
                name="calling_name"
                placeholder="Preferred Name"
                value={formData.calling_name}
                onChange={handleInputChange}
              />
              <div>
                <PhoneInput
                  country={"lk"}
                  value={formData.phone}
                  onChange={(phone, countryData) => {
                    setFormData((prev) => ({
                      ...prev,
                      phone: phone,
                      country_code: `+${countryData.dialCode}`,
                    }));
                  }}
                  inputStyle={{
                    width: "100%",
                    height: "42px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                  }}
                  dropdownStyle={{
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
              <select
                className="select"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <select
                className="select"
                name="marital_status"
                value={formData.marital_status}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Marital Status</option>
                <option>Married</option>
                <option>Unmarried</option>
              </select>
              <input
                className="input"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
              <input
                className="input"
                name="nic"
                placeholder="NIC Number"
                value={formData.nic}
                onChange={handleInputChange}
              />
              <input
                className="input"
                name="email"
                type="email"
                placeholder="Work Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                className="input"
                name="personal_email"
                type="email"
                placeholder="Personal Email"
                value={formData.personal_email}
                onChange={handleInputChange}
              />
              <input
                className="input"
                name="address_permanent"
                placeholder="Permanent Address"
                value={formData.address_permanent}
                onChange={handleInputChange}
              />
              <input
                className="input"
                name="address_temporary"
                placeholder="Temporary Address"
                value={formData.address_temporary}
                onChange={handleInputChange}
              />
              <select
                className="select"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
              >
                <option value="">Select Nationality</option>
                <option>Sri Lankan</option>
                <option>Indian</option>
                <option>Other</option>
              </select>
              <select
                className="select"
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
              >
                <option value="">Select Religion</option>
                <option>Buddhism</option>
                <option>Hinduism</option>
                <option>Christianity</option>
                <option>Islam</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="card">
            <h2 style={{ margin: 0 }}>Official Details</h2>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Enter employee official details</div>
            <div style={{ height: 12 }} />
            
            <div className="grid-2">
              <input
                className="input"
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleInputChange}
              />
              <select
                className="select"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="">Select Department</option>
                <option>IT</option>
                <option>Finance</option>
                <option>HR</option>
                <option>Sales</option>
                <option>Admin</option>
              </select>
              <select
                className="select"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
              >
                <option value="">Select Designation</option>
                <option>Executive</option>
                <option>Manager</option>
                <option>Assistant</option>
                <option>Officer</option>
              </select>
              <select
                className="select"
                name="working_office"
                value={formData.working_office}
                onChange={handleInputChange}
              >
                <option value="">Select Working Office</option>
                <option>Head Office</option>
                <option>Branch Office</option>
              </select>
              <select
                className="select"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
              >
                <option value="">Select Branch</option>
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Jaffna</option>
              </select>
              <select
                className="select"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleInputChange}
              >
                <option value="">Select Employment Type</option>
                <option>Permanent</option>
                <option>Contract</option>
                <option>Temporary</option>
                <option>Probation</option>
              </select>
              <input
                className="input"
                type="number"
                name="basic_salary"
                placeholder="Basic Salary"
                value={formData.basic_salary}
                onChange={handleInputChange}
              />
              <select
                className="select"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <select
                className="select"
                name="grade"
                value={formData.grade}
                onChange={handleGradeChange}
              >
                <option value="">Select Grade</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
              <select
                className="select"
                name="supervisor"
                value={formData.supervisor}
                onChange={handleInputChange}
              >
                <option value="">Select Supervisor</option>
                <option>Manager</option>
                <option>HR Head</option>
                <option>Director</option>
              </select>
              <input
                className="input"
                name="designated_emails"
                placeholder="Designated emails (comma separated)"
                value={formData.designated_emails}
                onChange={handleInputChange}
              />
              <input
                className="input"
                name="epf_no"
                placeholder="EPF Number"
                value={formData.epf_no}
                onChange={handleInputChange}
              />

              <input
                className="input"
                name="etf_no"
                placeholder="ETF Number"
                value={formData.etf_no}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="card">
            <h2 style={{ margin: 0 }}>Relatives Details</h2>
            <div style={{ height: 12 }} />
            
            <div className="grid-2">
              <input
                className="input"
                name="kin_name"
                placeholder="Name"
                value={formData.kin_name}
                onChange={handleInputChange}
              />
              <input
                className="input"
                name="relationship"
                placeholder="Relationship"
                value={formData.relationship}
                onChange={handleInputChange}
              />
              <input
                className="input"
                name="kin_nic"
                placeholder="NIC"
                value={formData.kin_nic}
                onChange={handleInputChange}
              />
              <input
                className="input"
                type="date"
                name="kin_dob"
                placeholder="DOB"
                value={formData.kin_dob}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="card">
            <h2 style={{ margin: 0 }}>Bank Details</h2>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Enter Employee Bank Details</div>
            <div style={{ height: 12 }} />
            
            <div className="grid-2">
              <input
                className="input"
                name="account_number"
                placeholder="Account Number"
                value={formData.account_number}
                onChange={handleInputChange}
              />
              <input
                className="input"
                name="account_name"
                placeholder="Account Name"
                value={formData.account_name}
                onChange={handleInputChange}
              />
              <select
                className="select"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
              >
                <option value="">Select Bank</option>
                <option>Bank of Ceylon</option>
                <option>People's Bank</option>
                <option>Commercial Bank</option>
                <option>Hatton National Bank</option>
                <option>Sampath Bank</option>
                <option>DFCC Bank</option>
                <option>NDB Bank</option>
              </select>
              <select
                className="select"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleInputChange}
              >
                <option value="">Select Branch</option>
                <option>Colombo</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Matara</option>
                <option>Kurunegala</option>
              </select>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                Upload Bank Document (Optional)
              </label>
              <input 
                className="input" 
                type="file" 
                onChange={handleBankDocumentChange} 
                accept=".pdf,.jpg,.jpeg,.png" 
              />
              <UploadStatus type="bank" />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="card">
            <h2 style={{ margin: 0 }}>Documents Upload</h2>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Upload profile photo and supporting documents</div>
            <div style={{ height: 12 }} />
            
            {/* Profile Photo Section */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                Profile Photo (JPG/JPEG/PNG)
              </label>
              <input 
                className="input" 
                type="file" 
                onChange={handleProfilePhotoChange} 
                accept=".jpg,.jpeg,.png" 
              />
              <UploadStatus type="profile" />
              {profilePhoto && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'green' }}>
                  ✅ Selected: {profilePhoto.name}
                </div>
              )}
            </div>

            {/* Multiple Documents Section */}
            <div style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 16 }}>Supporting Documents</h4>
              
              {/* Current Document Upload */}
              <div style={{ 
                padding: 16, 
                border: '1px solid #e1e5e9', 
                borderRadius: 8, 
                marginBottom: 16,
                background: '#f8f9fa'
              }}>
                <div className="grid-2">
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                      Document Type
                    </label>
                    <select 
                      className="select" 
                      value={currentDocumentType} 
                      onChange={(e) => setCurrentDocumentType(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="">Select Document Type</option>
                      <option>NIC Copy</option>
                      <option>Birth Certificate</option>
                      <option>Educational Certificates</option>
                      <option>Appointment Letter</option>
                      <option>Experience Letter</option>
                      <option>Passport Copy</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                      Upload Document (PDF/JPG/JPEG)
                    </label>
                    <input 
                      className="input" 
                      type="file" 
                      onChange={(e) => setCurrentDocumentFile(e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleAddDocument}
                  style={{ marginTop: 12 }}
                  disabled={!currentDocumentType || !currentDocumentFile}
                >
                  + Add Document
                </button>
              </div>

              {/* Uploaded Documents List */}
              {documents.length > 0 && (
                <div>
                  <h5 style={{ marginBottom: 12 }}>Uploaded Documents:</h5>
                  {documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        border: '1px solid #e1e5e9',
                        borderRadius: 6,
                        marginBottom: 8,
                        background: 'white'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{doc.type}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {doc.name}
                        </div>
                        <UploadStatus type={doc.uploadKey} />
                      </div>
                      <button 
                        type="button"
                        className="btn btn-soft"
                        onClick={() => handleRemoveDocument(doc.id)}
                        style={{ color: 'red', fontSize: 12 }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Upload Status Component
  const UploadStatus = ({ type }) => {
    const status = uploadStatus[type];
    if (!status) return null;
    
    return (
      <div style={{ 
        fontSize: '12px', 
        marginTop: '4px',
        color: status === 'success' ? 'green' : status === 'error' ? 'red' : 'blue',
        fontWeight: '500'
      }}>
        {status === 'uploading' && '⏳ Uploading...'}
        {status === 'success' && '✅ Upload successful!'}
        {status === 'error' && '❌ Upload failed!'}
      </div>
    );
  };

  return (
    <Layout>
      <div style={{ flexShrink: 0 }}>
        <PageHeader breadcrumb={["Employee Information", "Member Registration"]} title="Member Registration" />

        <div className="card" style={{ 
          display: "flex", 
          gap: "8px", 
          overflowX: "auto",
          whiteSpace: "nowrap",
          marginBottom: "16px",
          flexShrink: 0
        }}>
          {["Personal Details", "Official Details", "Relatives Details", "Bank Details", "Personal Documents"].map(
            (label, index) => (
              <button
                key={label}
                className={`btn ${step === index + 1 ? "btn-primary" : "btn-soft"}`}
                type="button"
                onClick={() => setStep(index + 1)}
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              >
                {index + 1}. {label}
              </button>
            )
          )}
        </div>

        {error && (
          <div className="card" style={{ 
            borderColor: "var(--danger)", 
            color: "var(--danger)", 
            marginBottom: "16px", 
            flexShrink: 0,
            padding: "12px"
          }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <form onSubmit={handleSubmit} style={{ height: "100%" }}>
          {renderStep()}
          <div style={{ height: 16 }} />
          <div style={{ display: "flex", gap: 8, paddingBottom: "20px" }}>
            {step > 1 && (
              <button type="button" className="btn btn-soft" onClick={prevStep}>
                Previous
              </button>
            )}
            {step < 5 && (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Save & Next
              </button>
            )}
            {step === 5 && (
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Employee"}
              </button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
}