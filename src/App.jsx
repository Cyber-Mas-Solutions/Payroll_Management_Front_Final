// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import EmployeeInfo from "./pages/EmployeeInfo";
import AddEmployee from "./pages/AddEmployee";
import AttendanceLeave from "./pages/AttendanceLeave";
import PerformanceTraining from "./pages/PerformanceTraining";
import DocumentsContracts from "./pages/DocumentsContracts";
import AuditLogs from "./pages/AuditLogs"
import Earnings from "./pages/Earnings";
import Deductions from "./pages/Deductions";
import Allowances from "./pages/Allowances";
import AddAllowance from "./pages/AddAllowance";
import EditEmployee from "./pages/EditEmployee";
import AddDeduction from "./pages/AddDeduction";
import AddLeave from "./pages/AddLeave";
import OvertimeAdjustments from "./pages/OvertimeAdjustments";
import CompensationAdjustment from "./pages/CompensationAdjustment";
import NetSalarySummary from "./pages/NetSalarySummary";
import BulkActions from "./pages/BulkActions";
import Policies from "./pages/Policies";
import Designations from "./pages/Designations";
import ViewEmployee from "./pages/ViewEmployee";
import AttendanceOverview from "./pages/AttendanceOverview";
import TimeManagement from "./pages/TimeManagement";
import AbsenceReport from "./pages/AbsenceReport";
import AttendanceAdjustment from "./pages/AttendanceAdjustment";
import EmployeeAdjustment from "./pages/EmployeeAdjustment";
import CheckinCheckoutReport from "./pages/CheckinCheckoutReport";
import EmployeeLeaves from "./pages/EmployeeLeaves";
import LeaveApproval from "./pages/LeaveApproval";
import LeaveCalendar from "./pages/LeaveCalendar";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveRules from "./pages/LeaveRules";



import SecurityAccessControl from "./pages/SecurityAccessControl";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import AccessControl from "./pages/AccessControl";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import PrivateRoute from "./components/PrivateRoute";
import AuditLog from "./pages/AuditLog";
import AuditLogDetails from "./pages/AuditLogDetails";
import EmployeeSummaryPage from "./pages/Reports/EmployeeSummaryPage/EmployeeSummaryPage";
import PayRollSummaryPage from "./pages/Reports/PayRollSummaryPage/PayRollSummaryPage";
import CostCenterAnalysisPage from "./pages/Reports/CostCenterAnalysisPage/CostCenterAnalysisPage";
import CompensateTrendsPage from "./pages/Reports/CompentsationTrendsPage/CompensateTrendsPage";
import ForecastingPage from "./pages/Reports/ForecastingPage/ForecastingPage";

import Payroll from "./pages/Payroll Processing/Payroll";
import ProcessPayroll from "./pages/Payroll Processing/ProcessPayroll";
import LoadEmployeeData from "./pages/Payroll Processing/LoadEmployeeData";
import GeneratePaySlip from "./pages/Payroll Processing/GeneratePaySlip";
import EmployeeSalaryDetails from "./pages/Payroll Processing/EmployeeSalaryDetails";

import ETFEPF from "./pages/ETFEPF";
import EtfEpfProcess from "./pages/EtfEpfProcess";
import UnpaidLeaves from "./pages/UnpaidLeaves";
// import ETFEPFDetails from "./pages/ETFEPFDetails";
import RolesPage from "./pages/Administration/AdministrationRoles/RolesPage";
import DepartmentsPage from "./pages/Administration/AdminstrationDepartment/DepartmentsPage";
import ShiftsPage from "./pages/Administration/AdministrativeShifts/ShiftsPage";
import HolidaysPage from "./pages/Administration/AdminsitrationHolidays/HolidaysPage";
import AnnouncementsPage from "./pages/Administration/AdministrativeAnnouncements/AnnouncementsPage";

//payroll processing 




