import type {
  PickLine,
  PickWave,
  PurchaseOrder,
  PoLine,
  Receipt,
  ReceiptLine,
  ReadyOrder,
  SalesOrder,
  Shipment,
} from "../types";
import { productMap } from "./products";

/* ---------------------------------- POs ---------------------------------- */

export const poLines: Record<string, PoLine[]> = {
  "PO-10482": [
    { sku: "SKU-10482", product: "Industrial Safety Gloves — Large", qty: 500, received: 500, unitCost: 4.85 },
    { sku: "SKU-10483", product: "Industrial Safety Gloves — Medium", qty: 300, received: 300, unitCost: 4.85 },
    { sku: "SKU-20115", product: "Safety Glasses — Clear Anti-Fog", qty: 240, received: 240, unitCost: 2.4 },
    { sku: "SKU-20140", product: "Hi-Vis Vest — Class 2, XL", qty: 100, received: 100, unitCost: 8.75 },
    { sku: "SKU-20155", product: "Hard Hat — Vented, White", qty: 100, received: 58, unitCost: 11.4 },
  ],
  "PO-10479": [
    { sku: "SKU-30210", product: "Hex Bolt M8 × 40 Zinc — Box/250", qty: 400, received: 380, unitCost: 38.5 },
    { sku: "SKU-30214", product: "Flange Nut M8 Zinc — Box/500", qty: 300, received: 300, unitCost: 27.0 },
    { sku: "SKU-30230", product: "Flat Washer M8 Stainless — Box/500", qty: 260, received: 260, unitCost: 31.2 },
    { sku: "SKU-30222", product: "Self-Tapping Screw 6 × 1-1/4 — Box/500", qty: 320, received: 300, unitCost: 19.75 },
  ],
  "PO-10477": [
    { sku: "SKU-60301", product: "Stretch Film 20 × 1500 — Case/4", qty: 240, received: 0, unitCost: 42.6 },
    { sku: "SKU-60322", product: "Packing Tape 2 in Clear — Case/36", qty: 180, received: 0, unitCost: 48.75 },
    { sku: "SKU-60315", product: "Poly Mailer 10×13 — Case/500", qty: 120, received: 0, unitCost: 36.4 },
  ],
  "PO-10474": [
    { sku: "SKU-50201", product: "Hydraulic Oil ISO 46 — 55 Gal Drum", qty: 24, received: 16, unitCost: 318.0 },
    { sku: "SKU-50212", product: "Industrial Degreaser — 5 Gal Pail", qty: 60, received: 60, unitCost: 58.9 },
    { sku: "SKU-50207", product: "Gear Lube SAE 80W-90 — 1 Gal", qty: 96, received: 96, unitCost: 21.75 },
  ],
  "PO-10471": [
    { sku: "SKU-40110", product: "Circuit Breaker 20A Single-Pole", qty: 240, received: 240, unitCost: 9.8 },
    { sku: "SKU-40125", product: "Junction Box 4 × 4 × 2 in NEMA 1", qty: 180, received: 180, unitCost: 6.4 },
    { sku: "SKU-40118", product: 'Conduit Coupling 3/4" PVC', qty: 500, received: 500, unitCost: 1.15 },
  ],
  "PO-10468": [
    { sku: "SKU-80501", product: "Bearing 6205-2RS Sealed", qty: 600, received: 600, unitCost: 5.6 },
    { sku: "SKU-80509", product: "V-Belt B-54 Wrapped", qty: 200, received: 200, unitCost: 9.85 },
    { sku: "SKU-80517", product: 'Conveyor Roller 2.5 × 24 in', qty: 80, received: 80, unitCost: 41.0 },
  ],
  "PO-10465": [
    { sku: "SKU-70401", product: "Cordless Impact Driver 20V", qty: 60, received: 0, unitCost: 119.0 },
    { sku: "SKU-70425", product: "Socket Set Metric — 40 pc", qty: 90, received: 0, unitCost: 68.0 },
    { sku: "SKU-70433", product: "Tape Measure 25 ft Magnetic", qty: 240, received: 0, unitCost: 12.4 },
  ],
  "PO-10462": [
    { sku: "SKU-90601", product: "MIG Wire .030 in — 33 lb Spool", qty: 120, received: 120, unitCost: 61.0 },
    { sku: "SKU-90607", product: "Electrode E6011 — 5 lb Pack", qty: 150, received: 150, unitCost: 34.75 },
  ],
  "PO-10459": [
    { sku: "SKU-60308", product: "Corrugated Box 18×12×12 — Bundle/25", qty: 400, received: 400, unitCost: 31.9 },
    { sku: "SKU-60330", product: "Pallet 48×40 GMA Grade A", qty: 300, received: 300, unitCost: 16.5 },
  ],
  "PO-10455": [
    { sku: "SKU-20133", product: "N95 Respirator — Box of 20", qty: 200, received: 200, unitCost: 22.5 },
    { sku: "SKU-20160", product: "Steel-Toe Boots — Size 10", qty: 60, received: 60, unitCost: 64.0 },
  ],
};

