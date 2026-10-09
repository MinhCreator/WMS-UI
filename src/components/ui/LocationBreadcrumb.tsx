import { ChevronRight, Warehouse } from "lucide-react";

export function LocationBreadcrumb({ code, warehouse = "Warehouse A" }: { code: string; warehouse?: string }) {
  const parts = code.split("-");
  const crumbs: { label: string; code?: string }[] = [
    { label: warehouse },
    { label: `Zone ${parts[0] ?? "—"}` },
    { label: `Aisle ${parts[1] ?? ""}` },
    { label: `Rack ${parts[2] ?? ""}` },
    { label: `Bin ${parts[3] ?? ""}` },
  ];
  return (
    <nav aria-label="Location path" className="flex flex-wrap items-center gap-1 text-tn">
      <Warehouse size={13} className="mr-0.5 text-ink-4" aria-hidden />
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={i} className="inline-flex items-center gap-1">
            <span
              className={
                last
                  ? "rounded-[4px] bg-surface-3 px-1.5 py-0.5 font-mono font-semibold tnum text-ink"
                  : "text-ink-3"
              }
            >
              {c.code ? c.code : c.label}
            </span>
            {!last && <ChevronRight size={12} className="text-ink-4" aria-hidden />}
          </span>
        );
      })}
    </nav>
  );
}

export function ProgressBar({
  value,
  tone = "accent",
  label,
  showPct = true,
  height = "8px",
}: {
  value: number;
  tone?: "accent" | "ok" | "warn" | "danger";
  label?: string;
  showPct?: boolean;
  height?: string;
}) {
  const color =
    tone === "ok" ? "#15803d" : tone === "warn" ? "#b45309" : tone === "danger" ? "#b42318" : "#0369a1";
  return (
    <div className="w-full">
      {(label || showPct) && (
        <div className="mb-1 flex items-center justify-between text-2xs">
          {label && <span className="font-medium text-ink-2">{label}</span>}
          {showPct && <span className="tnum font-semibold text-ink">{Math.round(value)}%</span>}
        </div>
      )}
      <div className="w-full overflow-hidden rounded-full bg-surface-3" style={{ height }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
          role="progressbar"
          aria-valuenow={Math.round(value)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}

export function Steps({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-1" aria-label="Workflow progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex items-center gap-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 text-2xs font-semibold ${
                done
                  ? "border-ok-line bg-ok-bg text-ok"
                  : active
                    ? "border-accent-line bg-accent-soft text-accent"
                    : "border-line bg-surface text-ink-4"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold ${
                  done ? "bg-ok text-white" : active ? "bg-accent text-white" : "bg-surface-3 text-ink-4"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {s}
            </span>
            {i < steps.length - 1 && <span aria-hidden className="h-px w-3 bg-line-strong" />}
          </li>
        );
      })}
    </ol>
  );
}