function App() {
  return (
    <Router>
      <Routes>

       <Route path="/" element={<Login />} />
       <Route path="/header" element={<Header />} />
       <Route path="/dashboard" element={<Dashboard />} />
       <Route path="/employee-info" element={<EmployeeInfo />} />
       <Route path="/add-employee" element={<AddEmployee />} />
       <Route path="/attendance-leave" element={<AttendanceLeave />} />
       <Route path="/performance-training" element={<PerformanceTraining />} />
       <Route path="/documents-contracts" element={<DocumentsContracts />} />
       <Route path="/audit-logs" element={<AuditLogs />} />
       <Route path="/earnings" element={<Earnings />} />
       <Route path="/deductions" element={<Deductions />} />
       <Route path="/allowances" element={<Allowances />} />
       // Add this route to your routing configuration
       <Route path="/add-allowance" element={<AddAllowance />} />
       <Route path="/employees" element={<AddEmployee/>} />     
       <Route path="/employees/:id/edit" element={<EditEmployee/>} />        
       <Route path="/add-deduction" element={<AddDeduction/>} />  
       <Route path="/add-leave" element={<AddLeave/>} />     
       <Route path="/overtime-adjustments" element={<OvertimeAdjustments/>}/>
       <Route path="/compensation-adjustment" element={<CompensationAdjustment/>}/>
       <Route path="/net-salary-summary" element={<NetSalarySummary/>}/>
       <Route path="/employees/:id/view" element={<ViewEmployee/>}/>
       <Route path="/attendance-overview" element={<AttendanceOverview/>}/>
       <Route path="/time-management" element={<TimeManagement/>}/>
       <Route path="/absence-report" element={<AbsenceReport/>}/>
       <Route path="/attendance-adjustment" element={<AttendanceAdjustment/>}/>
       <Route path="/attendance-adjustment/:id" element={<EmployeeAdjustment />} />
       <Route path="/checkin-checkout-report" element={<CheckinCheckoutReport />} />
       <Route path="/employee-leaves" element={<EmployeeLeaves/>} />
       <Route path="/leave-approval" element={<LeaveApproval/>} />
       <Route path="/leave-calendar" element={<LeaveCalendar/>} />
       <Route path="/leave-request" element={<LeaveRequest/>} />
       <Route path="/security-access-control" element={<SecurityAccessControl/>} />
       <Route path="/user-management" element={<UserManagement/>} />
       <Route path="/role-management" element={<RoleManagement/>} />
       <Route path="/access-control" element={<AccessControl/>} />
       <Route path="/add-user" element={<AddUser/>} />
       <Route path="/edit-user" element={<EditUser/>} />
      
      <Route path="/audit-logs" element={<AuditLogs />} />
      <Route path="/earnings" element={<Earnings />} />
      <Route path="/deductions" element={<Deductions />} />
      <Route path="/allowances" element={<Allowances />} />
      <Route path="/add-allowance" element={<AddAllowance />} />
      <Route path="/employees" element={<AddEmployee/>} />     
      <Route path="/employees/:id/edit" element={<EditEmployee/>} />        
      <Route path="/add-deduction" element={<AddDeduction/>} />  
      <Route path="/add-leave" element={<AddLeave/>} />     
      <Route path="/overtime-adjustments" element={<OvertimeAdjustments/>}/>
      <Route path="/compensation-adjustment" element={<CompensationAdjustment/>}/>
      <Route path="/net-salary-summary" element={<NetSalarySummary/>}/>

      <Route path="/etf-epf" element={<ETFEPF />} />
      <Route path="/etf-epf-process" element={<EtfEpfProcess />} />
      <Route path="/unpaid-leaves" element={<UnpaidLeaves />} />
      


      <Route path="/employees/:id/view" element={<ViewEmployee/>}/>
      <Route path="/attendance-overview" element={<AttendanceOverview/>}/>
      <Route path="/time-management" element={<TimeManagement/>}/>
      <Route path="/absence-report" element={<AbsenceReport/>}/>
      <Route path="/attendance-adjustment" element={<AttendanceAdjustment/>}/>
      <Route path="/attendance-adjustment/:id" element={<EmployeeAdjustment />} />
      <Route path="/checkin-checkout-report" element={<CheckinCheckoutReport />} />
      <Route path="/employee-leaves" element={<EmployeeLeaves/>} />
      <Route path="/leave-approval" element={<LeaveApproval/>} />
      <Route path="/leave-calendar" element={<LeaveCalendar/>} />
      <Route path="/leave-request" element={<LeaveRequest/>} />
      <Route path="/leave-rules" element={<LeaveRules/>} />


      {/* payroll processing */}
      <Route path="/payroll-processing" element={<Payroll/>} />
      <Route path="/process-payroll" element={<ProcessPayroll />} />
      <Route path="/process-payroll/load-data" element={<LoadEmployeeData />} />
      <Route path="/generate-pay-slip" element={<GeneratePaySlip />} />



      <Route path="/security-access-control" element={<SecurityAccessControl/>} />
      <Route path="/user-management" element={<UserManagement/>} />
      <Route path="/role-management" element={<RoleManagement/>} />
      <Route path="/access-control" element={<AccessControl/>} />
      <Route path="/add-user" element={<AddUser/>} />
      <Route path="/edit-user" element={<EditUser/>} />
      <Route path="/audit-log" element={<AuditLog/>} />
      <Route path="/audit-log/:id" element={<AuditLogDetails />} />

      
      <Route path="/payroll-processing" element={<Payroll/>} />
      <Route path="/process-payroll" element={<ProcessPayroll />} />
      <Route path="/process-payroll/load-data" element={<LoadEmployeeData />} />
      <Route path="/generate-pay-slip" element={<GeneratePaySlip />} />
      <Route path="/employee-salary-details" element={<EmployeeSalaryDetails />} />




      {/* Reports and Analysis */}
        <Route path="/report-analytics" element={<EmployeeSummaryPage />} />
        <Route path="/report-analytics/payroll-summary" element={<PayRollSummaryPage />} />
        <Route path="/report-analytics/cost-center-analysis" element={<CostCenterAnalysisPage />} />
        <Route path="/report-analytics/compensation-trends" element={<CompensateTrendsPage />} />
        <Route path="/report-analytics/forecasting" element={<ForecastingPage />} />

      {/* Administrative */}
        <Route path="/administrative" element={<RolesPage />} />
        <Route path="/administrative/departments" element={<DepartmentsPage />} />
        <Route path="/administrative/shifts" element={<ShiftsPage />} />
        <Route path="/administrative/holidays" element={<HolidaysPage />} />
        <Route path="/administrative/announcements" element={<AnnouncementsPage />} />

      {/* Admin helpers*/}
      <Route path="/bulk-actions" element={<BulkActions/>}/>
      <Route path="/policies" element={<Policies/>}/>
      <Route path="/designations" element={<Designations/>}/>

      </Routes>
    </Router>
  );
}

export default App;
