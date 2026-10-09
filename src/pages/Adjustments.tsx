import { Button } from "@chakra-ui/react";
import { Check, Plus, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AuditLog, OperatorCell } from "../components/ui/ActivityTimeline";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { fmt } from "../data/meta";
import { adjustments, adjustmentAudit } from "../data/ops";
import type { Adjustment } from "../types";

const typeTone: Record<string, "ok" | "warn" | "danger" | "neutral"> = {
  Damage: "danger",
  Shrinkage: "warn",
  "Count Correction": "warn",
  Expired: "warn",
  "System Error": "neutral",
  "Found Stock": "ok",
  Other: "neutral",
};

export default function Adjustments() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [approveTarget, setApproveTarget] = useState<Adjustment[] | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Adjustment[] | null>(null);

  const types = useMemo(() => Array.from(new Set(adjustments.map((a) => a.type))), []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adjustments.filter(
      (a) =>
        (status === "all" || a.status === status) &&
        (type === "all" || a.type === type) &&
        (!q || `${a.id} ${a.sku} ${a.product} ${a.location} ${a.user}`.toLowerCase().includes(q)),
    );
  }, [search, status, type]);

  const pending = adjustments.filter((a) => a.status === "Pending Approval");
  const metrics: MetricDef[] = [
    { label: "Pending approval", value: String(pending.length), delta: "2 >$100", hint: "routed to manager" },
    { label: "Approved today", value: "2", delta: "posted", good: true, hint: "ledger updated" },
    { label: "Rejected (90d)", value: "5", delta: "1.8% of adj", hint: "of 278 total" },
    { label: "YTD shrinkage", value: "-$18.2k", delta: "0.41% of COGS", good: false, hint: "target < 0.5%" },
    { label: "Adjustment value", value: "-$6.4k", delta: "net 30d", hint: "damage + shrink" },
    { label: "Audit rate", value: "100%", delta: "SOX-ready", good: true, hint: "all adj. logged" },
  ];

  const columns: Column<Adjustment>[] = [
    {
      key: "id",
      header: "Adjustment",
      sortable: true,
      sortValue: (a) => a.id,
      cell: (a) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-tn font-semibold text-ink">{a.id}</span>
          <span className="text-2xs text-ink-3">{a.timestamp}</span>
        </span>
      ),
    },
    {
      key: "sku",
      header: "Item",
      sortable: true,
      sortValue: (a) => a.sku,
      cell: (a) => (
        <span className="flex flex-col gap-0.5">
          <Link to={`/products/${a.sku}`} className="font-mono text-2xs font-semibold text-accent hover:underline">
            {a.sku}
          </Link>
          <span className="max-w-[240px] truncate text-tn text-ink">{a.product}</span>
        </span>
      ),
    },
    { key: "location", header: "Location", mono: true, sortable: true, sortValue: (a) => a.location, hideBelow: "lg" },
    { key: "type", header: "Type", sortable: true, sortValue: (a) => a.type, hideBelow: "md", cell: (a) => <StatusBadge status={a.type} tone={typeTone[a.type]} /> },
    {
      key: "qty",
      header: "Qty",
      align: "right",
      sortable: true,
      sortValue: (a) => a.qty,
      cell: (a) => (
        <span className={`tnum font-bold ${a.qty < 0 ? "text-danger" : "text-ok"}`}>
          {a.qty > 0 ? `+${fmt(a.qty)}` : fmt(a.qty)}
        </span>
      ),
    },
    { key: "user", header: "By", hideBelow: "lg", cell: (a) => <OperatorCell name={a.user} /> },
    { key: "status", header: "Status", cell: (a) => <StatusBadge status={a.status} />, sortable: true, sortValue: (a) => a.status },
  ];

  const targets = approveTarget ?? rejectTarget;

  return (
    <>
      <PageHeader
        title="Adjustments"
        subtitle="Variance, damage, shrinkage and found-stock corrections — fully audited"
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" onClick={() => toast({ title: "Adjustments", description: "Use the New adjustment flow on the Inventory page to start a correction.", status: "info" })}>
              New adjustment
            </Button>
            <Button size="sm" leftIcon={<Plus size={13} />} onClick={() => toast({ title: "Bulk template", description: "CSV import template downloaded.", status: "success" })}>
              Import
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
            <FilterBar
              activeCount={(status !== "all" ? 1 : 0) + (type !== "all" ? 1 : 0)}
              onClear={() => {
                setStatus("all");
                setType("all");
              }}
            >
              <SearchBox value={search} onChange={setSearch} placeholder="Search adjustment, SKU, user…" ariaLabel="Search adjustments" />
              <FilterSelect
                label="Type"
                value={type}
                onChange={setType}
                options={[{ value: "all", label: "All types" }, ...types.map((t) => ({ value: t, label: t }))]}
              />
              <FilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "Pending Approval", label: "Pending Approval" },
                  { value: "Approved", label: "Approved" },
                  { value: "Rejected", label: "Rejected" },
                ]}
              />
            </FilterBar>

            <DataTable
              columns={columns}
              data={rows}
              rowKey={(a) => a.id}
              selectable
              selected={selected}
              onSelectionChange={setSelected}
              defaultSort={{ key: "id", dir: "desc" }}
              bulkActions={
                <>
                  <Button size="xs" colorScheme="accent" leftIcon={<Check size={12} />} onClick={() => setApproveTarget(adjustments.filter((a) => selected.includes(a.id)))}>
                    Approve selected
                  </Button>
                  <Button size="xs" variant="outline" colorScheme="gray" onClick={() => setRejectTarget(adjustments.filter((a) => selected.includes(a.id)))}>
                    Reject selected
                  </Button>
                </>
              }
              emptyTitle="No adjustments match"
              emptyDescription="Adjust the type or status filter to widen results."
              rowActions={(a) =>
                a.status === "Pending Approval" ? (
                  <span className="flex items-center gap-1">
                    <Button size="xs" colorScheme="accent" leftIcon={<Check size={11} />} onClick={() => setApproveTarget([a])}>
                      Approve
                    </Button>
                    <Button size="xs" variant="ghost" colorScheme="gray" leftIcon={<X size={11} />} onClick={() => setRejectTarget([a])}>
                      Reject
                    </Button>
                  </span>
                ) : undefined
              }
            />
          </div>
        </div>

        <Panel title="Audit trail" subtitle="Every movement is logged" flush>
          <AuditLog entries={adjustmentAudit} />
          <div className="border-t border-line px-3 py-2">
            <span className="text-2xs text-ink-3">
              <ShieldCheck size={11} className="mr-1 inline text-ok" />
              Signing authority: only users with <span className="font-semibold text-ink">Inventory Manager</span> role approve adjustments over $100.
            </span>
          </div>
        </Panel>
      </div>

      <ConfirmationDialog
        open={targets !== null}
        onClose={() => {
          setApproveTarget(null);
          setRejectTarget(null);
        }}
        onConfirm={() => {
          const list = targets ?? [];
          const isApprove = approveTarget !== null;
          toast({
            title: isApprove ? `${list.length} adjustment${list.length === 1 ? "" : "s"} approved` : `${list.length} adjustment${list.length === 1 ? "" : "s"} rejected`,
            description: list.map((a) => a.id).join(", ") + (isApprove ? " · posted to ledger" : " · returned to creator"),
            status: isApprove ? "success" : "info",
          });
          setApproveTarget(null);
          setRejectTarget(null);
          setSelected([]);
        }}
        title={targets ? `${approveTarget ? "Approve" : "Reject"} ${targets.length === 1 ? targets[0].id : `${targets.length} adjustments`}?` : ""}
        message={
          approveTarget
            ? "Approved adjustments post instantly to the inventory ledger and bin balances."
            : "Rejected adjustments are returned to the creator with a review note for correction."
        }
        details={
          targets && targets.length === 1 ? (
            <div className="flex flex-col gap-1">
              <span>
                {targets[0].product} · {targets[0].qty > 0 ? `+${fmt(targets[0].qty)}` : fmt(targets[0].qty)} EA
              </span>
              <span className="font-mono text-2xs">{targets[0].location}</span>
            </div>
          ) : targets ? (
            <span className="font-mono text-2xs">
              {targets.map((t) => `${t.id} ·${t.qty > 0 ? "+" : ""}${fmt(t.qty)}`).join("\n")}
            </span>
          ) : null
        }
        confirmLabel={approveTarget ? "Approve adjustment" : "Reject adjustment"}
        tone={approveTarget ? "primary" : "danger"}
      />
    </>
  );
}