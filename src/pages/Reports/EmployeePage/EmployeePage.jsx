import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaMale, FaFemale } from 'react-icons/fa';

import { apiGetWithParams } from '../../../services/api';
import TotalCard from './TotalCard';
import DepartmentPicker from '../DepartmentPicker';

ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeePage = () => {
  const [data, setData] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState('all');

  // Fetch data whenever selectedDeptId changes
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const params = selectedDeptId !== 'all' ? { departmentId: selectedDeptId } : {};
        const res = await apiGetWithParams('/reports/employees', params);
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInsights();
  }, [selectedDeptId]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      {/* Department Picker */}
      {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
        <DepartmentPicker onChange={setSelectedDeptId} />
      </div> */}

      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TotalCard name="Employees" amount={data.total_employees} />
          <TotalCard name="Departments" amount={data.total_departments} />
        </div>

        {/* Gender Distribution */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
          {data.gender?.map((g) => {
            const percent = data.total_employees
              ? ((g.total / data.total_employees) * 100).toFixed(0)
              : 0;
            return (
              <div key={g.gender} style={{ textAlign: 'center' }}>
                {g.gender === 'Male' ? (
                  <FaMale style={{ fontSize: '50px', color: '#3399FF' }} />
                ) : (
                  <FaFemale style={{ fontSize: '50px', color: '#FF9933' }} />
                )}
                <div style={{ marginTop: '5px', fontWeight: 'bold', fontSize: '18px' }}>
                  {percent}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Doughnut Charts */}
        <div style={{ display: 'flex', gap: '50px' }}>
          <DoughnutChart title="Employee Type" data={data.types || []} labelKey="type" />
          <DoughnutChart title="Employee Grade" data={data.grades || []} labelKey="grade" />
        </div>
      </div>
    </div>
  );
};

// Doughnut Chart Component with dynamic colors
const DoughnutChart = ({ title, data, labelKey }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ minWidth: '200px', textAlign: 'center' }}>
        <h3>{title}</h3>
        <p>No data available</p>
      </div>
    );
  }

  // Generate dynamic colors for any number of slices
  const colors = data.map((_, i) => `hsl(${(i * 360) / data.length}, 70%, 60%)`);

  const chartData = {
    labels: data.map((d) => d[labelKey]),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: colors,
      },
    ],
  };

  return (
    <div style={{ width: '200px' }}>
      <h3>{title}</h3>
      <Doughnut data={chartData} />
    </div>
  );
};

export default EmployeePage;
