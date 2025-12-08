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
import QuarterSelector from '../QuarterSelector';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = ['#FF1493', '#00C49F', '#FF8042', '#FFBB28', '#A28EFF', '#FF6B6B', '#FFA500'];

const BonusesChart = ({ year: initialYear }) => {
  const [data, setData] = useState([]);
  const [quarter, setQuarter] = useState(null);
  const [year, setYear] = useState(initialYear || new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBonuses = async () => {
      setLoading(true);
      try {
        const params = { year };
        if (quarter) params.quarter = quarter;
        const res = await apiGetWithParams('/reports/bonuses/by-type', params);
        setData(res.map(d => ({ ...d, total_amount: Number(d.total_amount) || 0 })));
      } catch (err) {
        console.error('Error fetching bonuses:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBonuses();
  }, [year, quarter]);

  const handleQuarterYearChange = ({ quarter, year }) => {
    setQuarter(quarter);
    setYear(year);
  };

  const filtered = data.filter(d => d.total_amount > 0);

  const chartData = {
    labels: filtered.length ? filtered.map(d => d.type) : ['No Data'],
    datasets: [
      {
        label: 'Total Amount (LKR)',
        data: filtered.length ? filtered.map(d => d.total_amount) : [0],
        backgroundColor: filtered.length ? COLORS.slice(0, filtered.length) : ['#ddd'],
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
          label: (context) => filtered.length ? `${context.label}: ${context.formattedValue}` : '',
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Total Amount (LKR)' },
        beginAtZero: true
      },
      y: {
        title: { display: true, text: 'Bonus Type' },
        ticks: {
          autoSkip: false,
          align: 'start' // ensures labels are aligned nicely
        }
      }
    }

  };

  return (
    <div style={{ width: '600px', margin: '20px' }}>
      <h3 style={{ textAlign: 'center' }}>Bonuses by Type</h3>
      <QuarterSelector onChange={handleQuarterYearChange} />
      {loading ? <p>Loading Bonuses...</p> : <Bar data={chartData} options={chartOptions} />}
    </div>
  );
};

export default BonusesChart;
