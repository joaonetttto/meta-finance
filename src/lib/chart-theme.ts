/**
 * Tema corporativo para gráficos — estilo Stripe / Mercury.
 * Paleta restrita, linhas legíveis, sem glow/sombras nos dados.
 */

import type { CSSProperties } from "react";

export const CHART_MARGIN = { top: 12, right: 12, left: 4, bottom: 4 } as const;

export const CHART_STROKE_WIDTH = 2.5;
export const CHART_STROKE_WIDTH_SECONDARY = 2;

/** Paleta de categorias (máx. 4 tons — reutiliza em pizza/legenda) */
export const CHART_CATEGORY_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
] as const;

export const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
  grid: "hsl(var(--chart-grid))",
  border: "hsl(var(--border))",
  card: "hsl(var(--card))",
  foreground: "hsl(var(--foreground))",
} as const;

export const chartGridProps = {
  stroke: CHART_COLORS.grid,
  strokeDasharray: "0",
  vertical: false,
} as const;

export const chartAxisTick = {
  fontSize: 11,
  fill: "hsl(var(--muted-foreground))",
  fontFamily: "var(--font-body)",
} as const;

export const chartAxisProps = {
  axisLine: false,
  tickLine: false,
} as const;

/** Tooltip minimalista — sem sombra, foco nos números */
export const chartTooltipStyle: CSSProperties = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: "12px",
  boxShadow: "none",
  padding: "8px 10px",
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: "hsl(var(--foreground))",
  fontWeight: 600,
  marginBottom: 4,
  fontSize: "11px",
};

export const chartTooltipItemStyle: CSSProperties = {
  color: "hsl(var(--muted-foreground))",
  fontSize: "11px",
};

export const chartLegendStyle = {
  fontSize: 11,
  color: "hsl(var(--foreground))",
} as const;

/** Preenchimento sutil para áreas (dados em destaque, não o gradiente) */
export const CHART_AREA_FILL_OPACITY = { top: 0.1, bottom: 0 } as const;

export function chartYAxisFormatter(v: number) {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
  return `R$ ${v}`;
}
