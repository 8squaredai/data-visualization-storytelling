"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatMonth, formatNumber, type MonthRow } from "@/lib/format";

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as MonthRow;
  return (
    <div className="tooltip">
      <div className="tooltip-label">{formatMonth(row.month)}</div>
      <div className="tooltip-value">{formatNumber(row.orders)} orders</div>
    </div>
  );
}

export default function OrdersChart({ data, peak }: { data: MonthRow[]; peak: MonthRow }) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 28, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
            tickMargin={8}
          />
          <YAxis tickFormatter={formatNumber} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={ChartTooltip} cursor={{ className: "crosshair" }} />
          <Line
            dataKey="orders"
            type="monotone"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, className: "active-dot" }}
            isAnimationActive={false}
          />
          <ReferenceDot
            x={peak.month}
            y={peak.orders}
            r={5}
            className="peak-dot"
            label={{ value: `Peak: ${formatMonth(peak.month)}`, position: "top", offset: 12, className: "peak-label" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
