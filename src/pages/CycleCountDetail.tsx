import { Button, Input } from "@chakra-ui/react";
import { ArrowLeft, CheckCircle2, ClipboardCheck, OctagonAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { OperatorCell } from "../components/ui/ActivityTimeline";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { DataTable, type Column } from "../components/ui/DataTable";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Steps } from "../components/ui/LocationBreadcrumb";
import { useAppToast } from "../components/ui/Toast";
import { countLinesFor, cycleCounts } from "../data/ops";
import { fmt } from "../data/meta";

const stepOf = (status: string) => (status === "Scheduled" ? 0 : status === "In Progress" ? 1 : status === "Pending Review" ? 2 : 3);
const stepLabels = ["Scheduled", "Counting", "Review", "Completed"];

export default function CycleCountDetail() {
  const { id = "CC-0489" } = useParams();
  const toast = useAppToast();
  const count = cycleCounts.find((c) => c.id === id);
  const lines = useMemo(() => countLinesFor(id), [id]);

  const init = useMemo(() => {
    const m: Record<string, string> = {};
    for (const l of lines) if (l.counted !== null) m[l.sku] = String(l.counted);
    return m;
  }, [lines]);
  const [entered, setEntered] = useState<Record<string, string>>(init);
  const [approve, setApprove] = useState(false);

  const editable = count?.status === "Scheduled" || count?.status === "In Progress";

  const rows = useMemo(
    () =>
      lines.map((l) => {
        const raw = entered[l.sku]?.trim() ?? "";
        const counted = raw === "" ? null : Number(raw);
        const variance = counted === null ? null : counted - l.system;
        return {
          ...l,
          counted,
          variance,
          match: variance === null ? "Pending" : variance === 0 ? "Match" : "Mismatch",
        };
      }),
    [lines, entered],
  );

  const countedTotal = rows.reduce((s, r) => s + (r.counted ?? 0), 0);
  const systemTotal = rows.reduce((s, r) => s + r.system, 0);
  const mismatch = rows.filter((r) => r.match === "Mismatch").length;
  const accuracy = rows.length ? Math.max(0, Math.round((1 - mismatch / rows.length) * 1000) / 10) : 100;
  const varianceTotal = countedTotal - systemTotal;
  const unfinished = rows.filter((r) => r.match === "Pending").length;

  if (!count) {
    return (
      <div className="rounded-panel border border-line bg-surface p-10 text-center">
        <p className="font-semibold text-ink">Cycle count not found</p>
        <Link to="/cycle-counts" className="mt-2 inline-block text-2xs font-semibold text-accent hover:underline">
          Back to cycle counts
        </Link>
      </div>
    );
  }

  const metrics: MetricDef[] = count.status === "Scheduled" || count.status === "In Progress"
    ? [
        { label: "Lines to count", value: String(rows.length), delta: `${unfinished} pending`, hint: count.location },
        { label: "Counted", value: String(rows.length - unfinished), delta: `${Math.round(((rows.length - unfinished) / rows.length) * 100)}%`, hint: "blind count" },
        { label: "System value", value: `${systemTotal.toLocaleString()} EA`, delta: "on hand", hint: "hidden during count" },
      ]
    : [
        { label: "Lines counted", value: String(rows.length), delta: "100%", good: count.status === "Completed", hint: count.location },
        { label: "Variance", value: varianceTotal === 0 ? "0" : varianceTotal > 0 ? `+${fmt(varianceTotal)}` : fmt(varianceTotal), delta: `${mismatch} mismatches`, good: mismatch === 0, hint: "units" },
        { label: "Accuracy", value: `${accuracy.toFixed(1)}%`, delta: accuracy >= 99 ? "on target" : "review flag", good: accuracy >= 99, hint: "posted to ledger" },
      ];

  const columns: Column<(typeof rows)[number]>[] = [
    { key: "sku", header: "SKU", mono: true, sortable: true, sortValue: (r) => r.sku, cell: (r) => <Link to={`/products/${r.sku}`} className="font-mono text-tn font-semibold text-accent hover:underline">{r.sku}</Link> },
    { key: "product", header: "Product", sortable: true, sortValue: (r) => r.product, cell: (r) => <span className="max-w-[260px] truncate text-tn text-ink">{r.product}</span> },
    { key: "system", header: "System", align: "right", mono: true, sortable: true, sortValue: (r) => r.system, cell: (r) => <span className="tnum text-ink-2">{fmt(r.system)}</span> },
    {
      key: "counted",
      header: "Counted",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (r) => r.counted ?? -1,
      cell: (r) =>
        editable ? (
          <Input
            size="sm"
            width="72px"
            textAlign="right"
            value={entered[r.sku] ?? ""}
            placeholder="—"
            onChange={(e) => setEntered((p) => ({ ...p, [r.sku]: e.target.value.replace(/[^\d]/g, "") }))}
            className="font-mono tnum"
          />
        ) : (
          <span className={`tnum ${r.match === "Mismatch" ? "text-danger" : "text-ink"}`}>{r.counted === null ? "—" : fmt(r.counted)}</span>
        ),
    },
    {
      key: "variance",
      header: "Variance",
      align: "right",
      mono: true,
      sortable: true,
      sortValue: (r) => r.variance ?? 0,
      cell: (r) =>
        editable ? (
          <span className="text-ink-4">—</span>
        ) : (
          <span className={`tnum font-bold ${r.variance === null ? "text-ink-4" : r.variance === 0 ? "text-ok" : "text-danger"}`}>
            {r.variance === null ? "—" : r.variance === 0 ? "0" : r.variance > 0 ? `+${r.variance}` : r.variance}
          </span>
        ),
    },
    { key: "unit", header: "Unit", mono: true, hideBelow: "md" },
    { key: "match", header: "Result", sortable: true, sortValue: (r) => r.match, cell: (r) => (r.match === "Pending" ? <StatusBadge status="Queued" /> : r.match === "Match" ? <StatusBadge status="Healthy" tone="ok" /> : <StatusBadge status="Blocked" tone="danger" />) },
  ];

  const canFinish = editable && unfinished === 0;

  return (
    <>
      <PageHeader
        title={count.id}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono">{count.location}</span>
            <StatusBadge status={count.status} />
            <span className="text-ink-3">by {count.assigned}</span>
          </span>
        }
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<ArrowLeft size={13} />} as={Link} to="/cycle-counts">
              All counts
            </Button>
            {editable && (
              <Button size="sm" isDisabled={!canFinish} colorScheme="accent" leftIcon={<ClipboardCheck size={13} />} onClick={() => toast({ title: `${count.id} finished`, description: `${rows.length} lines counted · ${mismatch} mismatch(es) queued for review.`, status: "success" })}>
                {canFinish ? "Finish count" : `Count ${unfinished} open line${unfinished === 1 ? "" : "s"}`}
              </Button>
            )}
            {count.status === "Pending Review" && (
              <Button size="sm" colorScheme="accent" leftIcon={<CheckCircle2 size={13} />} onClick={() => setApprove(true)}>
                Approve & post
              </Button>
            )}
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4">
        <Steps steps={stepLabels} current={stepOf(count.status)} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
            <DataTable
              columns={columns}
              data={rows}
              rowKey={(r) => r.sku}
              defaultSort={{ key: "sku", dir: "asc" }}
              emptyTitle="No lines for this count"
              emptyDescription="The count pool is empty — reschedule the window."
              footerNote={
                <span className="flex items-center gap-2">
                  <span className="tnum">
                    {fmt(systemTotal)} system · {editable ? fmt(countedTotal) : fmt(countedTotal)} counted
                  </span>
                  {!editable && mismatch > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-danger">
                      <OctagonAlert size={11} /> {mismatch} line{mismatch === 1 ? "" : "s"} need adjustment
                    </span>
                  )}
                </span>
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Assignment" subtitle="Counter & window">
            <div className="flex items-center gap-2.5">
              <OperatorCell name={count.assigned} />
              <span className="text-2xs text-ink-3">· {count.scheduled}</span>
            </div>
            <div className="mt-3 rounded-[6px] border border-line bg-surface-2 px-3 py-2 text-2xs text-ink-2">
              <span className="font-semibold text-ink">{count.zone}-zone priority.</span> Variance &gt; 3
              units auto-blocks completion and triggers a recount within 24h.
            </div>
          </Panel>

          <Panel title="Count details">
            <dl className="flex flex-col gap-2 text-2xs">
              {[
                ["SKUs in pool", `${rows.length}`],
                ["System total", `${fmt(systemTotal)} EA`],
                ["Counted total", `${editable ? fmt(countedTotal) : fmt(countedTotal)} EA`],
                ["Net variance", `${varianceTotal === 0 ? "0" : varianceTotal > 0 ? `+${fmt(varianceTotal)}` : fmt(varianceTotal)} EA`],
                ["Live accuracy", `${accuracy.toFixed(1)}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-2">
                  <dt className="text-ink-3">{k}</dt>
                  <dd className={`tnum font-semibold ${k === "Net variance" && varianceTotal !== 0 ? "text-warn" : "text-ink"}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      </div>

      <ConfirmationDialog
        open={approve}
        onClose={() => setApprove(false)}
        onConfirm={() => {
          toast({ title: `${count.id} approved`, description: `Variance ${varianceTotal === 0 ? "0" : varianceTotal > 0 ? `+${fmt(varianceTotal)}` : fmt(varianceTotal)} EA posted · backlog rebuilt.`, status: "success" });
          setApprove(false);
        }}
        title={`Approve ${count.id}?`}
        message="Posting will update bin balances and open adjustment tickets for the mismatched lines."
        details={<span className="tnum">{mismatch} mismatch{""} line{mismatch === 1 ? "" : "s"} · ₤{(Math.abs(varianceTotal) * 0.02).toFixed(0)} est. value</span>}
        confirmLabel="Approve & post"
        tone="primary"
      />
    </>
  );
}