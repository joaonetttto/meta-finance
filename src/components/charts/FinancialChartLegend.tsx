import type { LegendProps } from "recharts";
import { chartLegendStyle } from "@/lib/chart-theme";

type FinancialChartLegendProps = LegendProps & {
  nameMap?: Record<string, string>;
};

export function FinancialChartLegend({ payload, nameMap }: FinancialChartLegendProps) {
  if (!payload?.length) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4">
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.value ?? "");
        const label = nameMap?.[key] ?? key;
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ ...chartLegendStyle, fontWeight: 500 }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
