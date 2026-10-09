import { Button } from "@chakra-ui/react";
import { Check, ClipboardCopy, Printer, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { shipments } from "../data/orders";
import type { Shipment } from "../types";

export default function Shipping() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [carrier, setCarrier] = useState("all");
  const [manifestTarget, setManifestTarget] = useState<Shipment | null>(null);

  const carriers = useMemo(() => Array.from(new Set(shipments.map((s) => s.carrier))), []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments.filter(
      (s) =>
        (status === "all" || s.status === status) &&
        (carrier === "all" || s.carrier === carrier) &&
        (!q || `${s.id} ${s.order} ${s.customer} ${s.carrier} ${s.tracking}`.toLowerCase().includes(q)),
    );
  }, [search, status, carrier]);

  const ready = shipments.filter((s) => s.status === "Ready");
  const metrics: MetricDef[] = [
    { label: "Ready to ship", value: String(ready.length), delta: "3 on dock", hint: "awaiting manifest" },
    { label: "Manifested today", value: String(shipments.filter((s) => s.status === "Manifested" && s.shipDate === "Today").length), delta: "on time", good: true, hint: "all carriers" },
    { label: "Shipments today", value: String(shipments.filter((s) => s.shipDate === "Today").length), delta: "8 packages", dir: "up", hint: "vs 5 yest." },
    { label: "Exceptions", value: String(shipments.filter((s) => s.status === "Exception").length), delta: "2 need review", good: false, hint: "carrier flags" },
    { label: "Dock utilization", value: "5 / 6", delta: "72%", good: true, hint: "doors in use" },
    { label: "Cut-off compliance", value: "98.6%", delta: "+0.4 pp", dir: "up", good: true, hint: "earned vs promised" },
  ];

  const columns: Column<Shipment>[] = [
    {
      key: "id",
      header: "Shipment",
      sortable: true,
      sortValue: (s) => s.id,
      cell: (s) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-tn font-semibold text-ink">{s.id}</span>
          <span className="font-mono text-2xs text-ink-3">{s.order}</span>
        </span>
      ),
    },
    { key: "customer", header: "Customer", sortable: true, sortValue: (s) => s.customer, hideBelow: "lg" },
    { key: "carrier", header: "Carrier", sortable: true, sortValue: (s) => s.carrier, cell: (s) => (
      <span className="flex flex-col">
        <span className="text-tn font-medium text-ink">{s.carrier}</span>
        <span className="text-2xs text-ink-3">{s.service}</span>
      </span>
    ) },
    { key: "packages", header: "Pkgs", align: "right", mono: true, sortable: true, sortValue: (s) => s.packages, hideBelow: "md" },
    { key: "weight", header: "Weight", mono: true, sortable: true, sortValue: (s) => s.weight, hideBelow: "md" },
    {
      key: "tracking",
      header: "Tracking",
      sortable: true,
      sortValue: (s) => s.tracking,
      cell: (s) => (
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-2xs tnum text-ink-2">
            {s.tracking === "—" ? <span className="text-ink-4">—</span> : s.tracking}
          </span>
          {s.tracking !== "—" && (
            <button
              type="button"
              aria-label={`Copy tracking for ${s.id}`}
              className="rounded-[4px] border border-line p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
              onClick={() => {
                navigator.clipboard?.writeText(s.tracking);
                toast({ title: "Tracking copied", description: s.tracking, status: "success" });
              }}
            >
              <ClipboardCopy size={11} />
            </button>
          )}
        </span>
      ),
    },
    { key: "shipDate", header: "Ship date", mono: true, sortable: true, sortValue: (s) => s.shipDate, hideBelow: "xl" },
    { key: "status", header: "Status", cell: (s) => <StatusBadge status={s.status} />, sortable: true, sortValue: (s) => s.status },
  ];

  return (
    <>
      <PageHeader
        title="Shipping"
        subtitle="Manifesting, carrier handoff and dock door staging · Tuesday, Oct 7"
        actions={
          <Button
            size="sm"
            leftIcon={<Truck size={13} />}
            onClick={() => toast({ title: "Carrier pickup scheduled", description: "UPS Freight window confirmed for 16:30–17:30 at Dock 05.", status: "success" })}
          >
            Schedule pickup
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
            <FilterBar
              activeCount={(status !== "all" ? 1 : 0) + (carrier !== "all" ? 1 : 0)}
              onClear={() => {
                setStatus("all");
                setCarrier("all");
              }}
            >
              <SearchBox value={search} onChange={setSearch} placeholder="Search shipment, order, customer, tracking…" ariaLabel="Search shipments" />
              <FilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "Ready", label: "Ready" },
                  { value: "Label Created", label: "Label Created" },
                  { value: "Manifested", label: "Manifested" },
                  { value: "Shipped", label: "Shipped" },
                  { value: "Exception", label: "Exception" },
                ]}
              />
              <FilterSelect
                label="Carrier"
                value={carrier}
                onChange={setCarrier}
                options={[{ value: "all", label: "All carriers" }, ...carriers.map((c) => ({ value: c, label: c }))]}
              />
            </FilterBar>

            <DataTable
              columns={columns}
              data={rows}
              rowKey={(s) => s.id}
              defaultSort={{ key: "id", dir: "desc" }}
              emptyTitle="No shipments match"
              emptyDescription="Try a different carrier or status filter."
              highlightRow={(s) => s.status === "Exception"}
              footerNote={<span className="hidden sm:inline">Tracking is live once manifested</span>}
              rowActions={(s) =>
                s.status === "Ready" ? (
                  <Button size="xs" colorScheme="blue" onClick={() => setManifestTarget(s)}>
                    Manifest
                  </Button>
                ) : s.status === "Label Created" ? (
                  <Button size="xs" variant="outline" colorScheme="gray" leftIcon={<Printer size={11} />} onClick={() => toast({ title: "Label reprinted", description: `${s.id} · ${s.tracking}`, status: "success" })}>
                    Reprint
                  </Button>
                ) : s.status === "Exception" ? (
                  <Button size="xs" variant="outline" colorScheme="gray" onClick={() => toast({ title: "Carrier flag opened", description: `${s.id} · verify dims/weight before tender.`, status: "warning" })}>
                    View flag
                  </Button>
                ) : s.status === "Manifested" ? (
                  <Button size="xs" variant="outline" colorScheme="gray" onClick={() => toast({ title: "Tendered to carrier", description: `${s.id} marked Shipped.`, status: "success" })}>
                    Mark shipped
                  </Button>
                ) : undefined
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Dock status" subtitle="16:25 · next cut-off 17:00">
            <div className="flex flex-col gap-2">
              {[
                ["Dock 01", "Open · next pick HT", "18:00"],
                ["Dock 02", "SHP-20873 · FedEx", "16:45"],
                ["Dock 03", "Open · standby", "—"],
                ["Dock 04", "SHP-20871 · UPS Freight", "17:30"],
                ["Dock 05", "SHP-20854 · UPS Freight", "16:30"],
                ["Dock 06", "SHP-20874 · UPS Freight", "16:30"],
              ].map(([dock, label, cut]) => (
                <div key={dock} className="flex items-center gap-3 rounded-[6px] border border-line px-3 py-2">
                  <span className="font-mono text-tn font-bold text-ink">{dock}</span>
                  <span className="min-w-0 flex-1 truncate text-2xs text-ink-2">{label}</span>
                  {cut !== "—" ? (
                    <span className="tnum shrink-0 text-2xs font-semibold text-ink">by {cut}</span>
                  ) : (
                    <span className="text-2xs text-ink-4">open</span>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Carrier 17:00 cut-off">
            <div className="flex items-center gap-2.5 rounded-[6px] border border-warn-line bg-warn-bg px-3 py-2.5">
              <Check size={14} className="shrink-0 text-warn" aria-hidden />
              <span className="text-2xs text-ink-2">
                Manifest before <span className="font-semibold text-ink">16:45</span> to hold the{" "}
                <span className="font-semibold text-ink">17:00</span> UPS Freight pickup. 3 shipments
                still in "Ready".
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-[6px] border border-line bg-surface-2 px-3 py-2 text-2xs">
              <span className="text-ink-3">BOLs generated</span>
              <span className="tnum font-semibold text-ink">7 / 12 today</span>
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmationDialog
        open={manifestTarget !== null}
        onClose={() => setManifestTarget(null)}
        onConfirm={() => {
          toast({
            title: "Shipment manifested",
            description: `${manifestTarget?.id} tendered to ${manifestTarget?.carrier} — tracking ${manifestTarget?.tracking ?? "generated"}.`,
            status: "success",
          });
          setManifestTarget(null);
        }}
        title={`Manifest ${manifestTarget?.id ?? ""}?`}
        message="Manifesting hands the shipment to the carrier schedule, generates the BOL and emails the customer the tracking number."
        details={
          manifestTarget && (
            <div className="flex flex-col gap-1">
              <span>{manifestTarget.customer} · {manifestTarget.service}</span>
              <span className="font-mono">{manifestTarget.tracking}</span>
            </div>
          )
        }
        confirmLabel="Manifest shipment"
        tone="primary"
      />
    </>
  );
}