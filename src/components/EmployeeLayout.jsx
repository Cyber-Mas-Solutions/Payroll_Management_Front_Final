import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "./Header"; // your existing top bar

import "../styles/EmployeeLayout.css";

export default function EmployeeLayout() {
  return (
    <div className="employee-shell">
      {/* Global app header */}
      <Header />

      {/* Uniform page-level header */}
      <div className="employee-header">
        <div className="eh-left">
          <div className="breadcrumb">
            <span>Employee Information</span>
            <span className="breadcrumb-sep">›</span>
            <span className="active">Employee Information Management</span>
          </div>
          <h1 className="page-title">Employee Information Management</h1>
        </div>
        <div className="eh-right">{/* add icons/actions if needed */}</div>
      </div>

      {/* Persistent sub-navigation for all Employee tabs */}
      <div className="employee-subnav">
        <NavLink end to="/employee-info" className="subtab">
          Overview
        </NavLink>
        <NavLink to="/employee-info/add" className="subtab">
          Add Employee
        </NavLink>
        <NavLink to="/employee-info/attendance" className="subtab">
          Attendance &amp; Leave Records
        </NavLink>
        <NavLink to="/employee-info/performance" className="subtab">
          Performance &amp; Training
        </NavLink>
        <NavLink to="/employee-info/documents" className="subtab">
          Documents &amp; Contracts
        </NavLink>
        <NavLink to="/employee-info/audit" className="subtab">
          Audit Logs
        </NavLink>
      </div>

      {/* Tab content renders here */}
      <div className="employee-body">
        <Outlet />
      </div>
    </div>
  );
}
