import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  actions,
  children,
  bodyClassName = "",
  className = "",
  flush = false,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section
      className={`rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)] ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-2.5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-tn font-semibold text-ink">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-2xs text-ink-3">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={flush ? "" : bodyClassName || "p-4"}>{children}</div>
    </section>
  );
}

export function Divider() {
  return <div className="h-px w-full bg-line" />;
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="block text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">
      {children}
    </span>
  );
}

export function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Label>{label}</Label>
      <div
        className={`mt-1 text-tn text-ink ${mono ? "font-mono tnum" : "font-medium"}`}
      >
        {value}
      </div>
    </div>
  );
}
