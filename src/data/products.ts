import type { Customer, Product, Supplier } from "../types";

export const suppliers: Supplier[] = [
  { id: "SUP-01", name: "Global Industrial Parts", contact: "Ray Mendez", email: "orders@globalindustrialparts.com", phone: "(614) 555-0142", city: "Columbus, OH", leadTimeDays: 5, otif: 96.4, openPos: 8, status: "Active" },
  { id: "SUP-02", name: "Vanguard Safety Products", contact: "Elaine Roth", email: "sales@vanguardsafety.com", phone: "(312) 555-0188", city: "Chicago, IL", leadTimeDays: 7, otif: 94.1, openPos: 5, status: "Active" },
  { id: "SUP-03", name: "BlueRock Steel Co.", contact: "Curtis Bell", email: "orderts@bluerocksteel.com", phone: "(412) 555-0119", city: "Pittsburgh, PA", leadTimeDays: 12, otif: 89.7, openPos: 4, status: "Active" },
  { id: "SUP-04", name: "Cascade Fluid Systems", contact: "Mona Delgado", email: "support@cascadefluid.com", phone: "(503) 555-0164", city: "Portland, OR", leadTimeDays: 9, otif: 92.5, openPos: 3, status: "Active" },
  { id: "SUP-05", name: "DeltaFast Fasteners", contact: "Gerald Kim", email: "quotes@deltafasteners.com", phone: "(216) 555-0173", city: "Cleveland, OH", leadTimeDays: 4, otif: 98.2, openPos: 6, status: "Active" },
  { id: "SUP-06", name: "Helix Electrical Supply", contact: "Dana Whitmore", email: "cs@helixelectrical.com", phone: "(313) 555-0155", city: "Detroit, MI", leadTimeDays: 6, otif: 91.8, openPos: 4, status: "Active" },
  { id: "SUP-07", name: "Ironclad Tool Works", contact: "Sam Ortiz", email: "orders@ironcladtools.com", phone: "(704) 555-0126", city: "Charlotte, NC", leadTimeDays: 8, otif: 87.3, openPos: 2, status: "On Hold" },
  { id: "SUP-08", name: "PacWrap Materials", contact: "Nina Petrova", email: "service@pacwrap.com", phone: "(419) 555-0197", city: "Toledo, OH", leadTimeDays: 3, otif: 97.6, openPos: 5, status: "Active" },
];

export const customers: Customer[] = [
  { id: "CUS-101", name: "Northstar Industrial Supply", city: "Milwaukee", state: "WI", terms: "Net 30", openOrders: 24, ytd: 1842000, status: "Active" },
  { id: "CUS-102", name: "Acme Manufacturing", city: "Dayton", state: "OH", terms: "Net 45", openOrders: 17, ytd: 1264500, status: "Active" },
  { id: "CUS-103", name: "Harborline Fabrication", city: "Tacoma", state: "WA", terms: "Net 30", openOrders: 9, ytd: 742300, status: "Active" },
  { id: "CUS-104", name: "Keystone Mining Corp", city: "Harrisburg", state: "PA", terms: "Net 60", openOrders: 12, ytd: 983750, status: "Active" },
  { id: "CUS-105", name: "Riverbend Automotive", city: "Louisville", state: "KY", terms: "Net 30", openOrders: 6, ytd: 458900, status: "Active" },
  { id: "CUS-106", name: "Summit Facility Group", city: "Denver", state: "CO", terms: "Net 15", openOrders: 4, ytd: 312400, status: "Credit Hold" },
];

type P = [string, string, string, string, string, string, string, string, number, number, number, Product["status"], string];

