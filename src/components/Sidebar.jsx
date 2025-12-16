// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { id: 'employee-information', label: 'Employee Information', icon: '👤', path: '/employee-info' },
    {
      id: 'salary-compensation',
      label: 'Salary Compensation',
      icon: '💰',
      path: '/earnings',
      hasSubmenu: true,
      submenu: [
        { label: 'Earnings', path: '/earnings' },
        { label: 'Deductions', path: '/deductions' },
        { label: 'Allowances', path: '/allowances' },
        { label: 'Overtime & Adjustments', path: '/overtime-adjustments' },
        { label: 'Compensation Adjustment', path: '/compensation-adjustment' },
        { label: 'ETF & EPF', path: '/etf-epf'},
        { label: "ETF/EPF Process", path: "/etf-epf-process" },
        { label: 'Unpaid Leaves', path: '/unpaid-leaves'},
        { label: 'Net Salary Summary', path: '/net-salary-summary' },
      ],
    },
    { id: 'payroll-processing', 
      label: 'Payroll Processing', 
      icon: '📊', 
      path: '/payroll-processing'
     },
    {
      id: 'time-attendance',
      label: 'Time & Attendance',
      icon: '⏰',
      path: '/time-attendance',
      hasSubmenu: true,
      submenu: [
        { label: 'Attendance', path: '/attendance-overview' },
        { label: 'Leave', path: '/employee-leaves' },
      ],
    },
    { id: 'compliance-reporting', label: 'Compliance & Reporting', icon: '📋', path: '/compliance-reporting' },
    {
      id: 'report-analytics',
      label: 'Report & Analytics',
      icon: '📈',
      path: '/report-analytics',
    },
        { id: 'administration', label: 'Administration', icon: '⚙️', path: '/administrative' },
    { id: 'security-access-control', label: 'Security & Access', icon: '🔒', path: '/security-access-control' },
  ];

  // Define all salary compensation related paths
  const salaryCompensationPaths = [
    '/earnings', '/deductions', '/allowances', '/overtime-adjustments',
    '/compensation-adjustment', '/net-salary-summary', '/add-deduction', '/add-allowance', '/etf-epf', '/etf-epf-process','/unpaid-leaves'
  ];

  const employeeInfoPaths = [
    '/employee-info', 
    '/add-employee', 
    '/attendance-leave', 
    '/performance-training', 
    '/documents-contracts', 
    '/audit-logs',
    '/employees'
  ];

  const timeAttendancePaths = [
    '/attendance-overview', '/employee-leaves', '/time-management', '/absence-report',
    '/attendance-adjustment', '/checkin-checkout-report', '/leave-approval',
    '/leave-calendar', '/leave-request'
  ];

  const reportAnalyticsPath = [
    '/report-analytics/payroll-summary', "/report-analytics/cost-center-analysis", "/report-analytics/compensation-trends", "/report-analytics/forecasting"
  ]

  const administrativePaths = [
    '/administrative', '/administrative/departments', '/administrative/shifts',
    '/administrative/holidays', '/administrative/announcements', '/administrative/roles'
  ];

  const getActiveItem = () => {
    const currentPath = location.pathname;

    if (salaryCompensationPaths.some(p => currentPath.startsWith(p))) return 'salary-compensation';
    if (employeeInfoPaths.some(p => currentPath.startsWith(p))) return 'employee-information';
    if (timeAttendancePaths.some(p => currentPath.startsWith(p))) return 'time-attendance';
    if (reportAnalyticsPath.some(p => currentPath.startsWith(p))) return 'report-analytics';

    return menuItems.find(item => currentPath === item.path)?.id || 'dashboard';
  };

  const activeItem = getActiveItem();

  const handleItemClick = (path) => navigate(path);

  const toggleSubmenu = (id) => setOpenSubmenu(openSubmenu === id ? null : id);

  const handleLogout = () => navigate('/');

  return (
    <div
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <div className="cms-logo">
          <div className="logo-icon">CMS</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="nav-item-container">
            <div
              className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => {
                if (item.hasSubmenu) toggleSubmenu(item.id);
                else handleItemClick(item.path);
              }}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.hasSubmenu && (
                <span className="submenu-arrow">{openSubmenu === item.id ? '▲' : '▼'}</span>
              )}
            </div>

            {/* ✅ Render Submenu only when expanded */}
            {item.hasSubmenu && openSubmenu === item.id && item.submenu && isExpanded && (
              <div className="submenu">
                {item.submenu.map((sub) => (
                  <div
                    key={sub.path}
                    className={`submenu-item ${location.pathname === sub.path ? 'active' : ''}`}
                    onClick={() => handleItemClick(sub.path)}
                  >
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 <span className="logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;