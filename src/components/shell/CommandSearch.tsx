import { Modal, ModalBody, ModalContent, ModalOverlay } from "@chakra-ui/react";
import {
  ArrowDownToLine,
  ClipboardList,
  FileText,
  ListChecks,
  MapPin,
  PackageSearch,
  Search,
  Tag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "../../data/products";
import { bins } from "../../data/locations";
import { cycleCounts } from "../../data/ops";
import {
  pickWaves,
  purchaseOrders,
  receipts,
  salesOrders,
  shipments,
} from "../../data/orders";
import { flatNav } from "./nav";

interface Result {
  group: string;
  label: string;
  sub?: string;
  meta?: string;
  to: string;
  icon: LucideIcon;
  hay: string;
}

interface Group {
  name: string;
  items: Result[];
}

const pageIndex: Result[] = flatNav.map((n) => ({
  group: "Pages",
  label: n.label,
  sub: n.to === "/" ? "Dashboard overview" : n.to,
  to: n.to,
  icon: n.icon,
  hay: (n.label + " " + n.to).toLowerCase(),
}));

const productIndex: Result[] = products.map((p) => ({
  group: "Products",
  label: `${p.sku} · ${p.name}`,
  sub: `${p.category} · ${p.barcode} · ${p.unit}`,
  to: `/products/${p.sku}`,
  icon: Tag,
  hay: `${p.sku} ${p.name} ${p.category} ${p.barcode}`.toLowerCase(),
}));

const soIndex: Result[] = salesOrders.map((o) => ({
  group: "Sales orders",
  label: o.id,
  sub: `${o.customer} · ${o.items} lines · ${o.destination}`,
  meta: o.status,
  to: "/sales-orders",
  icon: FileText,
  hay: `${o.id} ${o.customer} ${o.destination}`.toLowerCase(),
}));

const poIndex: Result[] = purchaseOrders.map((o) => ({
  group: "Purchase orders",
  label: o.id,
  sub: `${o.supplier} · ${o.lines} lines · due ${o.expected}`,
  meta: o.status,
  to: `/purchase-orders/${o.id}`,
  icon: ClipboardList,
  hay: `${o.id} ${o.supplier}`.toLowerCase(),
}));

const receiptIndex: Result[] = receipts.map((r) => ({
  group: "Receipts",
  label: r.id,
  sub: `${r.supplier} · dock ${r.dock} · PO ${r.po}`,
  meta: r.status,
  to: "/receiving",
  icon: ArrowDownToLine,
  hay: `${r.id} ${r.supplier} ${r.po} ${r.dock}`.toLowerCase(),
}));

const shipmentIndex: Result[] = shipments.map((s) => ({
  group: "Shipments",
  label: s.id,
  sub: `${s.carrier} ${s.service} · ${s.packages} packages · ${s.customer}`,
  meta: s.status,
  to: "/shipping",
  icon: Truck,
  hay: `${s.id} ${s.carrier} ${s.customer} ${s.order}`.toLowerCase(),
}));

const waveIndex: Result[] = pickWaves.map((w) => ({
  group: "Pick waves",
  label: w.id,
  sub: `${w.orders} orders · ${w.items} items · ${w.picker}`,
  meta: w.status,
  to: "/picking",
  icon: PackageSearch,
  hay: `${w.id} ${w.picker} ${w.status}`.toLowerCase(),
}));

const countIndex: Result[] = cycleCounts.map((c) => ({
  group: "Cycle counts",
  label: c.id,
  sub: `${c.location} · zone ${c.zone} · ${c.skuCount} SKUs · ${c.assigned}`,
  meta: c.status,
  to: `/cycle-counts/${c.id}`,
  icon: ListChecks,
  hay: `${c.id} ${c.zone} ${c.location} ${c.assigned}`.toLowerCase(),
}));

const locationIndex: Result[] = bins.slice(0, 400).map((b) => ({
  group: "Locations",
  label: b.code,
  sub: `zone ${b.zone} · aisle ${b.aisle} · ${b.skus} SKUs · ${b.units} units`,
  meta: b.status,
  to: "/locations",
  icon: MapPin,
  hay: `${b.code} ${b.zone} ${b.aisle}`.toLowerCase(),
}));

const GROUP_CAPS: Record<string, number> = {
  Pages: 6,
  Products: 5,
  "Sales orders": 4,
  "Purchase orders": 4,
  Receipts: 3,
  Shipments: 3,
  "Pick waves": 3,
  "Cycle counts": 3,
  Locations: 5,
};

const GROUP_ORDER = [
  "Pages",
  "Products",
  "Sales orders",
  "Purchase orders",
  "Receipts",
  "Shipments",
  "Pick waves",
  "Cycle counts",
  "Locations",
];

function score(hay: string, q: string): number {
  if (hay.startsWith(q)) return 0;
  const idx = hay.indexOf(q);
  if (idx === -1) return -1;
  return idx;
}

function search(raw: string): Group[] {
  const q = raw.trim().toLowerCase();
  const pools: Result[][] =
    q.length === 0
      ? [pageIndex]
      : [
          pageIndex,
          productIndex,
          soIndex,
          poIndex,
          receiptIndex,
          shipmentIndex,
          waveIndex,
          countIndex,
          q.length >= 2 ? locationIndex : [],
        ];

  const byGroup = new Map<string, Result[]>();
  for (const pool of pools) {
    for (const r of pool) {
      const s = score(r.hay, q);
      if (s === -1) continue;
      const list = byGroup.get(r.group) ?? [];
      list.push({ ...r, hay: String(s) });
      byGroup.set(r.group, list);
    }
  }

  // exact barcode-style match first
  if (q.length >= 6) {
    for (const r of productIndex) {
      if (r.hay.split(" ").includes(q)) {
        const list = byGroup.get(r.group) ?? [];
        byGroup.set(r.group, [
          { ...r, hay: "-1" },
          ...list.filter((x) => x.label !== r.label),
        ]);
      }
    }
  }

  const groups: Group[] = [];
  for (const name of GROUP_ORDER) {
    const items = byGroup.get(name);
    if (!items || items.length === 0) continue;
    groups.push({ name, items: items.slice(0, GROUP_CAPS[name] ?? 5) });
  }
  return groups;
}

export function CommandSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open]);

  const groups = useMemo(() => search(q), [q]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => setActive(0), [q]);

  const go = (r?: Result) => {
    if (!r) return;
    onClose();
    navigate(r.to);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    }
  };

  let counter = -1;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      size="2xl"
      initialFocusRef={inputRef}
      scrollBehavior="inside"
      trapFocus>
      <ModalOverlay bg="rgba(16,24,40,0.45)" />
      <ModalContent maxH="72vh" borderRadius="8px" overflow="hidden" mt="10vh">
        <div className="flex items-center gap-2.5 border-b border-line bg-surface px-3.5">
          <Search size={15} className="shrink-0 text-ink-4" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search SKU, order, location, barcode…"
            aria-label="Global search"
            className="h-11 min-w-0 flex-1 bg-transparent text-tn text-ink outline-none placeholder:text-ink-4"
          />
          <kbd className="shrink-0 rounded-[4px] border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-3">
            esc
          </kbd>
        </div>

        <ModalBody p={0} overflowY="auto">
          {flat.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-tn font-semibold text-ink">
                No matches for “{q}”
              </div>
              <div className="mt-1 text-2xs text-ink-3">
                Try a SKU (SKU-10482), order (SO-88421), PO, location
                (A-03-02-14) or barcode.
              </div>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.name}>
                <div className="sticky top-0 bg-surface-2 px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-ink-4 uppercase">
                  {g.name}
                </div>
                {g.items.map((r) => {
                  counter += 1;
                  const idx = counter;
                  const Icon = r.icon;
                  const isActive = idx === active;
                  return (
                    <button
                      key={`${g.name}-${r.label}`}
                      type="button"
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(r)}
                      className={`flex w-full items-center gap-3 px-3.5 py-2 text-left transition-colors ${
                        isActive ? "bg-surface-3" : "bg-transparent"
                      }`}>
                      <Icon
                        size={15}
                        className="shrink-0 text-ink-3 ml-[1rem]"
                        strokeWidth={1.9}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-tn font-medium text-ink">
                          {r.label}
                        </span>
                        {r.sub && (
                          <span className="block truncate text-2xs text-ink-3">
                            {r.sub}
                          </span>
                        )}
                      </span>
                      {r.meta && (
                        <span className="tnum shrink-0 text-2xs text-ink-4">
                          {r.meta}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </ModalBody>

        <div className="flex items-center gap-4 border-t border-line bg-surface-2 px-3.5 py-1.5 text-2xs text-ink-4">
          <span className="tnum">↑↓ navigate</span>
          <span className="tnum">↵ open</span>
          <span className="tnum">esc close</span>
          <span className="tnum ml-auto">
            {flat.length} result{flat.length === 1 ? "" : "s"}
          </span>
        </div>
      </ModalContent>
    </Modal>
  );
}
