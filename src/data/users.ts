import type { UserRow } from "../types";

export const users: UserRow[] = [
  { id: "USR-001", name: "Priya Raman", role: "Inventory Manager", email: "priya.raman@warehouseos.io", warehouse: "Warehouse A", lastActive: "Just now", status: "Active" },
  { id: "USR-002", name: "Marcus Webb", role: "Receiving Lead", email: "marcus.webb@warehouseos.io", warehouse: "Warehouse A", lastActive: "4 min ago", status: "Active" },
  { id: "USR-003", name: "Maria Chen", role: "Receiving Clerk", email: "maria.chen@warehouseos.io", warehouse: "Warehouse A", lastActive: "11 min ago", status: "Active" },
  { id: "USR-004", name: "Ana Kowalski", role: "Cycle Counter", email: "ana.kowalski@warehouseos.io", warehouse: "Warehouse A", lastActive: "22 min ago", status: "Active" },
  { id: "USR-005", name: "Derek Osei", role: "Picker", email: "derek.osei@warehouseos.io", warehouse: "Warehouse A", lastActive: "8 min ago", status: "Active" },
  { id: "USR-006", name: "Tomás Alvarez", role: "Putaway Operator", email: "tomas.alvarez@warehouseos.io", warehouse: "Warehouse A", lastActive: "35 min ago", status: "Active" },
  { id: "USR-007", name: "Jenna Whitfield", role: "Packing Lead", email: "jenna.whitfield@warehouseos.io", warehouse: "Warehouse A", lastActive: "1 hr ago", status: "Active" },
  { id: "USR-008", name: "Linda Nakamura", role: "Buyer", email: "linda.nakamura@warehouseos.io", warehouse: "Warehouse A", lastActive: "2 hrs ago", status: "Active" },
  { id: "USR-009", name: "Sofia Reyes", role: "Warehouse Supervisor", email: "sofia.reyes@warehouseos.io", warehouse: "Warehouse B", lastActive: "3 hrs ago", status: "Invited" },
  { id: "USR-010", name: "Caleb Quinn", role: "Customer Service", email: "caleb.quinn@warehouseos.io", warehouse: "Warehouse A", lastActive: "Yesterday", status: "Disabled" },
];