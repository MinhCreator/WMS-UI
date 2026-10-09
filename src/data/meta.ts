import type { Warehouse } from "../types";

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const fmt = (n: number) => n.toLocaleString("en-US");
export const fmt1 = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const money2 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export const warehouses: Warehouse[] = [
  { code: "CMH-01", name: "Warehouse A — Columbus", city: "Columbus, OH", timezone: "ET" },
  { code: "RNO-02", name: "Warehouse B — Reno", city: "Reno, NV", timezone: "PT" },
  { code: "ABE-03", name: "Warehouse C — Allentown", city: "Allentown, PA", timezone: "ET" },
];

export const carriers = [
  "UPS Ground",
  "UPS Freight",
  "FedEx Express",
  "FedEx Ground",
  "XPO Logistics",
  "Estes Express",
  "Old Dominion",
  "DHL Express",
] as const;

export const currentOperator = {
  name: "Priya Raman",
  initials: "PR",
  role: "Inventory Manager",
  email: "priya.raman@warehouseos.io",
};
