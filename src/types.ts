export type Tone = "ok" | "warn" | "danger" | "info" | "neutral";

export interface Warehouse {
  code: string;
  name: string;
  city: string;
  timezone: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  leadTimeDays: number;
  otif: number;
  openPos: number;
  status: "Active" | "On Hold";
}

export interface Customer {
  id: string;
  name: string;
  city: string;
  state: string;
  terms: string;
  openOrders: number;
  ytd: number;
  status: "Active" | "Credit Hold";
}

export interface Product {
  sku: string;
  name: string;
  barcode: string;
  category: string;
  supplier: string;
  unit: string;
  weight: string;
  dimensions: string;
  reorderPoint: number;
  safetyStock: number;
  unitCost: number;
  status: "Active" | "Discontinued" | "Pending";
  description: string;
}

export interface StockByLocation {
  sku: string;
  location: string;
  onHand: number;
  reserved: number;
  available: number;
  status: "Healthy" | "Low" | "Critical" | "Out";
}

export interface InventoryRow {
  sku: string;
  product: string;
  category: string;
  supplier: string;
  location: string;
  extraLocations: number;
  onHand: number;
  available: number;
  reserved: number;
  incoming: number;
  reorderPoint: number;
  status: "Healthy" | "Low" | "Critical" | "Out";
  updated: string;
}

export interface SalesOrder {
  id: string;
  customer: string;
  orderDate: string;
  promiseDate: string;
  lines: number;
  items: number;
  channel: string;
  warehouse: string;
  destination: string;
  priority: "Standard" | "Expedite" | "Critical";
  status:
    | "Received"
    | "Released"
    | "Picking"
    | "Packing"
    | "Ready to Ship"
    | "Shipped"
    | "On Hold"
    | "Exception";
  assignee: string;
}

export interface Shipment {
  id: string;
  order: string;
  customer: string;
  carrier: string;
  service: string;
  packages: number;
  weight: string;
  shipDate: string;
  tracking: string;
  status: "Ready" | "Label Created" | "Manifested" | "Shipped" | "Exception";
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  expected: string;
  lines: number;
  totalQty: number;
  receivedQty: number;
  status:
    | "Draft"
    | "Submitted"
    | "Partially Received"
    | "Received"
    | "Closed"
    | "Cancelled";
  buyer: string;
  warehouse: string;
  shipTo: string;
  total: number;
}

export interface PoLine {
  sku: string;
  product: string;
  qty: number;
  received: number;
  unitCost: number;
}

export interface Receipt {
  id: string;
  po: string;
  supplier: string;
  expectedDate: string;
  items: number;
  received: number;
  variance: number;
  dock: string;
  status: "Expected" | "In Progress" | "Completed" | "Exception";
  assigned: string;
}

export interface ReceiptLine {
  sku: string;
  product: string;
  expected: number;
  received: number;
  damaged: number;
  variance: number;
  lot: string;
  expiry: string;
}

export interface PickWave {
  id: string;
  orders: number;
  items: number;
  priority: "Standard" | "Expedite" | "Critical";
  picker: string;
  started: string;
  progress: number;
  status: "Released" | "In Progress" | "Completed" | "On Hold";
}

export interface ReadyOrder {
  id: string;
  customer: string;
  wave: string;
  lines: number;
  items: number;
  zone: string;
  priority: "Standard" | "Expedite" | "Critical";
  promise: string;
  status: "Ready" | "Picking" | "Short Pick" | "Completed";
}

export interface PickLine {
  sku: string;
  product: string;
  location: string;
  required: number;
  picked: number;
  lot?: string;
}

export interface ExceptionRow {
  id: string;
  type: string;
  reference: string;
  location: string;
  description: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  assigned: string;
  age: string;
  action: string;
}

export interface ActivityItem {
  time: string;
  operator: string;
  role: string;
  text: string;
  kind:
    | "receive"
    | "putaway"
    | "wave"
    | "pick"
    | "count"
    | "adjust"
    | "ship"
    | "pack";
}

export interface Adjustment {
  id: string;
  sku: string;
  product: string;
  location: string;
  type: string;
  qty: number;
  reason: string;
  notes: string;
  user: string;
  timestamp: string;
  status: "Pending Approval" | "Approved" | "Rejected";
}

export interface CycleCount {
  id: string;
  location: string;
  zone: string;
  skuCount: number;
  assigned: string;
  scheduled: string;
  variance: number;
  accuracy: number;
  status: "Scheduled" | "In Progress" | "Pending Review" | "Completed";
}

export interface CountLine {
  sku: string;
  product: string;
  system: number;
  counted: number | null;
  unit: string;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  lines: number;
  units: number;
  requestedBy: string;
  requested: string;
  status: "Draft" | "In Transit" | "Received" | "Cancelled";
}

export interface PutawayTask {
  id: string;
  receipt: string;
  sku: string;
  product: string;
  qty: number;
  from: string;
  to: string;
  priority: "Standard" | "Expedite" | "Critical";
  assignee: string;
  status: "Queued" | "In Progress" | "Completed";
}

export interface UserRow {
  id: string;
  name: string;
  role: string;
  email: string;
  warehouse: string;
  lastActive: string;
  status: "Active" | "Invited" | "Disabled";
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: Tone;
  read: boolean;
}

export interface Bin {
  code: string;
  zone: string;
  aisle: string;
  rack: string;
  bin: string;
  capacity: number;
  units: number;
  skus: number;
  status: "Active" | "Blocked" | "Reserved";
}

export interface AuditEntry {
  time: string;
  user: string;
  action: string;
  detail: string;
}
