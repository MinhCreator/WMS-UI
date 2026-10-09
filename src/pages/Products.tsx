import { Button } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { inventory, inventorySummary } from "../data/inventory";
import { money, money2 } from "../data/meta";
import { products } from "../data/products";
import type { Product } from "../types";

export default function Products() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const s = inventorySummary();
  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), []);
  const rowsBySku = useMemo(() => new Map(inventory.map((r) => [r.sku, r])), []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (status === "all" || p.status === status) &&
        (!q || `${p.sku} ${p.name} ${p.barcode} ${p.supplier} ${p.category}`.toLowerCase().includes(q)),
    );
  }, [search, category, status]);

  const metrics: MetricDef[] = [
    { label: "Catalog SKUs", value: String(products.length), delta: `${products.filter((p) => p.status === "Active").length} active`, hint: "across 12 categories" },
    { label: "Below reorder", value: String(s.lowStock), delta: "buying signal", good: false, hint: "of active inventory" },
    { label: "Discontinued", value: String(products.filter((p) => p.status === "Discontinued").length), delta: "no replenishment", hint: "clear-out in progress" },
    { label: "Pending", value: String(products.filter((p) => p.status === "Pending").length), delta: "new intros", hint: "await specs" },
    { label: "Inventory value", value: money(s.value), delta: "at cost", hint: "all locations" },
    { label: "Avg unit cost", value: money2(products.reduce((sum, p) => sum + p.unitCost, 0) / Math.max(1, products.length)), delta: "catalog mean", hint: "weighted skew noted" },
  ];

  const columns: Column<Product>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      sortValue: (p) => p.sku,
      cell: (p) => (
        <Link to={`/products/${p.sku}`} className="font-mono text-2xs font-semibold text-accent hover:underline">
          {p.sku}
        </Link>
      ),
    },
    {
      key: "name",
      header: "Product",
      sortable: true,
      sortValue: (p) => p.name,
      cell: (p) => (
        <span className="flex flex-col gap-0.5">
          <span className="max-w-[300px] truncate text-tn font-medium text-ink">{p.name}</span>
          <span className="font-mono text-2xs text-ink-3">{p.barcode}</span>
        </span>
      ),
    },
    { key: "category", header: "Category", sortable: true, sortValue: (p) => p.category, hideBelow: "lg", cell: (p) => <span className="text-2xs text-ink-2">{p.category}</span> },
    { key: "supplier", header: "Supplier", sortable: true, sortValue: (p) => p.supplier, hideBelow: "xl", cell: (p) => <span className="text-2xs text-ink-2">{p.supplier}</span> },
    { key: "unit", header: "Unit", mono: true, sortable: true, sortValue: (p) => p.unit, hideBelow: "md" },
    { key: "onHand", header: "On hand", align: "right", mono: true, sortable: true, sortValue: (p) => rowsBySku.get(p.sku)?.onHand ?? 0, cell: (p) => <span className="tnum text-ink">{(rowsBySku.get(p.sku)?.onHand ?? 0).toLocaleString()}</span> },
    { key: "cost", header: "Unit cost", align: "right", mono: true, sortable: true, sortValue: (p) => p.unitCost, cell: (p) => <span className="tnum text-ink-2">{money2(p.unitCost)}</span> },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} />, sortable: true, sortValue: (p) => p.status },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} SKUs · {catalog}`.replace("{catalog}", "master catalog across 12 categories")}
        actions={
          <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => toast({ title: "New product", description: "Product creation is stubbed in this demo build.", status: "info" })}>
            New product
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar
          activeCount={(category !== "all" ? 1 : 0) + (status !== "all" ? 1 : 0)}
          onClear={() => {
            setCategory("all");
            setStatus("all");
          }}
        >
          <SearchBox value={search} onChange={setSearch} placeholder="Search SKU, name, barcode, supplier…" ariaLabel="Search products" />
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={[{ value: "all", label: "All categories" }, ...categories.map((c) => ({ value: c, label: c }))]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Pending", label: "Pending" },
              { value: "Discontinued", label: "Discontinued" },
            ]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(p) => p.sku}
          defaultSort={{ key: "sku", dir: "asc" }}
          emptyTitle="No products match"
          emptyDescription="Try widening the category or status filter."
          footerNote={<span className="hidden sm:inline">On-hand joins the current inventory snapshot</span>}
        />
      </div>
    </>
  );
}