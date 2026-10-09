import { Button } from "@chakra-ui/react";
import { ArrowLeft, Check, CircleSlash2, MapPin, PackageSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { ProgressBar, Steps, LocationBreadcrumb } from "../components/ui/LocationBreadcrumb";
import { StatusBadge, PriorityBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { pickLines, readyOrders } from "../data/orders";
import type { PickLine } from "../types";

type PickLineState = PickLine & { short?: number };

export default function PickerWorkspace() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useAppToast();
  const source = orderId && pickLines[orderId] ? pickLines[orderId] : pickLines["SO-88421"] ?? [];
  const meta = readyOrders.find((o) => o.id === orderId) ?? readyOrders.find((o) => o.id === "SO-88421");

  const [lines, setLines] = useState<PickLineState[]>(source.map((l) => ({ ...l })));
  const [shortTarget, setShortTarget] = useState<PickLine | null>(null);
  const [done, setDone] = useState(false);

  const next = lines.find((l) => l.picked < l.required) ?? null;
  const complete = lines.filter((l) => l.picked >= l.required).length;
  const pct = Math.round((complete / Math.max(1, lines.length)) * 100);

  const pick = (line: PickLine) => {
    if (line.picked >= line.required) return;
    setLines((prev) =>
      prev.map((l) => (l.sku === line.sku ? { ...l, picked: l.picked + 1 } : l)),
    );
    if (line.picked + 1 >= line.required && lines.filter((l) => l.sku !== line.sku).every((l) => l.picked >= l.required)) {
      setDone(true);
    }
  };

  const markShort = (line: PickLineState) => {
    setLines((prev) =>
      prev.map((l) =>
        l.sku === line.sku ? { ...l, picked: l.required, short: (l.short ?? 0) + line.required - line.picked } : l,
      ),
    );
    toast({
      title: "Short pick logged",
      description: `SKU ${line.sku} short ${line.required - line.picked} EA — exception routed for review.`,
      status: "warning",
    });
  };

  const summary = useMemo(
    () => ({
      picked: lines.reduce((s, l) => s + l.picked, 0),
      required: lines.reduce((s, l) => s + l.required, 0),
      short: lines.reduce((s, l) => s + (l.short ?? 0), 0),
    }),
    [lines],
  );

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono">{orderId ?? "SO-88421"}</span>
            {meta && <PriorityBadge value={meta.priority} />}
            <StatusBadge status={done ? "Completed" : meta?.status ?? "Picking"} />
          </span>
        }
        subtitle={`${meta?.customer ?? "Northstar Industrial Supply"} · ${meta?.wave ?? "W-203"} · promise ${meta?.promise ?? "Today 17:00"}`}
        meta={<span className="text-2xs text-ink-3">{summary.picked} of {summary.required} units · {complete} of {lines.length} lines</span>}
        actions={
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
            leftIcon={<ArrowLeft size={13} />}
            onClick={() => navigate("/picking")}
          >
            Exit picking
          </Button>
        }
      />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Panel flush>
            <div className="flex items-center gap-4 px-4 pt-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">
                    Pick progress
                  </span>
                  <span className="tnum text-2xs font-semibold text-ink">{pct}%</span>
                </div>
                <ProgressBar value={pct} height="8px" tone={done ? "ok" : "accent"} />
              </div>
              <div className="hidden shrink-0 sm:block">
                <Steps steps={["Navigate", "Scan location", "Confirm pick", "Dock"]} current={next ? 1 : 3} />
              </div>
            </div>

            <div className="px-4 pb-3">
              {next ? (
                <div className="mt-3 rounded-[8px] border border-accent-line bg-accent-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-2xs font-semibold tracking-[0.06em] text-accent-strong uppercase">
                        Next pick · line {lines.indexOf(next) + 1} of {lines.length}
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin size={14} className="shrink-0 text-accent" aria-hidden />
                        <span className="font-mono text-[22px] font-bold tracking-wide text-ink">
                          {next.location}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col gap-0.5">
                        <span className="max-w-md truncate text-tn font-semibold text-ink">{next.product}</span>
                        <span className="inline-flex items-center gap-2 font-mono text-tn text-ink-3">
                          <span className="text-xs">Requirement</span>
                          <span className="tnum font-semibold text-ink">
                            {next.picked} / {next.required}
                          </span>
                          <span>· {next.lot ?? "no lot"}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        leftIcon={<Check size={14} />}
                        colorScheme="accent"
                        onClick={() => pick(next)}
                        isDisabled={next.picked >= next.required}
                      >
                        {next.picked + 1 >= next.required ? "Confirm last of line" : "Confirm pick"}
                      </Button>
                      <Button
                        variant="outline"
                        colorScheme="gray"
                        leftIcon={<CircleSlash2 size={14} />}
                        onClick={() => setShortTarget(next)}
                      >
                        Short pick
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3 rounded-[8px] border border-ok-line bg-ok-bg p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ok text-white">
                    <Check size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-tn font-semibold text-ink">All lines picked{summary.short > 0 ? ` — ${summary.short} units short` : ""}</span>
                    <span className="block text-2xs text-ink-3">
                      Take the cart to the pack station and confirm the handoff.
                    </span>
                  </div>
                  <Button colorScheme="accent" onClick={() => { toast({ title: "Pick handoff confirmed", description: `${orderId ?? "SO-88421"} staged for packing.`, status: "success" }); navigate("/picking"); }}>
                    Complete pick
                  </Button>
                </div>
              )}
            </div>
          </Panel>

          <Panel flush title="Pick lines" subtitle="Order of travel · nearest bin first">
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-[#f8fafc]">
                  <tr className="text-left text-2xs tracking-[0.05em] text-ink-3 uppercase">
                    <th className="border-b border-line px-3 py-2 font-semibold">Location</th>
                    <th className="border-b border-line px-3 py-2 font-semibold">Item / SKU</th>
                    <th className="border-b border-line px-3 py-2 text-right font-semibold">Required</th>
                    <th className="border-b border-line px-3 py-2 text-right font-semibold">Picked</th>
                    <th className="border-b border-line px-3 py-2 font-semibold">State</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => {
                    const isNext = next?.sku === l.sku;
                    const state = l.picked >= l.required ? (l.short ? "Short" : "Done") : isNext ? "Active" : "Pending";
                    return (
                      <tr key={l.sku} className={isNext ? "bg-accent-soft" : "hover:bg-surface-2"}>
                        <td className="border-b border-[#eef1f5] px-3 py-2">
                          <LocationBreadcrumb code={l.location} />
                        </td>
                        <td className="border-b border-[#eef1f5] px-3 py-2">
                          <span className="block max-w-[260px] truncate text-tn text-ink">{l.product}</span>
                          <span className="font-mono text-2xs text-ink-3">
                            {l.sku} · {i + 1}
                          </span>
                        </td>
                        <td className="border-b border-[#eef1f5] px-3 py-2 text-right text-tn tnum text-ink">{l.required}</td>
                        <td className="border-b border-[#eef1f5] px-3 py-2 text-right font-semibold tnum">
                          <span className={l.picked >= l.required ? "text-ok" : "text-ink"}>{l.picked}</span>
                        </td>
                        <td className="border-b border-[#eef1f5] px-3 py-2">
                          <StatusBadge status={state} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Order details">
            <div className="flex flex-col gap-2.5">
              {[
                ["Customer", meta?.customer ?? "—"],
                ["Wave / priority", `${meta?.wave ?? "—"} · ${meta?.priority ?? "—"}`],
                ["Promise by", meta?.promise ?? "—"],
                ["Zone", meta?.zone ?? "A / B"],
                ["Ordered via", "EDI"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3">
                  <span className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">{k}</span>
                  <span className="text-tn text-right font-medium text-ink">{v}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Scan shortcut" subtitle="Confirm a pick hands-free">
            <div className="flex flex-col gap-2">
              <div className="rounded-[8px] border border-dashed border-line-strong px-3 py-4 text-center">
                <PackageSearch size={18} className="mx-auto mb-1.5 text-ink-4" aria-hidden />
                <p className="text-2xs text-ink-3">
                  Point the RF gun at the bin label and pull the trigger to confirm {next ? `${next.product.split(" — ")[0]}` : "the pick"}.
                </p>
              </div>
              <p className="text-2xs text-ink-3">
                Scanning the same location twice advances{' '}
                <span className="font-semibold text-accent-strong">{next ? `SKU ${next.sku}` : "the queue"}</span>.
              </p>
            </div>
          </Panel>

          <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2.5 text-2xs text-ink-3">
            Need a <span className="font-mono">reprint</span> of the pick label? Ask the shift lead — reprints are handled at the station.
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={shortTarget !== null}
        onClose={() => setShortTarget(null)}
        onConfirm={() => {
          if (shortTarget) markShort(shortTarget);
          setShortTarget(null);
        }}
        title={`Short pick at ${shortTarget?.location ?? ""}`}
        message={`Record ${(shortTarget?.required ?? 0) - (shortTarget?.picked ?? 0)} units of ${shortTarget?.sku ?? ""} as unavailable at the bin.`}
        details={
          shortTarget && (
            <div className="flex flex-col gap-1">
              <span>Required {shortTarget.required} · picked {shortTarget.picked}</span>
              <span>This opens an exception and queues replenishment for the bin.</span>
            </div>
          )
        }
        confirmLabel="Log short pick"
        tone="danger"
      />

      {done && (
        <span className="sr-only">
          <Link to="/picking" />
        </span>
      )}
    </>
  );
}