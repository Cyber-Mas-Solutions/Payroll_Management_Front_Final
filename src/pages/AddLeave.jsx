import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddLeave.css'; // Updated styles
import Sidebar from '../components/Sidebar';

const AddLeave = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee: '',
    department: '',
    date: '',
    leaveType: '',
    duration: '',
    approvedBy: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingData = JSON.parse(localStorage.getItem('attendanceData')) || [];

    const newRecord = {
      id: existingData.length + 1,
      employee: formData.employee,
      department: formData.department,
      date: formData.date,
      attendanceStatus: '-',
      leaveStatus: 'Pending',
      details: `Type: ${formData.leaveType}\nDuration: ${formData.duration}\nApproved by: ${formData.approvedBy}`,
    };

    localStorage.setItem('attendanceData', JSON.stringify([...existingData, newRecord]));

    alert('✅ Leave added successfully!');
    navigate('/attendance-leave');
  };

  return (
    <div className="add-leave-wrapper">
      <Sidebar />

      <div className="overlay">
        <div className="add-leave-modal">
          <h2>Add Leave</h2>
          <form className="add-leave-form" onSubmit={handleSubmit}>
            <label>Employee Name</label>
            <input
              type="text"
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              required
            />

            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />

            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <label>Leave Type</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Annual Leave">Annual Leave</option>
            </select>

            <label>Duration</label>
            <input
              type="text"
              name="duration"
              placeholder="Full Day / Half Day"
              value={formData.duration}
              onChange={handleChange}
              required
            />

            <label>Approved By</label>
            <input
              type="text"
              name="approvedBy"
              value={formData.approvedBy}
              onChange={handleChange}
              required
            />

            <div className="button-group">
              <button type="submit" className="save-btn">Save</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/attendance-leave')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLeave;
