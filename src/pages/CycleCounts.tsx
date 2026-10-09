import { Button } from "@chakra-ui/react";
import { ArrowRight, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OperatorCell } from "../components/ui/ActivityTimeline";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { cycleCounts } from "../data/ops";
import type { CycleCount } from "../types";

export default function CycleCounts() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [zone, setZone] = useState("all");

  const zones = useMemo(() => Array.from(new Set(cycleCounts.map((c) => c.zone))).sort(), []);
  const avgAccuracy = cycleCounts.filter((c) => c.status !== "Scheduled").reduce((s, c) => s + c.accuracy, 0) / Math.max(1, cycleCounts.filter((c) => c.status !== "Scheduled").length);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cycleCounts.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (zone === "all" || c.zone === zone) &&
        (!q || `${c.id} ${c.location} ${c.assigned}`.toLowerCase().includes(q)),
    );
  }, [search, status, zone]);

  const metrics: MetricDef[] = [
    { label: "Scheduled", value: String(cycleCounts.filter((c) => c.status === "Scheduled").length), delta: "next wave", hint: "A-03 + B-02" },
    { label: "In progress", value: String(cycleCounts.filter((c) => c.status === "In Progress").length), delta: "live counts", hint: "RF units out" },
    { label: "Pending review", value: String(cycleCounts.filter((c) => c.status === "Pending Review").length), delta: "2 variances", hint: "CC-0489, CC-0487" },
    { label: "Completed (30d)", value: String(cycleCounts.filter((c) => c.status === "Completed").length), delta: "on schedule", good: true, hint: "3 of 3 windows" },
    { label: "Avg accuracy", value: `${avgAccuracy.toFixed(1)}%`, delta: "+0.2 pts", dir: "up", good: true, hint: "last 30 days" },
    { label: "Cycle coverage", value: "68%", delta: "SKUs counted", hint: "target 100% / 90d" },
  ];

  const columns: Column<CycleCount>[] = [
    {
      key: "id",
      header: "Cycle count",
      sortable: true,
      sortValue: (c) => c.id,
      cell: (c) => (
        <span className="flex flex-col gap-0.5">
          <Link to={`/cycle-counts/${c.id}`} className="font-mono text-tn font-semibold text-accent hover:underline">
            {c.id}
          </Link>
          <span className="text-2xs text-ink-3">{c.scheduled}</span>
        </span>
      ),
    },
    { key: "location", header: "Location", mono: true, sortable: true, sortValue: (c) => c.location, cell: (c) => <span className="font-mono text-tn text-ink">{c.location}</span> },
    { key: "zone", header: "Zone", mono: true, sortable: true, sortValue: (c) => c.zone, hideBelow: "md" },
    { key: "skuCount", header: "SKUs", align: "right", mono: true, sortable: true, sortValue: (c) => c.skuCount },
    { key: "assigned", header: "Assigned", hideBelow: "lg", cell: (c) => <OperatorCell name={c.assigned} /> },
    {
      key: "variance",
      header: "Variance",
      align: "right",
      sortable: true,
      sortValue: (c) => c.variance,
      cell: (c) => (
        <span className={`tnum font-bold ${c.variance < 0 ? "text-danger" : c.variance > 0 ? "text-warn" : "text-ink-4"}`}>
          {c.variance === 0 ? "—" : c.variance > 0 ? `+${c.variance}` : c.variance}
        </span>
      ),
    },
    { key: "accuracy", header: "Accuracy", align: "right", mono: true, sortable: true, sortValue: (c) => c.accuracy, hideBelow: "md", cell: (c) => <span className="tnum text-ink-2">{c.status === "Scheduled" ? "—" : `${c.accuracy.toFixed(1)}%`}</span> },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} />, sortable: true, sortValue: (c) => c.status },
  ];

  return (
    <>
      <PageHeader
        title="Cycle counts"
        subtitle="Scheduled verification of on-hand stock against physical inventory — accurate to ±1 unit"
        actions={
          <Button size="sm" leftIcon={<ClipboardList size={13} />} onClick={() => toast({ title: "Schedule a count", description: "Full-cycle scheduling ships with the RF slotting milestone.", status: "info" })}>
            Schedule count
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
            <FilterBar
              activeCount={(status !== "all" ? 1 : 0) + (zone !== "all" ? 1 : 0)}
              onClear={() => {
                setStatus("all");
                setZone("all");
              }}
            >
              <SearchBox value={search} onChange={setSearch} placeholder="Search count ID, location, owner…" ariaLabel="Search cycle counts" />
              <FilterSelect
                label="Zone"
                value={zone}
                onChange={setZone}
                options={[{ value: "all", label: "All zones" }, ...zones.map((z) => ({ value: z, label: `Zone ${z}` }))]}
              />
              <FilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "Scheduled", label: "Scheduled" },
                  { value: "In Progress", label: "In Progress" },
                  { value: "Pending Review", label: "Pending Review" },
                  { value: "Completed", label: "Completed" },
                ]}
              />
            </FilterBar>

            <DataTable
              columns={columns}
              data={rows}
              rowKey={(c) => c.id}
              defaultSort={{ key: "id", dir: "desc" }}
              emptyTitle="No cycle counts match"
              emptyDescription="Adjust the zone or status filter."
              rowActions={(c) => (
                <Button size="xs" variant="outline" colorScheme="gray" rightIcon={<ArrowRight size={11} />} as={Link} to={`/cycle-counts/${c.id}`}>
                  Open
                </Button>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Count policy" subtitle="How AA cycle counts run">
            <ol className="flex flex-col gap-2 text-2xs text-ink-2">
              {[
                ["A-class SKUs count every 30 days", "top movers get the tightest window"],
                ["Full-location bins count every 90 days", "mixed bins force full detail counts"],
                ["Variance > 3 units blocks completion", "auto-recount within 24h"],
                ["Counters are blind-count by default", "system totals hidden until upload"],
              ].map(([title, detail]) => (
                <li key={title} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    <span className="font-semibold text-ink">{title}.</span> {detail}
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}