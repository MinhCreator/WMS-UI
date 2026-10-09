import { Button } from "@chakra-ui/react";
import { Download, RefreshCw } from "lucide-react";
import { Bars, ChartLegend, Lines } from "../components/ui/Charts";
import { DataTable, type Column } from "../components/ui/DataTable";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { useAppToast } from "../components/ui/Toast";
import { dockPerformance, pickerPerformance, shiftPerformance } from "../data/reports";

type Shift = (typeof shiftPerformance)[number];
type Dock = (typeof dockPerformance)[number];
type Picker = (typeof pickerPerformance)[number];

export default function Performance() {
  const toast = useAppToast();

  const metrics: MetricDef[] = [
    { label: "Units picked", value: "9,847", delta: "+3.4%", dir: "up", good: true, hint: "vs yesterday" },
    { label: "Picks / labor hr", value: "142", delta: "+6", dir: "up", good: true, hint: "target 130" },
    { label: "Avg pick time", value: "49s", delta: "-4s", dir: "down", good: true, hint: "per line" },
    { label: "Short picks today", value: "15", delta: "0.31%", good: false, hint: "of 4,812 lines" },
    { label: "Packing rate", value: "164/hr", delta: "+2.1%", dir: "up", good: true, hint: "6 pack stations" },
    { label: "Dock variance", value: "2.3%", delta: "below target", good: true, hint: "≤ 3% SLA" },
  ];

  const shiftCols: Column<Shift>[] = [
    { key: "shift", header: "Shift", sortable: true, sortValue: (s) => s.shift, cell: (s) => <span className="text-tn font-medium text-ink">{s.shift}</span> },
    { key: "picked", header: "Picked", align: "right", mono: true, sortable: true, sortValue: (s) => s.picked, cell: (s) => <span className="tnum">{s.picked.toLocaleString()}</span> },
    { key: "packed", header: "Packed", align: "right", mono: true, sortable: true, sortValue: (s) => s.packed, hideBelow: "md", cell: (s) => <span className="tnum text-ink-2">{s.packed.toLocaleString()}</span> },
    { key: "shipped", header: "Shipped", align: "right", mono: true, sortable: true, sortValue: (s) => s.shipped, hideBelow: "md", cell: (s) => <span className="tnum text-ink-2">{s.shipped.toLocaleString()}</span> },
    { key: "accuracy", header: "Accuracy", align: "right", mono: true, sortable: true, sortValue: (s) => s.accuracy, cell: (s) => <span className={`tnum font-semibold ${s.accuracy >= 99.2 ? "text-ok" : "text-warn"}`}>{s.accuracy}%</span> },
    { key: "lines", header: "Lines", align: "right", mono: true, sortable: true, sortValue: (s) => s.lines, cell: (s) => <span className="tnum text-ink-2">{s.lines.toLocaleString()}</span> },
  ];

  const dockCols: Column<Dock>[] = [
    { key: "dock", header: "Dock", mono: true, sortable: true, sortValue: (d) => d.dock },
    { key: "receipts", header: "Receipts", align: "right", mono: true, sortable: true, sortValue: (d) => d.receipts },
    { key: "units", header: "Units", align: "right", mono: true, sortable: true, sortValue: (d) => d.units, cell: (d) => <span className="tnum">{d.units.toLocaleString()}</span> },
    { key: "avgMinutes", header: "Cycle time", align: "right", mono: true, sortable: true, sortValue: (d) => d.avgMinutes, cell: (d) => <span className="tnum text-ink-2">{d.avgMinutes} min</span> },
    { key: "varianceRate", header: "Variance", align: "right", mono: true, sortable: true, sortValue: (d) => d.varianceRate, cell: (d) => <span className={`tnum ${d.varianceRate > 3 ? "text-danger" : "text-ink-2"}`}>{d.varianceRate}%</span> },
    {
      key: "utilization",
      header: "Utilization",
      sortable: true,
      sortValue: (d) => d.utilization,
      width: "150px",
      cell: (d) => (
        <span className="block min-w-[120px]">
          <span className="mb-1 block text-2xs tnum font-semibold text-ink">{d.utilization}%</span>
          <div className="w-full overflow-hidden rounded-full bg-surface-3" style={{ height: "6px" }}>
            <div className="h-full rounded-full" style={{ width: `${d.utilization}%`, backgroundColor: "#0369a1" }} />
          </div>
        </span>
      ),
    },
  ];

  const pickerCols: Column<Picker>[] = [
    { key: "picker", header: "Picker", sortable: true, sortValue: (p) => p.picker, cell: (p) => <span className="text-tn font-medium text-ink">{p.picker}</span> },
    { key: "lines", header: "Lines", align: "right", mono: true, sortable: true, sortValue: (p) => p.lines, cell: (p) => <span className="tnum">{p.lines.toLocaleString()}</span> },
    { key: "units", header: "Units", align: "right", mono: true, sortable: true, sortValue: (p) => p.units, hideBelow: "md", cell: (p) => <span className="tnum text-ink-2">{p.units.toLocaleString()}</span> },
    { key: "avgSeconds", header: "Avg sec", align: "right", mono: true, sortable: true, sortValue: (p) => p.avgSeconds, cell: (p) => <span className="tnum text-ink-2">{p.avgSeconds}s</span> },
    { key: "shortPicks", header: "Short picks", align: "right", mono: true, sortable: true, sortValue: (p) => p.shortPicks, cell: (p) => <span className={`tnum ${p.shortPicks > 0 ? "text-warn" : "text-ok"}`}>{p.shortPicks}</span> },
    { key: "accuracy", header: "Accuracy", align: "right", mono: true, sortable: true, sortValue: (p) => p.accuracy, cell: (p) => <span className={`tnum font-semibold ${p.accuracy === 100 ? "text-ok" : "text-ink"}`}>{p.accuracy}%</span> },
    { key: "utilization", header: "Utilization", sortable: true, sortValue: (p) => p.utilization, width: "120px", cell: (p) => <span className="block min-w-[90px]"><div className="w-full overflow-hidden rounded-full bg-surface-3" style={{ height: "6px" }}><div className="h-full rounded-full" style={{ width: `${p.utilization}%`, backgroundColor: p.utilization >= 90 ? "#b42318" : p.utilization >= 80 ? "#b45309" : "#0369a1" }} /></div></span> },
  ];

  return (
    <>
      <PageHeader
        title="Performance"
        subtitle="Labor productivity, docks and accuracy — live from the floor"
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<Download size={13} />} onClick={() => toast({ title: "Performance bundle", description: "Shift × dock × picker export queued.", status: "success" })}>
              Export
            </Button>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<RefreshCw size={13} />} onClick={() => toast({ title: "Refreshed", description: "Metrics pulled from the operations store.", status: "success" })}>
              Refresh
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Throughput by shift" subtitle="Today, 06:00 onward">
          <Lines
            data={shiftPerformance.map((s) => ({ ...s, label: s.shift.replace("Shift ", "S").replace(/ \(.*/, "") }))}
            xKey="label"
            height={170}
            series={[
              { key: "picked", label: "Picked", color: "#0369a1" },
              { key: "packed", label: "Packed", color: "#0e7490" },
              { key: "shipped", label: "Shipped", color: "#15803d" },
            ]}
            ariaLabel="Throughput by shift"
          />
          <div className="mt-2">
            <ChartLegend series={[{ key: "picked", label: "Picked", color: "#0369a1" }, { key: "packed", label: "Packed", color: "#0e7490" }, { key: "shipped", label: "Shipped", color: "#15803d" }]} />
          </div>
        </Panel>

        <Panel title="Dock cycle time" subtitle="Avg minutes by dock, today">
          <Bars
            data={dockPerformance.map((d) => ({ ...d, label: d.dock.replace("Dock ", "") }))}
            xKey="label"
            height={170}
            series={[{ key: "avgMinutes", label: "Cycle time", color: "#0369a1" }]}
            yFormat={(n) => `${n}m`}
            ariaLabel="Dock cycle time"
          />
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
          <div className="border-b border-line px-3 py-2.5">
            <h3 className="text-tn font-semibold text-ink">Shift breakdown</h3>
          </div>
          <DataTable columns={shiftCols} data={shiftPerformance} rowKey={(s) => s.shift} defaultSort={{ key: "shift", dir: "asc" }} />
        </div>

        <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
          <div className="border-b border-line px-3 py-2.5">
            <h3 className="text-tn font-semibold text-ink">Dock scorecard</h3>
          </div>
          <DataTable columns={dockCols} data={dockPerformance} rowKey={(d) => d.dock} defaultSort={{ key: "utilization", dir: "desc" }} />
        </div>

        <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
          <div className="border-b border-line px-3 py-2.5">
            <h3 className="text-tn font-semibold text-ink">Picker productivity</h3>
          </div>
          <DataTable columns={pickerCols} data={pickerPerformance} rowKey={(p) => p.picker} defaultSort={{ key: "lines", dir: "desc" }} />
        </div>
      </div>
    </>
  );
}