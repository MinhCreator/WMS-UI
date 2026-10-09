import { Button } from "@chakra-ui/react";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { fmt } from "../data/meta";
import { salesOrders } from "../data/orders";
import type { SalesOrder } from "../types";

const metricsFor = (index: { open: number; released: number; picking: number; packing: number; ready: number; onHold: number; exception: number }) => [
  { label: "Open orders", value: String(index.open), delta: `${index.picking} picking now`, hint: "all channels" },
  { label: "Released to floor", value: String(index.released), delta: "waves today", hint: "wave ladder" },
  { label: "Picking", value: String(index.picking), delta: `${index.packing} packing`, hint: "2 assignees" },
  { label: "Ready to ship", value: String(index.ready), delta: "units staged", hint: "dock 01–06" },
  { label: "On hold", value: String(index.onHold), delta: "credit + spec", hint: "CS owned", good: false },
  { label: "Exceptions", value: String(index.exception), delta: "needs action", hint: "out bin + damage", good: false },
];

export default function SalesOrders() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [priority, setPriority] = useState("all");

  const channels = useMemo(() => Array.from(new Set(salesOrders.map((o) => o.channel))).sort(), []);
  const idx = useMemo(() => ({
    open: salesOrders.filter((o) => !["Shipped", "Cancelled", "On Hold"].includes(o.status)).length,
    released: salesOrders.filter((o) => ["Released", "Picking", "Packing", "Ready to Ship"].includes(o.status)).length,
    picking: salesOrders.filter((o) => o.status === "Picking").length,
    packing: salesOrders.filter((o) => o.status === "Packing").length,
    ready: salesOrders.filter((o) => o.status === "Ready to Ship").length,
    onHold: salesOrders.filter((o) => o.status === "On Hold").length,
    exception: salesOrders.filter((o) => o.status === "Exception").length,
  }), []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return salesOrders.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (channel === "all" || o.channel === channel) &&
        (priority === "all" || o.priority === priority) &&
        (!q || `${o.id} ${o.customer} ${o.destination} ${o.assignee}`.toLowerCase().includes(q)),
    );
  }, [search, status, channel, priority]);

  const columns: Column<SalesOrder>[] = [
    {
      key: "id",
      header: "Order",
      sortable: true,
      sortValue: (o) => o.id,
      cell: (o) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-tn font-semibold text-ink">{o.id}</span>
          <span className="text-2xs text-ink-3">{o.channel}</span>
        </span>
      ),
    },
    { key: "customer", header: "Customer", sortable: true, sortValue: (o) => o.customer, cell: (o) => <span className="max-w-[220px] truncate text-tn text-ink">{o.customer}</span> },
    { key: "promise", header: "Promise", sortable: true, sortValue: (o) => o.promiseDate, hideBelow: "lg", cell: (o) => <span className="text-2xs text-ink-2">{o.promiseDate}</span> },
    { key: "items", header: "Items", align: "right", mono: true, sortable: true, sortValue: (o) => o.items },
    { key: "lines", header: "Lines", align: "right", mono: true, sortable: true, sortValue: (o) => o.lines },
    { key: "priority", header: "Priority", hideBelow: "xl", cell: (o) => <StatusBadge status={o.priority} /> },
    { key: "assignee", header: "Assigned", hideBelow: "xl", cell: (o) => <span className="text-2xs text-ink-2">{o.assignee}</span> },
    { key: "status", header: "Status", cell: (o) => <StatusBadge status={o.status} />, sortable: true, sortValue: (o) => o.status },
  ];

  return (
    <>
      <PageHeader
        title="Sales orders"
        subtitle={`${salesOrders.length} in demo window — ${idx.open} open across ${channels.length} channels`}
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<Eye size={13} />} onClick={() => toast({ title: "Order explorer", description: "Deep order detail ships with the CS workspace.", status: "info" })}>
              Order view
            </Button>
            <Button size="sm" variant="outline" colorScheme="gray" onClick={() => toast({ title: "Order CSV", description: "Order backlog export downloaded.", status: "success" })}>
              Export
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metricsFor(idx)} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar
          activeCount={(status !== "all" ? 1 : 0) + (channel !== "all" ? 1 : 0) + (priority !== "all" ? 1 : 0)}
          onClear={() => {
            setStatus("all");
            setChannel("all");
            setPriority("all");
          }}
        >
          <SearchBox value={search} onChange={setSearch} placeholder="Search order, customer, assignee…" ariaLabel="Search sales orders" />
          <FilterSelect label="Channel" value={channel} onChange={setChannel} options={[{ value: "all", label: "All channels" }, ...channels.map((c) => ({ value: c, label: c }))]} />
          <FilterSelect
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={[
              { value: "all", label: "All priorities" },
              { value: "Standard", label: "Standard" },
              { value: "Expedite", label: "Expedite" },
              { value: "Critical", label: "Critical" },
            ]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Received", label: "Received" },
              { value: "Released", label: "Released" },
              { value: "Picking", label: "Picking" },
              { value: "Packing", label: "Packing" },
              { value: "Ready to Ship", label: "Ready to Ship" },
              { value: "Shipped", label: "Shipped" },
              { value: "On Hold", label: "On Hold" },
              { value: "Exception", label: "Exception" },
            ]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(o) => o.id}
          defaultSort={{ key: "id", dir: "desc" }}
          emptyTitle="No sales orders match"
          emptyDescription="Widen the channel, priority, or status filter."
          rowActions={(o) =>
            o.status === "On Hold" ? (
              <span className="flex items-center gap-1">
                <Button size="xs" colorScheme="accent" leftIcon={<CheckCircle2 size={11} />} onClick={() => toast({ title: `${o.id} released`, description: `Hold cleared for ${o.customer}.`, status: "success" })}>
                  Release
                </Button>
                <Button size="xs" variant="ghost" colorScheme="gray" leftIcon={<XCircle size={11} />} onClick={() => toast({ title: `${o.id} → credit team`, description: "CS ticket opened for escalation.", status: "info" })}>
                  Escalate
                </Button>
              </span>
            ) : o.status === "Exception" ? (
              <Button size="xs" variant="outline" colorScheme="gray" as={Link} to="/picking">
                Review
              </Button>
            ) : undefined
          }
          footerNote={<span className="hidden sm:inline">Promise dates resolve to the <span className="tnum">{fmt(idx.ready)}</span> orders staged at the dock.</span>}
        />
      </div>
    </>
  );
}