const raw: P[] = [
  ["SKU-10482", "Industrial Safety Gloves — Large", "00881234500124", "Safety & PPE", "Vanguard Safety Products", "EA", "0.42 lb", '12 × 8 × 6 in', 400, 250, 4.85, "Active", "Ansi A4 cut-resistant knit gloves with nitrile palm coating."],
  ["SKU-10483", "Industrial Safety Gloves — Medium", "00881234500131", "Safety & PPE", "Vanguard Safety Products", "EA", "0.38 lb", '12 × 8 × 6 in', 400, 250, 4.85, "Active", "Ansi A4 cut-resistant knit gloves with nitrile palm coating."],
  ["SKU-10491", "Cut-Resistant Sleeves — 18 in", "00881234500148", "Safety & PPE", "Vanguard Safety Products", "EA", "0.31 lb", '18 × 4 × 2 in', 250, 150, 6.2, "Active", "HPPE level A4 protective sleeves with thumb hole."],
  ["SKU-20115", "Safety Glasses — Clear Anti-Fog", "00881234500223", "Safety & PPE", "Vanguard Safety Products", "EA", "0.12 lb", '6 × 3 × 2 in', 600, 350, 2.4, "Active", "ANSI Z87.1 polycarbonate eyewear, anti-fog coating."],
  ["SKU-20117", "Ear Defenders — 28 dB NRR", "00881234500230", "Safety & PPE", "Vanguard Safety Products", "EA", "0.74 lb", '9 × 7 × 4 in', 200, 120, 14.9, "Active", "Over-ear hearing protection, foldable headband."],
  ["SKU-20133", "N95 Respirator — Box of 20", "00881234500247", "Safety & PPE", "Vanguard Safety Products", "BX", "1.10 lb", '10 × 6 × 5 in', 150, 90, 22.5, "Active", "NIOSH-approved N95 particulate respirator, 20 count."],
  ["SKU-20140", "Hi-Vis Vest — Class 2, XL", "00881234500254", "Safety & PPE", "Vanguard Safety Products", "EA", "0.55 lb", '14 × 10 × 1 in', 300, 180, 8.75, "Active", "ANSI Class 2 mesh vest, zip front, lime yellow."],
  ["SKU-20155", "Hard Hat — Vented, White", "00881234500261", "Safety & PPE", "Vanguard Safety Products", "EA", "0.85 lb", '12 × 10 × 8 in', 240, 140, 11.4, "Active", "Type I Class C helmet, 6-point harness, ratchet fit."],
  ["SKU-20160", "Steel-Toe Boots — Size 10", "00881234500278", "Safety & PPE", "Ironclad Tool Works", "PR", "3.60 lb", '14 × 10 × 5 in', 80, 50, 64.0, "Active", "ASTM F2413 composite toe, slip-resistant outsole."],
  ["SKU-30210", "Hex Bolt M8 × 40 Zinc — Box/250", "00881234500315", "Fasteners", "DeltaFast Fasteners", "BX", "11.20 lb", '12 × 9 × 6 in', 60, 40, 38.5, "Active", "DIN 933 fully threaded hex bolt, zinc plated."],
  ["SKU-30214", "Flange Nut M8 Zinc — Box/500", "00881234500322", "Fasteners", "DeltaFast Fasteners", "BX", "8.60 lb", '12 × 9 × 6 in', 50, 30, 27.0, "Active", "DIN 6923 serrated flange nut, zinc plated."],
  ["SKU-30222", "Self-Tapping Screw 6 × 1-1/4 — Box/500", "00881234500339", "Fasteners", "DeltaFast Fasteners", "BX", "4.10 lb", '10 × 7 × 4 in', 45, 25, 19.75, "Active", "Type 17 point, zinc plated drywall-style screw."],
  ["SKU-30230", "Flat Washer M8 Stainless — Box/500", "00881234500346", "Fasteners", "DeltaFast Fasteners", "BX", "6.30 lb", '11 × 8 × 4 in', 40, 24, 31.2, "Active", "A2-70 stainless flat washer, DIN 125A."],
  ["SKU-30244", 'Anchor Bolt 3/8" × 3" — Box/50', "00881234500353", "Fasteners", "BlueRock Steel Co.", "BX", "14.80 lb", '14 × 10 × 6 in', 30, 18, 52.0, "Active", "Wedge anchor, hot-dip galvanized, concrete substrate."],
  ["SKU-30250", 'U-Bolt 1/2" Galvanized — Box/25', "00881234500360", "Fasteners", "BlueRock Steel Co.", "BX", "12.40 lb", '16 × 10 × 5 in', 24, 14, 44.5, "Active", "Half-round U-bolt with plates and nuts, galvanized."],
  ["SKU-40102", "THHN Wire 12 AWG Black — 500 ft", "00881234500407", "Electrical", "Helix Electrical Supply", "SP", "16.50 lb", '18 × 18 × 6 in', 40, 24, 96.0, "Active", "600V copper building wire, black THHN/THWN-2."],
  ["SKU-40110", "Circuit Breaker 20A Single-Pole", "00881234500414", "Electrical", "Helix Electrical Supply", "EA", "0.48 lb", '5 × 3 × 3 in', 120, 70, 9.8, "Active", "10kA plug-on breaker, 120/240V, UL 489."],
  ["SKU-40118", 'Conduit Coupling 3/4" PVC', "00881234500421", "Electrical", "Helix Electrical Supply", "EA", "0.09 lb", '4 × 3 × 2 in', 300, 180, 1.15, "Active", "Schedule 40 PVC compression coupling."],
  ["SKU-40125", 'Junction Box 4 × 4 × 2 in NEMA 1', "00881234500438", "Electrical", "Helix Electrical Supply", "EA", "0.62 lb", '5 × 5 × 3 in', 150, 90, 6.4, "Active", "Steel handy box with cover, 19.5 cu in."],
  ["SKU-40133", "LED High Bay Fixture 150W", "00881234500445", "Electrical", "Helix Electrical Supply", "EA", "7.20 lb", '20 × 20 × 8 in', 40, 24, 78.5, "Active", "150W 21,000 lm UFO high bay, 5000K, DLC."],
  ["SKU-40141", "Cord Reel 50 ft 12/3 — 15A", "00881234500452", "Electrical", "Helix Electrical Supply", "EA", "18.40 lb", '22 × 18 × 10 in', 30, 18, 129.0, "Pending", "Spring-driven retractable reel with circuit breaker."],
  ["SKU-50201", "Hydraulic Oil ISO 46 — 55 Gal Drum", "00881234500506", "Fluids", "Cascade Fluid Systems", "DR", "462.00 lb", '36 × 24 × 24 in', 12, 8, 318.0, "Active", "Anti-wear hydraulic fluid, ISO VG 46."],
  ["SKU-50207", "Gear Lube SAE 80W-90 — 1 Gal", "00881234500513", "Fluids", "Cascade Fluid Systems", "CA", "8.40 lb", '12 × 6 × 6 in', 48, 30, 21.75, "Active", "API GL-5 limited slip gear lubricant."],
  ["SKU-50212", "Industrial Degreaser — 5 Gal Pail", "00881234500520", "Fluids", "Cascade Fluid Systems", "PL", "44.00 lb", '14 × 12 × 12 in', 36, 20, 58.9, "Active", "Bio-based heavy duty degreaser, concentrate."],
  ["SKU-50219", "Antifreeze PG — 55 Gal Drum", "00881234500537", "Fluids", "Cascade Fluid Systems", "DR", "510.00 lb", '36 × 24 × 24 in', 10, 6, 364.0, "Active", "Propylene glycol inhibited, down to -34°F."],
  ["SKU-50225", "Chain Lube Aerosol — Case/12", "00881234500544", "Fluids", "Cascade Fluid Systems", "CS", "10.80 lb", '16 × 10 × 9 in', 24, 14, 46.2, "Active", "Dry-film white lithium chain lubricant."],
  ["SKU-60301", 'Stretch Film 20 × 1500 in — Case/4', "00881234500605", "Packaging", "PacWrap Materials", "CS", "38.20 lb", '24 × 16 × 16 in', 80, 48, 42.6, "Active", "70 gauge cast machine film, 20 inch."],
  ["SKU-60308", "Corrugated Box 18×12×12 — Bundle/25", "00881234500612", "Packaging", "PacWrap Materials", "BD", "22.50 lb", '40 × 20 × 14 in', 60, 36, 31.9, "Active", "32 ECT single wall carton, kraft."],
  ["SKU-60315", "Poly Mailer 10×13 — Case/500", "00881234500629", "Packaging", "PacWrap Materials", "CS", "14.60 lb", '16 × 12 × 8 in', 40, 24, 36.4, "Active", "Cohesive closure courier bag, 2.5 mil."],
  ["SKU-60322", "Packing Tape 2 in Clear — Case/36", "00881234500636", "Packaging", "PacWrap Materials", "CS", "27.90 lb", '14 × 12 × 10 in', 50, 30, 48.75, "Active", "Hot melt acrylic carton sealing tape."],
  ["SKU-60330", "Pallet 48×40 GMA Grade A", "00881234500643", "Packaging", "PacWrap Materials", "EA", "37.00 lb", '48 × 40 × 6 in', 120, 80, 16.5, "Active", "Hardwood stringer pallet, 2,800 lb dynamic."],
  ["SKU-70401", "Cordless Impact Driver 20V", "00881234500704", "Tools", "Ironclad Tool Works", "EA", "3.90 lb", '14 × 10 × 4 in', 60, 36, 119.0, "Active", "Brushless 1/2 in driver, 4.0Ah battery included."],
  ["SKU-70409", 'Torque Wrench 1/2 in 25–250 ft-lb', "00881234500711", "Tools", "Ironclad Tool Works", "EA", "2.80 lb", '21 × 3 × 3 in', 40, 24, 89.5, "Active", "Click-type reversible ratchet, ±4% accuracy."],
  ["SKU-70417", 'Angle Grinder 4-1/2 in 11A', "00881234500728", "Tools", "Ironclad Tool Works", "EA", "5.60 lb", '15 × 6 × 6 in', 50, 30, 74.25, "Active", "Paddle switch grinder, 11,000 RPM no-load."],
  ["SKU-70425", "Socket Set Metric — 40 pc", "00881234500735", "Tools", "Global Industrial Parts", "EA", "6.20 lb", '16 × 10 × 3 in', 45, 28, 68.0, "Active", "CR-V chrome sockets, quick release ratchet."],
  ["SKU-70433", "Tape Measure 25 ft Magnetic", "00881234500742", "Tools", "Global Industrial Parts", "EA", "0.94 lb", '7 × 4 × 2 in', 120, 70, 12.4, "Active", "Wide blade, magnetic hook, nylon coating."],
  ["SKU-80501", "Bearing 6205-2RS Sealed", "00881234500803", "MRO & Components", "Global Industrial Parts", "EA", "0.30 lb", '4 × 4 × 2 in', 200, 120, 5.6, "Active", "Deep groove ball bearing, dual rubber seals."],
  ["SKU-80509", "V-Belt B-54 Wrapped", "00881234500810", "MRO & Components", "Global Industrial Parts", "EA", "0.68 lb", '20 × 5 × 3 in', 90, 55, 9.85, "Active", "Classical wrapped V-belt, 54 in outside length."],
  ["SKU-80517", 'Conveyor Roller 2.5 × 24 in', "00881234500827", "MRO & Components", "Global Industrial Parts", "EA", "9.40 lb", '26 × 6 × 6 in', 70, 40, 41.0, "Active", '1.9 in OD gravity roller, 1 in hex shaft.'],
  ["SKU-80525", 'Forklift Wheel Poly 8 × 4 in', "00881234500834", "MRO & Components", "Global Industrial Parts", "EA", "6.80 lb", '9 × 9 × 5 in', 36, 20, 57.25, "Active", "Polyurethane drive tire, 5/8 in hub bore."],
  ["SKU-80533", "Shelf Bracket Heavy Duty — Pair", "00881234500841", "MRO & Components", "BlueRock Steel Co.", "PR", "4.60 lb", '18 × 6 × 4 in', 100, 60, 18.4, "Active", '14 gauge steel bracket, 1,200 lb capacity.'],
  ["SKU-80541", "Drum Dolly 55 Gal — 1,200 lb", "00881234500858", "MRO & Components", "BlueRock Steel Co.", "EA", "24.00 lb", '26 × 26 × 10 in', 30, 18, 96.5, "Active", "Swivel casters, 5 in poly wheels, OSHA compliant."],
  ["SKU-90601", "MIG Wire .030 in — 33 lb Spool", "00881234500902", "Welding", "BlueRock Steel Co.", "SP", "34.50 lb", '12 × 12 × 5 in', 40, 24, 61.0, "Active", "ER70S-6 copper coated, .030 inch."],
  ["SKU-90607", "Electrode E6011 — 5 lb Pack", "00881234500919", "Welding", "BlueRock Steel Co.", "PK", "5.40 lb", '14 × 6 × 4 in', 50, 30, 34.75, "Active", '1/8 in cellulose sodium electrode, AC/DC.'],
  ["SKU-90613", "Argon/CO2 Mix — 80 cu ft Cylinder", "00881234500926", "Welding", "Cascade Fluid Systems", "CY", "58.00 lb", '10 × 10 × 55 in', 20, 12, 72.0, "Active", "75/25 shielding gas blend, CGA-580 valve."],
  ["SKU-90620", "Welding Helmet Auto-Dark", "00881234500933", "Welding", "Vanguard Safety Products", "EA", "1.60 lb", '14 × 12 × 10 in', 45, 26, 88.0, "Active", "1/25000 shade reaction, solar + battery assist."],
];

export const products: Product[] = raw.map(
  ([sku, name, barcode, category, supplier, unit, weight, dimensions, reorderPoint, safetyStock, unitCost, status, description]) => ({
    sku,
    name,
    barcode,
    category,
    supplier,
    unit,
    weight,
    dimensions,
    reorderPoint,
    safetyStock,
    unitCost,
    status,
    description,
  }),
);

export const productMap: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.sku, p]),
);

export const categories = Array.from(new Set(products.map((p) => p.category))).sort();
