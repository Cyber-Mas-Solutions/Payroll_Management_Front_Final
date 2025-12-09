import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/AddUser.css";

const AddUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "HR Admin",
    status: "Active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`User "${formData.name}" added successfully!`);
    navigate("/user-management");
  };

  return (
    <div className="adduser-container">
      <Sidebar />
      <div className="adduser-content">
        <Header />

        <header className="adduser-header">
          <h1 className="page-title">Add New User</h1>
          <p className="subtitle">Create a new user account</p>
        </header>

        <form className="adduser-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
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
              placeholder="Enter email"
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
            <button type="submit" className="save-btn">Save User</button>
            <button type="button" className="cancel-btn" onClick={() => navigate("/user-management")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
