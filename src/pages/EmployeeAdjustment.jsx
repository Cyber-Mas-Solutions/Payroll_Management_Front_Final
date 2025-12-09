import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/AttendanceAdjustment.css";

const EmployeeAdjustment = () => {
  const { id } = useParams(); // employee number from route
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Updated Employee Data (IDs = 1, 2, 3…)
  const employees = [
    { no: 1, empId: "1", name: "Rashmi Jayathunga", department: "HR", designation: "HR Manager" },
    { no: 2, empId: "2", name: "Nimesha Fernando", department: "Finance", designation: "Account Executive" },
    { no: 3, empId: "3", name: "Thilina Abeysekara", department: "IT", designation: "Software Engineer" },
    { no: 4, empId: "4", name: "Sajini Weerasinghe", department: "Operations", designation: "Operations Analyst" },
    { no: 5, empId: "5", name: "Chathura Ranasinghe", department: "Sales", designation: "Sales Executive" },
    { no: 6, empId: "6", name: "Isuri Karunaratne", department: "Marketing", designation: "Marketing Coordinator" },
    { no: 7, empId: "7", name: "Malith Perera", department: "IT", designation: "System Administrator" },
    { no: 8, empId: "8", name: "Sewwandi Gunasekara", department: "HR", designation: "Recruitment Officer" },
    { no: 9, empId: "9", name: "Roshan Siriwardena", department: "Logistics", designation: "Logistics Executive" },
    { no: 10, empId: "10", name: "Dinusha Rathnayake", department: "Customer Service", designation: "Customer Support Lead" },
  ];

  // ✅ Find employee by number (from route param)
  const employee = employees.find((e) => e.no === Number(id)) || employees[0];

  // ✅ Mock Attendance Records
  const attendanceRecords = [
    {
      date: "2025-09-28",
      checkIn: "08:45:10",
      checkInType: "Normal",
      checkOut: "17:00:00",
      checkOutType: "Normal",
      status: "Present",
      ot: "1h",
      remark: "On time",
      checkInAddress: "Colombo HQ",
      checkOutAddress: "Colombo HQ",
    },
    {
      date: "2025-09-29",
      checkIn: "09:10:00",
      checkInType: "Late",
      checkOut: "17:10:00",
      checkOutType: "Normal",
      status: "Present",
      ot: "0.5h",
      remark: "Late due to traffic",
      checkInAddress: "Colombo HQ",
      checkOutAddress: "Colombo HQ",
    },
  ];

  // ✅ Format date as MM/DD/YYYY uppercase
  const formatDate = (date) => {
    const d = new Date(date);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`.toUpperCase();
  };

  return (
    <div className="attendance-adjustment-container">
      <Sidebar />
      <div className="attendance-adjustment-content">
        <Header />

        {/* Header */}
        <header className="attendance-adjustment-header">
          <h1 className="page-title">Attendance Adjustment</h1>
        </header>

        {/* ✅ Employee Info Card 
        <div className="employee-details-card">
          <div>
            <strong>Employee No:</strong> {employee.empId}
          </div>
          <div>
            <strong>Name:</strong> {employee.name}
          </div>
          <div>
            <strong>Department:</strong> {employee.department}
          </div>
          <div>
            <strong>Designation:</strong> {employee.designation}
          </div>
        </div> */}

        {/* ✅ Date Filter Section */}
        <div className="date-filter-row">
          <div className="date-field">
            <input
              type={startDate ? "date" : "text"}
              value={startDate}
              className="filter-date uppercase-placeholder"
              placeholder="MM/DD/YYYY"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <span>—</span>

          <div className="date-field">
            <input
              type={endDate ? "date" : "text"}
              value={endDate}
              className="filter-date uppercase-placeholder"
              placeholder="MM/DD/YYYY"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <p className="date-note">*Pick date range to view attendance</p>
        </div>

        {/* ✅ Scrollable Table */}
        <div className="table-wrapper">
          <table className="adjustment-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Date</th>
                <th>Check-in Time</th>
                <th>Check-in Type</th>
                <th>Check-out Time</th>
                <th>Check-out Type</th>
                <th>Status</th>
                <th>OT</th>
                <th>Remark</th>
                <th>Check-in Address</th>
                <th>Check-out Address</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.checkIn}</td>
                    <td>{record.checkInType}</td>
                    <td>{record.checkOut}</td>
                    <td>{record.checkOutType}</td>
                    <td>{record.status}</td>
                    <td>{record.ot}</td>
                    <td>{record.remark}</td>
                    <td>{record.checkInAddress}</td>
                    <td>{record.checkOutAddress}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", color: "#9ca3af" }}>
                    No attendance records found.
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

export default EmployeeAdjustment;
