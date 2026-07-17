import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export const Sparkline = ({ data = [], dataKey = "val", color = "#22c55e", height = 35 }) => {
  return (
    <div style={{ width: "90px", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
