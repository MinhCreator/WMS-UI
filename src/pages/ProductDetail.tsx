import { Button, Tabs, TabList, TabPanels, TabPanel, Tab } from "@chakra-ui/react";
import { ArrowRight, PackageX, Printer } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Bars, HBar } from "../components/ui/Charts";
import { DataTable, type Column } from "../components/ui/DataTable";
import { LocationBreadcrumb } from "../components/ui/LocationBreadcrumb";
import { PageHeader } from "../components/ui/PageHeader";
import { Field, Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { inventory, stockBySku } from "../data/inventory";
import { money, money2 } from "../data/meta";
import { poLines, purchaseOrders } from "../data/orders";
import { productMap } from "../data/products";
import type { StockByLocation } from "../types";

export default function ProductDetail() {
  const { sku = "" } = useParams();
  const product = productMap[sku];
  const toast = useAppToast();

  const stock = useMemo(() => stockBySku[sku] ?? [], [sku]);
  const row = inventory.find((r) => r.sku === sku);

  if (!product) {
    return (
      <div className="rounded-panel border border-line bg-surface p-10 text-center">
        <PackageX size={28} className="mx-auto mb-2 text-ink-4" aria-hidden />
        <p className="font-semibold text-ink">Product not found</p>
        <p className="mt-1 text-2xs text-ink-3">We have no record for {sku}.</p>
        <Link to="/inventory" className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-accent hover:underline">
          Back to inventory <ArrowRight size={11} />
        </Link>
      </div>
    );
  }

  const total = stock.reduce((acc, x) => acc + x.onHand, 0);
  const totalAvail = stock.reduce((acc, x) => acc + x.available, 0);
  const totalRes = stock.reduce((acc, x) => acc + x.reserved, 0);
  const onHand = row?.onHand ?? total;

  const history = [
    { day: "Oct 1", in: 520, out: 140 },
    { day: "Oct 2", in: 0, out: 180 },
    { day: "Oct 3", in: 1240, out: 220 },
    { day: "Oct 4", in: 0, out: 260 },
    { day: "Oct 5", in: 0, out: 180 },
    { day: "Oct 6", in: 0, out: 240 },
    { day: "Today", in: 0, out: 90 },
  ];

  const relatedPos = purchaseOrders.filter((p) => (poLines[p.id] ?? []).some((l) => l.sku === sku));
  const relatedOrders = ["SO-88421", "SO-88417", "SO-88401"].filter((id) => id && id.length > 0);

  const columns: Column<StockByLocation>[] = [
    {
      key: "location",
      header: "Location",
      cell: (x) => <LocationBreadcrumb code={x.location} />,
      sortable: true,
      sortValue: (x) => x.location,
    },
    { key: "onHand", header: "On hand", align: "right", mono: true, sortable: true, sortValue: (x) => x.onHand },
    { key: "reserved", header: "Reserved", align: "right", mono: true, sortable: true, sortValue: (x) => x.reserved },
    { key: "available", header: "Available", align: "right", mono: true, sortable: true, sortValue: (x) => x.available, cell: (x) => <span className="font-semibold text-ink">{x.available}</span> },
    { key: "status", header: "Status", cell: (x) => <StatusBadge status={x.status} />, sortable: true, sortValue: (x) => x.status },
  ];

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono">{sku}</span>
            <StatusBadge status={product.status} />
          </span>
        }
        subtitle={product.name}
        meta={product.barcode}
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<Printer size={13} />} onClick={() => toast({ title: "Labels printing", description: `${stock.length} bin labels queued for ${sku}.`, status: "success" })}>
              Bin labels
            </Button>
            <Button size="sm" leftIcon={<ArrowRight size={13} />} onClick={() => toast({ title: "Edit product", description: "Edit mode is stubbed in this demo build.", status: "info" })}>
              Edit
            </Button>
          </>
        }
      />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["On hand", onHand.toLocaleString(), "accent"],
              ["Available", totalAvail.toLocaleString(), "ink"],
              ["Reserved", totalRes.toLocaleString(), "ink"],
              ["Incoming", (row?.incoming ?? 0).toLocaleString(), row?.incoming ? "ok" : "ink"],
            ].map(([label, value, tone]) => (
              <div key={label} className="rounded-panel border border-line bg-surface px-3 py-3 shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
                <div className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">{label}</div>
                <div className={`mt-1 text-[19px] font-semibold tnum ${tone === "accent" ? "text-accent" : tone === "ok" ? "text-ok" : "text-ink"}`}>{value}</div>
              </div>
            ))}
          </div>

          <Panel flush>
            <Tabs variant="line" size="sm" px={3} pt={3}>
              <TabList>
                <Tab>Stock by bin ({stock.length})</Tab>
                <Tab>Movement</Tab>
                <Tab>Activity</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={-3} pb={0}>
                  <DataTable
                    columns={columns}
                    data={stock}
                    rowKey={(x) => x.location}
                    paginated={false}
                    maxHeight={300}
                    emptyTitle="No stock locations"
                    emptyDescription="This SKU has no bins assigned right now."
                  />
                </TabPanel>
                <TabPanel px={0} pb={3}>
                  <div className="px-2">
                    <Bars
                      data={history}
                      xKey="day"
                      series={[
                        { key: "in", label: "Inbound", color: "#0369a1" },
                        { key: "out", label: "Outbound", color: "#d0d5dd" },
                      ]}
                      height={190}
                      ariaLabel="Inbound and outbound units per day"
                    />
                    <p className="mt-1 px-1 text-2xs text-ink-3">
                      Inbound spike on Oct 3 lines up with receipt RCV-20454 (1,240 units from Vanguard).
                    </p>
                  </div>
                </TabPanel>
                <TabPanel px={0} pb={3}>
                  <div className="flex flex-col gap-2 px-2">
                    {[
                      ["Today 13:44", "Reserved −46 EA", "Cycle count CC-0487 variance booked to an adjustment."],
                      ["Today 09:12", "Order SO-88421", "24 EA picked from A-03-02-14 · line 1."],
                      ["Oct 6 14:37", "Order SO-88414", "18 EA allocated for expedite wave W-202."],
                      ["Oct 5 09:31", "Reorder eval", "ROP 180 · safety 60 — within band, no action."],
                    ].map(([time, title, desc]) => (
                      <div key={time} className="flex gap-3 rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                        <span className="font-mono text-2xs tnum text-ink-3">{time}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-tn font-semibold text-ink">{title}</span>
                          <span className="block text-2xs text-ink-3">{desc}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Product card">
            <div className="flex flex-col gap-2.5">
              <Field label="Barcode" value={product.barcode} mono />
              <Field label="Category" value={product.category} />
              <Field label="Supplier" value={product.supplier} />
              <Field label="Unit" value={product.unit} />
              <Field label="Weight" value={product.weight} />
              <Field label="Dimensions" value={product.dimensions} mono />
              <Field label="Unit cost" value={money2(product.unitCost)} />
              <Field label="Reorder point" value={String(product.reorderPoint)} mono />
              <Field label="Safety stock" value={String(product.safetyStock)} mono />
            </div>
            <div className="mt-3 rounded-[6px] border border-line bg-surface-2 px-3 py-2">
              <div className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">Cover against ROP</div>
              <div className="mt-1.5">
                <HBar value={Math.min(100, (onHand / Math.max(1, product.reorderPoint)) * 100)} tone={onHand < product.safetyStock ? "danger" : onHand < product.reorderPoint ? "warn" : "accent"} />
              </div>
              <p className="mt-1.5 text-2xs text-ink-3">
                Days of cover: {(onHand / (1 + product.reorderPoint * 0.008)).toFixed(1)} at current demand rate.
              </p>
            </div>
          </Panel>

          {relatedPos.length > 0 && (
            <Panel title="Purchase history" subtitle={`${relatedPos.length} recent POs`}>
              <div className="flex flex-col gap-2">
                {relatedPos.slice(0, 3).map((p) => (
                  <Link to={`/purchase-orders/${p.id}`} key={p.id} className="flex items-center justify-between gap-3 rounded-[6px] border border-line px-3 py-2 hover:bg-surface-2">
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-tn font-semibold text-ink">{p.id}</span>
                      <span className="block truncate text-2xs text-ink-3">{p.supplier}</span>
                    </span>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Open orders" subtitle="Reserved against this SKU">
            <div className="flex flex-col gap-2">
              {relatedOrders.map((id) => (
                <button key={id} type="button" onClick={() => toast({ title: id, description: "Order detail opens from Sales Orders in this demo.", status: "info" })} className="flex items-center justify-between gap-3 rounded-[6px] border border-line px-3 py-2 text-left hover:bg-surface-2">
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-tn font-semibold text-ink">{id}</span>
                    <span className="block truncate text-2xs text-ink-3">
                      {id === "SO-88421" ? "Northstar Industrial Supply" : id === "SO-88417" ? "Riverbend Automotive" : "Riverbend Automotive"} · {money(totalRes)}
                    </span>
                  </span>
                  <StatusBadge status={id === "SO-88417" ? "Short Pick" : "Picking"} />
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}