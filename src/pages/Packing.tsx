import { Button } from "@chakra-ui/react";
import { ArrowRight, Box, Printer } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Field, Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { packOrder } from "../data/orders";

type PackLine = (typeof packOrder.lines)[number];
type PackageItem = (typeof packOrder.packages)[number];

export default function Packing() {
  const toast = useAppToast();
  const [lines, setLines] = useState<PackLine[]>(packOrder.lines.map((l) => ({ ...l })));
  const [packages, setPackages] = useState<PackageItem[]>(packOrder.packages.map((p) => ({ ...p })));
  const [completeOpen, setCompleteOpen] = useState(false);

  const packedLines = lines.filter((l) => l.packed >= l.qty).length;
  const pct = Math.round((packedLines / Math.max(1, lines.length)) * 100);
  const unfinished = lines.find((l) => l.packed < l.qty) ?? null;

  const packLine = (line: PackLine) => {
    setLines((prev) =>
      prev.map((l) =>
        l.sku === line.sku ? { ...l, packed: l.qty, bin: packages.length ? packages[0].id : "P-03" } : l,
      ),
    );
  };

  const addPackage = () => {
    const n = packages.length + 1;
    setPackages((prev) => [
      ...prev,
      {
        id: `PKG-${n}`,
        type: "Small Carton 12×10×8",
        weight: `${(6 + n * 2.3).toFixed(1)} lb`,
        dims: "12 × 10 × 8 in",
        carrier: "UPS Freight",
        service: "LTL Standard",
        tracking: `1Z999VA1015884210${String(n).padStart(2, "0")}`,
        items: 0,
      },
    ]);
  };

  const metrics: MetricDef[] = [
    { label: "In pack queue", value: String(packOrder.queue.length), delta: "2 expedite", hint: "awaiting pack" },
    { label: "Items packed", value: String(lines.reduce((s, l) => s + l.packed, 0)), delta: "of 180 queued", dir: "up", good: true, hint: "since 07:00" },
    { label: "This order", value: `${packedLines}/${lines.length}`, delta: "lines", hint: `${packOrder.id}` },
    { label: "Labels printed", value: String(packages.length + 12), delta: "+3 this hour", dir: "up", hint: "incl. reps" },
    { label: "Avg pack time", value: "3:41", delta: "-0:14", dir: "down", good: true, hint: "per 10-item order" },
    { label: "Dims / weight fail", value: "0", delta: "this shift", good: true, hint: "clear" },
  ];

  return (
    <>
      <PageHeader
        title="Packing"
        subtitle={`Pack station 03 · Shifts 1–2 · ${packOrder.customer}`}
        meta={<StatusBadge status="Packing" label="Open order" />}
        actions={
          packages.length > 0 && (
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<Printer size={13} />} onClick={() => toast({ title: "Label sent to printer", description: `${packages.length} package labels queued at Station 03.`, status: "success" })}>
              Print all labels
            </Button>
          )
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Panel
            flush
            title={
              <span className="flex items-center gap-2">
                <span className="font-mono">{packOrder.id}</span>
                <StatusBadge status={packedLines === lines.length ? "Ready to Ship" : "Packing"} />
              </span>
            }
            subtitle={`${packOrder.customer} · ${packOrder.destination} · ${packOrder.service}`}
            actions={
              <span className="tnum text-2xs font-semibold text-ink-3">
                {packedLines}/{lines.length} lines · {pct}%
              </span>
            }
          >
            <div className="space-y-1 px-3 pb-3">
              {lines.map((l) => {
                const done = l.packed >= l.qty;
                return (
                  <div
                    key={l.sku}
                    className={`flex items-center gap-3 rounded-[6px] border px-3 py-2 ${
                      done ? "border-ok-line bg-ok-bg/40" : "border-line bg-surface-2"
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${done ? "bg-ok" : "bg-ink-4"}`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-tn font-medium text-ink">{l.product}</span>
                      <span className="font-mono text-2xs text-ink-3">
                        {l.sku} · {l.qty} pcs → {l.bin}
                      </span>
                    </span>
                    <span className={`tnum text-2xs font-semibold ${done ? "text-ok" : "text-ink-3"}`}>
                      {l.packed}/{l.qty}
                    </span>
                    {!done && (
                      <Button size="xs" onClick={() => packLine(l)}>
                        Pack
                      </Button>
                    )}
                    {done && <span className="text-2xs font-semibold text-ok">Done</span>}
                  </div>
                );
              })}

              {unfinished && (
                <div className="mt-2 flex items-center justify-between rounded-[6px] border border-accent-line bg-accent-soft px-3 py-2 text-2xs">
                  <span className="font-semibold text-accent-strong">
                    Next: {unfinished.product.split(" — ")[0]} ({unfinished.qty} pcs)
                  </span>
                  <span>weight limit heard ✓</span>
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Packages"
            subtitle={`${packages.length} packages this order`}
            actions={
              <Button size="xs" variant="outline" colorScheme="gray" leftIcon={<Box size={12} />} onClick={addPackage}>
                Add package
              </Button>
            }
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {packages.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 rounded-[6px] border border-line bg-surface-2 px-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-tn font-bold text-ink">{p.id}</span>
                      <span className="truncate text-2xs text-ink-3">{p.type}</span>
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-2xs text-ink-3">{p.tracking}</span>
                    <span className="mt-1 block text-2xs text-ink-3">
                      {p.weight} · {p.dims} · {p.items} items
                    </span>
                  </span>
                  <Button size="xs" variant="ghost" colorScheme="gray" onClick={() => { navigator.clipboard?.writeText(p.tracking); toast({ title: `Label reprints for ${p.id}`, description: p.tracking, status: "info" }); }}>
                    Reprint
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Pack queue" subtitle="Next orders at this station">
            <div className="flex flex-col gap-2">
              {packOrder.queue.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() =>
                    toast({ title: `${q.id} opened`, description: `${q.customer} · ${q.packed}/${q.items} packed`, status: "info" })
                  }
                  className="flex items-center gap-3 rounded-[6px] border border-line px-3 py-2 text-left hover:bg-surface-2"
                >
                  <span className={`font-mono text-tn font-bold ${i === 0 ? "text-accent" : "text-ink"}`}>{q.id}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-2xs text-ink">{q.customer}</span>
                    <span className="text-2xs text-ink-3">Promise {q.promise}</span>
                  </span>
                  <span className="tnum text-2xs font-semibold text-ink">{q.packed}/{q.items}</span>
                </button>
              ))}
            </div>
            <Link to="/shipping" className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-accent hover:underline">
              Go to shipping <ArrowRight size={11} />
            </Link>
          </Panel>

          <Panel title="Order detail">
            <div className="flex flex-col gap-2.5">
              <Field label="Customer" value={packOrder.customer} />
              <Field label="Ship to" value={packOrder.destination} />
              <Field label="Service" value={packOrder.service} />
              <Field label="Promised" value={packOrder.promised} />
              <Field label="Carrier BOL" value="CMH-10482-01" mono />
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <span className={`tnum text-2xs font-semibold ${pct === 100 ? "text-ok" : "text-ink-3"}`}>
          {pct === 100 ? "All lines packed" : `${pct}% packed`}
        </span>
        <Button
          size="md"
          isDisabled={pct < 100}
          onClick={() => setCompleteOpen(true)}
          rightIcon={<ArrowRight size={13} />}
        >
          Complete & ship
        </Button>
      </div>

      <ConfirmationDialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={() => {
          toast({
            title: "Packing complete",
            description: `${packOrder.id} handed to staging with ${packages.length} packages — label batch reprinted.`,
            status: "success",
          });
          setCompleteOpen(false);
        }}
        title="Complete packing for SO-88421?"
        message="This stages the order at Dock 05 for carrier pickup and marks it Ready to Ship."
        details={`${packages.length} packages · ${lines.reduce((s, l) => s + l.qty, 0)} units · UPS Freight LTL`}
        confirmLabel="Complete & stage"
        tone="primary"
      />
    </>
  );
}