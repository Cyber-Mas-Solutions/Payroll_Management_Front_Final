// src/utils/payrollCalculations.js

/**
 * Calculate total deductions including EPF and unpaid leaves
 * @param {Object} employee - Employee data
 * @param {Number} month - Month number
 * @param {Number} year - Year
 * @returns {Number} Total deductions
 */
export const calculateTotalDeductions = (employee, month, year) => {
  // Regular deductions (loans, statutory, other)
  const regularDeductions = employee.deductions || 0;
  
  // EPF deduction (8% of basic salary)
  const basicSalary = employee.basic_salary || 0;
  const epfDeduction = (basicSalary * 0.08);
  
  // Unpaid leave deduction (if any)
  const unpaidLeaveDeduction = employee.unpaid_leave_deduction || 0;
  
  return regularDeductions + epfDeduction + unpaidLeaveDeduction;
};

/**
 * Calculate gross salary
 * @param {Object} employee - Employee data
 * @returns {Number} Gross salary
 */
export const calculateGrossSalary = (employee) => {
  const basicSalary = employee.basic_salary || 0;
  const allowances = employee.allowances || 0;
  const overtime = employee.overtime || 0;
  const bonus = employee.bonus || 0;
  
  return basicSalary + allowances + overtime + bonus;
};

/**
 * Calculate employer contributions
 * @param {Object} employee - Employee data
 * @returns {Object} Employer EPF and ETF contributions
 */
export const calculateEmployerContributions = (employee) => {
  const basicSalary = employee.basic_salary || 0;
  
  return {
    employerEPF: (basicSalary * 0.12), // 12% EPF
    employerETF: (basicSalary * 0.03)  // 3% ETF
  };
};

/**
 * Format currency for display
 * @param {Number} amount - Amount to format
 * @returns {String} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `Rs ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};