function poTotal(lines: PoLine[]) {
  return lines.reduce((s, l) => s + l.qty * l.unitCost, 0);
}
function poReceived(lines: PoLine[]) {
  return lines.reduce((s, l) => s + l.received, 0);
}
function poQty(lines: PoLine[]) {
  return lines.reduce((s, l) => s + l.qty, 0);
}

type PoSeed = [string, string, string, string, PurchaseOrder["status"], string, string];

const poSeeds: PoSeed[] = [
  ["PO-10482", "Vanguard Safety Products", "Oct 2, 2026", "Today", "Partially Received", "Linda Nakamura", "CMH-01"],
  ["PO-10479", "DeltaFast Fasteners", "Sep 30, 2026", "Oct 6, 2026", "Partially Received", "Linda Nakamura", "CMH-01"],
  ["PO-10477", "PacWrap Materials", "Oct 1, 2026", "Today", "Submitted", "Marcus Webb", "CMH-01"],
  ["PO-10474", "Cascade Fluid Systems", "Sep 26, 2026", "Oct 7, 2026", "Partially Received", "Linda Nakamura", "CMH-01"],
  ["PO-10471", "Helix Electrical Supply", "Sep 24, 2026", "Oct 3, 2026", "Received", "Marcus Webb", "CMH-01"],
  ["PO-10468", "Global Industrial Parts", "Sep 22, 2026", "Oct 1, 2026", "Received", "Linda Nakamura", "CMH-01"],
  ["PO-10465", "Ironclad Tool Works", "Oct 3, 2026", "Oct 14, 2026", "Submitted", "Marcus Webb", "CMH-01"],
  ["PO-10462", "BlueRock Steel Co.", "Sep 18, 2026", "Sep 30, 2026", "Closed", "Linda Nakamura", "CMH-01"],
  ["PO-10459", "PacWrap Materials", "Sep 15, 2026", "Sep 26, 2026", "Closed", "Marcus Webb", "CMH-01"],
  ["PO-10455", "Vanguard Safety Products", "Sep 12, 2026", "Sep 24, 2026", "Closed", "Linda Nakamura", "CMH-01"],
  ["PO-10453", "BlueRock Steel Co.", "Oct 5, 2026", "Oct 20, 2026", "Draft", "Marcus Webb", "CMH-01"],
  ["PO-10451", "Ironclad Tool Works", "Sep 8, 2026", "Sep 19, 2026", "Cancelled", "Linda Nakamura", "CMH-01"],
];

export const purchaseOrders: PurchaseOrder[] = poSeeds.map(
  ([id, supplier, orderDate, expected, status, buyer, warehouse]) => {
    const lines = poLines[id] ?? [];
    return {
      id,
      supplier,
      orderDate,
      expected,
      lines: lines.length,
      totalQty: poQty(lines),
      receivedQty: poReceived(lines),
      status,
      buyer,
      warehouse,
      shipTo: "Warehouse A — Columbus, Dock 01–06",
      total: poTotal(lines),
    };
  },
);

/* -------------------------------- Receipts ------------------------------- */

type RcSeed = [string, string, string, string, number, number, string, Receipt["status"], string];

const receiptSeeds: RcSeed[] = [
  ["RCV-20458", "PO-10477", "PacWrap Materials", "Today", 540, 178, "Dock 02", "In Progress", "Maria Chen"],
  ["RCV-20455", "PO-10479", "DeltaFast Fasteners", "Today", 1240, 1198, "Dock 04", "Exception", "Maria Chen"],
  ["RCV-20454", "PO-10482", "Vanguard Safety Products", "Today", 1240, 1198, "Dock 04", "Completed", "Maria Chen"],
  ["RCV-20452", "PO-10471", "Helix Electrical Supply", "Today", 920, 920, "Dock 01", "Completed", "Marcus Webb"],
  ["RCV-20451", "PO-10474", "Cascade Fluid Systems", "Tomorrow", 180, 0, "Dock 03", "Expected", "Unassigned"],
  ["RCV-20449", "PO-10482", "Vanguard Safety Products", "Tomorrow", 440, 0, "Dock 05", "Expected", "Maria Chen"],
  ["RCV-20448", "PO-10468", "Global Industrial Parts", "Oct 6, 2026", 880, 874, "Dock 02", "Exception", "Marcus Webb"],
  ["RCV-20447", "PO-10465", "Ironclad Tool Works", "Oct 8, 2026", 390, 0, "Dock 06", "Expected", "Unassigned"],
  ["RCV-20445", "PO-10462", "BlueRock Steel Co.", "Oct 3, 2026", 270, 270, "Dock 04", "Completed", "Maria Chen"],
  ["RCV-20443", "PO-10459", "PacWrap Materials", "Oct 2, 2026", 700, 700, "Dock 01", "Completed", "Marcus Webb"],
  ["RCV-20441", "PO-10455", "Vanguard Safety Products", "Oct 1, 2026", 260, 260, "Dock 03", "Completed", "Maria Chen"],
  ["RCV-20439", "PO-10471", "Helix Electrical Supply", "Sep 30, 2026", 120, 120, "Dock 02", "Completed", "Marcus Webb"],
];

export const receipts: Receipt[] = receiptSeeds.map(
  ([id, po, supplier, expectedDate, items, received, dock, status, assigned]) => ({
    id,
    po,
    supplier,
    expectedDate,
    items,
    received,
    variance: received - items,
    dock,
    status,
    assigned,
  }),
);

export function receiptLinesFor(receiptId: string): ReceiptLine[] {
  const r = receipts.find((x) => x.id === receiptId);
  if (!r) return [];
  const lines = poLines[r.po] ?? [];
  const totalQty = poQty(lines) || 1;
  return lines.map((l, i) => {
    const expected = Math.round((l.qty * r.items) / totalQty);
    let received = 0;
    if (r.status === "Completed") received = expected;
    else if (r.status !== "Expected")
      received = Math.round(expected * (r.received / Math.max(1, r.items)));
    const damaged = r.status === "Exception" && i === 1 ? 4 : 0;
    return {
      sku: l.sku,
      product: l.product,
      expected,
      received,
      damaged,
      variance: received - expected,
      lot: `L-${l.sku.slice(4, 9)}-${(i % 3) + 11}A`,
      expiry: ["Jun 2028", "Mar 2029", "Dec 2027", "Aug 2028", "Feb 2030"][i % 5],
    };
  });
}

/* ------------------------------ Sales orders ----------------------------- */

type SoSeed = [string, string, string, string, number, number, string, SalesOrder["priority"], SalesOrder["status"], string, string];

