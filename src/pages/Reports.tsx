import { Button } from "@chakra-ui/react";
import { Download, FileText, Play } from "lucide-react";
import { useState } from "react";
import { Bars, ChartLegend, Lines, type SeriesDef } from "../components/ui/Charts";
import { FilterBar, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { useAppToast } from "../components/ui/Toast";
import {
  accuracyByZone,
  dockPerformance,
  fulfillmentSeries,
  inboundOutbound,
  pickerPerformance,
  reportCatalog,
  shrinkageSeries,
  zoneUtilization,
} from "../data/reports";

const reportView = (id: string) => {
  switch (id) {
    case "order-fulfillment":
      return {
        title: "Order Fulfillment",
        axis: "day",
        series: [
          { key: "received", label: "Received", color: "#98a2b3" },
          { key: "picking", label: "Picking", color: "#0369a1" },
          { key: "packing", label: "Packing", color: "#0e7490" },
          { key: "shipped", label: "Shipped", color: "#15803d" },
        ] as SeriesDef[],
        data: fulfillmentSeries,
        kind: "lines" as const,
      };
    case "stock-movement":
      return {
        title: "Stock Movement",
        axis: "day",
        series: [
          { key: "inbound", label: "Inbound", color: "#0369a1" },
          { key: "outbound", label: "Outbound", color: "#d0d5dd" },
        ] as SeriesDef[],
        data: inboundOutbound,
        kind: "bars" as const,
      };
    case "cycle-count-accuracy":
      return {
        title: "Cycle Count Accuracy",
        axis: "zone",
        series: [
          { key: "firstCount", label: "1st count", color: "#98a2b3" },
          { key: "thirdCount", label: "3rd count", color: "#0369a1" },
        ] as SeriesDef[],
        data: accuracyByZone,
        kind: "bars" as const,
      };
    default:
      return null;
  }
};

export default function Reports() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>("order-fulfillment");
  const [range, setRange] = useState("Last 8 days");

  const metrics: MetricDef[] = [
    { label: "Reports", value: String(reportCatalog.length), delta: "2 schedulable", hint: "8 groups" },
    { label: "New report", value: "RN-1042", delta: "stock movement", hint: "queued 06:00" },
    { label: "Sent today", value: "6", delta: "3 to ops", good: true, hint: "email + Slack" },
    { label: "Failed (7d)", value: "1", delta: "retrying", good: false, hint: "RN-1038" },
  ];

  const links = reportCatalog.filter((r) => {
    const q = search.trim().toLowerCase();
    return !q || `${r.name} ${r.group} ${r.desc}`.toLowerCase().includes(q);
  });

  const view = active ? reportView(active) : null;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Scheduled analytics across inventory, inbound, outbound and capacity"
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<Download size={13} />} onClick={() => toast({ title: "Report bundle", description: "PDF + CSV export for the selected period queued.", status: "success" })}>
              Export
            </Button>
            <Button
              size="sm"
              leftIcon={<Play size={13} />}
              onClick={() => {
                setRange((r) => (r === "Last 8 days" ? "Last 30 days" : "Last 8 days"));
                toast({ title: "Refresh started", description: `Rebuilding “${reportCatalog.find((r) => r.id === active)?.name ?? "report"}” for ${range}.`, status: "info" });
              }}
            >
              Run now
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar>
          <SearchBox value={search} onChange={setSearch} placeholder="Filter report library by name, group…" ariaLabel="Filter reports" />
        </FilterBar>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
            {view && (
              <div className="px-2 pt-2">
                <div className="mb-3 flex items-center justify-between gap-2 px-3">
                  <div>
                    <h3 className="text-tn font-semibold text-ink">{view.title}</h3>
                    <ChartLegend series={view.series} />
                  </div>
                  <Button size="xs" variant="outline" colorScheme="gray" onClick={() => toast({ title: `${view.title} downloaded`, description: "PNG snapshot of the chart saved.", status: "success" })}>
                    Save chart
                  </Button>
                </div>
                <div className="rounded-[6px] border border-line bg-surface-2 p-3">
                  {view.kind === "bars" ? (
                    <Bars data={view.data} xKey={view.axis} series={view.series} height={210} ariaLabel={view.title} />
                  ) : (
                    <Lines data={view.data} xKey={view.axis} series={view.series} height={210} ariaLabel={view.title} />
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5 p-3">
              {links.map((r) => {
                const isActive = active === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActive(r.id)}
                    className={`flex items-center gap-3 rounded-[6px] border px-3 py-2.5 text-left transition-colors ${
                      isActive ? "border-accent-line bg-accent-soft/60" : "border-line bg-surface hover:border-line-strong"
                    }`}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-[6px] ${isActive ? "bg-accent text-white" : "bg-surface-3 text-ink-3"}`}>
                      <FileText size={13} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-tn font-semibold text-ink">{r.name}</span>
                      <span className="block truncate text-2xs text-ink-3">{r.desc}</span>
                    </span>
                    <span className="shrink-0 rounded-[4px] border border-line bg-surface px-1.5 py-0.5 text-2xs font-medium text-ink-3">{r.group}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Schedule" subtitle="Refresh cadence">
            <dl className="flex flex-col gap-2 text-2xs">
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Inventory accuracy</dt>
                <dd className="font-medium text-ink">Daily 06:00 ET</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Order fulfillment</dt>
                <dd className="font-medium text-ink">Every 4 hrs</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Shrinkage</dt>
                <dd className="font-medium text-ink">Wed 08:00 ET</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Utilization</dt>
                <dd className="font-medium text-ink">Daily 05:00 ET</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Kickoffs" subtitle="Live floor data">
            <div className="flex flex-col gap-2 text-2xs text-ink-2">
              <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                <span className="font-semibold text-ink">Receiving.</span> {dockPerformance[3].receipts} receipts moved through Dock 04 this window at {dockPerformance[3].avgMinutes} min average.
              </div>
              <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                <span className="font-semibold text-ink">Picking.</span> {pickerPerformance[0].lines} lines handled by the top picker today at {pickerPerformance[0].accuracy}% accuracy.
              </div>
              <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                <span className="font-semibold text-ink">Capacity.</span> {zoneUtilization[1].pct}% of {zoneUtilization[1].zone.split(" — ")[1]} bins in active use.
              </div>
            </div>
          </Panel>

          <Panel title="Six-period look" subtitle="Shrinkage by reason">
            <ChartLegend
              series={[
                { key: "damage", label: "Damage", color: "#b42318" },
                { key: "shrinkage", label: "Shrinkage", color: "#b45309" },
                { key: "expiry", label: "Expiry", color: "#98a2b3" },
              ]}
            />
            <div className="mt-2">
              <Bars data={shrinkageSeries} xKey="month" height={140} series={[
                { key: "damage", label: "Damage", color: "#b42318" },
                { key: "shrinkage", label: "Shrinkage", color: "#b45309" },
                { key: "expiry", label: "Expiry", color: "#98a2b3" },
              ]} ariaLabel="Monthly shrinkage by reason" />
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}