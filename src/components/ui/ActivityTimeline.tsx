import type { ActivityItem, AuditEntry, Tone } from "../../types";
import { Avatar } from "@chakra-ui/react";

const kindTone: Record<ActivityItem["kind"], Tone> = {
  receive: "info",
  putaway: "neutral",
  wave: "info",
  pick: "ok",
  count: "warn",
  adjust: "warn",
  ship: "ok",
  pack: "ok",
};

const dotColor: Record<Tone, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  info: "bg-accent",
  neutral: "bg-ink-4",
};

export function ActivityTimeline({
  items,
  maxHeight,
}: {
  items: ActivityItem[];
  maxHeight?: string | number;
}) {
  return (
    <ol
      className="relative overflow-y-auto pr-1"
      style={{ maxHeight: maxHeight ?? 420 }}
      aria-label="Warehouse activity"
    >
      <span aria-hidden className="absolute top-2 bottom-2 left-[57px] w-px bg-line" />
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-3 px-1 py-2.5">
          <span className="w-11 shrink-0 pt-0.5 text-right text-2xs tnum text-ink-4">
            {item.time}
          </span>
          <span
            aria-hidden
            className={`relative z-10 mt-1.5 h-2 w-2 shrink-0 rounded-full ring-2 ring-surface ${dotColor[kindTone[item.kind]]}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-tn leading-5 text-ink">{item.text}</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-ink-3">
              <span className="font-semibold text-ink-2">{item.operator}</span>
              <span className="text-ink-4">·</span>
              <span>{item.role}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="divide-y divide-[#eef1f5]" aria-label="Audit history">
      {entries.map((e, i) => (
        <li key={i} className="flex items-start gap-3 py-2.5">
          <span className="w-24 shrink-0 text-2xs tnum text-ink-4">{e.time}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-tn font-semibold text-ink">{e.action}</span>
              <span className="text-2xs text-ink-3">{e.user}</span>
            </div>
            <p className="mt-0.5 text-2xs text-ink-2">{e.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function OperatorCell({ name, size = "xs" }: { name: string; size?: "xs" | "sm" }) {
  if (name === "Unassigned") {
    return <span className="text-ink-4 italic">Unassigned</span>;
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar size={size} name={name} bg="#e6edf3" color="#475467" fontWeight={600} />
      <span className="text-tn">{name}</span>
    </span>
  );
}
