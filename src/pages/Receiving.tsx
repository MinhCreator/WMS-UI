import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import { ArrowRight, Plus, ScanLine } from "lucide-react";
import { useMemo, useState } from "react";
import { OperatorCell } from "../components/ui/ActivityTimeline";
import { BarcodeScanner } from "../components/ui/BarcodeScanner";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { Field } from "../components/ui/Panel";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { ProgressBar, Steps } from "../components/ui/LocationBreadcrumb";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { useAppToast } from "../components/ui/Toast";
import { fmt } from "../data/meta";
import { receiptLinesFor, receipts } from "../data/orders";
import type { Receipt } from "../types";

const docks = ["Dock 01", "Dock 02", "Dock 03", "Dock 04", "Dock 05", "Dock 06"];
const stepsFor = (status: Receipt["status"]) =>
  status === "Expected" ? 0 : status === "In Progress" ? 1 : status === "Exception" ? 2 : 3;

export default function Receiving() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dock, setDock] = useState("all");
  const [active, setActive] = useState<Receipt | null>(null);
  const [postTarget, setPostTarget] = useState<Receipt | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return receipts.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (dock === "all" || r.dock === dock) &&
        (!q ||
          `${r.id} ${r.po} ${r.supplier} ${r.assigned}`.toLowerCase().includes(q)),
    );
  }, [search, status, dock]);

  const today = receipts.filter((r) => r.expectedDate === "Today");
  const metrics: MetricDef[] = [
    { label: "Expected today", value: String(today.length), delta: "6 docks", hint: "booked arrivals" },
    { label: "In progress", value: String(receipts.filter((r) => r.status === "In Progress").length), delta: "2 active", dir: "up", hint: "on the floor" },
    { label: "Completed today", value: String(receipts.filter((r) => r.status === "Completed" && r.expectedDate === "Today").length), delta: "on schedule", good: true, hint: "posted to inventory" },
    { label: "Exceptions", value: String(receipts.filter((r) => r.status === "Exception").length), delta: "needs review", good: false, hint: "variance or damage" },
    { label: "Units received", value: fmt(receipts.filter((r) => r.expectedDate === "Today").reduce((s, r) => s + r.received, 0)), delta: "+640 vs yest.", dir: "up", good: true, hint: "today, all POs" },
    { label: "Open lines", value: fmt(receipts.reduce((s, r) => s + Math.max(0, r.items - r.received), 0)), delta: "across 12 receipts", hint: "units still due" },
  ];

  const columns: Column<Receipt>[] = [
    {
      key: "id",
      header: "Receipt",
      sortable: true,
      sortValue: (r) => r.id,
      cell: (r) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-tn font-semibold text-ink">{r.id}</span>
          <span className="font-mono text-2xs text-ink-3">{r.po}</span>
        </span>
      ),
    },
    { key: "supplier", header: "Supplier", sortable: true, sortValue: (r) => r.supplier },
    { key: "expectedDate", header: "Expected", sortable: true, sortValue: (r) => r.expectedDate, hideBelow: "lg" },
    {
      key: "progress",
      header: "Progress",
      width: "170px",
      cell: (r) => (
        <span className="block min-w-[130px]">
          <span className="mb-1 flex items-center justify-between text-2xs">
            <span className="tnum text-ink-2">
              {fmt(r.received)} / {fmt(r.items)}
            </span>
            <span className="tnum font-semibold text-ink">
              {Math.round((r.received / Math.max(1, r.items)) * 100)}%
            </span>
          </span>
          <ProgressBar
            value={(r.received / Math.max(1, r.items)) * 100}
            showPct={false}
            height="6px"
            tone={r.status === "Exception" ? "danger" : r.status === "Completed" ? "ok" : "accent"}
          />
        </span>
      ),
      sortValue: (r) => r.received / Math.max(1, r.items),
      sortable: true,
    },
    {
      key: "variance",
      header: "Variance",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (r) => r.variance,
      cell: (r) => (
        <span className={r.variance === 0 ? "text-ink-4" : r.variance < 0 ? "font-semibold text-danger" : "font-semibold text-ok"}>
          {r.variance === 0 ? "—" : r.variance > 0 ? `+${r.variance}` : r.variance}
        </span>
      ),
    },
    { key: "dock", header: "Dock", mono: true, hideBelow: "md" },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} />, sortable: true, sortValue: (r) => r.status },
    { key: "assigned", header: "Assigned", hideBelow: "xl", cell: (r) => <OperatorCell name={r.assigned} /> },
  ];

  const lines = active ? receiptLinesFor(active.id) : [];
  const exceptionCount = receipts.filter((r) => r.status === "Exception").length;

  return (
    <>
      <PageHeader
        title="Receiving"
        subtitle="Inbound appointments, dock doors and receipt posting · Tuesday, Oct 7"
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<ScanLine size={13} />}
              onClick={() => toast({ title: "Scanner session started", description: "Scan a PO or pallet label to start a receipt.", status: "info" })}>
              Scan PO
            </Button>
            <Button size="sm" leftIcon={<Plus size={13} />}
              onClick={() => toast({ title: "New receipt", description: "Receipt drafting is stubbed in this demo build.", status: "info" })}>
              New receipt
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      {exceptionCount > 0 && (
        <div className="mt-4 flex items-start gap-2.5 rounded-[6px] border border-warn-line bg-warn-bg px-3 py-2.5">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-warn" aria-hidden />
          <div className="min-w-0 flex-1">
            <span className="text-tn font-semibold text-warn">
              {exceptionCount} receipts need review before posting
            </span>
            <p className="mt-0.5 text-2xs text-ink-2">
              RCV-20455 came in 42 units short against PO-10479; RCV-20448 has a lot mismatch on
              3 cartons. Open a receipt to review the line variances.
            </p>
          </div>
          <Button size="xs" variant="outline" colorScheme="gray" onClick={() => setStatus("Exception")}>
            Show exceptions
          </Button>
        </div>
      )}

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar
          activeCount={(status !== "all" ? 1 : 0) + (dock !== "all" ? 1 : 0)}
          onClear={() => {
            setStatus("all");
            setDock("all");
          }}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search receipt, PO, supplier…"
            ariaLabel="Search receipts"
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Expected", label: "Expected" },
              { value: "In Progress", label: "In Progress" },
              { value: "Completed", label: "Completed" },
              { value: "Exception", label: "Exception" },
            ]}
          />
          <FilterSelect
            label="Dock"
            value={dock}
            onChange={setDock}
            options={[{ value: "all", label: "All docks" }, ...docks.map((d) => ({ value: d, label: d }))]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => r.id}
          defaultSort={{ key: "id", dir: "desc" }}
          onRowClick={(r) => setActive(r)}
          highlightRow={(r) => r.status === "Exception"}
          emptyTitle="No receipts match these filters"
          emptyDescription="Clear the status or dock filter to see the full inbound schedule."
          rowActions={(r) => (
            <Button size="xs" variant="outline" colorScheme="gray" onClick={() => setActive(r)}>
              Open
            </Button>
          )}
          footerNote={<span className="hidden sm:inline">Click a row for line detail</span>}
        />
      </div>

      <Drawer isOpen={active !== null} onClose={() => setActive(null)} placement="right" size="xl">
        <DrawerOverlay bg="rgba(16,24,40,0.45)" />
        <DrawerContent>
          {active && (
            <>
              <DrawerHeader borderBottomWidth="1px" pb={3}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2.5">
                    <span className="font-mono text-[15px] font-semibold text-ink">{active.id}</span>
                    <StatusBadge status={active.status} />
                  </span>
                  <span className="text-2xs text-ink-3">
                    {active.dock} · assigned {active.assigned}
                  </span>
                </div>
                <div className="mt-3">
                  <Steps
                    steps={["Booked", "Started", "Counted", "Posted"]}
                    current={stepsFor(active.status)}
                  />
                </div>
              </DrawerHeader>

              <DrawerBody pt={4}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label="Purchase order" value={<span className="font-mono">{active.po}</span>} />
                  <Field label="Supplier" value={active.supplier} />
                  <Field label="Expected" value={active.expectedDate} />
                  <Field label="Dock" value={active.dock} mono />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                    <div className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">Expected</div>
                    <div className="mt-0.5 text-[17px] font-semibold tnum text-ink">{fmt(active.items)}</div>
                  </div>
                  <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                    <div className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">Received</div>
                    <div className="mt-0.5 text-[17px] font-semibold tnum text-ink">{fmt(active.received)}</div>
                  </div>
                  <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                    <div className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">Variance</div>
                    <div className={`mt-0.5 text-[17px] font-semibold tnum ${active.variance === 0 ? "text-ink" : active.variance < 0 ? "text-danger" : "text-ok"}`}>
                      {active.variance === 0 ? "0" : active.variance > 0 ? `+${active.variance}` : active.variance}
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
                  <table className="w-full">
                    <thead className="bg-[#f8fafc]">
                      <tr className="text-left text-2xs tracking-[0.05em] text-ink-3 uppercase">
                        <th className="border-b border-line px-3 py-2 font-semibold">Item</th>
                        <th className="border-b border-line px-3 py-2 text-right font-semibold">Exp</th>
                        <th className="border-b border-line px-3 py-2 text-right font-semibold">Recd</th>
                        <th className="border-b border-line px-3 py-2 text-right font-semibold">Dmg</th>
                        <th className="border-b border-line px-3 py-2 text-right font-semibold">Var</th>
                        <th className="hidden border-b border-line px-3 py-2 font-semibold sm:table-cell">Lot</th>
                        <th className="hidden border-b border-line px-3 py-2 font-semibold md:table-cell">Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l) => (
                        <tr key={l.sku} className="hover:bg-surface-2">
                          <td className="border-b border-[#eef1f5] px-3 py-2">
                            <span className="block font-mono text-2xs font-semibold text-accent">{l.sku}</span>
                            <span className="block max-w-[240px] truncate text-tn text-ink">{l.product}</span>
                          </td>
                          <td className="border-b border-[#eef1f5] px-3 py-2 text-right text-tn tnum text-ink-3">{fmt(l.expected)}</td>
                          <td className="border-b border-[#eef1f5] px-3 py-2 text-right text-tn font-semibold tnum text-ink">{fmt(l.received)}</td>
                          <td className="border-b border-[#eef1f5] px-3 py-2 text-right text-tn tnum text-ink-3">{l.damaged || "—"}</td>
                          <td className={`border-b border-[#eef1f5] px-3 py-2 text-right text-tn font-semibold tnum ${l.variance === 0 ? "text-ink-4" : l.variance < 0 ? "text-danger" : "text-ok"}`}>
                            {l.variance === 0 ? "—" : l.variance > 0 ? `+${l.variance}` : l.variance}
                          </td>
                          <td className="hidden border-b border-[#eef1f5] px-3 py-2 font-mono text-2xs text-ink-3 sm:table-cell">{l.lot}</td>
                          <td className="hidden border-b border-[#eef1f5] px-3 py-2 text-2xs text-ink-3 md:table-cell">{l.expiry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <BarcodeScanner
                    label="Scan carton or pallet"
                    placeholder="Scan LPN / carton barcode, then Enter"
                    hint="counts against this receipt"
                    onScan={(code) =>
                      toast({ title: "Carton accepted", description: `${code} posted to ${active.id}.`, status: "success" })
                    }
                  />
                </div>
              </DrawerBody>

              <DrawerFooter borderTopWidth="1px">
                <Button variant="outline" colorScheme="gray" onClick={() => setActive(null)}>
                  Close
                </Button>
                {active.status === "Expected" && (
                  <Button
                    ml={3}
                    leftIcon={<ArrowRight size={13} />}
                    onClick={() =>
                      toast({ title: "Receipt started", description: `${active.id} opened at ${active.dock}.`, status: "success" })
                    }
                  >
                    Start receipt
                  </Button>
                )}
                {(active.status === "In Progress" || active.status === "Exception") && (
                  <Button ml={3} onClick={() => setPostTarget(active)}>
                    Post receipt
                  </Button>
                )}
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <ConfirmationDialog
        open={postTarget !== null}
        onClose={() => setPostTarget(null)}
        onConfirm={() => {
          toast({
            title: "Receipt posted",
            description: `${postTarget?.id} · ${fmt(postTarget?.received ?? 0)} units moved to putaway queue.`,
            status: "success",
          });
          setPostTarget(null);
          setActive(null);
        }}
        title={`Post receipt ${postTarget?.id ?? ""}?`}
        message="Posting writes the counted quantities to inventory and queues putaway tasks for each line."
        details={
          <div className="flex flex-col gap-1">
            <span>PO {postTarget?.po} · {postTarget?.supplier}</span>
            <span className="tnum">
              {fmt(postTarget?.received ?? 0)} of {fmt(postTarget?.items ?? 0)} units
              {postTarget && postTarget.variance !== 0 && ` · variance ${postTarget.variance}`}
            </span>
          </div>
        }
        confirmLabel="Post receipt"
        tone="primary"
      />
    </>
  );
}
