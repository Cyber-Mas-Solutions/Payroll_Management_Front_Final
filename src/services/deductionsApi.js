// src/services/deductionsApi.js
import { apiGet, apiJSON } from './api';

export const fetchDeductions = (month, year) =>
  apiGet(`/salary/deductions?month=${month}&year=${year}`);

export const createDeduction = (payload) =>
  apiJSON ('/salary/deductions', 'POST', payload);
