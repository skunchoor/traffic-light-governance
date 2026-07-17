import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS_MAP = {
  GREEN: "#22c55e",
  YELLOW: "#eab308",
  RED: "#ef4444"
};

export const DonutChart = ({ data = {}, height = 220 }) => {
  const chartData = [
    { name: "GREEN (Approved)", value: data.GREEN || 0, color: COLORS_MAP.GREEN },
    { name: "YELLOW (Review)", value: data.YELLOW || 0, color: COLORS_MAP.YELLOW },
    { name: "RED (Blocked)", value: data.RED || 0, color: COLORS_MAP.RED }
  ].filter(d => d.value > 0);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ width: "100%", height, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={78}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(10, 10, 15, 0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "0.85rem"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none"
        }}
      >
        <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f8fafc", display: "block" }}>
          {total}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Total PRs</span>
      </div>
    </div>
  );
};
