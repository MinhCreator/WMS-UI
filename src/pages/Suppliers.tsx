import { Button } from "@chakra-ui/react";
import { Building2, Plus, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar } from "../components/ui/LocationBreadcrumb";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { suppliers } from "../data/products";
import type { Supplier } from "../types";

export default function Suppliers() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return suppliers.filter(
      (s) =>
        (status === "all" || s.status === status) &&
        (!q || `${s.name} ${s.contact} ${s.city} ${s.id}`.toLowerCase().includes(q)),
    );
  }, [search, status]);

  const avgOtif = suppliers.reduce((s, x) => s + x.otif, 0) / suppliers.length;

  const metrics: MetricDef[] = [
    { label: "Suppliers", value: String(suppliers.length), delta: `${suppliers.filter((s) => s.status === "Active").length} active`, hint: "8 partners" },
    { label: "Open POs", value: suppliers.reduce((s, x) => s + x.openPos, 0).toLocaleString(), delta: "across 8", hint: "buyer queue" },
    { label: "Weighted OTIF", value: `${avgOtif.toFixed(1)}%`, delta: "last 90 days", hint: "target ≥ 95%" },
    { label: "On hold", value: String(suppliers.filter((s) => s.status === "On Hold").length), delta: "7-day OTIF < 80%", good: false, hint: "Ironclad quiet" },
    { label: "Avg lead time", value: `${(suppliers.reduce((s, x) => s + x.leadTimeDays, 0) / suppliers.length).toFixed(1)}d`, delta: "weighted", hint: "replenish planning" },
    { label: "Top partner", value: "DeltaFast", delta: "98.2% OTIF", good: true, hint: "tightest lead time" },
  ];

  const columns: Column<Supplier>[] = [
    {
      key: "id",
      header: "Vendor",
      sortable: true,
      sortValue: (s) => s.id,
      cell: (s) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-2xs font-semibold text-ink">{s.id}</span>
          <span className="text-tn font-medium text-ink">{s.name}</span>
        </span>
      ),
    },
    { key: "contact", header: "Contact", sortable: true, sortValue: (s) => s.contact, hideBelow: "xl", cell: (s) => <span className="flex flex-col gap-0.5"><span className="text-tn text-ink-2">{s.contact}</span><span className="text-2xs text-ink-3">{s.email}</span></span> },
    { key: "city", header: "Location", sortable: true, sortValue: (s) => s.city, hideBelow: "lg" },
    { key: "lead", header: "Lead time", align: "right", mono: true, sortable: true, sortValue: (s) => s.leadTimeDays, cell: (s) => <span className="tnum text-ink-2">{s.leadTimeDays}d</span> },
    { key: "openPos", header: "Open POs", align: "right", mono: true, sortable: true, sortValue: (s) => s.openPos },
    {
      key: "otif",
      header: "OTIF (90d)",
      sortable: true,
      sortValue: (s) => s.otif,
      width: "150px",
      cell: (s) => (
        <span className="block min-w-[110px]">
          {s.otif >= 95 ? <Star size={11} className="mb-0.5 mr-1 inline text-warn" fill="currentColor" /> : null}
          <span className={`tnum text-tn font-semibold ${s.otif >= 95 ? "text-ok" : s.otif >= 90 ? "text-ink" : "text-danger"}`}>{s.otif}%</span>
        </span>
      ),
    },
    { key: "status", header: "Status", cell: (s) => <StatusBadge status={s.status} />, sortable: true, sortValue: (s) => s.status },
  ];

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Vendor scorecards, OTIF and open purchasing commitments"
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<Building2 size={13} />} onClick={() => toast({ title: "Vendor portal", description: "Purchase orders sync to the portal every 15 min.", status: "info" })}>
              Vendor portal
            </Button>
            <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => toast({ title: "New supplier", description: "Vendor onboarding ships with the buyer flow milestone.", status: "info" })}>
              Add supplier
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar
          activeCount={status !== "all" ? 1 : 0}
          onClear={() => setStatus("all")}
        >
          <SearchBox value={search} onChange={setSearch} placeholder="Search vendor, contact, city…" ariaLabel="Search suppliers" />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "On Hold", label: "On Hold" },
            ]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(s) => s.id}
          defaultSort={{ key: "otif", dir: "desc" }}
          emptyTitle="No suppliers match"
          emptyDescription="Check the status filter or reset the search."
          highlightRow={(s) => s.otif < 88}
          footerNote={
            <span className="hidden sm:inline-flex items-center gap-1.5">
              OTIF 90-day lagging indicator, blended from dock receipt and promise date.
              <ProgressBar value={avgOtif} tone={avgOtif >= 95 ? "ok" : avgOtif >= 88 ? "warn" : "danger"} showPct label="Portfolio OTIF" />
            </span>
          }
        />
      </div>
    </>
  );
}