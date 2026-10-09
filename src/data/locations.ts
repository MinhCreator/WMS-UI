import type { Bin } from "../types";
import { mulberry32 } from "./meta";

export interface Zone {
  code: string;
  name: string;
  purpose: string;
  aisles: number;
  racks: number;
  binsPerRack: number;
  prefix: string;
}

export const zones: Zone[] = [
  { code: "A", name: "Zone A — Fast Pick", purpose: "High-velocity pick faces", aisles: 8, racks: 6, binsPerRack: 24, prefix: "A" },
  { code: "B", name: "Zone B — Bulk Storage", purpose: "Reserve pallet storage", aisles: 5, racks: 4, binsPerRack: 12, prefix: "B" },
  { code: "C", name: "Zone C — Hazardous", purpose: "Flammable & chemical", aisles: 3, racks: 3, binsPerRack: 8, prefix: "C" },
  { code: "D", name: "Zone D — Returns / QC", purpose: "Returns processing & quarantine", aisles: 2, racks: 2, binsPerRack: 6, prefix: "D" },
  { code: "E", name: "Zone E — Receiving Staging", purpose: "Inbound dock lanes", aisles: 6, racks: 2, binsPerRack: 6, prefix: "E" },
  { code: "F", name: "Zone F — Shipping Staging", purpose: "Outbound dock lanes", aisles: 6, racks: 2, binsPerRack: 6, prefix: "F" },
];

const pad = (n: number) => String(n).padStart(2, "0");

function buildBins(): Bin[] {
  const rng = mulberry32(90421);
  const bins: Bin[] = [];
  for (const zone of zones) {
    for (let a = 1; a <= zone.aisles; a++) {
      for (let r = 1; r <= zone.racks; r++) {
        for (let b = 1; b <= zone.binsPerRack; b++) {
          const roll = rng();
          const isStaging = zone.code === "E" || zone.code === "F";
          const utilization = isStaging
            ? Math.round(roll * 70)
            : roll < 0.14
              ? 0
              : Math.round(18 + roll * 78);
          const units = utilization === 0 ? 0 : Math.round((utilization / 100) * (zone.code === "B" ? 2400 : 640) + rng() * 40);
          const skus = utilization === 0 ? 0 : Math.max(1, Math.round(utilization / 14) + (rng() > 0.7 ? 2 : 0));
          const blocked = zone.code !== "E" && zone.code !== "F" && rng() > 0.985;
          const reserved = !blocked && zone.code !== "E" && zone.code !== "F" && rng() > 0.97;
          bins.push({
            code: `${zone.prefix}-${pad(a)}-${pad(r)}-${pad(b)}`,
            zone: zone.code,
            aisle: pad(a),
            rack: pad(r),
            bin: pad(b),
            capacity: utilization,
            units,
            skus,
            status: blocked ? "Blocked" : reserved ? "Reserved" : "Active",
          });
        }
      }
    }
  }
  return bins;
}

export const bins = buildBins();
export const binMap: Record<string, Bin> = Object.fromEntries(bins.map((b) => [b.code, b]));

export const aisleList = (zoneCode: string) =>
  Array.from(new Set(bins.filter((b) => b.zone === zoneCode).map((b) => b.aisle))).sort();

export function zoneSummary(zoneCode: string) {
  const zb = bins.filter((b) => b.zone === zoneCode);
  const active = zb.filter((b) => b.status === "Active");
  const used = zb.reduce((s, b) => s + b.capacity, 0);
  return {
    bins: zb.length,
    active: active.length,
    blocked: zb.filter((b) => b.status === "Blocked").length,
    used,
    units: zb.reduce((s, b) => s + b.units, 0),
    utilization: Math.round(used / zb.length),
  };
}
