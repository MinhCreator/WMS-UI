import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Package,
  Settings,
  UserRound,
  Warehouse as WarehouseIcon,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Warehouse } from "../../types";
import { currentOperator, warehouses } from "../../data/meta";
import { useState } from "react";
import { useAppToast } from "../ui/Toast";
import { useAppDispatch, useAppSelector } from "../../states/hooks";
import {
  markAllNotificationsRead,
  markNotificationRead,
  selectNotifications,
  selectUnreadCount,
} from "../../states/slices/uiSlice";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[6px] bg-accent text-white"
      style={{ height: size, width: size }}
      aria-hidden
    >
      <Package size={Math.round(size * 0.56)} strokeWidth={2.2} />
    </span>
  );
}

export function WarehouseMenu({
  warehouse,
  onChange,
  variant = "header",
}: {
  warehouse: Warehouse;
  onChange: (w: Warehouse) => void;
  variant?: "header" | "sidebar";
}) {
  if (variant === "sidebar") {
    return (
      <Menu placement="right-start">
        <MenuButton
          as={Button}
          variant="outline"
          colorScheme="gray"
          w="full"
          h="auto"
          py="7px"
          px="8px"
          mb={2}
          mt={2}
          justifyContent="flex-start"
          leftIcon={<WarehouseIcon size={15} className="text-ink-3" />}
          rightIcon={<ChevronDown size={13} className="text-ink-4" />}
          textAlign="left"
          fontWeight={600}
        >
          <span className="flex min-w-0 flex-col items-start leading-tight">
            <span className="text-2xs font-medium text-ink-4">Warehouse</span>
            <span className="w-full truncate text-tn text-ink">
              {warehouse.name}
            </span>
          </span>
        </MenuButton>
        <MenuList minW="250px" zIndex={40}>
          {warehouses.map((w) => (
            <MenuItem
              key={w.code}
              onClick={() => onChange(w)}
              bg={w.code === warehouse.code ? "accent.50" : undefined}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span>
                  <span className="block font-semibold text-ink">{w.name}</span>
                  <span className="block text-2xs text-ink-3">
                    {w.code} · {w.city}
                  </span>
                </span>
                {w.code === warehouse.code && (
                  <span className="h-2 w-2 rounded-full bg-accent" />
                )}
              </span>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    );
  }

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        variant="outline"
        colorScheme="gray"
        size="sm"
        leftIcon={<WarehouseIcon size={13} className="text-ink-3" />}
        rightIcon={<ChevronDown size={13} />}
        fontWeight={600}
        letterSpacing="0.02em"
      >
        {warehouse.code}
      </MenuButton>
      <MenuList minW="250px" zIndex={40}>
        {warehouses.map((w) => (
          <MenuItem
            key={w.code}
            onClick={() => onChange(w)}
            bg={w.code === warehouse.code ? "accent.50" : undefined}
          >
            <span className="flex w-full items-center justify-between gap-3">
              <span>
                <span className="block font-semibold text-ink">{w.name}</span>
                <span className="block text-2xs text-ink-3">
                  {w.code} · {w.city}
                </span>
              </span>
              {w.code === warehouse.code && (
                <span className="h-2 w-2 rounded-full bg-accent" />
              )}
            </span>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

export function NotificationsButton({
  variant = "icon",
}: {
  variant?: "icon" | "row";
}) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectNotifications);
  const unread = useAppSelector(selectUnreadCount);

  const markAll = () => dispatch(markAllNotificationsRead());
  const markOne = (id: string) => dispatch(markNotificationRead(id));

  const badge = unread > 0 && (
    <span
      className={`absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9.5px] font-bold text-white ${
        variant === "icon" ? "-top-0.5 -right-0.5" : "top-0.5 right-1.5"
      }`}
    >
      {unread}
    </span>
  );

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        {variant === "icon" ? (
          <IconButton
            aria-label={`Notifications, ${unread} unread`}
            variant="ghost"
            size="sm"
            position="relative"
            color="ink.700"
          >
            <Bell size={16} />
            {badge}
          </IconButton>
        ) : (
          <button
            type="button"
            className="relative flex h-8 w-full items-center gap-2.5 rounded-[6px] px-2 text-tn text-ink-2 hover:bg-surface-2 hover:text-ink"
          >
            <Bell size={15} className="text-ink-3" />
            <span className="flex-1 text-left">Notifications</span>
            {badge}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        w="450px"
        maxH="440px"
        borderRadius="8px"
        borderColor="#e4e7ec"
        zIndex={40}
      >
        <PopoverHeader px="12px" py="8px" borderBottomWidth="1px">
          <span className="flex items-center justify-between">
            <span className="text-tn font-semibold text-ink">
              Notifications
            </span>
            <button
              type="button"
              onClick={markAll}
              className="text-2xs font-semibold text-accent hover:underline"
            >
              Mark all read
            </button>
          </span>
        </PopoverHeader>
        <PopoverBody p={0} overflowY="auto" maxH="340px">
          {items.map((n) => {
            const dot =
              n.tone === "danger"
                ? "bg-danger"
                : n.tone === "warn"
                  ? "bg-warn"
                  : n.tone === "ok"
                    ? "bg-ok"
                    : n.tone === "info"
                      ? "bg-accent"
                      : "bg-ink-4";
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => markOne(n.id)}
                className={`flex w-full gap-2.5 border-b border-[#eef1f5] px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-2 ${
                  n.read ? "" : "bg-accent-soft/60"
                }`}
              >
                <span
                  className={`ml-1.5 mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className={`truncate text-tn ${n.read ? "text-ink-2" : "font-semibold text-ink"}`}
                    >
                      {n.title}
                    </span>
                    <span className="shrink-0 text-2xs text-ink-4 pr-5">
                      {n.time}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-2xs leading-snug text-ink-3">
                    {n.detail}
                  </span>
                </span>
              </button>
            );
          })}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export function HelpButton({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const [open, setOpen] = useState(false);
  const shortcuts: [string, string][] = [
    ["⌘K / Ctrl+K", "Open global search"],
    ["/", "Focus global search"],
    ["Enter", "Confirm the focused action"],
    ["Esc", "Close dialog, drawer or search"],
    ["Tab", "Move through controls in order"],
    ["← →", "Step through wizard or picker screens"],
  ];

  return (
    <>
      {variant === "icon" ? (
        <IconButton
          aria-label="Help and keyboard shortcuts"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          color="ink.700"
        >
          <HelpCircle size={16} />
        </IconButton>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-full items-center gap-2.5 rounded-[6px] px-2 text-tn text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <HelpCircle size={15} className="text-ink-3" />
          <span className="flex-1 text-left">Help</span>
          <span className="rounded-[4px] border border-line px-1 text-2xs text-ink-4">
            ?
          </span>
        </button>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} size="lg" isCentered>
        <ModalOverlay bg="rgba(16,24,40,0.45)" />
        <ModalContent borderRadius="8px">
          <ModalHeader fontSize="15px" borderBottomWidth="1px">
            Help &amp; keyboard shortcuts
          </ModalHeader>
          <ModalBody py={4}>
            <div className="mb-4 text-tn text-ink-2">
              WarehouseOS runs on keyboard-first workflows built for scan guns,
              pick tablets and desktop workstations.
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-2xs tracking-[0.06em] text-ink-3 uppercase">
                  <th
                    scope="col"
                    className="border-b border-line pb-1.5 font-semibold"
                  >
                    Shortcut
                  </th>
                  <th
                    scope="col"
                    className="border-b border-line pb-1.5 font-semibold"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map(([k, label]) => (
                  <tr
                    key={k}
                    className="border-b border-[#eef1f5] last:border-b-0"
                  >
                    <td className="py-2 pr-4">
                      <kbd className="rounded-[4px] border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-2xs font-semibold text-ink-2">
                        {k}
                      </kbd>
                    </td>
                    <td className="py-2 text-tn text-ink">{label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 rounded-[6px] border border-line bg-surface-2 p-3 text-2xs text-ink-3">
              Support:{" "}
              <span className="font-semibold text-ink-2">
                ops-support@warehouseos.io
              </span>{" "}
              · Shift hotline{" "}
              <span className="font-semibold text-ink-2">(614) 555-0177</span> ·
              Build 2026.10.7
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export function UserMenu({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const toast = useAppToast();

  const items = (
    <>
      <MenuItem
        icon={<UserRound size={14} />}
        fontSize="13px"
        onClick={() =>
          toast({
            title: "Profile",
            description: "Profile settings are not part of this demo.",
            status: "info",
          })
        }
      >
        Profile
      </MenuItem>
      <MenuItem
        icon={<Settings size={14} />}
        fontSize="13px"
        as={Link}
        to="/settings"
      >
        Settings
      </MenuItem>
      <MenuDivider />
      <MenuItem
        icon={<LogOut size={14} />}
        fontSize="13px"
        color="danger.600"
        onClick={() =>
          toast({
            title: "Signed out",
            description: "Demo session remains active.",
            status: "info",
          })
        }
      >
        Sign out
      </MenuItem>
    </>
  );

  if (variant === "row") {
    return (
      <Menu placement="top-end">
        <MenuButton
          as={Button}
          variant="ghost"
          w="full"
          h="auto"
          py="7px"
          px="8px"
          justifyContent="flex-start"
          _hover={{ bg: "#f2f4f7" }}
        >
          <span className="flex w-full items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6edf3] text-2xs font-bold text-ink-2">
              {currentOperator.initials}
            </span>
            <span className="min-w-0 flex-1 text-left leading-tight">
              <span className="block truncate text-tn font-semibold text-ink">
                {currentOperator.name}
              </span>
              <span className="block truncate text-2xs text-ink-3">
                {currentOperator.role}
              </span>
            </span>
            <ChevronDown size={13} className="shrink-0 text-ink-4" />
          </span>
        </MenuButton>
        <MenuList minW="210px" zIndex={40}>
          {items}
        </MenuList>
      </Menu>
    );
  }

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="User menu"
        variant="ghost"
        size="sm"
        borderRadius="full"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e6edf3] text-2xs font-bold text-ink-2">
          {currentOperator.initials}
        </span>
      </MenuButton>
      <MenuList minW="210px" zIndex={40}>
        <div className="border-b border-line px-3 py-2">
          <div className="text-tn font-semibold text-ink">
            {currentOperator.name}
          </div>
          <div className="text-2xs text-ink-3">{currentOperator.email}</div>
        </div>
        {items}
      </MenuList>
    </Menu>
  );
}

export function RailSpacer() {
  return <div className="h-2" aria-hidden />;
}

export function CloseHint() {
  return (
    <span className="inline-flex items-center gap-1 text-2xs text-ink-4">
      <X size={11} /> esc
    </span>
  );
}