const soSeeds: SoSeed[] = [
  ["SO-88421", "Northstar Industrial Supply", "Today 08:12", "Today 17:00", 8, 64, "EDI", "Expedite", "Picking", "Derek Osei", "Milwaukee, WI"],
  ["SO-88420", "Acme Manufacturing", "Today 07:58", "Today 17:00", 4, 22, "EDI", "Standard", "Packing", "Owen Brady", "Dayton, OH"],
  ["SO-88419", "Keystone Mining Corp", "Today 07:44", "Tomorrow 12:00", 11, 186, "Portal", "Standard", "Released", "Unassigned", "Harrisburg, PA"],
  ["SO-88417", "Riverbend Automotive", "Today 07:31", "Today 15:30", 5, 38, "EDI", "Critical", "Exception", "Jenna Whitfield", "Louisville, KY"],
  ["SO-88414", "Harborline Fabrication", "Yesterday 16:22", "Today 16:00", 6, 54, "Portal", "Expedite", "Ready to Ship", "Raj Patel", "Tacoma, WA"],
  ["SO-88412", "Northstar Industrial Supply", "Yesterday 15:47", "Today 14:00", 3, 18, "EDI", "Standard", "Shipped", "Raj Patel", "Milwaukee, WI"],
  ["SO-88409", "Acme Manufacturing", "Yesterday 14:10", "Today 12:00", 9, 142, "EDI", "Expedite", "Exception", "Derek Osei", "Dayton, OH"],
  ["SO-88406", "Summit Facility Group", "Yesterday 11:35", "Oct 8, 2026", 2, 8, "Email", "Standard", "On Hold", "Unassigned", "Denver, CO"],
  ["SO-88404", "Keystone Mining Corp", "Yesterday 10:19", "Oct 7, 2026", 7, 96, "Portal", "Standard", "Picking", "Derek Osei", "Harrisburg, PA"],
  ["SO-88401", "Riverbend Automotive", "Oct 6, 16:05", "Oct 7, 2026", 5, 44, "EDI", "Standard", "Picking", "Ana Kowalski", "Louisville, KY"],
  ["SO-88398", "Harborline Fabrication", "Oct 6, 14:41", "Oct 7, 2026", 12, 210, "Portal", "Standard", "Released", "Unassigned", "Tacoma, WA"],
  ["SO-88395", "Northstar Industrial Supply", "Oct 6, 09:12", "Oct 6, 17:00", 4, 30, "EDI", "Expedite", "Shipped", "Raj Patel", "Milwaukee, WI"],
  ["SO-88392", "Acme Manufacturing", "Oct 5, 15:28", "Oct 6, 17:00", 6, 72, "EDI", "Standard", "Shipped", "Owen Brady", "Dayton, OH"],
  ["SO-88390", "Summit Facility Group", "Oct 5, 13:02", "Oct 8, 2026", 3, 25, "Email", "Standard", "Received", "Unassigned", "Denver, CO"],
  ["SO-88387", "Keystone Mining Corp", "Oct 5, 08:47", "Oct 6, 12:00", 8, 118, "Portal", "Critical", "Shipped", "Raj Patel", "Harrisburg, PA"],
  ["SO-88384", "Harborline Fabrication", "Oct 4, 16:33", "Oct 6, 17:00", 5, 61, "Portal", "Standard", "Shipped", "Owen Brady", "Tacoma, WA"],
];

export const salesOrders: SalesOrder[] = soSeeds.map(
  ([id, customer, orderDate, promiseDate, lines, items, channel, priority, status, assignee, destination]) => ({
    id,
    customer,
    orderDate,
    promiseDate,
    lines,
    items,
    channel,
    warehouse: "Warehouse A — Columbus",
    destination,
    priority,
    status,
    assignee,
  }),
);

/* ------------------------------- Shipments ------------------------------- */

type ShSeed = [string, string, string, string, string, number, string, string, string, Shipment["status"]];

const shipmentSeeds: ShSeed[] = [
  ["SHP-20874", "SO-88421", "Northstar Industrial Supply", "UPS Freight", "LTL Standard", 3, "148.6 lb", "Today", "1Z999VA101588421001", "Ready"],
  ["SHP-20873", "SO-88420", "Acme Manufacturing", "FedEx Express", "Priority Overnight", 1, "22.4 lb", "Today", "7712 4498 3106", "Label Created"],
  ["SHP-20871", "SO-88414", "Harborline Fabrication", "UPS Freight", "LTL Standard", 6, "312.8 lb", "Today", "1Z999VA101588414006", "Manifested"],
  ["SHP-20869", "SO-88412", "Northstar Industrial Supply", "UPS Ground", "Ground", 1, "8.2 lb", "Today", "1Z999VA101588412001", "Shipped"],
  ["SHP-20867", "SO-88409", "Acme Manufacturing", "XPO Logistics", "LTL Guaranteed", 4, "204.0 lb", "Today", "XPO-774008211", "Exception"],
  ["SHP-20865", "SO-88395", "Northstar Industrial Supply", "FedEx Ground", "Ground", 2, "46.7 lb", "Oct 6, 2026", "7712 4498 2914", "Shipped"],
  ["SHP-20862", "SO-88392", "Acme Manufacturing", "Old Dominion", "LTL Standard", 5, "268.3 lb", "Oct 6, 2026", "ODFL-5590231", "Shipped"],
  ["SHP-20859", "SO-88387", "Keystone Mining Corp", "Estes Express", "LTL Economy", 7, "411.9 lb", "Oct 6, 2026", "EST-3340198", "Shipped"],
  ["SHP-20856", "SO-88384", "Harborline Fabrication", "DHL Express", "Worldwide", 2, "34.1 lb", "Oct 5, 2026", "DHL 4471 8890 22", "Shipped"],
  ["SHP-20854", "SO-88419", "Keystone Mining Corp", "UPS Freight", "LTL Standard", 0, "—", "Today", "—", "Ready"],
  ["SHP-20851", "SO-88417", "Riverbend Automotive", "FedEx Express", "Priority Overnight", 0, "—", "Today", "—", "Exception"],
  ["SHP-20848", "SO-88404", "Keystone Mining Corp", "UPS Ground", "Ground", 0, "—", "Oct 7, 2026", "—", "Ready"],
];

export const shipments: Shipment[] = shipmentSeeds.map(
  ([id, order, customer, carrier, service, packages, weight, shipDate, tracking, status]) => ({
    id,
    order,
    customer,
    carrier,
    service,
    packages,
    weight,
    shipDate,
    tracking,
    status,
  }),
);

/* -------------------------------- Picking -------------------------------- */

export const pickWaves: PickWave[] = [
  { id: "W-203", orders: 18, items: 246, priority: "Expedite", picker: "Derek Osei", started: "14:20", progress: 42, status: "In Progress" },
  { id: "W-202", orders: 14, items: 188, priority: "Standard", picker: "Ana Kowalski", started: "11:05", progress: 100, status: "Completed" },
  { id: "W-204", orders: 9, items: 96, priority: "Critical", picker: "Unassigned", started: "—", progress: 0, status: "Released" },
  { id: "W-205", orders: 22, items: 341, priority: "Standard", picker: "Unassigned", started: "—", progress: 0, status: "Released" },
  { id: "W-201", orders: 11, items: 134, priority: "Standard", picker: "Derek Osei", started: "08:41", progress: 100, status: "Completed" },
  { id: "W-199", orders: 7, items: 62, priority: "Expedite", picker: "Ana Kowalski", started: "07:55", progress: 100, status: "Completed" },
  { id: "W-198", orders: 5, items: 48, priority: "Standard", picker: "Marcus Webb", started: "07:12", progress: 76, status: "On Hold" },
];

export const readyOrders: ReadyOrder[] = [
  { id: "SO-88419", customer: "Keystone Mining Corp", wave: "W-204", lines: 11, items: 186, zone: "A / B", priority: "Standard", promise: "Tomorrow 12:00", status: "Ready" },
  { id: "SO-88417", customer: "Riverbend Automotive", wave: "W-203", lines: 5, items: 38, zone: "A", priority: "Critical", promise: "Today 15:30", status: "Short Pick" },
  { id: "SO-88421", customer: "Northstar Industrial Supply", wave: "W-203", lines: 8, items: 64, zone: "A / B", priority: "Expedite", promise: "Today 17:00", status: "Picking" },
  { id: "SO-88404", customer: "Keystone Mining Corp", wave: "W-203", lines: 7, items: 96, zone: "A", priority: "Standard", promise: "Oct 7, 2026", status: "Picking" },
  { id: "SO-88401", customer: "Riverbend Automotive", wave: "W-203", lines: 5, items: 44, zone: "B", priority: "Standard", promise: "Oct 7, 2026", status: "Picking" },
  { id: "SO-88398", customer: "Harborline Fabrication", wave: "W-205", lines: 12, items: 210, zone: "A / B / C", priority: "Standard", promise: "Oct 7, 2026", status: "Ready" },
  { id: "SO-88414", customer: "Harborline Fabrication", wave: "W-202", lines: 6, items: 54, zone: "A", priority: "Expedite", promise: "Today 16:00", status: "Completed" },
  { id: "SO-88420", customer: "Acme Manufacturing", wave: "W-203", lines: 4, items: 22, zone: "A", priority: "Standard", promise: "Today 17:00", status: "Picking" },
];

