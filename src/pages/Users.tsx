import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
} from "@chakra-ui/react";
import { KeyRound, RefreshCcw, ShieldCheck, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AccessRequestRecord, InviteResult, SecurityRole, UserRecord } from "../api/types";
import { errorMessage } from "../api/client";
import { usersApi, type UserUpdateInput } from "../api/users";
import { useCan } from "../components/auth";
import {
  ConfirmationDialog,
  DataTable,
  ErrorState,
  LoadingState,
  MetricStrip,
  PageHeader,
  Panel,
  StatusBadge,
  useAppToast,
  type Column,
  type MetricDef,
} from "../components/ui";
import { useAppSelector } from "../states/hooks";
import { selectCurrentUser, selectWarehouses } from "../states/slices/authSlice";

const SECURITY_ROLES: SecurityRole[] = ["ADMIN", "MANAGER", "OFFICE", "OPERATOR", "VIEWER"];

const roleTone: Record<string, "info" | "neutral" | "warn"> = {
  ADMIN: "warn",
  MANAGER: "info",
  OFFICE: "neutral",
  OPERATOR: "neutral",
  VIEWER: "neutral",
};

function displayName(user: UserRecord) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "Unnamed account";
}

function inviteLink(result: InviteResult) {
  if (result.inviteUrl) return result.inviteUrl;
  const token = result.invite?.token;
  return token ? `${window.location.origin}/invite?token=${encodeURIComponent(token)}` : "";
}

