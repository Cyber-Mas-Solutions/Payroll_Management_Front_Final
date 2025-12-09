import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/AddUser.css"; // You can reuse AddUser styles

const EditUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });

  useEffect(() => {
    if (userData) setFormData(userData);
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`User "${formData.name}" updated successfully!`);
    navigate("/user-management");
  };

  return (
    <div className="adduser-container">
      <Sidebar />
      <div className="adduser-content">
        <Header />
        <header className="adduser-header">
          <h1 className="page-title">Edit User</h1>
          <p className="subtitle">Modify user details</p>
        </header>

        <form className="adduser-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Role
            <select name="role" value={formData.role} onChange={handleChange}>
              <option>HR Admin</option>
              <option>Finance</option>
              <option>IT Support</option>
              <option>Operations Manager</option>
              <option>Marketing Executive</option>
            </select>
          </label>

          <label>
            Status
            <select name="status" value={formData.status} onChange={handleChange}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/user-management")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
