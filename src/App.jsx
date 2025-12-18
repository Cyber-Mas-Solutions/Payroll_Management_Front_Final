// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Header from "./components/Header"; // Header is likely included within Layout/PrivateRoute
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute

// Employee Info
import EmployeeInfo from "./pages/EmployeeInfo";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import ViewEmployee from "./pages/ViewEmployee";

// Salary Compensation
import Earnings from "./pages/Earnings";
import Deductions from "./pages/Deductions";
import Allowances from "./pages/Allowances";
import AddAllowance from "./pages/AddAllowance";
import AddDeduction from "./pages/AddDeduction";
import OvertimeAdjustments from "./pages/OvertimeAdjustments";
import CompensationAdjustment from "./pages/CompensationAdjustment";
import NetSalarySummary from "./pages/NetSalarySummary";
import ETFEPF from "./pages/ETFEPF";
import EtfEpfProcess from "./pages/EtfEpfProcess"; // <-- New Component
import UnpaidLeaves from "./pages/UnpaidLeaves"; // <-- New Component


// Time & Attendance / Leave Management
import AttendanceLeave from "./pages/AttendanceLeave"; // Landing page?
import AttendanceOverview from "./pages/AttendanceOverview";
import TimeManagement from "./pages/TimeManagement";
import AbsenceReport from "./pages/AbsenceReport";
import AttendanceAdjustment from "./pages/AttendanceAdjustment";
import EmployeeAdjustment from "./pages/EmployeeAdjustment"; // specific employee adjustment
import CheckinCheckoutReport from "./pages/CheckinCheckoutReport";
import EmployeeLeaves from "./pages/EmployeeLeaves"; // Employee's own leaves
import LeaveApproval from "./pages/LeaveApproval";
import LeaveCalendar from "./pages/LeaveCalendar";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveRules from "./pages/LeaveRules";
import AddLeave from "./pages/AddLeave";

// Performance & Documents
import PerformanceTraining from "./pages/PerformanceTraining";
import DocumentsContracts from "./pages/DocumentsContracts";

// Payroll Processing
import Payroll from "./pages/Payroll Processing/Payroll"; // Main Payroll Landing
import ProcessPayroll from "./pages/Payroll Processing/ProcessPayroll";
import LoadEmployeeData from "./pages/Payroll Processing/LoadEmployeeData";
import ReviewSalary from "./pages/Payroll Processing/ReviewSalary";
import FinalizePayroll from "./pages/Payroll Processing/FinalizePayroll";
import ConfirmProcessing from "./pages/Payroll Processing/ConfirmProcessing";
import GeneratePaySlip from "./pages/Payroll Processing/GeneratePaySlip";
import EmployeeSalaryDetails from "./pages/Payroll Processing/EmployeeSalaryDetails";

// Reports and Analytics
import EmployeeSummaryPage from "./pages/Reports/EmployeeSummaryPage/EmployeeSummaryPage";
import PayRollSummaryPage from "./pages/Reports/PayRollSummaryPage/PayRollSummaryPage";
import CostCenterAnalysisPage from "./pages/Reports/CostCenterAnalysisPage/CostCenterAnalysisPage";
import CompensateTrendsPage from "./pages/Reports/CompentsationTrendsPage/CompensateTrendsPage";
import ForecastingPage from "./pages/Reports/ForecastingPage/ForecastingPage";

// Security & Administration
import AuditLogs from "./pages/AuditLogs"; // Seems to be the list page
import AuditLog from "./pages/AuditLog"; // Duplicate? Keeping AuditLogs for list.
import AuditLogDetails from "./pages/AuditLogDetails";
import SecurityAccessControl from "./pages/SecurityAccessControl";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import AccessControl from "./pages/AccessControl";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import BulkActions from "./pages/BulkActions";
import Policies from "./pages/Policies";
import Designations from "./pages/Designations";
import RolesPage from "./pages/Administration/AdministrationRoles/RolesPage";
import DepartmentsPage from "./pages/Administration/AdminstrationDepartment/DepartmentsPage";
import ShiftsPage from "./pages/Administration/AdministrativeShifts/ShiftsPage";
import HolidaysPage from "./pages/Administration/AdminsitrationHolidays/HolidaysPage";
import AnnouncementsPage from "./pages/Administration/AdministrativeAnnouncements/AnnouncementsPage";


