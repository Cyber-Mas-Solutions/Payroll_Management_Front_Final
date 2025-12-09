import React from 'react'
import PayrollTrendsChart from './PayrollTrendsChart'
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import PageHeader from '../../../components/PageHeader';

const CompensateTrendsPage = () => {

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
        breadcrumb={["Report & Analytics", "Compensate Trends"]}
        title="Compensate Trends"
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


      <div className="bg-white rounded-lg w-[95%] text-black shadow-sm border border-gray-200" style={{paddingTop: '10px', margin:'24px'}}>
        <PayrollTrendsChart />
      </div>
    </Layout>
  )
}

export default CompensateTrendsPage
