import { Button } from "@chakra-ui/react";
import { ArrowLeft, CheckCircle2, PackageOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { DataTable, type Column } from "../components/ui/DataTable";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { ProgressBar } from "../components/ui/LocationBreadcrumb";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { fmt, money2 } from "../data/meta";
import { poLines, purchaseOrders } from "../data/orders";
import { useState } from "react";

export default function PurchaseOrderDetail() {
  const { id = "PO-10482" } = useParams();
  const toast = useAppToast();
  const [receive, setReceive] = useState(false);
  const po = purchaseOrders.find((p) => p.id === id);
  const lines = poLines[id] ?? [];

  if (!po) {
    return (
      <div className="rounded-panel border border-line bg-surface p-10 text-center">
        <p className="font-semibold text-ink">Purchase order not found</p>
        <Link to="/purchase-orders" className="mt-2 inline-block text-2xs font-semibold text-accent hover:underline">
          Back to purchase orders
        </Link>
      </div>
    );
  }

  const pct = Math.round((po.receivedQty / Math.max(1, po.totalQty)) * 100);
  const receivable = po.receivedQty < po.totalQty && ["Partially Received", "Submitted", "Draft"].includes(po.status);

  const metrics: MetricDef[] = [
    { label: "Lines", value: String(po.lines), delta: `${lines.filter((l) => l.received < l.qty).length} open`, hint: po.supplier },
    { label: "Receipt", value: `${pct}%`, delta: `${po.receivedQty.toLocaleString()} / ${po.totalQty.toLocaleString()}`, hint: "units" },
    { label: "Value", value: money2(po.total), delta: "at PO cost", hint: `buyer: ${po.buyer}` },
    { label: "Expected", value: po.expected, delta: po.orderDate, hint: `docks: ${po.shipTo.replace("Warehouse A — Columbus, ", "")}` },
  ];

  const columns: Column<(typeof lines)[number]>[] = [
    { key: "sku", header: "SKU", mono: true, sortable: true, sortValue: (l) => l.sku, cell: (l) => <Link to={`/products/${l.sku}`} className="font-mono text-tn font-semibold text-accent hover:underline">{l.sku}</Link> },
    { key: "product", header: "Product", sortable: true, sortValue: (l) => l.product, cell: (l) => <span className="max-w-[260px] truncate text-tn text-ink">{l.product}</span> },
    { key: "qty", header: "Qty", align: "right", mono: true, sortable: true, sortValue: (l) => l.qty, cell: (l) => <span className="tnum">{fmt(l.qty)}</span> },
    { key: "received", header: "Received", align: "right", mono: true, sortable: true, sortValue: (l) => l.received, cell: (l) => <span className={`tnum ${l.received < l.qty ? "text-warn" : "text-ok"}`}>{fmt(l.received)}</span> },
    { key: "unitCost", header: "Unit cost", align: "right", mono: true, sortable: true, sortValue: (l) => l.unitCost, cell: (l) => <span className="tnum text-ink-2">{money2(l.unitCost)}</span> },
    {
      key: "line",
      header: "Subtotal",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (l) => l.qty * l.unitCost,
      hideBelow: "md",
      cell: (l) => <span className="tnum text-ink-2">{money2(l.qty * l.unitCost)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (l) => (l.received >= l.qty ? <StatusBadge status="Received" /> : l.received > 0 ? <StatusBadge status="Partially Received" /> : <StatusBadge status="Submitted" />),
      sortable: true,
      sortValue: (l) => (l.received >= l.qty ? 2 : l.received > 0 ? 1 : 0),
    },
  ];

  const openCount = lines.filter((l) => l.received < l.qty).length;

  return (
    <>
      <PageHeader
        title={po.id}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-medium text-ink">{po.supplier}</span>
            <StatusBadge status={po.status} />
            <span className="text-ink-3">ordered {po.orderDate}</span>
          </span>
        }
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<ArrowLeft size={13} />} as={Link} to="/purchase-orders">
              All POs
            </Button>
            {receivable && (
              <Button size="sm" colorScheme="accent" leftIcon={<PackageOpen size={13} />} onClick={() => setReceive(true)}>
                Receive {openCount} line{openCount === 1 ? "" : "s"}
              </Button>
            )}
            {["Received"].includes(po.status) && (
              <Button size="sm" leftIcon={<CheckCircle2 size={13} />} onClick={() => toast({ title: `${po.id} closed`, description: "Accounted to cost of goods, dock reconciled.", status: "success" })}>
                Close PO
              </Button>
            )}
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
            <DataTable
              columns={columns}
              data={lines}
              rowKey={(l) => l.sku}
              defaultSort={{ key: "sku", dir: "asc" }}
              emptyTitle="No lines on this PO"
              emptyDescription="Add line items from the buyer workspace."
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Receipt progress">
            <ProgressBar value={pct} tone={pct >= 100 ? "ok" : pct >= 40 ? "warn" : "accent"} label="Units received" />
            <dl className="mt-3 flex flex-col gap-2 text-2xs">
              {[
                ["Ordered", `${fmt(po.totalQty)} units`],
                ["Received", `${fmt(po.receivedQty)} units`],
                ["Outstanding", `${fmt(Math.max(0, po.totalQty - po.receivedQty))} units`],
                ["Ship to", po.shipTo.replace("Warehouse A — Columbus, ", "")],
                ["Warehouse", po.warehouse],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-2">
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Vendor notes" subtitle={po.supplier}>
            <div className="flex flex-col gap-2 text-2xs text-ink-2">
              <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                <span className="font-semibold text-ink">OTA receipt.</span> Shortages over 2% today
                auto-generate a claim to the supplier portal.
              </div>
              <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                <span className="font-semibold text-ink">Dock routing.</span> 7:00–15:00 ET —
                drop at {po.shipTo.replace("Warehouse A — Columbus, ", "")}.
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmationDialog
        open={receive}
        onClose={() => setReceive(false)}
        onConfirm={() => {
          toast({ title: `Receiving started for ${po.id}`, description: `${openCount} open line${openCount === 1 ? "" : "s"} now at the dock — see Receiving.`, status: "success" });
          setReceive(false);
        }}
        title={`Receive ${po.id}?`}
        message="Creates a receipt against the dock and moves all outstanding lines into the receiving app."
        details={<span className="tnum">{openCount} open lines · {fmt(Math.max(0, po.totalQty - po.receivedQty))} units inbound</span>}
        confirmLabel="Start receiving"
        tone="primary"
      />
    </>
  );
}