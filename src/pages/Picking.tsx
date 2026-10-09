import { Button, Tab, TabList, Tabs } from "@chakra-ui/react";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OperatorCell } from "../components/ui/ActivityTimeline";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/LocationBreadcrumb";
import { StatusBadge, PriorityBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { pickWaves, readyOrders } from "../data/orders";
import type { PickWave, ReadyOrder } from "../types";

const priorityRank: Record<string, number> = { Critical: 0, Expedite: 1, Standard: 2 };

export default function Picking() {
  const toast = useAppToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("waves");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [releaseTarget, setReleaseTarget] = useState<PickWave | null>(null);
  const [waveStart, setWaveStart] = useState<PickWave | null>(null);

  const waves = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pickWaves.filter(
      (w) =>
        (status === "all" || w.status === status) &&
        (!q || `${w.id} ${w.picker} ${w.priority}`.toLowerCase().includes(q)),
    );
  }, [search, status]);

  const ready = useMemo(() => {
    const q = search.trim().toLowerCase();
    return readyOrders.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!q || `${o.id} ${o.customer ?? ""} ${o.wave} ${o.priority}`.toLowerCase().includes(q)),
    );
  }, [search, status]);

  const inFlight = pickWaves.filter((w) => w.status === "In Progress");
  const metrics: MetricDef[] = [
    { label: "Active waves", value: String(inFlight.length), delta: "2 on floor", hint: "W-203 + W-198" },
    { label: "Orders ready", value: String(readyOrders.filter((o) => o.status === "Ready").length), delta: "awaiting release", hint: "queued to waves" },
    { label: "Items in waves", value: String(pickWaves.filter((w) => w.status !== "Completed").reduce((s, w) => s + w.items, 0)), delta: "across 5 waves", hint: "open work" },
    { label: "Items picked", value: "9,847", delta: "+3.4%", dir: "up", good: true, hint: "today, all zones" },
    { label: "Short picks", value: "4", delta: "0.04% of lines", good: false, hint: "2 need review" },
    { label: "Accuracy", value: "99.4%", delta: "+0.1 pp", dir: "up", good: true, hint: "24-day rolling" },
  ];

  const waveColumns: Column<PickWave>[] = [
    {
      key: "id",
      header: "Wave",
      sortable: true,
      sortValue: (w) => w.id,
      cell: (w) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-tn font-semibold text-ink">{w.id}</span>
          <span className="text-2xs text-ink-3">
            {w.orders} orders · {w.items} lines
          </span>
        </span>
      ),
    },
    { key: "priority", header: "Priority", hideBelow: "md", cell: (w) => <PriorityBadge value={w.priority} />, sortable: true, sortValue: (w) => priorityRank[w.priority] ?? 3 },
    { key: "picker", header: "Picker", cell: (w) => <OperatorCell name={w.picker} />, sortable: true, sortValue: (w) => w.picker },
    { key: "started", header: "Started", mono: true, sortable: true, sortValue: (w) => w.started },
    {
      key: "progress",
      header: "Progress",
      width: "170px",
      cell: (w) => (
        <span className="block min-w-[130px]">
          <span className="mb-1 flex items-center justify-between text-2xs">
            <span className="tnum text-ink-3">
              {w.progress === 100 ? "complete" : w.progress === 0 ? "not started" : `${w.progress}%`}
            </span>
          </span>
          <ProgressBar
            value={w.progress}
            showPct={false}
            height="6px"
            tone={w.status === "On Hold" ? "warn" : w.progress === 100 ? "ok" : "accent"}
          />
        </span>
      ),
      sortValue: (w) => w.progress,
      sortable: true,
    },
    { key: "status", header: "Status", cell: (w) => <StatusBadge status={w.status} />, sortable: true, sortValue: (w) => w.status },
  ];

  const orderColumns: Column<ReadyOrder>[] = [
    {
      key: "id",
      header: "Order",
      sortable: true,
      sortValue: (o) => o.id,
      cell: (o) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-tn font-semibold text-ink">{o.id}</span>
          <span className="text-2xs text-ink-3">{o.customer}</span>
        </span>
      ),
    },
    { key: "wave", header: "Wave", mono: true, sortable: true, sortValue: (o) => o.wave },
    { key: "size", header: "Size", align: "right", mono: true, sortable: true, sortValue: (o) => o.items, cell: (o) => `${o.items} it / ${o.lines} ln` },
    { key: "zone", header: "Zone", mono: true, hideBelow: "md", sortable: true, sortValue: (o) => o.zone },
    { key: "priority", header: "Priority", hideBelow: "lg", cell: (o) => <PriorityBadge value={o.priority} />, sortable: true, sortValue: (o) => priorityRank[o.priority] ?? 3 },
    { key: "promise", header: "Promise by", mono: true, sortable: true, sortValue: (o) => o.promise },
    { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} />, sortable: true, sortValue: (o) => o.status },
  ];

  const filterCount = (status !== "all" ? 1 : 0) + (search ? 1 : 0);

  return (
    <>
      <PageHeader
        title="Picking"
        subtitle="Wave management and order release for Zone A, B and C pickers"
        actions={
          <Button size="sm" leftIcon={<Sparkles size={13} />} onClick={() => toast({ title: "Wave optimizer", description: "Suggested pack W-205 next and split W-203 expedites to fast pick.", status: "info" })}>
            Suggest release
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <div className="flex items-center justify-between gap-3 px-3 pt-3">
          <Tabs
            variant="unstyled"
            onChange={(i) => {
              setTab(i === 0 ? "waves" : "orders");
              setStatus("all");
              setSearch("");
            }}
            size="sm"
          >
            <TabList gap={1}>
              <Tab
                px={3}
                py={1.5}
                borderRadius="6px"
                fontWeight={600}
                fontSize="12px"
                _selected={{ bg: "#eaf1f8", color: "#07527e" }}
              >
                Pick waves
              </Tab>
              <Tab
                px={3}
                py={1.5}
                borderRadius="6px"
                fontWeight={600}
                fontSize="12px"
                _selected={{ bg: "#eaf1f8", color: "#07527e" }}
              >
                Ready orders
              </Tab>
            </TabList>
          </Tabs>
          <span className="hidden items-center gap-1.5 text-2xs text-ink-3 sm:inline-flex">
            <Users size={12} /> 4 pickers online
          </span>
        </div>

        <div className="px-3 pt-3">
          <FilterBar activeCount={filterCount} onClear={() => { setStatus("all"); setSearch(""); }}>
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder={tab === "waves" ? "Search wave, wave ID, picker…" : "Search order, customer, wave…"}
              ariaLabel="Search picking work"
            />
            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={
                tab === "waves"
                  ? [
                      { value: "all", label: "All statuses" },
                      { value: "Released", label: "Released" },
                      { value: "In Progress", label: "In Progress" },
                      { value: "On Hold", label: "On Hold" },
                      { value: "Completed", label: "Completed" },
                    ]
                  : [
                      { value: "all", label: "All statuses" },
                      { value: "Ready", label: "Ready" },
                      { value: "Picking", label: "Picking" },
                      { value: "Short Pick", label: "Short Pick" },
                      { value: "Completed", label: "Completed" },
                    ]
              }
            />
          </FilterBar>
        </div>

        {tab === "waves" ? (
          <DataTable
            columns={waveColumns}
            data={waves}
            rowKey={(w) => w.id}
            defaultSort={{ key: "id", dir: "desc" }}
            paginated={false}
            maxHeight="calc(100vh - 480px)"
            emptyTitle="No waves match"
            emptyDescription="Try clearing the status filter."
            rowActions={(w) =>
              w.status === "Released" ? (
                <Button size="xs" colorScheme="blue" onClick={() => setWaveStart(w)}>
                  Start wave
                </Button>
              ) : w.status === "In Progress" ? (
                <Button
                  size="xs"
                  variant="outline"
                  colorScheme="gray"
                  leftIcon={<ArrowRight size={11} />}
                  onClick={() => navigate("/picking/workspace/SO-88421")}
                >
                  Workspace
                </Button>
              ) : w.status === "On Hold" ? (
                <Button size="xs" variant="outline" colorScheme="gray" onClick={() => setReleaseTarget(w)}>
                  Resume
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            columns={orderColumns}
            data={ready}
            rowKey={(o) => o.id}
            defaultSort={{ key: "promise", dir: "asc" }}
            paginated={false}
            maxHeight="calc(100vh - 480px)"
            emptyTitle="No ready orders match"
            emptyDescription="Release a wave to surface orders here."
            highlightRow={(o) => o.status === "Short Pick"}
            rowActions={(o) => (
              <Button
                size="xs"
                variant={o.status === "Short Pick" ? "outline" : "solid"}
                colorScheme={o.status === "Short Pick" ? "gray" : "blue"}
                onClick={() => navigate(`/picking/workspace/${o.id}`)}
              >
                {o.status === "Short Pick" ? "View short" : "Pick"}
              </Button>
            )}
          />
        )}
      </div>

      <ConfirmationDialog
        open={releaseTarget !== null || waveStart !== null}
        onClose={() => {
          setReleaseTarget(null);
          setWaveStart(null);
        }}
        onConfirm={() => {
          const w = waveStart ?? releaseTarget;
          if (w) {
            toast({
              title: waveStart ? `Wave ${w.id} started` : `Wave ${w.id} resumed`,
              description: waveStart ? `${w.orders} orders released to ${w.picker === "Unassigned" ? "the unassigned pool" : w.picker}.` : "Pickers notified to continue.",
              status: "success",
            });
          }
          setReleaseTarget(null);
          setWaveStart(null);
        }}
        title={waveStart ? `Start wave ${waveStart?.id}?` : `Resume wave ${releaseTarget?.id}?`}
        message={
          waveStart?.id
            ? "Starting the wave allocates pickers and writes the pick path for every order in it."
            : "This takes the wave off hold and returns outstanding tasks to the picker queue."
        }
        details={
          (releaseTarget ?? waveStart) && (
            <div className="flex flex-col gap-1">
              <span>
                {(releaseTarget ?? waveStart)?.orders} orders · {(releaseTarget ?? waveStart)?.items} lines ·{" "}
                {(releaseTarget ?? waveStart)?.priority}
              </span>
              <span>Picker: {(releaseTarget ?? waveStart)?.picker}</span>
            </div>
          )
        }
        confirmLabel={waveStart ? "Start wave" : "Resume"}
        tone="primary"
      />
    </>
  );
}