import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import PageHeader from '../../../components/PageHeader';
import { useLocation, useNavigate } from 'react-router-dom';
import EmployeeContent from './EmployeeContent';

const EmployeeSummaryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Employee Summary", path: "/report-analytics" },
    { label: "Payroll Summary", path: "/report-analytics/payroll-summary" },
    { label: "Cost Center Analysis", path: "/report-analytics/cost-center-analysis" },
    { label: "Compensation Trends", path: "/report-analytics/compensation-trends" },
    { label: "Forecasting", path: "/report-analytics/forecasting" },
  ];

  return (
    <Layout>
      <PageHeader
        breadcrumb={["Report & Analytics", "Employee Summary"]}
        title="Employee Summary"
      />

      {/* Tab Buttons */}
      <div
        className="card"
        style={{ display: "flex", gap: "8px", overflowX: "auto", whiteSpace: "nowrap" }}
      >
        {tabs.map((t) => (
          <button
            key={t.path}
            className={`btn ${location.pathname === t.path ? "btn-primary" : "btn-soft"}`}
            onClick={() => navigate(t.path)}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <EmployeeContent/>
      
    </Layout>
  );
};



export default EmployeeSummaryPage;
