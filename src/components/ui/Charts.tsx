export interface SeriesDef {
  key: string;
  label: string;
  color: string;
}

const AXIS = "#98a2b3";
const GRID = "#eef1f5";

export const compact = (n: number) => {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(Math.round(n * 10) / 10);
};

function niceCeil(max: number) {
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const norm = max / pow;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * pow;
}

export function Sparkline({
  values,
  tone = "accent",
  width = 72,
  height = 22,
}: {
  values: number[];
  tone?: "accent" | "danger" | "ok";
  width?: number;
  height?: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * (width - 4) + 2;
    const y = height - 3 - ((v - min) / span) * (height - 6);
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const stroke = tone === "danger" ? "#b42318" : tone === "ok" ? "#15803d" : "#0369a1";
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} aria-hidden="true" className="block">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={stroke} />
    </svg>
  );
}

export function ChartLegend({ series }: { series: SeriesDef[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
      {series.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5 text-2xs text-ink-2">
          <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function Bars({
  data,
  xKey,
  series,
  height = 196,
  yFormat = compact,
  ariaLabel,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  yFormat?: (n: number) => string;
  ariaLabel?: string;
}) {
  const w = 780;
  const padL = 42;
  const padR = 6;
  const padT = 8;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const max = niceCeil(
    Math.max(
      1,
      ...data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0))),
    ),
  );
  const ticks = 4;
  const groupW = innerW / Math.max(1, data.length);
  const gap = 6;
  const barW = Math.max(3, (groupW - gap) / series.length - 2);

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel ?? "Chart"}
    >
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max / ticks) * i;
        const y = padT + innerH - (v / max) * innerH;
        return (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={y} y2={y} stroke={GRID} strokeWidth="1" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9.5" fill={AXIS}>
              {yFormat(v)}
            </text>
          </g>
        );
      })}
      {data.map((d, gi) => {
        const gx = padL + gi * groupW;
        return (
          <g key={gi}>
            {series.map((s, si) => {
              const v = Number(d[s.key] ?? 0);
              const h = Math.max(v > 0 ? 1.5 : 0, (v / max) * innerH);
              const x = gx + gap / 2 + si * (barW + 2);
              return (
                <rect
                  key={s.key}
                  x={x}
                  y={padT + innerH - h}
                  width={barW}
                  height={h}
                  rx="1.5"
                  fill={s.color}
                >
                  <title>{`${d[xKey]} — ${s.label}: ${v.toLocaleString("en-US")}`}</title>
                </rect>
              );
            })}
            <text
              x={gx + groupW / 2}
              y={height - 6}
              textAnchor="middle"
              fontSize="9.5"
              fill="#667085"
            >
              {String(d[xKey])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Lines({
  data,
  xKey,
  series,
  height = 190,
  yFormat = compact,
  target,
  ariaLabel,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  yFormat?: (n: number) => string;
  target?: number;
  ariaLabel?: string;
}) {
  const w = 780;
  const padL = 42;
  const padR = 8;
  const padT = 8;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = height - padT - padB;
  const all = data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0)));
  const max = niceCeil(Math.max(1, target ?? 0, ...all));
  const ticks = 4;
  const xAt = (i: number) => padL + (i / Math.max(1, data.length - 1)) * innerW;
  const yAt = (v: number) => padT + innerH - (v / max) * innerH;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel ?? "Chart"}
    >
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = (max / ticks) * i;
        const y = yAt(v);
        return (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={y} y2={y} stroke={GRID} strokeWidth="1" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9.5" fill={AXIS}>
              {yFormat(v)}
            </text>
          </g>
        );
      })}
      {target !== undefined && (
        <g>
          <line
            x1={padL}
            x2={w - padR}
            y1={yAt(target)}
            y2={yAt(target)}
            stroke="#98a2b3"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          <text x={w - padR} y={yAt(target) - 4} textAnchor="end" fontSize="9" fill="#667085">
            target {yFormat(target)}
          </text>
        </g>
      )}
      {series.map((s) => {
        const d = data
          .map((row, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)} ${yAt(Number(row[s.key] ?? 0)).toFixed(1)}`)
          .join(" ");
        return (
          <g key={s.key}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
            {data.map((row, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(Number(row[s.key] ?? 0))} r="2.2" fill={s.color}>
                <title>{`${row[xKey]} — ${s.label}: ${Number(row[s.key]).toLocaleString("en-US")}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={xAt(i)} y={height - 6} textAnchor="middle" fontSize="9.5" fill="#667085">
          {String(d[xKey])}
        </text>
      ))}
    </svg>
  );
}

export function HBar({
  value,
  tone = "accent",
}: {
  value: number;
  tone?: "accent" | "warn" | "danger" | "ok";
}) {
  const color =
    tone === "warn" ? "#b45309" : tone === "danger" ? "#b42318" : tone === "ok" ? "#15803d" : "#0369a1";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}
