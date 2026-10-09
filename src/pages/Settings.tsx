import { Button, Input, Select, Switch, Text } from "@chakra-ui/react";
import { Bell, Database, Save, Shield, UserCog } from "lucide-react";
import { useState } from "react";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { useAppToast } from "../components/ui/Toast";
import { carriers, currentOperator, warehouses } from "../data/meta";

function Toggle({
  label,
  detail,
  initial,
  onFlip,
}: {
  label: string;
  detail: string;
  initial: boolean;
  onFlip?: (next: boolean) => void;
}) {
  const [on, setOn] = useState(initial);
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span>
        <span className="block text-tn font-medium text-ink">{label}</span>
        <span className="block text-2xs text-ink-3">{detail}</span>
      </span>
      <Switch size="sm" colorScheme="accent" isChecked={on} onChange={(e) => { setOn(e.target.checked); onFlip?.(e.target.checked); }} />
    </div>
  );
}

export default function Settings() {
  const toast = useAppToast();
  const [danger, setDanger] = useState(false);
  const [warehouse, setWarehouse] = useState(warehouses[0].code);
  const [siteName, setSiteName] = useState(warehouses[0].name);

  const metrics: MetricDef[] = [
    { label: "Site", value: warehouses[0].code, delta: "primary", hint: warehouses[0].city },
    { label: "Sites", value: String(warehouses.length), delta: "Columbus + Reno + Allentown", hint: "all managed from here" },
    { label: "Integrations", value: "5", delta: "2 healthy", good: true, hint: "ERP, OMS, carrier" },
    { label: "Operator", value: currentOperator.initials, delta: currentOperator.role, hint: currentOperator.email },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Site profile, integrations, notification and security posture for this workspace"
        actions={
          <Button size="sm" leftIcon={<Save size={13} />} onClick={() => toast({ title: "Settings saved", description: "Changes propagated to the workspace config store.", status: "success" })}>
            Save changes
          </Button>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Site profile" subtitle={warehouse}>
          <div className="flex flex-col gap-3">
            <div>
              <Text as="span" className="text-tn font-medium text-ink">Site</Text>
              <Select size="sm" value={warehouse} onChange={(e) => { setWarehouse(e.target.value); setSiteName(warehouses.find((w) => w.code === e.target.value)?.name ?? e.target.value); }} mt={1}>
                {warehouses.map((w) => (
                  <option key={w.code} value={w.code}>{w.code} — {w.name.replace(/^Warehouse [A-Z] — /, "")}</option>
                ))}
              </Select>
            </div>
            <div>
              <Text as="span" className="text-tn font-medium text-ink">Display name</Text>
              <Input size="sm" value={siteName} onChange={(e) => setSiteName(e.target.value)} mt={1} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Text as="span" className="text-tn font-medium text-ink">Timezone</Text>
                <Input size="sm" value="America/New_York" mt={1} isReadOnly />
              </div>
              <div>
                <Text as="span" className="text-tn font-medium text-ink">Default carrier</Text>
                <Select size="sm" mt={1}>
                  {carriers.slice(0, 5).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Integrations" subtitle="Connections to the ecosystem">
          <div className="flex flex-col divide-y divide-line">
            <Toggle label="ERP sync" detail="Item master + cost via middleware — last sync 04:05" initial />
            <Toggle label="OMS webhook" detail="Sales orders push inbound; promise dates honored" initial />
            <Toggle label="Carrier rate shopping" detail="Label + rating calls at pack time" initial />
            <Toggle label="SAC slotting engine" detail="Nightly re-slot of Zone A pick faces" initial={false} onFlip={(v) => toast({ title: v ? "Slotting enabled" : "Slotting paused", description: v ? "Nightly re-slot queued for 02:00 ET." : "Zone A freezes at current faces.", status: "info" })} />
            <Toggle label="Barcode label printer" detail="Zebra ZD421 on dock network (192.168.4.22)" initial />
          </div>
        </Panel>

        <Panel title="Notifications" subtitle="Who gets told, and when">
          <div className="flex flex-col divide-y divide-line">
            <Toggle label="Exception alerts" detail="Danger-level events page every operator + lead" initial />
            <Toggle label="Low stock digest" detail="Daily 07:00 ET to Inventory Manager role" initial />
            <Toggle label="Batch report emails" detail="Scheduled reports attach to the ops inbox" initial />
            <Toggle label="Dock variance pings" detail="Real-time when variance rate exceeds 3%" initial />
          </div>
        </Panel>

        <Panel title="Security" subtitle="Access posture for the workspace">
          <div className="flex flex-col divide-y divide-line">
            <Toggle label="Require 2FA" detail="TOTP for all admin and manager roles" initial />
            <Toggle label="Session timeout" detail="Auto-logout after 4 hours idle" initial />
            <Toggle label="SSO (SAML)" detail="WorkOS directory sync enabled" initial />
            <Toggle label="Audit export" detail="Daily ingestion into the data lake (SOX)" initial />
          </div>
        </Panel>

        <Panel title="Danger zone" subtitle="Destructive workspace actions" flush>
          <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-3">
            {[
              { icon: <Database size={13} />, label: "Reindex search", tone: "muted" as const, action: () => toast({ title: "Search reindexed", description: "Full-text index rebuilt from the ops store.", status: "success" }) },
              { icon: <Bell size={13} />, label: "Reset demo data", tone: "muted" as const, action: () => toast({ title: "Demo data reset", description: "Returned to deterministic seed state.", status: "info" }) },
              { icon: <Shield size={13} />, label: "Clear cache", tone: "muted" as const, action: () => toast({ title: "Cache cleared", description: "Reports dashboard rebuilt on next open.", status: "success" }) },
            ].map((b) => (
              <button key={b.label} onClick={b.action} className="flex items-center gap-2 rounded-[6px] border border-line bg-surface-2 px-3 py-2 text-tn font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink">
                {b.icon}
                {b.label}
              </button>
            ))}
          </div>
          <div className="border-t border-line bg-surface-2 px-3 py-2.5">
            <Button size="sm" variant="outline" colorScheme="red" leftIcon={<UserCog size={13} />} onClick={() => setDanger(true)}>
              Deactivate this workspace
            </Button>
          </div>
        </Panel>

        <Panel title="About" subtitle="warehouseos-ui 1.0.0">
          <dl className="flex flex-col gap-2 text-2xs">
            {[
              ["Build channel", "stable — production ready"],
              ["Environment", "demo seeded from deterministic generators"],
              ["Coverage", "27 pages across ops, inventory, management and analytics"],
              ["Docs", "ADR-1042 slotting engine — approved"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-2">
                <dt className="text-ink-3">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <ConfirmationDialog
        open={danger}
        onClose={() => setDanger(false)}
        onConfirm={() => {
          toast({ title: "Workspace deactivated", description: "This is demo data — reactivating on reload.", status: "info" });
          setDanger(false);
        }}
        title="Deactivate this workspace?"
        message="A disabled workspace stops floor applications and blocks operator sign-in within minutes."
        confirmLabel="Deactivate workspace"
        tone="danger"
      />
    </>
  );
}