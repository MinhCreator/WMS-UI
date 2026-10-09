/* Deterministic operational datasets used by dashboard, reports and performance. */

export const fulfillmentSeries = [
  { day: "Sep 30", received: 986, picking: 941, packing: 928, shipped: 914 },
  { day: "Oct 1", received: 1042, picking: 1018, packing: 997, shipped: 992 },
  { day: "Oct 2", received: 884, picking: 902, packing: 895, shipped: 881 },
  { day: "Oct 3", received: 1174, picking: 1121, packing: 1108, shipped: 1096 },
  { day: "Oct 4", received: 742, picking: 768, packing: 761, shipped: 758 },
  { day: "Oct 5", received: 618, picking: 641, packing: 634, shipped: 640 },
  { day: "Oct 6", received: 1208, picking: 1164, packing: 1142, shipped: 1131 },
  { day: "Today", received: 812, picking: 764, packing: 703, shipped: 688 },
];

export const kpis = [
  { label: "Orders Today", value: "1,284", delta: "+8.2%", dir: "up" as const, good: true, spark: [986, 1042, 884, 1174, 742, 618, 1208, 1284] },
  { label: "Orders Pending", value: "312", delta: "-4.1%", dir: "down" as const, good: true, spark: [398, 372, 401, 356, 344, 330, 325, 312] },
  { label: "Receiving Today", value: "48", delta: "+6 POs", dir: "up" as const, good: true, spark: [31, 36, 29, 44, 27, 22, 42, 48] },
  { label: "Items Picked", value: "9,847", delta: "+3.4%", dir: "up" as const, good: true, spark: [8420, 8890, 8110, 9240, 6880, 6120, 9530, 9847] },
  { label: "Inventory Accuracy", value: "99.2%", delta: "+0.3 pp", dir: "up" as const, good: true, spark: [98.6, 98.8, 98.7, 99.0, 98.9, 99.1, 99.0, 99.2] },
  { label: "Low Stock SKUs", value: "37", delta: "+5", dir: "up" as const, good: false, spark: [24, 26, 28, 27, 31, 33, 32, 37] },
];

export const shiftPerformance = [
  { shift: "Shift 1 (06:00–14:00)", picked: 4820, packed: 4510, shipped: 4480, accuracy: 99.4, lines: 1108 },
  { shift: "Shift 2 (14:00–22:00)", picked: 4102, packed: 3980, shipped: 3921, accuracy: 99.1, lines: 962 },
  { shift: "Shift 3 (22:00–06:00)", picked: 925, packed: 902, shipped: 898, accuracy: 98.7, lines: 214 },
];

export const dockPerformance = [
  { dock: "Dock 01", receipts: 14, units: 4820, avgMinutes: 38, varianceRate: 1.2, utilization: 74 },
  { dock: "Dock 02", receipts: 11, units: 3610, avgMinutes: 44, varianceRate: 2.1, utilization: 68 },
  { dock: "Dock 03", receipts: 9, units: 2980, avgMinutes: 51, varianceRate: 3.4, utilization: 59 },
  { dock: "Dock 04", receipts: 16, units: 6240, avgMinutes: 35, varianceRate: 1.8, utilization: 82 },
  { dock: "Dock 05", receipts: 7, units: 2140, avgMinutes: 47, varianceRate: 2.6, utilization: 52 },
  { dock: "Dock 06", receipts: 5, units: 1480, avgMinutes: 55, varianceRate: 4.1, utilization: 41 },
];

export const pickerPerformance = [
  { picker: "Derek Osei", lines: 412, units: 3184, avgSeconds: 46, shortPicks: 3, accuracy: 99.6, utilization: 92 },
  { picker: "Ana Kowalski", lines: 388, units: 2946, avgSeconds: 51, shortPicks: 1, accuracy: 99.8, utilization: 88 },
  { picker: "Tomás Alvarez", lines: 341, units: 2712, avgSeconds: 49, shortPicks: 5, accuracy: 98.9, utilization: 84 },
  { picker: "Owen Brady", lines: 306, units: 2188, avgSeconds: 57, shortPicks: 2, accuracy: 99.3, utilization: 79 },
  { picker: "Marcus Webb", lines: 274, units: 1954, avgSeconds: 62, shortPicks: 4, accuracy: 99.0, utilization: 71 },
  { picker: "Jenna Whitfield", lines: 198, units: 1402, avgSeconds: 58, shortPicks: 0, accuracy: 100, utilization: 64 },
];

