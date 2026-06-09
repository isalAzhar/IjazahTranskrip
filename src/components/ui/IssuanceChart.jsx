import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getMonthlyIssuance } from "../../services/dashboard.api";

const bulanList = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const colors = ["#F4CC70", "#DE7A22", "#6AB187"];

const getLastThreeYears = () => {
  const currentYear = new Date().getFullYear();
  return [
    String(currentYear - 2),
    String(currentYear - 1),
    String(currentYear),
  ];
};

const getEmptyChartData = (years) => {
  return bulanList.map((bulan) => {
    const row = { name: bulan };
    years.forEach((year) => {
      row[`y${year}`] = 0;
    });
    return row;
  });
};

const IssuanceChart = () => {
  const displayYears = useMemo(() => getLastThreeYears(), []);
  const [data, setData] = useState(() => getEmptyChartData(displayYears));
  const [loading, setLoading] = useState(true);

  const fetchIssuanceData = async () => {
    try {
      setLoading(true);
      const result = await getMonthlyIssuance();
      const rows = result.raw || [];
      const chartData = getEmptyChartData(displayYears);

      rows.forEach((item) => {
        const bulan = item.bulan === "Ags" ? "Agu" : item.bulan;
        const targetMonth = chartData.find((row) => row.name === bulan);

        if (targetMonth) {
          displayYears.forEach((year) => {
            targetMonth[`y${year}`] = Number(item[year] || 0);
          });
        }
      });

      setData(chartData);
    } catch (error) {
      console.log("Gagal mengambil data statistik tahunan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuanceData();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[320px] flex items-center justify-center text-sm text-gray-400">
        Memuat data chart...
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 flex flex-col h-full mt-4">
      {/* Kontainer Chart */}
      <div className="w-full min-w-0 h-[260px]">
        {/* 🔥 FIX: width="99%" ada di sini agar Recharts tidak error */}
        <ResponsiveContainer width="99%" height={260} minWidth={0}>
          <BarChart
            data={data}
            barGap={0}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: "#9ca3af", fontWeight: 500 }}
              dy={10}
            />

            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />

            {displayYears.map((year, index) => (
              <Bar
                key={year}
                dataKey={`y${year}`}
                name={year}
                fill={colors[index]}
                barSize={16}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="flex justify-center gap-3 mt-6">
        {displayYears.map((year, index) => (
          <div
            key={year}
            className={`px-4 py-1.5 text-xs font-bold rounded-md shadow-sm ${
              index === 0 ? "text-black" : "text-white"
            }`}
            style={{ backgroundColor: colors[index] }}
          >
            Tahun {year}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssuanceChart;