import type {
  ActivityItem,
  Adjustment,
  AuditEntry,
  CycleCount,
  CountLine,
  ExceptionRow,
  NotificationItem,
  PutawayTask,
  Transfer,
} from "../types";
import { inventory, stockBySku } from "./inventory";
import { products } from "./products";

export const exceptions: ExceptionRow[] = [
  { id: "EXC-4192", type: "Stock discrepancy", reference: "SKU-30210", location: "A-02-01-09", description: "Cycle count variance of -46 EA against system quantity", priority: "High", assigned: "Ana Kowalski", age: "2h 14m", action: "Resolve" },
  { id: "EXC-4191", type: "Short pick", reference: "SO-88417", location: "A-05-03-21", description: "Picker reported 6 EA short against pick line 3", priority: "Critical", assigned: "Jenna Whitfield", age: "38m", action: "Reassign" },
  { id: "EXC-4189", type: "Damaged inventory", reference: "SKU-60308", location: "B-02-03-04", description: "12 bundles water-damaged after sprinkler test", priority: "High", assigned: "Derek Osei", age: "5h 02m", action: "Adjust" },
  { id: "EXC-4186", type: "Missing barcode", reference: "SKU-70401", location: "A-06-02-17", description: "Item label unreadable at pack station 03", priority: "Medium", assigned: "Owen Brady", age: "6h 41m", action: "Relabel" },
  { id: "EXC-4184", type: "Receiving discrepancy", reference: "RCV-20455", location: "Dock 03", description: "PO-10479 received 42 units below expected quantity", priority: "High", assigned: "Maria Chen", age: "1d 03h", action: "Investigate" },
  { id: "EXC-4181", type: "Blocked location", reference: "A-04-01-02", location: "A-04-01-02", description: "Bin blocked for rack damage inspection — facility ticket 8821", priority: "Medium", assigned: "Jenna Whitfield", age: "1d 08h", action: "View" },
  { id: "EXC-4179", type: "Stock discrepancy", reference: "SKU-50201", location: "C-01-02-05", description: "Drum count 2 EA over system after decanting", priority: "Medium", assigned: "Ana Kowalski", age: "1d 11h", action: "Resolve" },
  { id: "EXC-4176", type: "Short pick", reference: "SO-88409", location: "B-03-02-11", description: "Reserve stock unavailable — putaway overdue from RCV-20451", priority: "High", assigned: "Derek Osei", age: "2d 01h", action: "Reassign" },
  { id: "EXC-4172", type: "Damaged inventory", reference: "SKU-40102", location: "B-04-01-06", description: "Spool crushed in rack — 1 unit unusable", priority: "Low", assigned: "Tomás Alvarez", age: "2d 06h", action: "Adjust" },
  { id: "EXC-4168", type: "Receiving discrepancy", reference: "RCV-20448", location: "Dock 05", description: "Lot number mismatch on 3 cartons of SKU-20133", priority: "Medium", assigned: "Maria Chen", age: "3d 02h", action: "Investigate" },
];

export const activity: ActivityItem[] = [
  { time: "14:42", operator: "Maria Chen", role: "Receiving Lead", text: "PO #10482 received at Dock 04 — 1,198 of 1,240 units", kind: "receive" },
  { time: "14:36", operator: "Tomás Alvarez", role: "Forklift Operator", text: "42 items put away to Zone B", kind: "putaway" },
  { time: "14:20", operator: "Jenna Whitfield", role: "Shift Supervisor", text: "Wave #W-203 released — 18 orders, 246 items", kind: "wave" },
  { time: "14:12", operator: "Derek Osei", role: "Picker", text: "Order #SO-88421 picked — 6 of 8 lines complete", kind: "pick" },
  { time: "13:58", operator: "Ana Kowalski", role: "Cycle Count Specialist", text: "Cycle count CC-0487 completed at A-02 — accuracy 99.4%", kind: "count" },
  { time: "13:41", operator: "Priya Raman", role: "Inventory Manager", text: "Inventory adjustment ADJ-3319 approved — shrinkage 12 EA", kind: "adjust" },
  { time: "13:22", operator: "Raj Patel", role: "Shipping Clerk", text: "Shipment SHP-20871 manifested — 6 packages, UPS Freight", kind: "ship" },
  { time: "13:05", operator: "Owen Brady", role: "Packer", text: "Order #SO-88414 packed — 2 packages, label printed", kind: "pack" },
  { time: "12:47", operator: "Maria Chen", role: "Receiving Lead", text: "Receipt RCV-20458 started at Dock 02 — PO #10477", kind: "receive" },
  { time: "12:31", operator: "Derek Osei", role: "Picker", text: "Wave #W-202 completed — 14 orders, 0 short picks", kind: "wave" },
  { time: "12:10", operator: "Jenna Whitfield", role: "Shift Supervisor", text: "Exception EXC-4191 assigned to evening shift", kind: "pick" },
  { time: "11:52", operator: "Tomás Alvarez", role: "Forklift Operator", text: "Transfer TRF-0219 received from Warehouse B", kind: "putaway" },
  { time: "11:30", operator: "Ana Kowalski", role: "Cycle Count Specialist", text: "Cycle count CC-0486 started — Zone A, aisle 03", kind: "count" },
  { time: "11:04", operator: "Priya Raman", role: "Inventory Manager", text: "Reorder alert cleared for 8 SKUs after PO-10480 submission", kind: "adjust" },
];

