import React, { useState } from 'react';
import PayrollSummaryCards from './PayrollSummaryCards';
import SalaryHistogram from './SalaryHistogram';
import DaySelector from '../DaySelector';
import Layout from '../../../components/Layout';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';

const PayRollSummaryPage = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Employee Summary", path: "/report-analytics" },
    { label: "Payroll Summary", path: "/report-analytics/payroll-summary" },
    { label: "Cost Center Analysis", path: "/report-analytics/cost-center-analysis" },
    { label: "Compensation Trends", path: "/report-analytics/compensation-trends" },
    { label: "Forecasting", path: "/report-analytics/forecasting" },
  ];
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleMonthYearChange = ({ month: selectedMonth, year: selectedYear }) => {
    setMonth(selectedMonth);
    setYear(selectedYear);
  };

  return (
      <Layout>

       <PageHeader
              breadcrumb={["Report & Analytics", "Payroll Summary"]}
              title="Payroll Summary"
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
      
      
        <div style={{padding: '14px 10px', margin:'24px'}}>
          <div className="bg-white rounded-lg w-[95%] text-black shadow-sm border border-gray-200">

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding:0, margin:'10px' }}>
              <DaySelector type='monthYear' onChange={handleMonthYearChange} />
            </div>

            <PayrollSummaryCards month={month} year={year} />

            <SalaryHistogram />
          </div>
        </div>
      </Layout>
  );
};

export default PayRollSummaryPage;
