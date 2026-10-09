import { Button } from "@chakra-ui/react";
import { ArrowLeft, MapPinned } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DataTable, type Column } from "../components/ui/DataTable";
import { HBar } from "../components/ui/Charts";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { aisleList, bins, zones, zoneSummary } from "../data/locations";
import type { Bin } from "../types";

export default function LocationsZone() {
  const { zone = "A" } = useParams();
  const toast = useAppToast();
  const z = zones.find((x) => x.code === zone);
  const s = zoneSummary(zone);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [aisle, setAisle] = useState("all");

  const aisles = useMemo(() => aisleList(zone), [zone]);
  const zb = useMemo(() => bins.filter((b) => b.zone === zone), [zone]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return zb.filter(
      (b) =>
        (status === "all" || b.status === status) &&
        (aisle === "all" || b.aisle === aisle) &&
        (!q || `${b.code} ${b.zone}${b.aisle}${b.rack}${b.bin}`.includes(q)),
    );
  }, [zb, status, aisle, search]);

  if (!z) {
    return (
      <div className="rounded-panel border border-line bg-surface p-10 text-center">
        <p className="font-semibold text-ink">Zone not found</p>
        <Link to="/locations" className="mt-2 inline-block text-2xs font-semibold text-accent hover:underline">
          Back to locations
        </Link>
      </div>
    );
  }

  const metrics: MetricDef[] = [
    { label: "Bins in zone", value: String(s.bins), delta: `${s.active} active`, hint: z.name },
    { label: "Utilization", value: `${s.utilization}%`, delta: `${s.used.toLocaleString()} used`, hint: "of capacity units" },
    { label: "Units stored", value: s.units.toLocaleString(), delta: "all aisles", hint: "across racks" },
    { label: "Blocked bins", value: String(s.blocked), delta: s.blocked ? "needs review" : "clear", good: s.blocked === 0, hint: "shelved" },
    { label: "Aisles", value: String(z.aisles), delta: `${z.aisles} × ${z.racks} racks`, hint: "grid layout" },
  ];

  const columns: Column<Bin>[] = [
    { key: "code", header: "Bin", mono: true, sortable: true, sortValue: (b) => b.code, cell: (b) => <span className="font-mono text-tn font-semibold text-ink">{b.code}</span> },
    { key: "aisle", header: "Aisle", mono: true, sortable: true, sortValue: (b) => b.aisle },
    { key: "rack", header: "Rack", mono: true, sortable: true, sortValue: (b) => b.rack },
    { key: "bin", header: "Level", mono: true, sortable: true, sortValue: (b) => b.bin },
    {
      key: "util",
      header: "Occupancy",
      width: "170px",
      cell: (b) => (
        <span className="block min-w-[130px]">
          <span className="mb-1 flex items-center justify-between text-2xs">
            <span className="tnum text-ink-3">{b.units.toLocaleString()} units · {b.skus} SKUs</span>
          </span>
          <HBar value={b.capacity} tone={b.capacity >= 90 ? "danger" : b.capacity >= 65 ? "warn" : "accent"} />
        </span>
      ),
      sortValue: (b) => b.capacity,
      sortable: true,
    },
    { key: "status", header: "Status", cell: (b) => <StatusBadge status={b.status} />, sortable: true, sortValue: (b) => b.status },
  ];

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono">{zone}</span>
            <span className="text-base font-normal text-ink-3">{z.name.replace(`Zone ${zone} — `, "")}</span>
          </span>
        }
        subtitle={`${z.purpose} · ${z.aisles} aisles × ${z.racks} racks × ${z.binsPerRack} levels`}
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<ArrowLeft size={13} />} as={Link} to="/locations">
              All zones
            </Button>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<MapPinned size={13} />} onClick={() => toast({ title: `Zone ${zone} map`, description: "Interactive slotting map ships in a later milestone.", status: "info" })}>
              Zone map
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
            <FilterBar
              activeCount={(status !== "all" ? 1 : 0) + (aisle !== "all" ? 1 : 0)}
              onClear={() => {
                setStatus("all");
                setAisle("all");
              }}
            >
              <SearchBox value={search} onChange={setSearch} placeholder={`Search bin in Zone ${zone}…`} ariaLabel="Search bins" />
              <FilterSelect
                label="Aisle"
                value={aisle}
                onChange={setAisle}
                options={[{ value: "all", label: "All aisles" }, ...aisles.map((a) => ({ value: a, label: `Aisle ${a}` }))]}
              />
              <FilterSelect
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "Active", label: "Active" },
                  { value: "Blocked", label: "Blocked" },
                  { value: "Reserved", label: "Reserved" },
                ]}
              />
            </FilterBar>

            <DataTable
              columns={columns}
              data={rows}
              rowKey={(b) => b.code}
              defaultSort={{ key: "code", dir: "asc" }}
              pageSize={50}
              emptyTitle="No bins match"
              emptyDescription="Narrow the search or clear the aisle filter."
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Zone snapshot">
            <div className="flex flex-col gap-2.5">
              {aisles.map((a) => {
                const ab = zb.filter((b) => b.aisle === a);
                const used = ab.reduce((sum, b) => sum + b.capacity, 0);
                const pct = Math.round((used / Math.max(1, ab.length)) * 100);
                const blockedAisle = ab.filter((b) => b.status === "Blocked").length;
                return (
                  <div key={a}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-tn font-medium text-ink">Aisle {a}</span>
                      <span className="tnum text-2xs text-ink-3">
                        {ab.length} bins{pct}%{blockedAisle ? ` · ${blockedAisle} blocked` : ""}
                      </span>
                    </div>
                    <HBar value={pct} tone={pct >= 90 ? "danger" : pct >= 65 ? "warn" : "accent"} />
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Policies" subtitle="Zone guardrails">
            <div className="flex flex-col gap-2 text-2xs text-ink-2">
              <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                <span className="font-semibold text-ink">Target fill:</span> 75–85%. Above 85% the
                slotting engine moves slow movers to Zone B.
              </div>
              <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                <span className="font-semibold text-ink">Reserve bins</span> hold at most 4 SKUs each;
                mixed bins auto-segregate on the next cycle.
              </div>
              <div className="rounded-[6px] border border-line bg-surface-2 px-3 py-2">
                <span className="font-semibold text-ink">Blocked bins</span> disable putaway and picking
                instantly; exceptions EXC-4181 covers {zone}-04 in demo data.
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}