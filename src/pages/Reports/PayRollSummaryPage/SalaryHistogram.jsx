import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Spineer from '../../../components/Spineer';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SalaryHistogram = ({ binSize = 20000 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      try {
        const salaries = await apiGet('/reports/payroll/salary-range');

        const bins = {};
        salaries.forEach(s => {
          const bin = Math.floor(s / binSize) * binSize;
          const label = `${bin}-${bin + binSize - 1}`;
          bins[label] = (bins[label] || 0) + 1;
        });

        const sortedKeys = Object.keys(bins).sort((a, b) => parseInt(a) - parseInt(b));
        const labels = sortedKeys.map(key => {
          const [start, end] = key.split('-').map(Number);
          return `${Math.floor(start / 1000)}k-${Math.floor(end / 1000)}k`;
        });

        const dataValues = sortedKeys.map(key => bins[key]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Employees',
              data: dataValues,
              backgroundColor: '#82ca9d',
            },
          ],
        });
      } catch (err) {
        console.error('Failed to fetch salary histogram:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaries();
  }, [binSize]);

  if (loading) return <Spineer/>;
  if (!chartData) return <p>No data available</p>;

  return (
    <div style={{ width: '50%', height: 350, padding: 10 }}>
      <h3>Basic Salary Distribution</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true },
          },
          scales: {
            x: {
              ticks: { maxRotation: 45, minRotation: 45 },
            },
            y: {
              beginAtZero: true,
              ticks: {
                // Force only integers
                callback: function (value) {
                  return Number.isInteger(value) ? value : null;
                },
              },
            },
          },
        }}
      />

    </div>
  );
};

export default SalaryHistogram;