export const adjustments: Adjustment[] = [
  { id: "ADJ-3324", sku: "SKU-60308", product: "Corrugated Box 18×12×12 — Bundle/25", location: "B-02-03-04", type: "Damage", qty: -12, reason: "Damage", notes: "Water damage from sprinkler test — photos attached", user: "Derek Osei", timestamp: "Today 13:44", status: "Pending Approval" },
  { id: "ADJ-3323", sku: "SKU-30210", product: "Hex Bolt M8 × 40 Zinc — Box/250", location: "A-02-01-09", type: "Count Correction", qty: -46, reason: "Count Correction", notes: "Third blind count confirmed variance", user: "Ana Kowalski", timestamp: "Today 11:26", status: "Pending Approval" },
  { id: "ADJ-3321", sku: "SKU-50201", product: "Hydraulic Oil ISO 46 — 55 Gal Drum", location: "C-01-02-05", type: "Found Stock", qty: 2, reason: "Found Stock", notes: "Drums located in overflow bay during sweep", user: "Tomás Alvarez", timestamp: "Today 09:52", status: "Approved" },
  { id: "ADJ-3319", sku: "SKU-20115", product: "Safety Glasses — Clear Anti-Fog", location: "A-01-04-22", type: "Shrinkage", qty: -12, reason: "Shrinkage", notes: "Unaccounted loss after dock audit", user: "Priya Raman", timestamp: "Yesterday 16:18", status: "Approved" },
  { id: "ADJ-3316", sku: "SKU-50212", product: "Industrial Degreaser — 5 Gal Pail", location: "C-02-01-03", type: "Expired", qty: -6, reason: "Expired", notes: "Shelf life exceeded — scheduled disposal", user: "Ana Kowalski", timestamp: "Yesterday 10:03", status: "Approved" },
  { id: "ADJ-3314", sku: "SKU-40102", product: "THHN Wire 12 AWG Black — 500 ft", location: "B-04-01-06", type: "Damage", qty: -1, reason: "Damage", notes: "Spool crushed during rack impact", user: "Tomás Alvarez", timestamp: "Oct 6, 14:37", status: "Approved" },
  { id: "ADJ-3311", sku: "SKU-80501", product: "Bearing 6205-2RS Sealed", location: "A-07-03-11", type: "System Error", qty: 40, reason: "System Error", notes: "Double receipt posted against RCV-20441", user: "Priya Raman", timestamp: "Oct 6, 09:14", status: "Rejected" },
  { id: "ADJ-3308", sku: "SKU-90607", product: "Electrode E6011 — 5 lb Pack", location: "B-05-02-07", type: "Other", qty: -3, reason: "Other", notes: "Packaging opened for sample — remainder returned", user: "Owen Brady", timestamp: "Oct 5, 15:51", status: "Approved" },
];