export const pickLines: Record<string, PickLine[]> = {
  "SO-88421": [
    { sku: "SKU-10482", product: "Industrial Safety Gloves — Large", location: "A-03-02-14", required: 24, picked: 18, lot: "L-10482-14A" },
    { sku: "SKU-20115", product: "Safety Glasses — Clear Anti-Fog", location: "A-01-04-22", required: 48, picked: 48, lot: "L-20115-12C" },
    { sku: "SKU-30210", product: "Hex Bolt M8 × 40 Zinc — Box/250", location: "A-02-01-09", required: 12, picked: 12 },
    { sku: "SKU-40110", product: "Circuit Breaker 20A Single-Pole", location: "A-06-02-03", required: 6, picked: 6 },
    { sku: "SKU-70433", product: "Tape Measure 25 ft Magnetic", location: "A-07-01-15", required: 10, picked: 4 },
    { sku: "SKU-80501", product: "Bearing 6205-2RS Sealed", location: "B-01-02-18", required: 40, picked: 40 },
    { sku: "SKU-60322", product: "Packing Tape 2 in Clear — Case/36", location: "B-02-01-05", required: 8, picked: 8 },
    { sku: "SKU-20140", product: "Hi-Vis Vest — Class 2, XL", location: "A-04-03-12", required: 16, picked: 0 },
  ],
};

export const packOrder = {
  id: "SO-88421",
  customer: "Northstar Industrial Supply",
  destination: "Milwaukee, WI 53204",
  service: "UPS Freight — LTL Standard",
  promised: "Today 17:00",
  items: 8,
  packed: 6,
  lines: [
    { sku: "SKU-10482", product: "Industrial Safety Gloves — Large", qty: 24, packed: 24, bin: "P-01" },
    { sku: "SKU-20115", product: "Safety Glasses — Clear Anti-Fog", qty: 48, packed: 48, bin: "P-01" },
    { sku: "SKU-30210", product: "Hex Bolt M8 × 40 Zinc — Box/250", qty: 12, packed: 12, bin: "P-02" },
    { sku: "SKU-40110", product: "Circuit Breaker 20A Single-Pole", qty: 6, packed: 6, bin: "P-02" },
    { sku: "SKU-70433", product: "Tape Measure 25 ft Magnetic", qty: 10, packed: 10, bin: "P-03" },
    { sku: "SKU-80501", product: "Bearing 6205-2RS Sealed", qty: 40, packed: 40, bin: "P-03" },
    { sku: "SKU-60322", product: "Packing Tape 2 in Clear — Case/36", qty: 8, packed: 0, bin: "—" },
    { sku: "SKU-20140", product: "Hi-Vis Vest — Class 2, XL", qty: 16, packed: 0, bin: "—" },
  ],
  packages: [
    { id: "PKG-1", type: "Small Carton 12×10×8", weight: "18.4 lb", dims: "12 × 10 × 8 in", carrier: "UPS Freight", service: "LTL Standard", tracking: "1Z999VA101588421001", items: 2 },
    { id: "PKG-2", type: "Medium Carton 18×12×12", weight: "31.7 lb", dims: "18 × 12 × 12 in", carrier: "UPS Freight", service: "LTL Standard", tracking: "1Z999VA101588421002", items: 2 },
  ],
  queue: [
    { id: "SO-88420", customer: "Acme Manufacturing", items: 22, packed: 18, promise: "Today 17:00" },
    { id: "SO-88414", customer: "Harborline Fabrication", items: 54, packed: 54, promise: "Today 16:00" },
    { id: "SO-88412", customer: "Northstar Industrial Supply", items: 18, packed: 18, promise: "Today 14:00" },
  ],
};

export function productOf(sku: string) {
  return productMap[sku];
}
