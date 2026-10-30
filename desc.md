## General/shell

- WarehouseOS WMS single-page app. Persistent left nav grouped as Operations / Inventory / Management / Analytics. Top bar has breadcrumb, global search SKU, order, location, barcode… ⌘K, warehouse switcher A-Columbus / B-Reno / C-Allentown, notifications panel with Mark all read, help/shortcuts, user menu Profile / Sign out. Shared patterns: KPI cards, filter bar with search + dropdowns, sortable table with Rows per page / Columns / Prev-Next, status pills, progress bars, charts.
  Dashboard /
- Monitors shift: KPI cards, 7-day fulfillment chart Received/Picked/Packed/Shipped, live activity timeline by role, exception queue table with Reassign / Resolve / Adjust / Investigate / Relabel / View, in-progress waves + dock receipts panels, low-stock table linking to product detail, zone utilization bars.

## Inbound

- Receiving /receiving: Manages receipts. Search + Status/Dock filters. Columns Receipt/Supplier/Expected/Progress/Variance/Dock/Status/Assignee. Actions Scan PO, New receipt, Show exceptions, Open.
- Putaway /putaway: Staging-to-bin tasks. Search + Status/Priority/Assignee filters. Columns Task/Item/Qty/From→To/Priority/Assignee/Status. Actions Batch open tasks, Start / Complete, Stock. Has dock scanner input + how-it-works guide.
- Purchase Orders /purchase-orders, /purchase-orders/:id: Procurement pipeline Draft→Submitted→Partially Received→Received→Closed/Cancelled. Search + Supplier/Status filters. Columns PO/Supplier/Expected/Lines/Qty/Value/Buyer/Status. Detail shows line table SKU/Qty/Received/Cost/Subtotal/Status, receipt progress Ordered/Received/Outstanding, ship-to, vendor notes. Actions New PO, Open, Receive 1 line.

## Outbound

- Picking /picking: Wave management. Search + Status filter. Columns Wave/Priority/Picker/Started/Progress/Status. Actions Suggest release, Start wave, Workspace / Resume.
- Picker Workspace /picking/workspace/:orderId: Guided pick for one order. Shows pick progress %, step flow Navigate→Scan→Confirm→Dock, next-pick card, pick-line table Location/Item/Required/Picked/State ordered by travel. Actions Confirm pick, Short pick, Exit picking.
- Packing /packing: Pack station work. No table, card layout per order. Functions: select open order, pack items to packages P-01…, Pack, Add package, Print all labels, Reprint.
- Shipping /shipping: Manifest + handoff. Search + Status/Carrier filters. Columns Shipment/Customer/Carrier/Pkgs/Weight/Tracking/Ship Date/Status. Actions Schedule pickup, Manifest, Reprint, Mark shipped, View flag.
- Sales Orders /sales-orders: Order pipeline Received→Released→Picking→Packing→Ready→Shipped/On Hold/Exception. Search + Channel/Priority/Status filters. Columns Order/Customer/Promise/Items/Lines/Priority/Assigned/Status. Actions Order view, Export, Release, Escalate.
- Transfers /transfers: Inter-warehouse Draft→In Transit→Received/Cancelled. Status filter. Columns Transfer/Route/Lines/Units/Requested By/Status. Actions New transfer,
  Receive, Cancel.

## Inventory & catalog

- Inventory /inventory: Stock health. Search + Category/Status filters. Columns SKU/Product/Category/Location/OnHand/Avail/Resv/In/ROP/Status. Actions Print labels, New adjustment, Detail.
- Products /products, /products/:sku: Master catalog. Search + Category/Status filters. Columns SKU/Product/Category/Supplier/Unit/OnHand/Cost/Status. Detail adds stock-by-bin table, product card Barcode/Category/Supplier/Unit/Weight/Dims/Cost/ROP/Safety, purchase history, reserved orders. Actions New product, Bin labels, Edit.
- Locations /locations, /locations/:zone: Bin map. Zone cards Fast Pick/Bulk/Hazardous/Returns/Receiving/Staging/Shipping with Browse bins / Zone map. Zone detail has Aisle/Status filters, bin table Bin/Aisle/Rack/Level/Occupancy/Status.

## Accuracy

- Adjustments /adjustments: Correction approval. Search + Type/Status filters. Types Damage/Count Correction/Found Stock/Shrinkage/Expired/System Error. Columns Adjustment/Item/Location/Type/Qty/By/Status. Actions New adjustment, Import, Approve / Reject.
- Cycle Counts /cycle-counts, /cycle-counts/:id: Physical verification Scheduled→Counting→Review→Completed. Search + Zone/Status filters. Columns Count/Location/Zone/SKUs/Assigned/Variance/Accuracy/Status. Detail shows lines System/Counted/Variance/Result with blind count, assignment + window, count steps. Actions Schedule count, Open, Count open lines.

## Masters

- Suppliers /suppliers: Scorecards. Search + Status filter. Columns Vendor/Contact/Location/Lead Time/Open POs/OTIF/Status. Actions Vendor portal, Add supplier.
- Customers /customers: Accounts + credit. Search + Status filter. Columns Customer/HQ/Terms/Open Orders/YTD/Status Active/Credit Hold. Actions Credit alerts, Add customer.
- Users /users: RBAC across sites. Search + Role/Status filters. Columns User/Role/Site/Last Active/Status. Roles Buyer/Customer Service/Cycle Counter/Inventory Manager/Packing Lead/Picker/Putaway Operator/Receiving Clerk/Lead/Supervisor. Actions Invite, Policies, Disable / Restore.

## Insights & admin

- Reports /reports: Scheduled analytics groups Inventory/Inbound/Outbound/Capacity. Functions filter reports, view chart cards Inventory Accuracy / Stock Movement / Receiving / Picking / Fulfillment / Utilization / Shrinkage, Export, Run now, Save chart.
- Performance /performance: Labor + dock. Throughput-by-shift chart, dock cycle-time chart, shift table Shift/Picked/Packed/Shipped/Accuracy/Lines, dock scorecard Dock/Receipts/Units/Cycle/Variance/Utilization. Actions Export, Refresh.
- Settings /settings: Workspace config. Site selector, display name, timezone, default carrier selects, integrations list ERP/OMS/Carrier/Slotting/Printer with status, notifications toggles, security. Actions Save changes, Reindex search, Reset demo data, Clear cache, Deactivate workspace.
