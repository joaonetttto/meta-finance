import type { TooltipProps } from "recharts";
import {
  chartTooltipStyle,
  chartTooltipLabelStyle,
  chartTooltipItemStyle,
} from "@/lib/chart-theme";
import { type } from "@/lib/typography";
import { cn } from "@/lib/utils";

type FinancialTooltipProps = TooltipProps<number, string> & {
  labelFormatter?: (label: string | number) => string;
  valueFormatter?: (value: number) => string;
  nameFormatter?: (name: string) => string;
};

export function FinancialChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter = (v) => v.toLocaleString("pt-BR"),
  nameFormatter = (n) => n,
}: FinancialTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter
    ? labelFormatter(label as string | number)
    : String(label ?? "");

  return (
    <div style={chartTooltipStyle}>
      {displayLabel ? (
        <p style={chartTooltipLabelStyle}>{displayLabel}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry) => {
          const value = entry.value as number;
          const name = nameFormatter(String(entry.name ?? entry.dataKey ?? ""));
          return (
            <div
              key={String(entry.dataKey ?? entry.name)}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-2" style={chartTooltipItemStyle}>
                <span
                  className="inline-block h-2 w-2 rounded-sm shrink-0"
                  style={{ backgroundColor: entry.color ?? entry.stroke }}
                />
                {name}
              </span>
              <span className={type.financialSm}>
                {valueFormatter(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
