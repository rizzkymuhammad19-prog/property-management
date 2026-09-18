"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const GRID_COLOR = "#e6e9f2";
const AXIS_STYLE = { fontSize: 11, fill: "#9ca3af" };

export function RevenueTrendChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
        <YAxis
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}jt`}
        />
        <Tooltip
          formatter={(value: number) => [`Rp${(value / 1_000_000).toFixed(1)}jt`, "Revenue"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f2", fontSize: 12 }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#6650e0" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FunnelChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="status" tick={AXIS_STYLE} axisLine={{ stroke: GRID_COLOR }} tickLine={false} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f2", fontSize: 12 }} />
        <Bar dataKey="count" fill="#7c6cf4" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SalesLeaderboardChart({ data }: { data: { name: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 42, 120)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
        <CartesianGrid stroke={GRID_COLOR} horizontal={false} />
        <XAxis
          type="number"
          tick={AXIS_STYLE}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}jt`}
        />
        <YAxis type="category" dataKey="name" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={100} />
        <Tooltip
          formatter={(value: number) => [`Rp${(value / 1_000_000).toFixed(1)}jt`, "Revenue"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e6e9f2", fontSize: 12 }}
        />
        <Bar dataKey="revenue" fill="#3b5299" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
