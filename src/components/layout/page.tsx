import * as React from "react";
import { cn } from "@/lib/utils";
import { layout } from "@/lib/layout";

type PageShellProps = React.HTMLAttributes<HTMLDivElement> & {
  narrow?: boolean;
};

export function PageShell({ narrow, className, children, ...props }: PageShellProps) {
  return (
    <div className={cn(narrow ? layout.pageNarrow : layout.page, className)} {...props}>
      {children}
    </div>
  );
}

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn(layout.pageHeader, className)}>
      <div className="min-w-0 space-y-1">
        <h1 className={layout.pageTitle}>{title}</h1>
        {description ? <p className={layout.pageDescription}>{description}</p> : null}
      </div>
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-3">{children}</div> : null}
    </div>
  );
}

type PageSectionProps = React.HTMLAttributes<HTMLElement> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
};

export function PageSection({ title, description, className, children, ...props }: PageSectionProps) {
  return (
    <section className={cn(layout.section, className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title ? <h2 className={layout.panelTitle}>{title}</h2> : null}
          {description ? <p className={layout.panelDescription}>{description}</p> : null}
        </div>
      )}
      {children}
    </section>
  );
}

type PanelCardProps = React.HTMLAttributes<HTMLDivElement>;

export function PanelCard({ className, children, ...props }: PanelCardProps) {
  return (
    <div className={cn(layout.card, className)} {...props}>
      {children}
    </div>
  );
}

type PanelCardHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function PanelCardHeader({ title, description, action, className }: PanelCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", layout.cardHeader, className)}>
      <div className="min-w-0">
        <h2 className={layout.panelTitle}>{title}</h2>
        {description ? <p className={layout.panelDescription}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
