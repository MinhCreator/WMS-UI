import { Button } from "@chakra-ui/react";
import { BellRing, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { money } from "../data/meta";
import { customers } from "../data/products";
import type { Customer } from "../types";

export default function Customers() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (!q || `${c.name} ${c.city} ${c.id} ${c.state}`.toLowerCase().includes(q)),
    );
  }, [search, status]);

  const ytdTotal = customers.reduce((s, c) => s + c.ytd, 0);
  const openTotal = customers.reduce((s, c) => s + c.openOrders, 0);

  const metrics: MetricDef[] = [
    { label: "Customers", value: String(customers.length), delta: "6 active", hint: "accounts" },
    { label: "YTD revenue", value: money(ytdTotal), delta: "+8.4%", dir: "up", good: true, hint: "qty shipped × price" },
    { label: "Open orders", value: String(openTotal), delta: "all channels", hint: "72 in flight" },
    { label: "Credit hold", value: String(customers.filter((c) => c.status === "Credit Hold").length), delta: "Summit Facility", good: false, hint: "CS + finance" },
    { label: "Top account", value: "Northstar", delta: "34% of YTD", good: true, hint: "Milwaukee" },
    { label: "YTD per account", value: money(ytdTotal / customers.length), delta: "blended", hint: "net of credits" },
  ];

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      sortValue: (c) => c.name,
      cell: (c) => (
        <span className="flex flex-col gap-0.5">
          <span className="max-w-[240px] truncate text-tn font-medium text-ink">{c.name}</span>
          <span className="font-mono text-2xs text-ink-3">{c.id}</span>
        </span>
      ),
    },
    { key: "city", header: "HQ", sortable: true, sortValue: (c) => c.city, cell: (c) => <span className="text-2xs text-ink-2">{c.city}, {c.state}</span> },
    { key: "terms", header: "Terms", sortable: true, sortValue: (c) => c.terms, hideBelow: "md" },
    { key: "openOrders", header: "Open orders", align: "right", mono: true, sortable: true, sortValue: (c) => c.openOrders },
    {
      key: "ytd",
      header: "YTD",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (c) => c.ytd,
      cell: (c) => <span className="tnum text-ink-2">{money(c.ytd)}</span>,
    },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} />, sortable: true, sortValue: (c) => c.status },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Accounts, credit posture and order load across the sales base"
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<BellRing size={13} />} onClick={() => toast({ title: "Credit alerts", description: "Summit Facility Group is the only account in a hold state.", status: "info" })}>
              Credit alerts
            </Button>
            <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => toast({ title: "New customer", description: "Customer onboarding ships with the CS workspace.", status: "info" })}>
              Add customer
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
          <SearchBox value={search} onChange={setSearch} placeholder="Search customer, city, account…" ariaLabel="Search customers" />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All customers" },
              { value: "Active", label: "Active" },
              { value: "Credit Hold", label: "Credit Hold" },
            ]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(c) => c.id}
          defaultSort={{ key: "ytd", dir: "desc" }}
          emptyTitle="No customers match"
          emptyDescription="Adjust the status filter or reset the search."
          highlightRow={(c) => c.status === "Credit Hold"}
          footerNote={<span className="hidden sm:inline">Order load = open orders across all channels; YTD in shipped revenue.</span>}
        />
      </div>
    </>
  );
}