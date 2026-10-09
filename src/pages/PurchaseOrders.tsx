import { Button } from "@chakra-ui/react";
import { ArrowRight, FilePlus2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { money, money2 } from "../data/meta";
import { purchaseOrders } from "../data/orders";
import { suppliers } from "../data/products";
import type { PurchaseOrder } from "../types";

export default function PurchaseOrders() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [supplier, setSupplier] = useState("all");

  const supplierNames = useMemo(() => Array.from(new Set(purchaseOrders.map((p) => p.supplier))).sort(), []);
  const open = purchaseOrders.filter((p) => !["Received", "Closed", "Cancelled"].includes(p.status));
  const backlog = open.reduce((s, p) => s + (p.totalQty - p.receivedQty), 0);
  const openValue = open.reduce((s, p) => s + p.total * ((p.totalQty - p.receivedQty) / Math.max(1, p.totalQty)), 0);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchaseOrders.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (supplier === "all" || p.supplier === supplier) &&
        (!q || `${p.id} ${p.supplier} ${p.buyer}`.toLowerCase().includes(q)),
    );
  }, [search, status, supplier]);

  const metrics: MetricDef[] = [
    { label: "Open POs", value: String(open.length), delta: `${backlog.toLocaleString()} units`, hint: "4 suppliers" },
    { label: "Inbound value", value: money(openValue), delta: "open balance", hint: "at PO cost" },
    { label: "Due today", value: "2", delta: "PO-10477, 10482", hint: "docs + dampers" },
    { label: "Overdue", value: "1", delta: "PO-10479", good: false, hint: "+1 day" },
    { label: "Avg OTIF (30d)", value: `${(suppliers.reduce((s, sup) => s + sup.otif, 0) / suppliers.length).toFixed(1)}%`, delta: "+0.6 pts", dir: "up", good: true, hint: "weighted across ups" },
    { label: "Partially received", value: String(purchaseOrders.filter((p) => p.status === "Partially Received").length), delta: "open docks", hint: "short + claim review" },
  ];

  const columns: Column<PurchaseOrder>[] = [
    {
      key: "id",
      header: "PO",
      sortable: true,
      sortValue: (p) => p.id,
      cell: (p) => (
        <span className="flex flex-col gap-0.5">
          <Link to={`/purchase-orders/${p.id}`} className="font-mono text-tn font-semibold text-accent hover:underline">
            {p.id}
          </Link>
          <span className="text-2xs text-ink-3">{p.orderDate}</span>
        </span>
      ),
    },
    { key: "supplier", header: "Supplier", sortable: true, sortValue: (p) => p.supplier, cell: (p) => <span className="max-w-[220px] truncate text-tn text-ink">{p.supplier}</span> },
    {
      key: "expected",
      header: "Expected",
      sortable: true,
      sortValue: (p) => p.expected,
      hideBelow: "lg",
      cell: (p) => (
        <span className={`text-2xs ${["Today"].includes(p.expected) && !["Received", "Closed", "Cancelled"].includes(p.status) ? "font-semibold text-accent" : "text-ink-2"}`}>
          {p.expected}
        </span>
      ),
    },
    { key: "lines", header: "Lines", align: "right", mono: true, sortable: true, sortValue: (p) => p.lines },
    {
      key: "qty",
      header: "Qty",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (p) => p.totalQty,
      cell: (p) => (
        <span className="tnum text-ink-2">
          {p.receivedQty.toLocaleString()}
          <span className="text-ink-4"> / {p.totalQty.toLocaleString()}</span>
        </span>
      ),
    },
    { key: "total", header: "Value", align: "right", mono: true, sortable: true, sortValue: (p) => p.total, hideBelow: "md", cell: (p) => <span className="tnum text-ink-2">{money2(p.total)}</span> },
    { key: "buyer", header: "Buyer", hideBelow: "xl", cell: (p) => <span className="text-2xs text-ink-2">{p.buyer}</span> },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} />, sortable: true, sortValue: (p) => p.status },
  ];

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "Draft", label: "Draft" },
    { value: "Submitted", label: "Submitted" },
    { value: "Partially Received", label: "Partially Received" },
    { value: "Received", label: "Received" },
    { value: "Closed", label: "Closed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <PageHeader
        title="Purchase orders"
        subtitle="Procurement pipeline from draft to closed — docked against supplier OTIF"
        actions={
          <Button size="sm" leftIcon={<FilePlus2 size={13} />} onClick={() => toast({ title: "New purchase order", description: "PO workspace ships with the buyer flow milestone.", status: "info" })}>
            New PO
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar
          activeCount={(status !== "all" ? 1 : 0) + (supplier !== "all" ? 1 : 0)}
          onClear={() => {
            setStatus("all");
            setSupplier("all");
          }}
        >
          <SearchBox value={search} onChange={setSearch} placeholder="Search PO, supplier, buyer…" ariaLabel="Search purchase orders" />
          <FilterSelect
            label="Supplier"
            value={supplier}
            onChange={setSupplier}
            options={[{ value: "all", label: "All suppliers" }, ...supplierNames.map((s) => ({ value: s, label: s }))]}
          />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={statusOptions} />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(p) => p.id}
          defaultSort={{ key: "id", dir: "desc" }}
          emptyTitle="No purchase orders match"
          emptyDescription="Adjust the supplier or status filter."
          rowActions={(p) => (
            <Button size="xs" variant="outline" colorScheme="gray" rightIcon={<ArrowRight size={11} />} as={Link} to={`/purchase-orders/${p.id}`}>
              Open
            </Button>
          )}
        />
      </div>
    </>
  );
}