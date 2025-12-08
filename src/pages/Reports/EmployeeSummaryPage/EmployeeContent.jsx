import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaMale, FaFemale } from 'react-icons/fa';
import TotalCard from './TotalCard';
import { apiGetWithParams } from '../../../services/api';
import Spineer from '../../../components/Spineer';
import DepartmentPicker from '../DepartmentPicker'


const EmployeeContent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedDeptId, setSelectedDeptId] = useState('all');

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            try {
                const params = selectedDeptId !== 'all' ? { departmentId: selectedDeptId } : {};
                const res = await apiGetWithParams('/reports/employees', params);
                setData(res);
            } catch (err) {
                console.error(err);
                setData()
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [selectedDeptId]);


    if (loading) { return <Spineer />; }
    if (!data || Object.keys(data).length === 0) return < div style={{ margin: '24px', backgroundColor: 'white', padding: '10px' }}>No Data</div>;

    return (
        <div >
            {/* Department Picker */}
            <div className="flex justify-end" style={{ marginBottom: '2px' }}>
                <DepartmentPicker value={selectedDeptId} onChange={setSelectedDeptId} />
            </div>

            <div className="flex flex-row flex-wrap gap-6">
                {/* Totals Section */}
                <div className="flex flex-col gap-6">
                    <TotalCard name="Employees" amount={data.total_employees} />
                    <TotalCard name="Departments" amount={data.total_departments} />
                </div>

                {/* Gender Distribution */}
                <div className="flex gap-6" style={{ marginTop: '16px' }}>
                    {(() => {
                        // Calculate total employees first
                        const totalEmp = data.gender?.reduce((sum, g) => sum + g.total, 0) || 0;

                        return data.gender?.map((g) => {
                            const Icon =
                                g.gender === "Male"
                                    ? FaMale
                                    : g.gender === "Female"
                                        ? FaFemale
                                        : null;

                            if (!Icon) return null;

                            return (
                                <div key={g.gender} className="text-center">
                                    <Icon
                                        className={`text-[50px] ${g.gender === "Male" ? "text-blue-500" : "text-orange-500"
                                            }`}
                                    />
                                    {/* Show Percentage */}
                                    <div className=" font-bold text-lg" style={{ marginTop: '4px' }}>
                                        {((g.total / totalEmp) * 100).toFixed(2)}%
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>



                {/* Donut Charts */}
                <div className="flex flex-wrap gap-12">
                    <DonutChart title="Employee Type" data={data.types || []} labelKey="type" />
                    <DonutChart title="Employee Grade" data={data.grades || []} labelKey="grade" />
                </div>
            </div>
        </div>
    )
}

export default EmployeeContent


// Donut Chart Component showing counts
const DonutChart = ({ title, data, labelKey }) => {
    if (!data || data.length === 0) {
        return (
            <div className="min-w-[200px] text-center">
                <h3 className="text-lg font-semibold" style={{ marginBottom: '2px' }}>{title}</h3>
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    const COLORS = data.map((_, i) => `hsl(${(i * 360) / data.length}, 70%, 60%)`);

    return (
        <div className="w-[250px] text-center">
            <h3 className="text-lg font-semibold" style={{ marginBottom: '2px' }}>{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="total"
                        nameKey={labelKey}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        label={({ value }) => value}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} employees`} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};