import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import type { ReactNode } from "react";

export function FilterBar({
  children,
  activeCount = 0,
  onClear,
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
}: {
  children?: ReactNode;
  activeCount?: number;
  onClear?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const search =
    onSearchChange !== undefined ? (
      <div className="relative w-full min-w-[200px] max-w-[300px] shrink">
        <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-4" />
        <Input
          value={searchValue ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          pl="30px"
          pr={searchValue ? "28px" : "10px"}
          aria-label={searchPlaceholder}
        />
        {searchValue && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-4 hover:text-ink-2"
          >
            <X size={13} />
          </button>
        )}
      </div>
    ) : null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
      <div className="hidden w-full flex-wrap items-center gap-2 lg:flex">
        {search}
        {children}
        {activeCount > 0 && onClear && (
          <>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-2xs font-bold text-white">
              {activeCount}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="text-2xs font-semibold text-accent hover:underline"
            >
              Clear all
            </button>
          </>
        )}
      </div>

      <div className="flex w-full items-center gap-2 lg:hidden">
        {search}
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[6px] border border-line-strong bg-surface px-3 text-tn font-semibold text-ink-2"
        >
          <Filter size={13} />
          Filters
          {activeCount > 0 && (
            <span className="ml-0.5 rounded-full bg-accent px-1.5 text-2xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <Drawer isOpen={isOpen} onClose={onClose} placement="left" size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" fontSize="14px">
            Filters
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-3 pt-4">
            <div className="flex flex-col gap-3">{children}</div>
            {activeCount > 0 && onClear && (
              <button type="button" onClick={onClear} className="self-start text-tn font-semibold text-accent">
                Clear all filters ({activeCount})
              </button>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  minWidth = "195px",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  minWidth?: string;
}) {
  return (
    <label className="flex items-center gap-1.5" style={{ minWidth }}>
      <span className="shrink-0 text-2xs font-semibold tracking-[0.05em] text-ink-3 uppercase">
        {label}
      </span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        flex="1"
        minW={0}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </label>
  );
}

export function MoreFiltersButton({ count = 0, onClick }: { count?: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-line-strong bg-surface px-2.5 text-tn font-medium text-ink-2 hover:bg-surface-2"
    >
      <Filter size={13} />
      More filters
      {count > 0 && (
        <span className="rounded-full bg-accent px-1.5 text-2xs font-bold text-white">{count}</span>
      )}
      <ChevronDown size={13} className="text-ink-4" />
    </button>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel,
  width = "260px",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  width?: string;
}) {
  return (
    <div className="relative" style={{ width }}>
      <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-4" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        pl="30px"
        pr={value ? "28px" : "10px"}
        aria-label={ariaLabel ?? placeholder}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-4 hover:text-ink-2"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
