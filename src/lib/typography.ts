/**
 * Sistema tipográfico — hierarquia clara, números em destaque, textos secundários discretos.
 *
 * pageTitle      → H1 de página
 * pageDesc       → subtítulo de página
 * panelTitle     → título de card/seção
 * panelDesc      → descrição de card
 * overline       → rótulo superior (caps)
 * label          → labels de formulário
 * body / bodyMuted → texto corrido
 * caption        → metadados, hints
 * financial*     → valores monetários (maior peso visual)
 */
export const type = {
  pageTitle: "font-display text-3xl font-bold tracking-tight leading-[1.15] text-foreground md:text-4xl",
  pageTitleHero: "font-display text-4xl font-bold tracking-tight leading-[1.1] text-foreground md:text-5xl",
  pageDesc: "text-sm font-normal leading-relaxed text-muted-foreground",

  sectionTitle: "font-display text-lg font-semibold tracking-tight leading-snug text-foreground",
  panelTitle: "font-display text-sm font-semibold tracking-tight leading-snug text-foreground",
  panelDesc: "mt-1 text-xs font-normal leading-relaxed text-muted-foreground",

  overline: "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
  overlineAccent: "text-[11px] font-semibold uppercase tracking-[0.14em] text-primary",

  label: "text-xs font-medium leading-none text-foreground/90",
  body: "text-sm font-normal leading-relaxed text-foreground",
  bodyMuted: "text-sm font-normal leading-relaxed text-muted-foreground",
  caption: "text-xs font-normal leading-normal text-muted-foreground",

  /** Valor principal — saldo, totais hero */
  financialHero: "font-mono-nums text-4xl font-bold tracking-tight leading-none md:text-5xl lg:text-[3.25rem]",
  /** Valor secundário — cards KPI, metas */
  financialLg: "font-mono-nums text-2xl font-bold tracking-tight leading-tight text-foreground",
  /** Valor padrão — listas, tooltips */
  financial: "font-mono-nums text-xl font-semibold tracking-tight leading-tight text-foreground",
  financialSm: "font-mono-nums text-sm font-semibold tabular-nums tracking-tight text-foreground",

  statValue: "font-mono-nums text-xl font-bold tracking-tight leading-tight text-foreground",
  statHint: "text-xs font-normal leading-normal text-muted-foreground",

  nav: "text-sm font-medium tracking-tight",
  empty: "text-sm font-normal leading-relaxed text-muted-foreground",
} as const;
