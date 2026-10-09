import { Button } from "@chakra-ui/react";
import { KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, type Column } from "../components/ui/DataTable";
import { FilterBar, FilterSelect, SearchBox } from "../components/ui/FilterBar";
import { MetricStrip, type MetricDef } from "../components/ui/Metric";
import { PageHeader } from "../components/ui/PageHeader";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAppToast } from "../components/ui/Toast";
import { users } from "../data/users";
import type { UserRow } from "../types";

const roles = Array.from(new Set(users.map((u) => u.role))).sort();

export default function Users() {
  const toast = useAppToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (status === "all" || u.status === status) &&
        (role === "all" || u.role === role) &&
        (!q || `${u.name} ${u.email} ${u.role} ${u.warehouse}`.toLowerCase().includes(q)),
    );
  }, [search, status, role]);

  const metrics: MetricDef[] = [
    { label: "Team members", value: String(users.length), delta: `${users.filter((u) => u.status === "Active").length} active`, hint: "all sites" },
    { label: "Operators", value: String(users.filter((u) => ["Picker", "Putaway Operator", "Receiving Clerk", "Cycle Counter"].includes(u.role)).length), delta: "floor duty", hint: "Warehouse A" },
    { label: "Invited", value: String(users.filter((u) => u.status === "Invited").length), delta: "2 pending", hint: "onboarding" },
    { label: "Disabled", value: String(users.filter((u) => u.status === "Disabled").length), delta: "deactivated", hint: "no active sessions" },
    { label: "Roles", value: String(roles.length), delta: "least-privilege", good: true, hint: "RBAC enforced" },
    { label: "2FA coverage", value: "100%", delta: "enforced", good: true, hint: "TOTP + recovery" },
  ];

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      sortValue: (u) => u.name,
      cell: (u) => (
        <span className="flex flex-col gap-0.5">
          <span className="small-caps text-tn font-medium text-ink">{u.name}</span>
          <span className="text-2xs text-ink-3">{u.email}</span>
        </span>
      ),
    },
    { key: "role", header: "Role", sortable: true, sortValue: (u) => u.role, cell: (u) => <StatusBadge status={u.role} tone={u.role === "Warehouse Supervisor" ? "info" : "neutral"} /> },
    { key: "warehouse", header: "Site", sortable: true, sortValue: (u) => u.warehouse, hideBelow: "lg" },
    { key: "lastActive", header: "Last active", sortable: true, sortValue: (u) => u.lastActive, hideBelow: "md", cell: (u) => <span className="text-2xs text-ink-2">{u.lastActive}</span> },
    { key: "status", header: "Status", cell: (u) => <StatusBadge status={u.status} />, sortable: true, sortValue: (u) => u.status },
  ];

  return (
    <>
      <PageHeader
        title="Users & roles"
        subtitle="Access control across 3 sites — loaded by role, guarded by policy"
        actions={
          <>
            <Button size="sm" variant="outline" colorScheme="gray" leftIcon={<KeyRound size={13} />} onClick={() => toast({ title: "Role policies", description: "RBAC matrix opens in the admin console milestone.", status: "info" })}>
              Policies
            </Button>
            <Button size="sm" leftIcon={<UserPlus size={13} />} onClick={() => toast({ title: "Invite user", description: "SSO invitation flow ships with the admin console.", status: "info" })}>
              Invite
            </Button>
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
        <FilterBar
          activeCount={(status !== "all" ? 1 : 0) + (role !== "all" ? 1 : 0)}
          onClear={() => {
            setStatus("all");
            setRole("all");
          }}
        >
          <SearchBox value={search} onChange={setSearch} placeholder="Search name, email, role…" ariaLabel="Search users" />
          <FilterSelect label="Role" value={role} onChange={setRole} options={[{ value: "all", label: "All roles" }, ...roles.map((r) => ({ value: r, label: r }))]} />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All statuses" },
              { value: "Active", label: "Active" },
              { value: "Invited", label: "Invited" },
              { value: "Disabled", label: "Disabled" },
            ]}
          />
        </FilterBar>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(u) => u.id}
          defaultSort={{ key: "name", dir: "asc" }}
          emptyTitle="No users match"
          emptyDescription="Adjust the role or status filter."
          rowActions={(u) => (
            <span className="flex items-center gap-1">
              {u.status === "Invited" ? (
                <Button size="xs" colorScheme="accent" onClick={() => toast({ title: `Invite resent to ${u.email}`, description: `Expires in 72h for ${u.name}.`, status: "success" })}>
                  Resend invite
                </Button>
              ) : (
                <Button size="xs" variant="outline" colorScheme="gray" onClick={() => toast({ title: `${u.status === "Active" ? "Disable" : "Restore"} ${u.name}`, description: u.status === "Active" ? "Ends all sessions and removes floor access." : "Re-enables the prior role and floor access.", status: "info" })}>
                  {u.status === "Active" ? "Disable" : "Restore"}
                </Button>
              )}
            </span>
          )}
          footerNote={
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-ok" />
              Floor actions require a role with warehouse scope; approval over $100 needs Inventory Manager or above.
            </span>
          }
        />
      </div>
    </>
  );
}