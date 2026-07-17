import React from "react";
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export const RadarChart = ({ data = [], dataKey = "value", angleKey = "subject", color = "#3b82f6", height = 260 }) => {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey={angleKey} stroke="#94a3b8" fontSize={11} />
          <PolarRadiusAxis angle={30} domain={[0, "auto"]} stroke="rgba(255,255,255,0.05)" />
          <Radar name="Findings" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.4} />
          <Tooltip
            contentStyle={{
              background: "rgba(10, 10, 15, 0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "0.85rem"
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
