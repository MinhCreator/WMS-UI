import { Sparkline } from "./Charts";

export interface MetricDef {
  label: string;
  value: string;
  delta?: string;
  dir?: "up" | "down";
  good?: boolean;
  spark?: number[];
  hint?: string;
}

export function MetricStrip({ metrics }: { metrics: MetricDef[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-3 2xl:grid-cols-6">
      {metrics.map((m) => (
        <div key={m.label} className="bg-surface px-4 py-3">
          <div className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">
            {m.label}
          </div>
          <div className="mt-1.5 flex items-end justify-between gap-2">
            <span className="text-[21px] leading-6 font-semibold tnum text-ink">
              {m.value}
            </span>
            {m.spark && (
              <span className="mb-0.5 shrink-0">
                <Sparkline values={m.spark} tone={m.good === false ? "danger" : "accent"} />
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-2xs">
            {m.delta && (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  m.good === false
                    ? "text-danger"
                    : m.good
                      ? "text-ok"
                      : "text-ink-3"
                }`}
              >
                <span aria-hidden>
                  {m.dir === "down" ? "▼" : m.dir === "up" ? "▲" : "•"}
                </span>
                {m.delta}
              </span>
            )}
            <span className="text-ink-4">
              {m.hint ?? "vs previous period"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