export const adjustmentAudit: AuditEntry[] = [
  { time: "Today 13:44", user: "Derek Osei", action: "Adjustment created", detail: "ADJ-3324 · -12 EA · Damage" },
  { time: "Today 13:45", user: "System", action: "Validation passed", detail: "Quantity within operator tolerance (±50 EA)" },
  { time: "Today 13:46", user: "System", action: "Approval routed", detail: "Routed to Inventory Manager (>$100 value)" },
  { time: "Yesterday 16:20", user: "Priya Raman", action: "Adjustment approved", detail: "ADJ-3319 · posted to inventory ledger" },
  { time: "Yesterday 16:18", user: "Derek Osei", action: "Attachment added", detail: "damage-a01-04-22.jpg (248 KB)" },
  { time: "Oct 6, 09:20", user: "Priya Raman", action: "Adjustment rejected", detail: "ADJ-3311 · duplicate of RMA-1189" },
];

export const cycleCounts: CycleCount[] = [
  { id: "CC-0491", location: "A-03 (all bins)", zone: "A", skuCount: 46, assigned: "Ana Kowalski", scheduled: "Today 15:00", variance: 0, accuracy: 100, status: "Scheduled" },
  { id: "CC-0490", location: "B-02-03-01 … 12", zone: "B", skuCount: 18, assigned: "Derek Osei", scheduled: "Today 13:00", variance: 0, accuracy: 100, status: "In Progress" },
  { id: "CC-0489", location: "C-01 (all bins)", zone: "C", skuCount: 11, assigned: "Ana Kowalski", scheduled: "Today 09:00", variance: -2, accuracy: 97.4, status: "Pending Review" },
  { id: "CC-0487", location: "A-02 (all bins)", zone: "A", skuCount: 52, assigned: "Ana Kowalski", scheduled: "Yesterday 14:00", variance: -46, accuracy: 99.4, status: "Pending Review" },
  { id: "CC-0486", location: "A-01-04-01 … 24", zone: "A", skuCount: 34, assigned: "Ana Kowalski", scheduled: "Yesterday 10:00", variance: -12, accuracy: 98.8, status: "Completed" },
  { id: "CC-0484", location: "B-04 (all bins)", zone: "B", skuCount: 22, assigned: "Marcus Webb", scheduled: "Oct 6, 11:00", variance: -1, accuracy: 99.6, status: "Completed" },
  { id: "CC-0482", location: "D-01 (all bins)", zone: "D", skuCount: 9, assigned: "Derek Osei", scheduled: "Oct 5, 15:30", variance: 0, accuracy: 100, status: "Completed" },
  { id: "CC-0479", location: "A-05-03-01 … 24", zone: "A", skuCount: 41, assigned: "Ana Kowalski", scheduled: "Oct 4, 09:00", variance: 4, accuracy: 99.1, status: "Completed" },
];

export function countLinesFor(countId: string): CountLine[] {
  const count = cycleCounts.find((c) => c.id === countId);
  if (!count) return [];
  const zoneBins = new Set(
    inventory.filter((r) => r.location.startsWith(count.location.slice(0, 4))).map((r) => r.sku),
  );
  const pool = inventory.filter((r) => zoneBins.has(r.sku));
  const source = pool.length >= 6 ? pool : inventory;
  const start = (countId.charCodeAt(6) * 7) % Math.max(1, source.length - 8);
  const slice = source.slice(start, start + 8);
  return slice.map((r, i) => {
    const varianceHit = i === 2 && count.variance !== 0;
    const counted = varianceHit ? r.onHand + (count.variance > 0 ? 1 : Math.max(count.variance, -3)) : r.onHand;
    return {
      sku: r.sku,
      product: r.product,
      system: r.onHand,
      counted: count.status === "Scheduled" || count.status === "In Progress" ? null : counted,
      unit: products.find((p) => p.sku === r.sku)?.unit ?? "EA",
    };
  });
}

export const transfers: Transfer[] = [
  { id: "TRF-0224", from: "Warehouse A — Columbus", to: "Warehouse B — Reno", lines: 6, units: 420, requestedBy: "Priya Raman", requested: "Today 08:15", status: "Draft" },
  { id: "TRF-0223", from: "Warehouse C — Allentown", to: "Warehouse A — Columbus", lines: 3, units: 96, requestedBy: "Jenna Whitfield", requested: "Yesterday 14:40", status: "In Transit" },
  { id: "TRF-0221", from: "Warehouse A — Columbus", to: "Warehouse C — Allentown", lines: 11, units: 1284, requestedBy: "Marcus Webb", requested: "Yesterday 09:22", status: "In Transit" },
  { id: "TRF-0219", from: "Warehouse B — Reno", to: "Warehouse A — Columbus", lines: 4, units: 260, requestedBy: "Linda Nakamura", requested: "Oct 6, 10:05", status: "Received" },
  { id: "TRF-0217", from: "Warehouse A — Columbus", to: "Warehouse B — Reno", lines: 2, units: 48, requestedBy: "Priya Raman", requested: "Oct 5, 16:31", status: "Received" },
  { id: "TRF-0214", from: "Warehouse C — Allentown", to: "Warehouse B — Reno", lines: 8, units: 640, requestedBy: "Marcus Webb", requested: "Oct 4, 11:47", status: "Cancelled" },
];

