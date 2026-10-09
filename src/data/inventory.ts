import type { InventoryRow, StockByLocation } from "../types";
import { mulberry32 } from "./meta";
import { bins } from "./locations";
import { products } from "./products";

const updatedStamps = [
  "Today 14:12", "Today 13:47", "Today 12:05", "Today 11:38", "Today 10:52",
  "Today 09:31", "Today 08:46", "Yesterday 17:20", "Yesterday 15:04", "Yesterday 11:19",
  "Oct 6, 16:41", "Oct 6, 09:58", "Oct 5, 14:22", "Oct 5, 08:15",
];

function statusFor(onHand: number, reorder: number, safety: number): InventoryRow["status"] {
  if (onHand === 0) return "Out";
  if (onHand < safety) return "Critical";
  if (onHand < reorder) return "Low";
  return "Healthy";
}

const activeBins = bins.filter((b) => b.zone === "A" || b.zone === "B");
const rng = mulberry32(104821);

function pickBin(i: number) {
  return activeBins[(i * 37 + 11) % activeBins.length].code;
}

/** Hand-set featured product so headline figures match the operational brief. */
const featuredSplits: Record<string, { location: string; onHand: number; reserved: number }[]> = {
  "SKU-10482": [
    { location: "A-03-02-14", onHand: 640, reserved: 80 },
    { location: "A-03-02-15", onHand: 412, reserved: 62 },
    { location: "B-01-04-08", onHand: 232, reserved: 36 },
  ],
};

const splitsBySku: Record<string, StockByLocation[]> = {};
const rows: InventoryRow[] = [];

products.forEach((p, i) => {
  const reorder = p.reorderPoint;
  const safety = p.safetyStock;
  const base = Math.round(reorder * (0.55 + rng() * 2.6) + safety * 0.4);
  let onHand = base;

  // A handful of realistic problem rows
  if (i === 6) onHand = Math.round(safety * 0.42); // Hi-Vis XL — critical
  if (i === 17) onHand = 0; // junction boxes — out
  if (i === 30) onHand = Math.round(reorder * 0.7); // pallets — low
  if (i === 40) onHand = Math.round(reorder * 3.4); // bearings — overstocked but still healthy

  const reserved = Math.min(onHand, Math.round(onHand * (0.04 + rng() * 0.18)));
  const incoming = rng() > 0.55 ? Math.round(reorder * (0.5 + rng() * 1.5)) : 0;
  const status = statusFor(onHand, reorder, safety);

  let splits = featuredSplits[p.sku];
  if (!splits) {
    const pattern = onHand === 0 ? [] : i % 3 === 0 ? [0.58, 0.42] : i % 3 === 1 ? [1] : [0.5, 0.3, 0.2];
    let remaining = onHand;
    let remainingRes = reserved;
    splits = pattern.map((frac, idx) => {
      const locOnHand = idx === pattern.length - 1 ? remaining : Math.round(onHand * frac);
      const locRes =
        idx === pattern.length - 1 ? remainingRes : Math.round(reserved * frac);
      remaining -= locOnHand;
      remainingRes -= locRes;
      const loc = pickBin(i + idx);
      return { sku: p.sku, location: loc, onHand: locOnHand, reserved: locRes, available: locOnHand - locRes, status: statusFor(locOnHand, reorder, safety) };
    });
    if (onHand === 0) splits = [];
  }

  const splitsNonEmpty: StockByLocation[] = splits.map((s) => ({
    sku: p.sku,
    location: s.location,
    onHand: s.onHand,
    reserved: s.reserved,
    available: s.onHand - s.reserved,
    status: statusFor(s.onHand, reorder, safety),
  }));
  splitsBySku[p.sku] = splitsNonEmpty;

  rows.push({
    sku: p.sku,
    product: p.name,
    category: p.category,
    supplier: p.supplier,
    location: splitsNonEmpty[0]?.location ?? "—",
    extraLocations: Math.max(0, splitsNonEmpty.length - 1),
    onHand,
    available: onHand - reserved,
    reserved,
    incoming,
    reorderPoint: reorder,
    status,
    updated: updatedStamps[i % updatedStamps.length],
  });
});

export const inventory: InventoryRow[] = rows;
export const stockBySku = splitsBySku;

export function inventorySummary() {
  const low = rows.filter((r) => r.status === "Low" || r.status === "Critical" || r.status === "Out");
  return {
    skus: rows.length,
    totalUnits: rows.reduce((s, r) => s + r.onHand, 0),
    reserved: rows.reduce((s, r) => s + r.reserved, 0),
    incoming: rows.reduce((s, r) => s + r.incoming, 0),
    lowStock: low.length,
    value: rows.reduce((s, r) => s + r.onHand * (products.find((p) => p.sku === r.sku)?.unitCost ?? 0), 0),
  };
}
