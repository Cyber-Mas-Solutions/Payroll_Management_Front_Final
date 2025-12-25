// src/services/api.js
import { getPublicIP } from "../utils/getIP";

// Base URL (same as you had)
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'; // Add "export" here

// ---- Token helpers -------------------------------------------------
export function getToken() { // Add "export" here
  // Adjust if your app stores the token differently
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

export function authHeaders(extra = {}) { // Add "export" here
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}


// ---- GET: return raw body (array or object). Throw on non-2xx -----
export async function apiGet(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || 'GET',
    credentials: 'include',
    headers: authHeaders(opts.headers || {}),
    ...opts,
  });

  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const body = isJSON ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

  if (!res.ok) {
    // Prefer server message if available
    const msg =
      (isJSON && body && (body.message || body.error)) ||
      (typeof body === 'string' && body) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return body; // could be array or object
}

let cachedIP = null;
// ---- JSON helpers (POST/PUT/PATCH) that ALWAYS attach token --------
// They return: { ok, status, ...body } so caller can check json.ok safely.
async function apiJsonWrite(path, method, body) {
  if (!cachedIP) cachedIP = await getPublicIP(); 
  const payload = { ...body, ip : cachedIP };
  console.log(payload);

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });

  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const data = isJSON ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

  if (typeof data === 'object' && data !== null) {
    return { ok: res.ok, status: res.status, ...data };
  }
  return { ok: res.ok, status: res.status, data };
}

// Backward-compat name you already used sometimes
export function apiJSON(path, method, body) {
  return apiJsonWrite(path, method, body);
}

// POST/PUT/PATCH wrappers
export function apiPost(path, body = {}) {
  return apiJsonWrite(path, 'POST', body);
}

export function apiPut(path, body = {}) {
  return apiJsonWrite(path, 'PUT', body);
}

export function apiPatch(path, body = {}) {
  return apiJsonWrite(path, 'PATCH', body);
}

// ---- DELETE (returns { ok, status, ...body }) ----------------------
export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: authHeaders(),
  });

  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const data = isJSON ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

  if (typeof data === 'object' && data !== null) {
    return { ok: res.ok, status: res.status, ...data };
  }
  return { ok: res.ok, status: res.status, data };
}

// ---- Upload (FormData) — do NOT set Content-Type manually ----------
// Returns { ok, status, ...body } like write helpers.
export async function apiUpload(path, formData, method = 'POST') {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: authHeaders(), // no 'Content-Type' so browser sets proper boundary
    body: formData,
  });

  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const data = isJSON ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

  if (typeof data === 'object' && data !== null) {
    return { ok: res.ok, status: res.status, ...data };
  }
  return { ok: res.ok, status: res.status, data };
}

// api with parameters
export async function apiGetWithParams(path, params = {}, opts = {}) {
  // Build query string
  let url = path;
  const query = new URLSearchParams();

  for (const key in params) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }

  const queryString = query.toString();
  if (queryString) url += `?${queryString}`;

  const finalUrl = `${API_BASE}${url}`;

  const res = await fetch(finalUrl, {
    method: opts.method || 'GET',
    credentials: 'include',
    headers: authHeaders(opts.headers || {}),
    ...opts,
  });
  
  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const body = isJSON ? await res.json().catch(() => ({})) : await res.text().catch(() => '');

  if (!res.ok) {
    // Ensure the thrown error contains the status/message if available in JSON body
    const msg =
      (isJSON && body && (body.message || body.error)) ||
      (typeof body === 'string' && body) ||
      `Request failed: ${res.status}`;
    throw new Error(msg);
  }

  // **CRITICAL FIX**: Return the entire body (which includes {ok: true, data: [...]})
  // This matches the consuming component's expected structure: `const data = res.ok && Array.isArray(res.data)`
  return body;
}

// Time & Attendance API calls
export const attendanceApi = {
  // Timetables
  getTimetables: () => apiGet('/attendance/timetables'),
  createTimetable: (data) => apiPost('/attendance/timetables', data),
  updateTimetable: (id, data) => apiPut(`/attendance/timetables/${id}`, data),
  deleteTimetable: (id) => apiDelete(`/attendance/timetables/${id}`),

  // Attendance records
  checkIn: (data) => apiPost('/attendance/checkin', data),
  checkOut: (data) => apiPost('/attendance/checkout', data),

  // Adjustments
  getAttendanceRecords: (params) =>
    apiGetWithParams('/attendance/attendance', params),
  getEmployeeAttendance: (employeeId, params) =>
    apiGetWithParams(`/attendance/attendance/employee/${employeeId}`, params),
  getAdjustments: (params) =>
    apiGetWithParams('/attendance/adjustments', params),
  createAdjustment: (data) => apiPost('/attendance/adjustments', data),
  approveAdjustment: (id, data) =>
    apiPut(`/attendance/adjustments/${id}/approve`, data),

  // Reports
  getAbsenceReport: (params) =>
    apiGetWithParams('/attendance/reports/absence', params),
  // 🔧 FIXED: use apiGetWithParams so query params are actually sent
  getCheckinCheckoutReport: (params) =>
    apiGetWithParams('/attendance/reports/checkin-checkout', params),
};

