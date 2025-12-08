import React, { useEffect, useState, useMemo } from 'react';
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

const COLORS = [
    '#0088FE', '#00C49F', '#A28EFF', '#FFBB28', '#FF8042',
    '#FF6B6B', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57'
];

const AllowancesChart = ({ year }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    // Fetch data when year or month changes
    useEffect(() => {
        const fetchAllowances = async () => {
            setLoading(true);
            try {
                const res = await apiGetWithParams('/reports/allowances/by-type', { year, month });
                const formatted = res.map(d => ({
                    ...d,
                    total_amount: d.total_amount != null ? Number(d.total_amount) : 0
                }));
                setData(formatted);
            } catch (err) {
                console.error('Error fetching allowances:', err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllowances();
    }, [year, month]);

    // Filter only items with amount > 0 (memoized)
    const filtered = useMemo(() => data.filter(d => d.total_amount > 0), [data]);

    // Prepare chart data (memoized)
    const chartData = useMemo(() => ({
        labels: filtered.length ? filtered.map(d => d.type) : ['No Data'],
        datasets: [
            {
                label: 'Total Amount (LKR)',
                data: filtered.length ? filtered.map(d => d.total_amount) : [0],
                backgroundColor: filtered.length ? COLORS.slice(0, filtered.length) : ['#ddd'],
                borderWidth: 1,
            },
        ],
    }), [filtered]);

    const chartOptions = useMemo(() => ({
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
                beginAtZero: true,
            },
            y: {
                title: { display: true, text: 'Allowance Type' },
                ticks: { autoSkip: false },
            },
        },
    }), [filtered]);

    return (
        <div style={{ width: '600px', margin: '40px' }}>
            <h3 style={{ textAlign: 'center' }}>Allowances by Type</h3>
            <DaySelector
                type='monthYear'
                onChange={({ month: m }) => setMonth(m)}
            />
            {loading ? <Spineer /> : <Bar data={chartData} options={chartOptions} />}
        </div>
    );
};

export default AllowancesChart;