export default function Users() {
  const toast = useAppToast();
  const warehouses = useAppSelector(selectWarehouses);
  const currentUser = useAppSelector(selectCurrentUser);
  const canInvite = useCan("user:invite");
  const canWrite = useCan("user:write");

  const [rows, setRows] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [accessRequests, setAccessRequests] = useState<AccessRequestRecord[]>([]);
  const [requestsBusy, setRequestsBusy] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<SecurityRole>("OPERATOR");
  const [inviteWarehouse, setInviteWarehouse] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);

  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState<UserUpdateInput>({});
  const [editBusy, setEditBusy] = useState(false);

  const [confirm, setConfirm] = useState<{ user: UserRecord; kind: "deactivate" | "revoke" } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await usersApi.list({ limit: 100 });
      setRows(page.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAccessRequests = useCallback(async () => {
    if (!canInvite) return;
    try {
      const result = await usersApi.listAccessRequests();
      setAccessRequests(result.data);
    } catch (err) {
      toast({ title: "Could not load access requests", description: errorMessage(err), status: "error" });
    }
  }, [canInvite, toast]);

  useEffect(() => {
    void loadUsers();
    void loadAccessRequests();
  }, [loadUsers, loadAccessRequests]);

  const inviteRoleOptions = useMemo(
    () => (currentUser?.role === "MANAGER" ? SECURITY_ROLES.filter((r) => !["ADMIN", "MANAGER"].includes(r)) : SECURITY_ROLES),
    [currentUser?.role],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (statusFilter === "active" && !user.isActive) return false;
      if (statusFilter === "disabled" && user.isActive) return false;
      if (!query) return true;
      return `${displayName(user)} ${user.email ?? ""} ${user.role}`.toLowerCase().includes(query);
    });
  }, [rows, search, roleFilter, statusFilter]);

  const metrics: MetricDef[] = [
    { label: "Accounts", value: String(rows.length), delta: `${rows.filter((u) => u.isActive).length} active`, hint: "all sites you can see" },
    { label: "Managers", value: String(rows.filter((u) => ["ADMIN", "MANAGER"].includes(u.role)).length), delta: "approval duties", hint: "RBAC enforced" },
    { label: "Operators", value: String(rows.filter((u) => u.role === "OPERATOR").length), delta: "floor duty", hint: "site-scoped" },
    { label: "Disabled", value: String(rows.filter((u) => !u.isActive).length), delta: "no sessions", hint: "revoked immediately" },
    { label: "Access requests", value: String(accessRequests.length), delta: canInvite ? "awaiting review" : "read-only", hint: "admin queue" },
    { label: "Roles", value: String(SECURITY_ROLES.length), delta: "least-privilege", good: true, hint: "5 security roles" },
  ];

  const columns: Column<UserRecord>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      sortValue: (user) => displayName(user),
      cell: (user) => (
        <span className="flex flex-col gap-0.5">
          <span className="small-caps text-tn font-medium text-ink">{displayName(user)}</span>
          <span className="text-2xs text-ink-3">{user.email}</span>
        </span>
      ),
    },
    {
      key: "role",
      header: "Security role",
      sortable: true,
      sortValue: (user) => user.role,
      cell: (user) => <StatusBadge status={user.role} tone={roleTone[user.role] ?? "neutral"} />,
    },
    {
      key: "jobRole",
      header: "Job title",
      sortable: true,
      sortValue: (user) => user.jobRole ?? "—",
      hideBelow: "xl",
      cell: (user) => <span className="text-2xs text-ink-2">{user.jobRole ?? "—"}</span>,
    },
    {
      key: "warehouse",
      header: "Site",
      sortable: true,
      sortValue: (user) => user.warehouse?.name ?? (user.allWarehouses ? "All sites" : "Unassigned"),
      hideBelow: "lg",
      cell: (user) => (
        <span className="text-2xs text-ink-2">
          {user.allWarehouses ? "All sites" : (user.warehouse?.name ?? "Unassigned")}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last sign-in",
      sortable: true,
      sortValue: (user) => user.lastLoginAt ?? "",
      hideBelow: "md",
      cell: (user) => (
        <span className="text-2xs text-ink-2">
          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      sortValue: (user) => (user.isActive ? 1 : 0),
      cell: (user) => <StatusBadge status={user.isActive ? "Active" : "Disabled"} />,
    },
  ];

  async function submitInvite() {
    if (!inviteEmail.trim()) {
      toast({ title: "Email required", status: "warning" });
      return;
    }
    setInviteBusy(true);
    try {
      const result = await usersApi.createInvite({
        email: inviteEmail.trim(),
        role: inviteRole,
        warehouseId: inviteWarehouse || null,
      });
      setInviteResult(result);
      toast({ title: "Invite created", description: `Invite ready for ${result.invite.email}.`, status: "success" });
      void loadUsers();
    } catch (err) {
      toast({ title: "Invite failed", description: errorMessage(err), status: "error" });
    } finally {
      setInviteBusy(false);
    }
  }

  function openEdit(user: UserRecord) {
    setEditUser(user);
    setEditForm({
      role: user.role as SecurityRole,
      warehouseId: user.warehouseId,
      isActive: user.isActive ?? true,
    });
  }

  async function submitEdit() {
    if (!editUser) return;
    setEditBusy(true);
    try {
      const updated = await usersApi.update(editUser.id, editForm);
      setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      toast({
        title: "Account updated",
        description: "Security changes revoke existing sessions immediately.",
        status: "success",
      });
      setEditUser(null);
    } catch (err) {
      toast({ title: "Update failed", description: errorMessage(err), status: "error" });
    } finally {
      setEditBusy(false);
    }
  }

  async function runConfirm() {
    if (!confirm) return;
    try {
      if (confirm.kind === "revoke") {
        await usersApi.revokeSessions(confirm.user.id);
        toast({ title: "Sessions revoked", description: `${displayName(confirm.user)} must sign in again.`, status: "success" });
      } else {
        const updated = await usersApi.update(confirm.user.id, { isActive: false });
        setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
        toast({ title: "Account disabled", status: "success" });
      }
    } catch (err) {
      toast({ title: "Action failed", description: errorMessage(err), status: "error" });
    } finally {
      setConfirm(null);
    }
  }

  async function decideRequest(request: AccessRequestRecord, approve: boolean) {
    setRequestsBusy(request.id);
    try {
      if (approve) {
        const result = await usersApi.approveAccessRequest(request.id, "OPERATOR", request.warehouseId ?? null);
        setInviteResult(result);
        toast({
          title: "Request approved",
          description: `Invite ready for ${result.invite.email}.`,
          status: "success",
        });
      } else {
        await usersApi.rejectAccessRequest(request.id);
        toast({ title: "Request rejected", status: "info" });
      }
      setAccessRequests((current) => current.filter((row) => row.id !== request.id));
    } catch (err) {
      toast({ title: "Decision failed", description: errorMessage(err), status: "error" });
    } finally {
      setRequestsBusy(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Users & roles"
        subtitle="Accounts are invite-only — every change bumps the security version and revokes sessions"
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              leftIcon={<RefreshCcw size={13} />}
              onClick={() => void loadUsers()}
            >
              Refresh
            </Button>
            {canInvite && (
              <Button
                size="sm"
                leftIcon={<UserPlus size={13} />}
                onClick={() => {
                  setInviteResult(null);
                  setInviteEmail("");
                  setInviteRole("OPERATOR");
                  setInviteWarehouse(warehouses[0]?.id ?? "");
                  setInviteOpen(true);
                }}
              >
                Invite user
              </Button>
            )}
          </>
        }
      />

      <MetricStrip metrics={metrics} />

      {error ? (
        <div className="mt-4">
          <ErrorState title="Could not load users" description={error} onRetry={() => void loadUsers()} />
        </div>
      ) : loading ? (
        <div className="mt-4">
          <LoadingState label="Loading accounts…" />
        </div>
      ) : (
        <div className="mt-4 rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
            <Input
              size="sm"
              maxW="260px"
              placeholder="Search name, email, role…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Select size="sm" maxW="170px" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">All roles</option>
              {SECURITY_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
            <Select size="sm" maxW="150px" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </Select>
            <span className="ml-auto text-2xs text-ink-3">
              {filtered.length} of {rows.length} accounts
            </span>
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            rowKey={(user) => user.id}
            emptyTitle="No accounts match"
            emptyDescription="Adjust the search or filters, or invite a new user."
            defaultSort={{ key: "name", dir: "asc" }}
            rowActions={(user) =>
              canWrite ? (
                <span className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    className="rounded-[4px] px-1.5 py-0.5 text-2xs font-semibold text-accent hover:bg-accent-soft"
                    onClick={() => openEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-[4px] px-1.5 py-0.5 text-2xs font-semibold text-ink-3 hover:bg-surface-2 hover:text-ink"
                    onClick={() => setConfirm({ user, kind: "revoke" })}
                  >
                    Revoke
                  </button>
                  {user.isActive && user.id !== currentUser?.id && (
                    <button
                      type="button"
                      className="rounded-[4px] px-1.5 py-0.5 text-2xs font-semibold text-danger hover:bg-danger-bg"
                      onClick={() => setConfirm({ user, kind: "deactivate" })}
                    >
                      Disable
                    </button>
                  )}
                </span>
              ) : null
            }
            footerNote={
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-ok" />
                Role, site and active-status changes revoke access tokens immediately.
              </span>
            }
          />
        </div>
      )}

      {canInvite && (
        <div className="mt-4">
          <Panel
            title="Access requests"
            subtitle="Unknown users who asked for an account; approving issues an invite"
            actions={
              <Button size="xs" variant="ghost" onClick={() => void loadAccessRequests()}>
                Refresh
              </Button>
            }
          >
            {accessRequests.length === 0 ? (
              <p className="text-2xs text-ink-3">No pending access requests.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-[#eef1f5]">
                {accessRequests.map((request) => (
                  <li key={request.id} className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="min-w-0 flex-1">
                      <span className="block text-tn font-medium text-ink">
                        {[request.firstName, request.lastName].filter(Boolean).join(" ") || request.email}
                      </span>
                      <span className="block text-2xs text-ink-3">
                        {request.email}
                        {request.reason ? ` · ${request.reason}` : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <Button
                        size="xs"
                        colorScheme="blue"
                        isLoading={requestsBusy === request.id}
                        onClick={() => void decideRequest(request, true)}
                      >
                        Approve (OPERATOR)
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="gray"
                        isDisabled={requestsBusy === request.id}
                        onClick={() => void decideRequest(request, false)}
                      >
                        Reject
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}

      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} size="md" isCentered>
        <ModalOverlay bg="rgba(16,24,40,0.45)" />
        <ModalContent borderRadius="8px">
          <ModalHeader fontSize="15px" borderBottomWidth="1px">
            Invite a user
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4} display="flex" flexDirection="column" gap={3}>
            {inviteResult ? (
              <div className="flex flex-col gap-2">
                <p className="text-tn text-ink-2">
                  Invite created for <span className="font-semibold text-ink">{inviteResult.invite.email}</span> as{" "}
                  <span className="font-mono text-2xs">{inviteResult.invite.role}</span>.
                </p>
                <div className="rounded-[6px] border border-line bg-surface-2 p-2">
                  <p className="mb-1 text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">
                    Invite link
                  </p>
                  <code className="block break-all text-2xs text-ink-2">{inviteLink(inviteResult)}</code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  onClick={() => {
                    void navigator.clipboard?.writeText(inviteLink(inviteResult));
                    toast({ title: "Invite link copied", status: "success" });
                  }}
                >
                  Copy link
                </Button>
              </div>
            ) : (
              <>
                <FormControl isRequired>
                  <FormLabel fontSize="13px">Work email</FormLabel>
                  <Input
                    size="sm"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="new.hire@company.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px">Security role</FormLabel>
                  <Select
                    size="sm"
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as SecurityRole)}
                  >
                    {inviteRoleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText fontSize="11px">
                    Job titles are profile metadata; only this role grants permissions.
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="13px">Home warehouse</FormLabel>
                  <Select
                    size="sm"
                    value={inviteWarehouse}
                    onChange={(event) => setInviteWarehouse(event.target.value)}
                  >
                    <option value="">All sites (admin only)</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter gap={2}>
            {inviteResult ? (
              <Button size="sm" onClick={() => setInviteOpen(false)}>
                Done
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" colorScheme="gray" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" isLoading={inviteBusy} onClick={() => void submitInvite()}>
                  Create invite
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} size="md" isCentered>
        <ModalOverlay bg="rgba(16,24,40,0.45)" />
        <ModalContent borderRadius="8px">
          <ModalHeader fontSize="15px" borderBottomWidth="1px">
            Edit {editUser ? displayName(editUser) : "account"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4} display="flex" flexDirection="column" gap={3}>
            <FormControl>
              <FormLabel fontSize="13px">Security role</FormLabel>
              <Select
                size="sm"
                value={editForm.role ?? "VIEWER"}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, role: event.target.value as SecurityRole }))
                }
              >
                {SECURITY_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="13px">Home warehouse</FormLabel>
              <Select
                size="sm"
                value={editForm.warehouseId ?? ""}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, warehouseId: event.target.value || null }))
                }
              >
                <option value="">Unassigned</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl display="flex" alignItems="center" gap={3}>
              <FormLabel fontSize="13px" mb={0} flex="1">
                Account active
              </FormLabel>
              <Switch
                isChecked={editForm.isActive ?? true}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
            </FormControl>
            <div className="flex items-start gap-2 rounded-[6px] border border-line bg-surface-2 p-2.5 text-2xs text-ink-3">
              <KeyRound size={12} className="mt-px shrink-0" />
              Saving a role, site, or status change revokes all of this account&apos;s sessions.
            </div>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button size="sm" variant="outline" colorScheme="gray" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={editBusy} onClick={() => void submitEdit()}>
              Save changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => void runConfirm()}
        title={confirm?.kind === "revoke" ? "Revoke sessions" : "Disable account"}
        message={
          confirm?.kind === "revoke"
            ? `Revoke every active session for ${confirm ? displayName(confirm.user) : ""}?`
            : `Disable ${confirm ? displayName(confirm.user) : ""}? They lose access on their next request.`
        }
        confirmLabel={confirm?.kind === "revoke" ? "Revoke sessions" : "Disable account"}
      />
    </>
  );
}
