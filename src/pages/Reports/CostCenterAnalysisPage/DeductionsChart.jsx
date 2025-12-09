import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { apiGetWithParams } from '../../../services/api';
import DaySelector from '../DaySelector';
import Spineer from '../../../components/Spineer';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = ['#FF6B6B', '#FFA500', '#FF1493', '#FF8042', '#FFBB28', '#FF8C00', '#E74C3C'];

const DeductionsChart = ({ year: initialYear }) => {
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleYearChange = ({ year: newYear }) => {
    setYear(newYear);
  };

  useEffect(() => {
    const fetchDeductions = async () => {
      setLoading(true);
      try {
        const res = await apiGetWithParams('/reports/deductions/by-type', { year });
        setData(res.map(d => ({ ...d, total_amount: Number(d.total_amount) || 0 })));
      } catch (err) {
        console.error('Error fetching deductions:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeductions();
  }, [year]);


  if (loading) return <Spineer/>;

  // Prepare chart data even if empty
  const filtered = data.filter(d => d.total_amount > 0);
  const hasData = filtered.length > 0;

  const chartData = {
    labels: hasData ? filtered.map(d => d.type) : ['No Data'],
    datasets: [
      {
        label: 'Total Amount (LKR)',
        data: hasData ? filtered.map(d => d.total_amount) : [0],
        backgroundColor: hasData
          ? COLORS.slice(0, filtered.length)
          : ['#e0e0e0'], // grey color for empty
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.formattedValue}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Total Amount (LKR)' },
        beginAtZero: true,
      },
      y: {
        title: { display: true, text: 'Deduction Type' },
        ticks: { autoSkip: false },
      },
    },
  };

  return (
    <div style={{ width: '600px', margin: '40px' }}>
      <h3 style={{ textAlign: 'center' }}>Deductions by Type</h3>
      <DaySelector type="year" initialYear={year} onChange={handleYearChange} />
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default DeductionsChart;
