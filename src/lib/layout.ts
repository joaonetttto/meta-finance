/**
 * Tokens de espaçamento — escala 4/8px para consistência entre telas.
 *
 * page (gap-8)     → entre seções principais da página
 * section (gap-6)  → blocos dentro de uma seção
 * stack (gap-4)    → formulários e listas internas
 * grid (gap-4)     → grids padrão
 * gridLg (gap-6)   → grids de destaque (2 colunas amplas)
 * card (p-6)       → padding interno de cards/painéis
 */
export const layout = {
  page: "flex flex-col gap-8 w-full",
  pageNarrow: "flex flex-col gap-8 w-full max-w-xl",
  section: "flex flex-col gap-6",
  stack: "flex flex-col gap-4",
  grid: "grid gap-4",
  gridLg: "grid gap-6",
  card: "rounded-xl border border-border bg-card p-6",
  cardHeader: "mb-5",
  pageHeader: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
  pageTitle: "text-3xl font-bold font-display tracking-tight",
  pageDescription: "text-sm text-muted-foreground",
  panelTitle: "text-base font-semibold tracking-tight",
  panelDescription: "text-xs text-muted-foreground mt-1",
  emptyState: "py-12 text-center text-sm text-muted-foreground",
} as const;
