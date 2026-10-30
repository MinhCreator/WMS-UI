import { Button } from "@chakra-ui/react";
import { Printer, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { money } from "../data/meta";
import type { InventoryRow } from "../types";
import { useAppDispatch, useAppSelector } from "../states/hooks";
import {
  resetFilters,
  selectCategories,
  selectFilteredInventory,
  selectInventoryFilters,
  selectInventorySummary,
  setCategory,
  setSearch,
  setStatusFilter,
} from "../states/slices/inventorySlice";

export default function Inventory() {
  const toast = useAppToast();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectInventoryFilters);
  const { search, category, status } = filters;
  const rows = useAppSelector(selectFilteredInventory);
  const s = useAppSelector(selectInventorySummary);
  const categories = useAppSelector(selectCategories);

  const statusRank: Record<string, number> = { Out: 0, Critical: 1, Low: 2, Healthy: 3 };

  const metrics: MetricDef[] = [
    {
      label: "SKUs tracked",
      value: String(s.skus),
      delta: "46 under stocking",
      hint: "100% active",
    },
    {
      label: "Units on hand",
      value: String(s.totalUnits.toLocaleString()),
      delta: "+2.4%",
      dir: "up",
      good: true,
      hint: "across 3 zones",
    },
    {
      label: "Reserved",
      value: String(s.reserved.toLocaleString()),
      delta: `${s.reserved} alloc.`,
      hint: "for open orders",
    },
    {
      label: "Incoming",
      value: String(s.incoming.toLocaleString()),
      delta: "on 12 POs",
      dir: "up",
      good: true,
      hint: "expected units",
    },
    {
      label: "Below reorder",
      value: String(s.lowStock),
      delta: "needs buying",
      good: false,
      hint: `${Math.round((s.lowStock / s.skus) * 100)}% of catalog`,
    },
    {
      label: "Stock value",
      value: money(s.value),
      delta: "at cost",
      hint: "wholesale",
    },
  ];

  const columns: Column<InventoryRow>[] = [
    {
      key: "sku",
      header: "SKU / Product",
      sortable: true,
      sortValue: (r) => r.sku,
      cell: (r) => (
        <Link to={`/products/${r.sku}`} className="block min-w-0">
          <span className="block font-mono text-2xs font-semibold text-accent">
            {r.sku}
          </span>
          <span className="block max-w-[260px] truncate text-tn text-ink">
            {r.product}
          </span>
        </Link>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      sortValue: (r) => r.category,
      hideBelow: "lg",
      cell: (r) => <span className="text-2xs text-ink-2">{r.category}</span>,
    },
    {
      key: "location",
      header: "Location",
      mono: true,
      sortable: true,
      sortValue: (r) => r.location,
      cell: (r) => (
        <span className="font-mono text-2xs tnum">
          <span className="text-ink">{r.location}</span>
          {r.extraLocations > 0 && (
            <span className="text-ink-4"> +{r.extraLocations}</span>
          )}
        </span>
      ),
    },
    {
      key: "onHand",
      header: "On hand",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (r) => r.onHand,
      cell: (r) => (
        <span className="font-semibold text-ink">
          {r.onHand.toLocaleString()}
        </span>
      ),
    },
    {
      key: "available",
      header: "Avail.",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (r) => r.available,
      hideBelow: "md",
    },
    {
      key: "reserved",
      header: "Resv.",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (r) => r.reserved,
      hideBelow: "md",
    },
    {
      key: "incoming",
      header: "In",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (r) => r.incoming,
      hideBelow: "xl",
      cell: (r) =>
        r.incoming > 0 ? (
          <span className="text-ok">{r.incoming.toLocaleString()}</span>
        ) : (
          <span className="text-ink-4">—</span>
        ),
    },
    {
      key: "reorder",
      header: "ROP",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (r) => r.reorderPoint,
      hideBelow: "xl",
      cell: (r) => <span className="text-ink-3">{r.reorderPoint}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
      sortable: true,
      sortValue: (r) => statusRank[r.status],
    },
  ];

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="On-hand, availability and reorder health · all bins, all zones"
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              leftIcon={<Printer size={13} />}
              onClick={() =>
                toast({
                  title: "Labels queued",
                  description:
                    "Cycle count labels for A-03 print at Station 01.",
                  status: "info",
                })
              }
            >
              Print labels
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() =>
                toast({
                  title: "New adjustment",
                  description:
                    "Adjustment drafting lives under Inventory → Adjustments.",
                  status: "info",
                })
              }
            >
              New adjustment
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar
          activeCount={
            (status !== "all" ? 1 : 0) + (category !== "all" ? 1 : 0)
          }
          onClear={() => {
            dispatch(resetFilters());
          }}
        >
          <SearchBox
            value={search}
            onChange={(v) => dispatch(setSearch(v))}
            placeholder="Search SKU, product, supplier, bin…"
            ariaLabel="Search inventory"
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={(v) => dispatch(setCategory(v))}
            options={[
              { value: "all", label: "All categories" },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={(v) => dispatch(setStatusFilter(v))}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Healthy", label: "Healthy" },
              { value: "Low", label: "Low" },
              { value: "Critical", label: "Critical" },
              { value: "Out", label: "Out" },
            ]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => r.sku}
          defaultSort={{ key: "sku", dir: "asc" }}
          emptyTitle="No inventory rows match"
          emptyDescription="Adjust the category or status filter to widen the result set."
          footerNote={
            <span className="hidden sm:inline">Click a SKU for bin detail</span>
          }
          rowActions={(r) => (
            <Link
              to={`/products/${r.sku}`}
              className="text-2xs font-semibold text-accent hover:underline"
            >
              Detail
            </Link>
          )}
        />
      </div>
    </>
  );
}