export const putawayTasks: PutawayTask[] = [
  { id: "PA-7712", receipt: "RCV-20458", sku: "SKU-60301", product: "Stretch Film 20 × 1500 — Case/4", qty: 64, from: "E-01-01-02", to: "B-01-02-09", priority: "Standard", assignee: "Tomás Alvarez", status: "In Progress" },
  { id: "PA-7711", receipt: "RCV-20458", sku: "SKU-60322", product: "Packing Tape 2 in Clear — Case/36", qty: 36, from: "E-01-01-03", to: "B-01-02-10", priority: "Standard", assignee: "Tomás Alvarez", status: "Queued" },
  { id: "PA-7710", receipt: "RCV-20455", sku: "SKU-10482", product: "Industrial Safety Gloves — Large", qty: 240, from: "E-02-01-04", to: "A-03-02-14", priority: "Expedite", assignee: "Derek Osei", status: "In Progress" },
  { id: "PA-7709", receipt: "RCV-20455", sku: "SKU-20115", product: "Safety Glasses — Clear Anti-Fog", qty: 480, from: "E-02-01-05", to: "A-01-04-22", priority: "Expedite", assignee: "Derek Osei", status: "Queued" },
  { id: "PA-7708", receipt: "RCV-20452", sku: "SKU-30210", product: "Hex Bolt M8 × 40 Zinc — Box/250", qty: 40, from: "E-03-01-01", to: "A-02-01-09", priority: "Standard", assignee: "Tomás Alvarez", status: "Completed" },
  { id: "PA-7707", receipt: "RCV-20452", sku: "SKU-40110", product: "Circuit Breaker 20A Single-Pole", qty: 96, from: "E-03-01-02", to: "A-06-02-03", priority: "Critical", assignee: "Marcus Webb", status: "Completed" },
  { id: "PA-7705", receipt: "RCV-20449", sku: "SKU-50201", product: "Hydraulic Oil ISO 46 — 55 Gal Drum", qty: 8, from: "E-04-01-01", to: "C-01-02-05", priority: "Standard", assignee: "Tomás Alvarez", status: "Queued" },
  { id: "PA-7703", receipt: "RCV-20447", sku: "SKU-80533", product: "Shelf Bracket Heavy Duty — Pair", qty: 120, from: "E-05-01-02", to: "B-03-04-11", priority: "Standard", assignee: "Derek Osei", status: "Completed" },
];

export const notifications: NotificationItem[] = [
  { id: "N-1", title: "Short pick on SO-88417", detail: "Picker reported 6 EA short at A-05-03-21 — action required", time: "38m", tone: "danger", read: false },
  { id: "N-2", title: "Receipt variance on RCV-20455", detail: "PO-10479 came in 42 units short — supplier claim suggested", time: "1h", tone: "warn", read: false },
  { id: "N-3", title: "Wave W-203 released", detail: "18 orders and 246 items queued for Zone A pickers", time: "2h", tone: "info", read: false },
  { id: "N-4", title: "Adjustment ADJ-3319 approved", detail: "12 EA shrinkage posted against SKU-20115", time: "3h", tone: "ok", read: true },
  { id: "N-5", title: "Cycle count scheduled", detail: "CC-0491 assigned to you — Zone A aisle 03 at 15:00", time: "5h", tone: "neutral", read: true },
];

export const lowStockSkus = inventory.filter(
  (r) => r.status === "Low" || r.status === "Critical" || r.status === "Out",
);

export function recentStockFor(sku: string) {
  const row = inventory.find((r) => r.sku === sku);
  return row ? stockBySku[sku] ?? [] : [];
}
