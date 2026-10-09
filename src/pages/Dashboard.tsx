import { Button } from "@chakra-ui/react";
import { ArrowRight, Download, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ActivityTimeline, OperatorCell } from "../components/ui/ActivityTimeline";
import { ChartLegend, Lines, HBar } from "../components/ui/Charts";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { DateRangePicker, useRange } from "../components/ui/DateRangePicker";
import { DataTable, type Column } from "../components/ui/DataTable";
import { MetricStrip } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { ProgressBar } from "../components/ui/LocationBreadcrumb";
import { StatusBadge, PriorityBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { activity, exceptions, lowStockSkus } from "../data/ops";
import type { ExceptionRow } from "../types";
import { fmt } from "../data/meta";
import { pickWaves, receipts } from "../data/orders";
import { fulfillmentSeries, kpis, zoneUtilization } from "../data/reports";

const fulfillmentSeriesDef = [
  { key: "received", label: "Received", color: "#0369a1" },
  { key: "picking", label: "Picked", color: "#15803d" },
  { key: "packing", label: "Packed", color: "#b45309" },
  { key: "shipped", label: "Shipped", color: "#344054" },
];

const priorityRank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export default function Dashboard() {
  const toast = useAppToast();
  const [range, setRange] = useRange("Last 7 days");
  const [target, setTarget] = useState<ExceptionRow | null>(null);

  const exceptionColumns: Column<ExceptionRow>[] = [
    {
      key: "type",
      header: "Exception",
      sortable: true,
      sortValue: (r) => r.type,
      cell: (r) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold text-ink">{r.type}</span>
          <span className="truncate text-2xs text-ink-3">{r.description}</span>
        </span>
      ),
    },
    { key: "reference", header: "Reference", mono: true, sortable: true, sortValue: (r) => r.reference },
    { key: "location", header: "Location", mono: true, hideBelow: "lg" },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      sortValue: (r) => priorityRank[r.priority],
      cell: (r) => <PriorityBadge value={r.priority} />,
    },
    { key: "assigned", header: "Assigned", hideBelow: "lg", cell: (r) => <OperatorCell name={r.assigned} /> },
    { key: "age", header: "Age", mono: true, align: "right", sortable: true, sortValue: (r) => r.age },
  ];

  const openExceptions = [...exceptions].sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
  );

  const activeWaves = pickWaves.filter((w) => w.status === "In Progress" || w.status === "Released" || w.status === "On Hold");
  const activeReceipts = receipts.filter((r) => r.status === "In Progress" || r.status === "Exception");

  return (
    <>
      <PageHeader
        title="Dashboard"
        meta={
          <StatusBadge
            status="In Progress"
            label="Shift 2 live · 14:00–22:00"
          />
        }
        subtitle="Warehouse A — Columbus · Tuesday, October 7, 2026 · Operator: Priya Raman"
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              leftIcon={<Download size={13} />}
              onClick={() =>
                toast({ title: "Export queued", description: `Dashboard snapshot (${range}) will download shortly.`, status: "info" })
              }
            >
              Export
            </Button>
          </>
        }
      />

      <MetricStrip metrics={kpis} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Fulfillment activity"
          subtitle={`Units per day · ${range.toLowerCase()}`}
          actions={<ChartLegend series={fulfillmentSeriesDef} />}
        >
          <Lines
            data={fulfillmentSeries}
            xKey="day"
            series={fulfillmentSeriesDef}
            height={210}
            ariaLabel="Units received, picked, packed and shipped per day"
          />
        </Panel>

        <Panel
          title="Live activity"
          actions={<span className="text-2xs text-ink-4">Updated 14:42</span>}
        >
          <ActivityTimeline items={activity} maxHeight={236} />
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Exception queue"
          subtitle={`${openExceptions.length} open · sorted by priority`}
          flush
          actions={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-2xs font-semibold text-accent hover:underline"
              onClick={() => toast({ title: "Exception workspace", description: "Full exception management opens from the Operations menu.", status: "info" })}
            >
              View all <ArrowRight size={11} />
            </button>
          }
        >
          <DataTable
            columns={exceptionColumns}
            data={openExceptions}
            rowKey={(r) => r.id}
            defaultSort={{ key: "priority", dir: "asc" }}
            paginated={false}
            maxHeight={300}
            emptyTitle="No open exceptions"
            emptyDescription="The queue is clear — keep the shift moving."
            rowActions={(r) => (
              <Button size="xs" variant="outline" colorScheme="gray" onClick={() => setTarget(r)}>
                {r.action}
              </Button>
            )}
          />
        </Panel>

        <Panel title="In progress" subtitle="Waves and receipts on the floor now">
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">
                <span>Pick waves</span>
                <Link to="/picking" className="font-semibold text-accent hover:underline">
                  Open picking
                </Link>
              </div>
              <div className="flex flex-col gap-2.5">
                {activeWaves.map((w) => (
                  <div key={w.id} className="rounded-[6px] border border-line px-2.5 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-tn font-semibold text-ink">{w.id}</span>
                        <StatusBadge status={w.status} />
                      </span>
                      <span className="tnum text-2xs text-ink-3">
                        {w.orders} orders · {w.items} items
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ProgressBar
                        value={w.progress}
                        showPct={false}
                        height="6px"
                        tone={w.status === "On Hold" ? "warn" : w.progress === 100 ? "ok" : "accent"}
                      />
                      <span className="tnum w-9 shrink-0 text-right text-2xs font-semibold text-ink-2">
                        {w.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">
                <span>Receipts on dock</span>
                <Link to="/receiving" className="font-semibold text-accent hover:underline">
                  Open receiving
                </Link>
              </div>
              <div className="flex flex-col gap-1.5">
                {activeReceipts.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() =>
                      toast({ title: `${r.id}`, description: `${r.supplier} · ${r.dock} · ${fmt(r.received)} of ${fmt(r.items)} units`, status: "info" })
                    }
                    className="flex items-center gap-2 rounded-[6px] border border-line px-2.5 py-2 text-left hover:bg-surface-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-tn font-semibold text-ink">{r.id}</span>
                      <span className="block truncate text-2xs text-ink-3">
                        {r.supplier} · {r.dock}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-right text-2xs">
                      <span className="block font-semibold text-ink">{fmt(r.received)}</span>
                      <span className="block text-ink-4">of {fmt(r.items)}</span>
                    </span>
                    <StatusBadge status={r.status} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Low stock SKUs"
          subtitle={`${lowStockSkus.length} SKUs at or below safety stock`}
          flush
          actions={
            <Link
              to="/inventory"
              className="inline-flex items-center gap-1 text-2xs font-semibold text-accent hover:underline"
            >
              Open inventory <ArrowRight size={11} />
            </Link>
          }
        >
          <div className="max-h-[280px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-[#f8fafc]">
                <tr className="text-left text-2xs tracking-[0.05em] text-ink-3 uppercase">
                  <th className="border-b border-line px-3 py-2 font-semibold">SKU / Product</th>
                  <th className="border-b border-line px-3 py-2 font-semibold">Location</th>
                  <th className="border-b border-line px-3 py-2 text-right font-semibold">On hand</th>
                  <th className="hidden border-b border-line px-3 py-2 font-semibold md:table-cell">
                    Reorder point
                  </th>
                  <th className="border-b border-line px-3 py-2 font-semibold">Cover</th>
                  <th className="border-b border-line px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockSkus.map((r) => {
                  const pct = Math.min(100, Math.round((r.onHand / Math.max(1, r.reorderPoint)) * 100));
                  return (
                    <tr key={r.sku} className="hover:bg-surface-2">
                      <td className="border-b border-[#eef1f5] px-3 py-2">
                        <Link to={`/products/${r.sku}`} className="block min-w-0">
                          <span className="block font-mono text-2xs font-semibold text-accent">{r.sku}</span>
                          <span className="block truncate text-tn text-ink">{r.product}</span>
                        </Link>
                      </td>
                      <td className="border-b border-[#eef1f5] px-3 py-2 font-mono text-2xs tnum text-ink-2">
                        {r.location}
                        {r.extraLocations > 0 && (
                          <span className="text-ink-4"> +{r.extraLocations}</span>
                        )}
                      </td>
                      <td className="border-b border-[#eef1f5] px-3 py-2 text-right text-tn font-semibold tnum text-ink">
                        {fmt(r.onHand)}
                      </td>
                      <td className="hidden border-b border-[#eef1f5] px-3 py-2 text-right text-tn tnum text-ink-3 md:table-cell">
                        {fmt(r.reorderPoint)}
                      </td>
                      <td className="w-28 border-b border-[#eef1f5] px-3 py-2">
                        <HBar
                          value={pct}
                          tone={r.status === "Out" || r.status === "Critical" ? "danger" : "warn"}
                        />
                      </td>
                      <td className="border-b border-[#eef1f5] px-3 py-2">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Zone utilization" subtitle="Bin occupancy across the building">
          <div className="flex flex-col gap-3">
            {zoneUtilization.map((z) => (
              <div key={z.zone}>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="truncate text-tn font-medium text-ink">{z.zone}</span>
                  <span className="tnum shrink-0 text-2xs text-ink-3">
                    {z.used}/{z.bins} bins · <span className="font-semibold text-ink">{z.pct}%</span>
                  </span>
                </div>
                <HBar
                  value={z.pct}
                  tone={z.pct >= 80 ? "danger" : z.pct >= 65 ? "warn" : "accent"}
                />
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between rounded-[6px] border border-line bg-surface-2 px-3 py-2 text-2xs">
              <span className="text-ink-3">Building capacity used</span>
              <span className="font-semibold text-ink">1,220 of 1,632 bins · 75%</span>
            </div>
          </div>
        </Panel>
      </div>

      <ConfirmationDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={() => {
          toast({
            title: `${target?.action} started`,
            description: `${target?.id} · ${target?.type} on ${target?.reference}`,
            status: "success",
          });
          setTarget(null);
        }}
        title={`${target?.action ?? "Handle"} exception ${target?.id ?? ""}`}
        message={`This will update ${target?.reference ?? "the reference"} at ${target?.location ?? "the location"} and notify ${target?.assigned ?? "the assignee"}.`}
        details={
          <div className="flex flex-col gap-1">
            <div>{target?.description}</div>
            <div className="text-ink-4">
              Open for {target?.age} · priority {target?.priority}
            </div>
          </div>
        }
        confirmLabel={target?.action ?? "Confirm"}
        tone={target?.priority === "Critical" || target?.priority === "High" ? "danger" : "primary"}
      />

      <div className="mt-4 flex items-center justify-between text-2xs text-ink-4">
        <span>Keyboard: press <kbd className="rounded-[3px] border border-line bg-surface px-1 font-mono">/</kbd> anywhere to search</span>
        <span className="inline-flex items-center gap-1">
          <Play size={10} /> WarehouseOS 2026.10.7 · data refreshed 14:42
        </span>
      </div>
    </>
  );
}