// Leave Management API calls
export const leaveApi = {
  // Requests
  // If later you send FormData (with attachment), switch this to apiUpload
  createRequest: (data) => apiPost('/leaves/requests', data),
  listRequests: (params) => apiGetWithParams('/leaves/requests', params),
  decideRequest: (id, data) => apiPost(`/leaves/requests/${id}/decide`, data),

  // Overview + widgets
  getStatusList: (params) => apiGetWithParams('/leaves/status', params),
  getCalendar: (params) => apiGetWithParams('/leaves/calendar', params),
  getSummary: (params) => apiGetWithParams('/leaves/summary', params),
  getEmployeeBalances: (params) =>
  apiGetWithParams('/leaves/balances', params),

  

  // 🔹 Calendar restrictions (special / restricted days)
  saveRestriction: (data) =>
    apiPost('/leaves/calendar/restrictions', data),

  deleteRestrictionById: (id) =>
    apiDelete(`/leaves/calendar/restrictions/${id}`),

  // we send a dummy id (0) + date query, controller will use the date
  deleteRestrictionByDate: (date) =>
    apiDelete(
      `/leaves/calendar/restrictions/0?date=${encodeURIComponent(date)}`
    ),

  // 🔹 NEW: Grade-based Leave Rules
  getRules: () => apiGet('/leaves/rules'),
  saveRule: (data) => apiPost('/leaves/rules', data),

  
};

export const performanceApi = {
  getPerformanceOverview: () => apiGet('/employees/performance-overview'),
  addPerformanceReview: (data) => apiPost('/employees/performance-reviews', data),

  getTrainingOverview: () => apiGet('/employees/training-overview'),
  addTrainingRecord: (data) => apiPost('/employees/training-records', data),
};

export const contractsApi = {
  list: (params) => apiGetWithParams('/contracts-docs', params),
  upload: (formData) => apiUpload('/contracts-docs', formData),
  delete: (id) => apiDelete(`/contracts-docs/${id}`),
};

// epf etf
// epf etf
export const etfEpfApi = {
  getRecords: () => apiGet('/salary/etf-epf'),
  getEmployeesWithout: () => apiGet('/salary/etf-epf/employees-without'),
  
  getById: (id) => apiGet(`/salary/etf-epf/${id}`),
  create: (data) => apiPost('/salary/etf-epf', data),
  update: (id, data) => apiPut(`/salary/etf-epf/${id}`, data),
  delete: (id) => apiDelete(`/salary/etf-epf/${id}`),
  calculate: (data) => apiPost('/salary/etf-epf/calculate', data),

  // NEW FUNCTIONS FOR ETF/EPF PROCESSING
  getProcessList: ({ year, month }) => 
    apiGetWithParams('/salary/etf-epf/process-list', { year, month }), 
    
  processPayment: (payload) => 
    apiPost('/salary/etf-epf/process-payment', payload),

   // NEW: Payment history and summary
  getPaymentHistory: ({ year, month }) => 
    apiGetWithParams('/salary/etf-epf/payment-history', { year, month }),
    
  getPaymentSummary: () => 
    apiGet('/salary/etf-epf/payment-summary'),
    
  getEmployeePaymentHistory: (employeeId) => 
    apiGet(`/salary/etf-epf/${employeeId}/history`),

  exportETFCSV: (params) => 
    apiGetWithParams('/payroll/export-etf-csv', params),

   getEtfEpfProcessList: ({ year, month }) => 
    apiGetWithParams('/salary/etf-epf-process', { year, month }),
    
  getETFReport: ({ year, month }) =>
    apiGetWithParams('/salary/etf-report', { year, month }),
  
};

// 💡 NEW: Unpaid Leaves API definition
export const unpaidLeavesApi = {
    // Used by UnpaidLeaves.jsx for table data (List)
    list: () => apiGet('/salary/unpaid-leaves'),
    
    // Used by the "Add Unpaid Leave" modal (Create)
    create: (data) => apiPost('/salary/unpaid-leaves', data),
    
    // Used by the "Edit" function (Update)
    update: (id, data) => apiPut(`/salary/unpaid-leaves/${id}`, data),
    
    // Used by the "Delete" button (Delete)
    del: (id) => apiDelete(`/salary/unpaid-leaves/${id}`),

    // Used by the "Process" button (Deduction calculation trigger)
    processDeduction: (id, data) => apiPost(`/salary/unpaid-leaves/${id}/process`, data || {}),
};

// Add to api.js
export const payrollApi = {
  getPayrollSummary: (params) => 
    apiGetWithParams('/payroll/payroll-summary', params),
  
  getPayrollStatus: (params) => 
    apiGetWithParams('/payroll/payroll-status', params),
  
  getPayrollTransferOverview: (params) => 
    apiGetWithParams('/payroll/payroll-transfer-overview', params),
  
  initiateBankTransfer: (data) => 
    apiPost('/payroll/initiate-bank-transfer', data),
  
  // Existing functions...
  getEmployeePayrollData: (params) => 
    apiGetWithParams('/payroll/employee-payroll-data', params),
  
  generatePaySlipPDF: (params) => 
    apiGetWithParams('/payroll/generate-payslip-pdf', params),
  
  processSalaryTransfer: (data) => 
    apiPost('/payroll/process-salary-transfer', data),
  
  getDepartmentPayrollSummary: (params) => 
    apiGetWithParams('/payroll/department-payroll-summary', params),
  
  getPayrollTransfers: (params) => 
    apiGetWithParams('/payroll/payroll-transfers', params),
  
  exportPayrollCSV: (params) => 
    apiGetWithParams('/payroll/export-payroll-csv', params),
  
  getAvailableMonths: (params) => 
    apiGetWithParams('/payroll/available-months', params),
};




