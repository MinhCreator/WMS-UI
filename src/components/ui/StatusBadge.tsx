import type { Tone } from "../../types";

const toneClasses: Record<Tone, string> = {
  ok: "bg-ok-bg text-ok border-ok-line",
  warn: "bg-warn-bg text-warn border-warn-line",
  danger: "bg-danger-bg text-danger border-danger-line",
  info: "bg-accent-soft text-accent border-accent-line",
  neutral: "bg-neutral-bg text-neutral border-neutral-line",
};

const lookup: Record<string, Tone> = {
  Healthy: "ok",
  Active: "ok",
  Completed: "ok",
  Approved: "ok",
  Shipped: "ok",
  Received: "ok",
  Closed: "ok",
  Resolved: "ok",
  Low: "warn",
  "Partially Received": "warn",
  "Pending Review": "warn",
  "Pending Approval": "warn",
  "On Hold": "warn",
  "In Transit": "warn",
  "Credit Hold": "warn",
  Invited: "warn",
  Expedite: "warn",
  Blocked: "warn",
  Reserved: "info",
  "In Progress": "info",
  Released: "info",
  Picking: "info",
  Packing: "info",
  Ready: "info",
  "Ready to Ship": "info",
  "Label Created": "info",
  Manifested: "info",
  Submitted: "info",
  Expected: "info",
  Scheduled: "info",
  Draft: "info",
  Standard: "info",
  Queued: "info",
  Critical: "danger",
  Out: "danger",
  Exception: "danger",
  "Short Pick": "danger",
  Rejected: "danger",
  Disabled: "danger",
  Failed: "danger",
  High: "danger",
  Cancelled: "neutral",
  Discontinued: "neutral",
  Pending: "neutral",
};

export function toneFor(status: string): Tone {
  return lookup[status] ?? "neutral";
}

export function StatusBadge({
  status,
  tone,
  label,
}: {
  status?: string;
  tone?: Tone;
  label?: string;
}) {
  const t = tone ?? toneFor(status ?? "neutral");
  const text = label ?? status ?? "";
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-[4px] border px-1.5 py-[1px] text-2xs leading-4 font-semibold whitespace-nowrap ${toneClasses[t]}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
      <span className="truncate">{text}</span>
    </span>
  );
}

export function PriorityBadge({ value }: { value: string }) {
  const tone: Tone =
    value === "Critical" || value === "High"
      ? "danger"
      : value === "Medium"
        ? "warn"
        : value === "Low"
          ? "neutral"
          : "info";
  const marks: Record<string, string> = { Critical: "●●●", High: "●●", Medium: "●", Low: "○" };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-[1px] text-2xs leading-4 font-semibold whitespace-nowrap ${toneClasses[tone]}`}
    >
      <span aria-hidden className="text-[8px] leading-none opacity-70">
        {marks[value] ?? "●"}
      </span>
      {value}
    </span>
  );
}
