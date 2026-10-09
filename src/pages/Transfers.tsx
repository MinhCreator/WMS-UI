import { Button } from "@chakra-ui/react";
import { ArrowLeftRight, Plus, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { OperatorCell } from "../components/ui/ActivityTimeline";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { transfers } from "../data/ops";
import type { Transfer } from "../types";

export default function Transfers() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<{ t: Transfer; action: "Receive" | "Cancel" } | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transfers.filter(
      (t) =>
        (status === "all" || t.status === status) &&
        (!q || `${t.id} ${t.from} ${t.to} ${t.requestedBy}`.toLowerCase().includes(q)),
    );
  }, [search, status]);

  const inTransit = transfers.filter((t) => t.status === "In Transit");
  const metrics: MetricDef[] = [
    { label: "In transit", value: String(inTransit.length), delta: "1,380 units", hint: "inter-warehouse" },
    { label: "Inbound to A", value: "1", delta: "96 units", hint: "from Allentown" },
    { label: "Received this month", value: "4", delta: "2,420 units", dir: "up", good: true, hint: "across all sites" },
    { label: "Drafts", value: String(transfers.filter((t) => t.status === "Draft").length), delta: "not submitted", hint: "1 open" },
    { label: "Avg transit time", value: "1.8 d", delta: "-0.2 d", dir: "down", good: true, hint: "rolling 30d" },
    { label: "Damage in transit", value: "0.3%", delta: "+0.05 pp", good: false, hint: "per unit" },
  ];

  const columns: Column<Transfer>[] = [
    {
      key: "id",
      header: "Transfer",
      sortable: true,
      sortValue: (t) => t.id,
      cell: (t) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-tn font-semibold text-ink">{t.id}</span>
          <span className="text-2xs text-ink-3">
            {t.requestedBy} · {t.requested}
          </span>
        </span>
      ),
    },
    {
      key: "route",
      header: "Route",
      cell: (t) => (
        <span className="flex flex-col gap-0.5">
          <span className="text-tn text-ink">{t.from}</span>
          <span className="inline-flex items-center gap-1 text-2xs text-ink-3">
            <ArrowLeftRight size={11} aria-hidden /> {t.to}
          </span>
        </span>
      ),
      sortable: true,
      sortValue: (t) => t.from,
    },
    { key: "lines", header: "Lines", align: "right", mono: true, sortable: true, sortValue: (t) => t.lines, hideBelow: "md" },
    { key: "units", header: "Units", align: "right", mono: true, sortable: true, sortValue: (t) => t.units },
    { key: "requestedBy", header: "Requested by", hideBelow: "lg", cell: (t) => <OperatorCell name={t.requestedBy} /> },
    { key: "status", header: "Status", cell: (t) => <StatusBadge status={t.status} />, sortable: true, sortValue: (t) => t.status },
  ];

  return (
    <>
      <PageHeader
        title="Transfers"
        subtitle="Across COE warehouses A (Columbus), B (Reno) and C (Allentown)"
        actions={
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => toast({ title: "New transfer", description: "Drafting handles a single-wave builder in the full build.", status: "info" })}>
            New transfer
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar
          activeCount={status !== "all" ? 1 : 0}
          onClear={() => setStatus("all")}
        >
          <SearchBox value={search} onChange={setSearch} placeholder="Search transfer, warehouse, requester…" ariaLabel="Search transfers" />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Draft", label: "Draft" },
              { value: "In Transit", label: "In Transit" },
              { value: "Received", label: "Received" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(t) => t.id}
          defaultSort={{ key: "id", dir: "desc" }}
          emptyTitle="No transfers match"
          emptyDescription="Clear the status filter to see the full transfer ledger."
          rowActions={(t) =>
            t.status === "In Transit" ? (
              <Button size="xs" colorScheme="blue" onClick={() => setTarget({ t, action: "Receive" })}>
                Receive
              </Button>
            ) : t.status === "Draft" ? (
              <Button size="xs" variant="outline" colorScheme="gray" onClick={() => setTarget({ t, action: "Cancel" })}>
                Cancel
              </Button>
            ) : undefined
          }
        />
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-[6px] border border-line bg-surface px-3 py-2.5">
        <Truck size={14} className="mt-0.5 shrink-0 text-ink-4" aria-hidden />
        <p className="text-2xs text-ink-2">
          <span className="font-semibold text-ink">Transfer matching</span> — when a receiving warehouse
          confirms, bin availability runs first, then the system proposes a putaway task. Failed matches
          become transfer exceptions on the receiving site's queue.
        </p>
      </div>

      <ConfirmationDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={() => {
          if (target) {
            toast({
              title: target.action === "Receive" ? "Transfer received" : "Transfer cancelled",
              description:
                target.action === "Receive"
                  ? `${target.t.id} · ${target.t.units} units booked into receiving to ${"Warehouse A — Columbus"}.`
                  : `${target.t.id} was cancelled and stock stays reserved at origin.`,
              status: target.action === "Receive" ? "success" : "info",
            });
          }
          setTarget(null);
        }}
        title={target ? `${target.action} ${target.t.id}?` : ""}
        message={
          target?.action === "Receive"
            ? "Receiving the transfer counts every line into this site and queues putaway for the units."
            : "Cancelling reverses the origin reservation and notifies the requester."
        }
        details={
          target && (
            <div className="flex flex-col gap-1">
              <span>{target.t.from} → {target.t.to}</span>
              <span>{target.t.lines} lines · {target.t.units} units</span>
            </div>
          )
        }
        confirmLabel={target?.action === "Receive" ? "Receive transfer" : "Cancel transfer"}
        tone={target?.action === "Cancel" ? "danger" : "primary"}
      />
    </>
  );
}