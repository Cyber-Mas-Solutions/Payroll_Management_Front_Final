import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { apiGet } from "../../../services/api";
import Spineer from "../../../components/Spineer";

const PayrollTrendsChart = () => {
  const [option, setOption] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await apiGet("/reports/payroll/trends");
        console.log(res)

        // Format dataset source for ECharts
        const years = res.map(r => `${r.period_year}-${String(r.period_month).padStart(2, "0")}`);
        const dataset = [
          ["Type", ...years],
          ["Net Salary", ...res.map(r => Number(r.net_salary))],
          ["Allowances", ...res.map(r => Number(r.allowances))],
          ["Deductions", ...res.map(r => Number(r.deductions))],
          ["Bonuses", ...res.map(r => Number(r.bonuses))],
        ];


        const chartOption = {
          legend: {},
          tooltip: {
            trigger: "axis",
            showContent: false,
          },
          dataset: { source: dataset },
          xAxis: { type: "category" },
          yAxis: { gridIndex: 0 },
          grid: { left: "25%" },
          series: [
            {
              type: "line",
              smooth: true,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              type: "line",
              smooth: true,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              type: "line",
              smooth: true,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              type: "line",
              smooth: true,
              seriesLayoutBy: "row",
              emphasis: { focus: "series" },
            },
            {
              type: "pie",
              id: "pie",
              radius: "30%",
              center: ["10%", "50%"],
              emphasis: { focus: "self" },
              label: {
                formatter: "{b}: {@[" + years[0] + "]} ({d}%)",
              },
              encode: {
                itemName: "Type",
                value: years[0],
                tooltip: years[0],
              },
            },
          ],
        };

        setOption(chartOption);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) return <Spineer/>;

  return (
    <ReactECharts
      option={option}
      style={{ height: "500px", width: "100%" }}
      onEvents={{
        updateAxisPointer: (event, chart) => {
          const xAxisInfo = event.axesInfo && event.axesInfo[0];
          if (xAxisInfo) {
            const dimension = xAxisInfo.value + 1;
            chart.setOption({
              series: {
                id: "pie",
                label: {
                  formatter: `{b}: {@[${dimension}]} ({d}%)`,
                },
                encode: {
                  value: dimension,
                  tooltip: dimension,
                },
              },
            });
          }
        },
      }}
    />
  );
};

export default PayrollTrendsChart;
