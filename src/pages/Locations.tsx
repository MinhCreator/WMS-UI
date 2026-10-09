import { Button } from "@chakra-ui/react";
import { ArrowRight, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";
import { HBar } from "../components/ui/Charts";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { bins, zones, zoneSummary } from "../data/locations";

export default function Locations() {
  const toast = useAppToast();
  const totals = zoneSummary("A");
  const blocked = bins.filter((b) => b.status === "Blocked").length;
  const reserved = bins.filter((b) => b.status === "Reserved").length;
  const activeBins = bins.filter((b) => b.status === "Active");
  const utilization = Math.round((bins.reduce((s, b) => s + b.capacity, 0) / bins.length) * 100);

  const metrics: MetricDef[] = [
    { label: "Total bins", value: String(bins.length), delta: `${activeBins.length} active`, hint: "all zones" },
    { label: "Utilization", value: `${utilization}%`, delta: "1,220 used", hint: "of 1,632 bins" },
    { label: "Blocked", value: String(blocked), delta: "shelved", good: false, hint: "await inspection" },
    { label: "Reserved", value: String(reserved), delta: "allocated", hint: "planned waves" },
    { label: "Units stored", value: bins.reduce((s, b) => s + b.units, 0).toLocaleString(), delta: "+1.2%", dir: "up", good: true, hint: "all zones" },
    { label: "Zone A density", value: `${totals.utilization}%`, delta: "fast pick", hint: "79% target band" },
  ];

  return (
    <>
      <PageHeader
        title="Locations"
        subtitle={`${bins.length} bins across ${zones.length} zones — A fast pick to F shipping staging`}
        actions={
          <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<MapPinned size={13} />} onClick={() => toast({ title: "Zone map", description: "Interactive slotting map ships in a later milestone.", status: "info" })}>
            Zone map
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {zones.map((z) => {
          const s = zoneSummary(z.code);
          const zb = bins.filter((b) => b.zone === z.code);
          const zoneBlocked = zb.filter((b) => b.status === "Blocked").length;
          return (
            <Panel key={z.code} title={<span className="flex items-center gap-2"><span className="font-mono">{z.code}</span><span>{z.name.replace(`Zone ${z.code} — `, "")}</span></span>} subtitle={z.purpose}>
              <div className="flex items-center justify-between text-2xs text-ink-3">
                <span className="tnum">
                  {s.used.toLocaleString()} of {s.bins} bins used
                </span>
                <span className={`tnum font-semibold ${s.utilization >= 80 ? "text-danger" : s.utilization >= 65 ? "text-warn" : "text-ok"}`}>
                  {s.utilization}%
                </span>
              </div>
              <div className="mt-1.5">
                <HBar value={s.utilization} tone={s.utilization >= 80 ? "danger" : s.utilization >= 65 ? "warn" : "accent"} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-[6px] border border-line bg-surface-2 px-2 py-1.5">
                  <div className="tnum text-tn font-bold text-ink">{s.units.toLocaleString()}</div>
                  <div className="text-2xs text-ink-3">units</div>
                </div>
                <div className="rounded-[6px] border border-line bg-surface-2 px-2 py-1.5">
                  <div className="tnum text-tn font-bold text-ink">{z.aisles}</div>
                  <div className="text-2xs text-ink-3">aisles</div>
                </div>
                <div className="rounded-[6px] border border-line bg-surface-2 px-2 py-1.5">
                  <div className="tnum text-tn font-bold text-ink">{zoneBlocked}</div>
                  <div className="text-2xs text-ink-3">blocked</div>
                </div>
              </div>
              <Link to={`/locations/${z.code}`} className="mt-3 inline-flex items-center gap-1 text-2xs font-semibold text-accent hover:underline">
                Browse bins <ArrowRight size={11} />
              </Link>
            </Panel>
          );
        })}
      </div>

      <div className="mt-4 rounded-[6px] border border-line bg-surface px-3 py-2.5 text-2xs text-ink-3">
        <span className="font-semibold text-ink">Slotting note.</span> P10 SKUs get pick faces in Zone A
        aisles 1–3; anything hotter than 40 picks/day is flagged for face enlargement every Sunday
        during slotting.
        <StatusBadge status="Healthy" />
      </div>
    </>
  );
}