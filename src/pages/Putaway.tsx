import { Button } from "@chakra-ui/react";
import { ArrowRight, ScanLine, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OperatorCell } from "../components/ui/ActivityTimeline";
import { BarcodeScanner } from "../components/ui/BarcodeScanner";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Label, Panel } from "../components/ui/Panel";
import { StatusBadge, PriorityBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { fmt } from "../data/meta";
import { putawayTasks } from "../data/ops";
import type { PutawayTask } from "../types";

const priorityRank: Record<string, number> = { Critical: 0, Expedite: 1, Standard: 2 };

export default function Putaway() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [priority, setPriority] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [target, setTarget] = useState<{ task: PutawayTask; action: "Start" | "Complete" } | null>(null);

  const assignees = useMemo(
    () => Array.from(new Set(putawayTasks.map((t) => t.assignee))),
    [],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return putawayTasks.filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (assignee === "all" || t.assignee === assignee) &&
        (priority === "all" || t.priority === priority) &&
        (!q || `${t.id} ${t.receipt} ${t.sku} ${t.product} ${t.to}`.toLowerCase().includes(q)),
    );
  }, [search, status, assignee, priority]);

  const open = putawayTasks.filter((t) => t.status === "Queued" || t.status === "In Progress");
  const metrics: MetricDef[] = [
    { label: "Open tasks", value: String(open.length), delta: "across 6 zones", hint: "queued + in progress" },
    { label: "Queued", value: String(putawayTasks.filter((t) => t.status === "Queued").length), delta: "waiting on floor", hint: "not yet started" },
    { label: "In progress", value: String(putawayTasks.filter((t) => t.status === "In Progress").length), delta: "2 operators", dir: "up", hint: "active right now" },
    { label: "Units to place", value: fmt(open.reduce((s, t) => s + t.qty, 0)), delta: "pending", hint: "cases and units" },
    { label: "Completed today", value: String(putawayTasks.filter((t) => t.status === "Completed").length), delta: "posted", good: true, hint: "bins confirmed" },
    { label: "Avg time / task", value: "4.2 min", delta: "-0.4 min", dir: "down", good: true, hint: "7-day average" },
  ];

  const columns: Column<PutawayTask>[] = [
    {
      key: "id",
      header: "Task",
      sortable: true,
      sortValue: (t) => t.id,
      cell: (t) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-tn font-semibold text-ink">{t.id}</span>
          <span className="font-mono text-2xs text-ink-3">{t.receipt}</span>
        </span>
      ),
    },
    {
      key: "sku",
      header: "Item",
      sortable: true,
      sortValue: (t) => t.sku,
      cell: (t) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-2xs font-semibold text-accent">{t.sku}</span>
          <span className="max-w-[260px] truncate text-tn text-ink">{t.product}</span>
        </span>
      ),
    },
    { key: "qty", header: "Qty", align: "right", mono: true, sortable: true, sortValue: (t) => t.qty },
    {
      key: "to",
      header: "From → To",
      cell: (t) => (
        <span className="flex items-center gap-1.5 font-mono text-2xs tnum">
          <span className="text-ink-4">{t.from}</span>
          <ArrowRight size={11} className="shrink-0 text-ink-4" aria-hidden />
          <span className="font-semibold text-ink">{t.to}</span>
        </span>
      ),
      sortable: true,
      sortValue: (t) => t.to,
    },
    { key: "priority", header: "Priority", hideBelow: "md", sortable: true, sortValue: (t) => priorityRank[t.priority] ?? 3, cell: (t) => <PriorityBadge value={t.priority} /> },
    { key: "assignee", header: "Assignee", hideBelow: "lg", cell: (t) => <OperatorCell name={t.assignee} /> },
    { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} />, sortable: true, sortValue: (t) => t.status },
  ];

  const nextQueued = putawayTasks.find((t) => t.status === "Queued");

  return (
    <>
      <PageHeader
        title="Putaway"
        subtitle="Directed staging-to-bin movement after receipt posting"
        meta={<span className="text-tn text-ink-3">Open queue · {open.length} tasks · {fmt(open.reduce((s, t) => s + t.qty, 0))} units</span>}
        actions={
          <Button
            size="sm"
            leftIcon={<Truck size={13} />}
            onClick={() =>
              toast({ title: "Putaway wave created", description: "Queued tasks were batched for Zone B (forklift).", status: "success" })
            }
          >
            Batch open tasks
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
            <FilterBar
              activeCount={(status !== "all" ? 1 : 0) + (assignee !== "all" ? 1 : 0) + (priority !== "all" ? 1 : 0)}
              onClear={() => {
                setStatus("all");
                setAssignee("all");
                setPriority("all");
              }}
            >
              <SearchBox value={search} onChange={setSearch} placeholder="Search task, SKU, destination bin…" ariaLabel="Search putaway tasks" />
              <FilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "Queued", label: "Queued" },
                  { value: "In Progress", label: "In Progress" },
                  { value: "Completed", label: "Completed" },
                ]}
              />
              <FilterSelect
                label="Priority"
                value={priority}
                onChange={setPriority}
                options={[
                  { value: "all", label: "All priorities" },
                  { value: "Critical", label: "Critical" },
                  { value: "Expedite", label: "Expedite" },
                  { value: "Standard", label: "Standard" },
                ]}
              />
              <FilterSelect
                label="Assignee"
                value={assignee}
                onChange={setAssignee}
                options={[{ value: "all", label: "Everyone" }, ...assignees.map((a) => ({ value: a, label: a }))]}
              />
            </FilterBar>

            <DataTable
              columns={columns}
              data={rows}
              rowKey={(t) => t.id}
              selectable
              selected={selected}
              onSelectionChange={setSelected}
              defaultSort={{ key: "id", dir: "desc" }}
              bulkActions={
                <>
                  <Button size="xs" variant="outline" colorScheme="gray" onClick={() => { toast({ title: `${selected.length} tasks started`, description: "Operators notified on their handhelds.", status: "success" }); setSelected([]); }}>
                    Start selected
                  </Button>
                  <Button size="xs" variant="outline" colorScheme="gray" onClick={() => { toast({ title: "Tasks reassigned", description: `${selected.length} tasks assigned to Tomás Alvarez.`, status: "info" }); setSelected([]); }}>
                    Reassign
                  </Button>
                </>
              }
              emptyTitle="No putaway tasks match"
              emptyDescription="Clear filters, or post a receipt to generate new putaway work."
              rowActions={(t) =>
                t.status === "Queued" ? (
                  <Button size="xs" variant="outline" colorScheme="gray" onClick={() => setTarget({ task: t, action: "Start" })}>
                    Start
                  </Button>
                ) : t.status === "In Progress" ? (
                  <Button size="xs" colorScheme="blue" onClick={() => setTarget({ task: t, action: "Complete" })}>
                    Complete
                  </Button>
                ) : (
                  <Link to={`/inventory/${t.sku}`} className="text-2xs font-semibold text-accent hover:underline">
                    Stock
                  </Link>
                )
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Directed putaway" subtitle="Scan the pallet or case label">
            <BarcodeScanner
              large
              label="Scan at dock"
              placeholder="Scan LPN / carton barcode, then Enter"
              hint={nextQueued ? `next task: ${nextQueued.id} → ${nextQueued.to}` : "queue is empty"}
              onScan={(code) =>
                nextQueued
                  ? setTarget({ task: nextQueued, action: "Start" })
                  : toast({ title: "No queued tasks", description: `${code} matched nothing in the queue.`, status: "warning" })
              }
            />
          </Panel>

          <Panel title="How directed putaway works">
            <ol className="flex flex-col gap-2.5 text-tn text-ink-2">
              {[
                ["1", "Post the receipt", "Every received line spawns a task with a suggested bin."],
                ["2", "Scan at the dock", "The handheld resolves the next task by priority and zone."],
                ["3", "Travel and confirm", "Scan the destination bin, place the stock, confirm."],
                ["4", "Bin confirmed", "On-hand quantity updates and the receipt closes out."],
              ].map(([n, title, desc]) => (
                <li key={n} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-2xs font-bold text-white">
                    {n}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{title}</span>
                    <span className="block text-2xs text-ink-3">{desc}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-[6px] border border-line bg-surface-2 px-3 py-2">
              <Label>Rule of thumb</Label>
              <p className="mt-1 text-2xs text-ink-2">
                Expedite and Critical tasks are always sequenced ahead of standard replenishment,
                regardless of receipt age.
              </p>
            </div>
            <Link
              to="/receiving"
              className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-accent hover:underline"
            >
              Back to receiving <ArrowRight size={11} />
            </Link>
          </Panel>
          <span className="hidden items-center gap-1.5 text-2xs text-ink-4 xl:flex">
            <ScanLine size={11} /> Handheld RF session connected — 2 devices online
          </span>
        </div>
      </div>

      <ConfirmationDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (target) {
            toast({
              title: `Task ${target.task.id} ${target.action === "Start" ? "started" : "completed"}`,
              description:
                target.action === "Start"
                  ? `${target.task.qty} units of ${target.task.sku} → ${target.task.to}`
                  : `${target.task.to} confirmed · stock now available`,
              status: "success",
            });
          }
          setTarget(null);
        }}
        title={target ? `${target.action} ${target.task.id}?` : ""}
        message={
          target?.action === "Start"
            ? "The task moves to In Progress and appears on the assignee's handheld queue."
            : "Completing writes the quantity to the destination bin and closes the task."
        }
        details={
          target && (
            <div className="flex flex-col gap-1">
              <span className="font-mono text-2xs">
                {target.task.from} → {target.task.to} · {fmt(target.task.qty)} EA
              </span>
              <span>{target.task.product}</span>
            </div>
          )
        }
        confirmLabel={target?.action === "Start" ? "Start task" : "Complete task"}
        tone={target?.action === "Complete" ? "primary" : "primary"}
      />
    </>
  );
}