function App() {
  return (
    <Router>
      <Routes>
        
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={<Login />} />
        <Route path="/header" element={<Header />} /> {/* Should probably be part of Layout */}

        {/* === PRIVATE ROUTES (Requires Auth) === */}
        {/* Wrap all main application routes in a PrivateRoute */}
        <Route element={<PrivateRoute />}>
          
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Employee Information */}
          <Route path="/employee-info" element={<EmployeeInfo />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/employees/:id/edit" element={<EditEmployee />} /> 
          <Route path="/employees/:id/view" element={<ViewEmployee />} />
          <Route path="/designations" element={<Designations />} />

          {/* Salary Compensation */}
          <Route path="/earnings" element={<Earnings />} />
          <Route path="/deductions" element={<Deductions />} />
          <Route path="/add-deduction" element={<AddDeduction />} />
          <Route path="/allowances" element={<Allowances />} />
          <Route path="/add-allowance" element={<AddAllowance />} />
          <Route path="/overtime-adjustments" element={<OvertimeAdjustments />} />
          <Route path="/compensation-adjustment" element={<CompensationAdjustment />} />
          <Route path="/net-salary-summary" element={<NetSalarySummary />} />
          
          {/* ETF/EPF & Unpaid Leaves */}
          <Route path="/etf-epf" element={<ETFEPF />} />
          <Route path="/etf-epf-process" element={<EtfEpfProcess />} />
          <Route path="/unpaid-leaves" element={<UnpaidLeaves />} />
          
          {/* Time & Attendance */}
          <Route path="/attendance-leave" element={<AttendanceLeave />} />
          <Route path="/attendance-overview" element={<AttendanceOverview />} />
          <Route path="/time-management" element={<TimeManagement />} />
          <Route path="/absence-report" element={<AbsenceReport />} />
          <Route path="/attendance-adjustment" element={<AttendanceAdjustment />} />
          <Route path="/attendance-adjustment/:id" element={<EmployeeAdjustment />} />
          <Route path="/checkin-checkout-report" element={<CheckinCheckoutReport />} />
          
          {/* Leave Management */}
          <Route path="/employee-leaves" element={<EmployeeLeaves />} />
          <Route path="/leave-approval" element={<LeaveApproval />} />
          <Route path="/leave-calendar" element={<LeaveCalendar />} />
          <Route path="/leave-request" element={<LeaveRequest />} />
          <Route path="/leave-rules" element={<LeaveRules />} />
          <Route path="/add-leave" element={<AddLeave />} />

          {/* Performance & Documents */}
          <Route path="/performance-training" element={<PerformanceTraining />} />
          <Route path="/documents-contracts" element={<DocumentsContracts />} />
          
          {/* Payroll Processing */}
          <Route path="/payroll-processing" element={<Payroll />} />
          <Route path="/process-payroll" element={<ProcessPayroll />} />
          <Route path="/process-payroll/load-data" element={<LoadEmployeeData />} />
          <Route path="/process-payroll/review-salary" element={<ReviewSalary />} />
          <Route path="/process-payroll/finalize-payroll" element={<FinalizePayroll />} />
          <Route path="/process-payroll/confirm-processing" element={<ConfirmProcessing />} />
          <Route path="/generate-pay-slip" element={<GeneratePaySlip />} />
          <Route path="/employee-salary-details" element={<EmployeeSalaryDetails />} />

          {/* Reports and Analysis */}
          <Route path="/report-analytics" element={<EmployeeSummaryPage />} /> {/* Main Reports Landing */}
          <Route path="/report-analytics/payroll-summary" element={<PayRollSummaryPage />} />
          <Route path="/report-analytics/cost-center-analysis" element={<CostCenterAnalysisPage />} />
          <Route path="/report-analytics/compensation-trends" element={<CompensateTrendsPage />} />
          <Route path="/report-analytics/forecasting" element={<ForecastingPage />} />

          {/* Security & Access Control */}
          <Route path="/security-access-control" element={<SecurityAccessControl />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/edit-user" element={<EditUser />} />
          <Route path="/role-management" element={<RoleManagement />} />
          <Route path="/access-control" element={<AccessControl />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/audit-log/:id" element={<AuditLogDetails />} />
          
          {/* Administration */}
          <Route path="/administrative" element={<RolesPage />} /> {/* Main Admin Landing */}
          <Route path="/administrative/departments" element={<DepartmentsPage />} />
          <Route path="/administrative/shifts" element={<ShiftsPage />} />
          <Route path="/administrative/holidays" element={<HolidaysPage />} />
          <Route path="/administrative/announcements" element={<AnnouncementsPage />} />
          
          {/* Admin Helpers (Moved from main routes) */}
          <Route path="/bulk-actions" element={<BulkActions />} />
          <Route path="/policies" element={<Policies />} />
          
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;