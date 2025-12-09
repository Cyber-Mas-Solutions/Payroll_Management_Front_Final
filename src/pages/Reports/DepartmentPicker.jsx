import React, { useState, useEffect } from 'react';
import { apiGet } from '../../services/api';

const DepartmentPicker = ({ value, onChange }) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiGet('/reports/departments');
        const deptList = [{ id: 'all', name: 'ALL' }, ...res];
        setDepartments(deptList);

        // If no value yet, default to "all"
        if (!value && onChange) onChange('all');
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, [value, onChange]);

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      Department:
      <select
        value={value}
        style={{ height: 24, padding: 2 }}
        onChange={(e) => onChange(e.target.value)}
      >
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DepartmentPicker;