export const zoneUtilization = [
  { zone: "Zone A — Fast Pick", bins: 1152, used: 912, units: 214800, pct: 79 },
  { zone: "Zone B — Bulk Storage", bins: 240, used: 186, units: 486200, pct: 78 },
  { zone: "Zone C — Hazardous", bins: 72, used: 41, units: 18400, pct: 57 },
  { zone: "Zone D — Returns / QC", bins: 24, used: 9, units: 640, pct: 38 },
  { zone: "Zone E — Receiving Staging", bins: 72, used: 33, units: 4180, pct: 46 },
  { zone: "Zone F — Shipping Staging", bins: 72, used: 39, units: 5320, pct: 54 },
];

export const shrinkageSeries = [
  { month: "May", damage: 8200, shrinkage: 4100, expiry: 2600, error: 1200 },
  { month: "Jun", damage: 7600, shrinkage: 3800, expiry: 3100, error: 900 },
  { month: "Jul", damage: 9100, shrinkage: 4600, expiry: 2900, error: 1500 },
  { month: "Aug", damage: 6800, shrinkage: 3500, expiry: 2400, error: 1100 },
  { month: "Sep", damage: 7200, shrinkage: 5200, expiry: 2800, error: 1300 },
  { month: "Oct", damage: 4100, shrinkage: 2900, expiry: 1600, error: 700 },
];

export const accuracyByZone = [
  { zone: "Zone A", firstCount: 97.8, secondCount: 99.1, thirdCount: 99.5, target: 99.0 },
  { zone: "Zone B", firstCount: 98.2, secondCount: 99.3, thirdCount: 99.6, target: 99.0 },
  { zone: "Zone C", firstCount: 96.4, secondCount: 98.6, thirdCount: 99.0, target: 99.0 },
  { zone: "Zone D", firstCount: 95.9, secondCount: 98.1, thirdCount: 98.8, target: 99.0 },
  { zone: "Zone E", firstCount: 98.9, secondCount: 99.4, thirdCount: 99.7, target: 99.0 },
];

export const inboundOutbound = [
  { day: "Sep 30", inbound: 6420, outbound: 5980 },
  { day: "Oct 1", inbound: 7180, outbound: 6640 },
  { day: "Oct 2", inbound: 5240, outbound: 6120 },
  { day: "Oct 3", inbound: 8410, outbound: 7820 },
  { day: "Oct 4", inbound: 4180, outbound: 4660 },
  { day: "Oct 5", inbound: 3260, outbound: 3980 },
  { day: "Oct 6", inbound: 9240, outbound: 8610 },
  { day: "Today", inbound: 6420, outbound: 4980 },
];

export const reportCatalog = [
  { id: "inventory-accuracy", name: "Inventory Accuracy", group: "Inventory", desc: "Count accuracy by zone across the last six periods." },
  { id: "stock-movement", name: "Stock Movement", group: "Inventory", desc: "Inbound and outbound unit movement by day." },
  { id: "receiving-performance", name: "Receiving Performance", group: "Inbound", desc: "Dock throughput, cycle time and variance rates." },
  { id: "picking-performance", name: "Picking Performance", group: "Outbound", desc: "Picker productivity, short picks and accuracy." },
  { id: "order-fulfillment", name: "Order Fulfillment", group: "Outbound", desc: "Orders received, staged, picked and shipped by day." },
  { id: "warehouse-utilization", name: "Warehouse Utilization", group: "Capacity", desc: "Bin occupancy and stored units by zone." },
  { id: "shrinkage", name: "Shrinkage", group: "Inventory", desc: "Adjustment value by reason code." },
  { id: "cycle-count-accuracy", name: "Cycle Count Accuracy", group: "Inventory", desc: "Accuracy trend by zone against target." },
];
