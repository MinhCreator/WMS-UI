import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Checkbox,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Select,
  Skeleton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EmptyState } from "./States";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  hideBelow?: "md" | "lg" | "xl";
  cell?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  mono?: boolean;
  nowrap?: boolean;
  menuHidden?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selected?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  pageSize?: number;
  paginated?: boolean;
  bulkActions?: ReactNode;
  rowActions?: (row: T) => ReactNode;
  maxHeight?: string | number;
  minWidth?: string | number;
  footerNote?: ReactNode;
  highlightRow?: (row: T) => boolean;
}

const hideClass = (below?: "md" | "lg" | "xl") => {
  if (below === "xl") return "hidden xl:table-cell";
  if (below === "lg") return "hidden lg:table-cell";
  if (below === "md") return "hidden md:table-cell";
  return "";
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  selectable,
  selected,
  onSelectionChange,
  onRowClick,
  defaultSort,
  loading,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pageSize: pageSizeProp = 25,
  paginated = true,
  bulkActions,
  rowActions,
  maxHeight = "calc(100vh - 348px)",
  minWidth,
  footerNote,
  highlightRow,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(
    defaultSort ?? null,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeProp);
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [hiddenCols, setHiddenCols] = useState<string[]>(
    columns.filter((c) => c.menuHidden).map((c) => c.key),
  );

  const selection = selected ?? internalSelected;
  const setSelection = (ids: string[]) => {
    (onSelectionChange ?? setInternalSelected)(ids);
  };

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenCols.includes(c.key)),
    [columns, hiddenCols],
  );

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    const get = col.sortValue;
    if (!get) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [data, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = paginated ? sorted.slice((safePage - 1) * pageSize, safePage * pageSize) : sorted;

  useEffect(() => {
    setPage(1);
  }, [sorted.length, pageSize]);

  const pageIds = pageRows.map(rowKey);
  const selectedOnPage = pageIds.filter((id) => selection.includes(id));
  const allOnPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

  const toggleAll = () => {
    if (allOnPageSelected) {
      setSelection(selection.filter((id) => !pageIds.includes(id)));
    } else {
      setSelection(Array.from(new Set([...selection, ...pageIds])));
    }
  };

  const toggleRow = (id: string) => {
    if (selection.includes(id)) setSelection(selection.filter((x) => x !== id));
    else setSelection([...selection, id]);
  };

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    setSort((prev) =>
      prev?.key === col.key
        ? prev.dir === "asc"
          ? { key: col.key, dir: "desc" }
          : null
        : { key: col.key, dir: "asc" },
    );
  };

  const from = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(sorted.length, safePage * pageSize);
  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

  return (
    <div>
      {selectable && selection.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-accent-line bg-accent-soft px-3 py-2">
          <span className="text-tn font-semibold text-accent-strong">
            {selection.length} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">{bulkActions}</div>
          <button
            type="button"
            className="ml-auto text-2xs font-semibold text-accent hover:underline"
            onClick={() => setSelection([])}
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-auto" style={{ maxHeight }}>
        <Table variant="wms" size="sm" style={{ width: "100%", minWidth }}>
          <Thead>
            <Tr>
              {selectable && (
                <Th
                  scope="col"
                  position="sticky"
                  top={0}
                  zIndex={3}
                  width="38px"
                  px="10px"
                  bg="#f8fafc"
                >
                  <Checkbox
                    isChecked={allOnPageSelected}
                    isIndeterminate={someOnPageSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows on this page"
                    size="sm"
                  />
                </Th>
              )}
              {visibleColumns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <Th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      active
                        ? sort?.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : col.sortable
                          ? "none"
                          : undefined
                    }
                    position="sticky"
                    top={0}
                    zIndex={2}
                    bg="#f8fafc"
                    width={col.width}
                    textAlign={col.align ?? "left"}
                    isNumeric={col.align === "right"}
                    cursor={col.sortable ? "pointer" : "default"}
                    userSelect="none"
                    whiteSpace="nowrap"
                    className={hideClass(col.hideBelow)}
                    onClick={() => toggleSort(col)}
                    _hover={col.sortable ? { color: "#344054" } : undefined}
                    title={col.sortable ? `Sort by ${col.header}` : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable &&
                        (active ? (
                          sort?.dir === "asc" ? (
                            <ArrowUp size={11} aria-hidden />
                          ) : (
                            <ArrowDown size={11} aria-hidden />
                          )
                        ) : (
                          <ChevronsUpDown size={11} className="opacity-45" aria-hidden />
                        ))}
                    </span>
                  </Th>
                );
              })}
              {rowActions && (
                <Th
                  scope="col"
                  position="sticky"
                  top={0}
                  zIndex={2}
                  bg="#f8fafc"
                  width="44px"
                  textAlign="right"
                  px="8px"
                >
                  <span className="sr-only">Actions</span>
                </Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {loading &&
              Array.from({ length: Math.min(pageSize, 8) }, (_, i) => (
                <Tr key={`sk-${i}`}>
                  {selectable && (
                    <Td px="10px">
                      <Skeleton height="14px" width="14px" borderRadius="3px" />
                    </Td>
                  )}
                  {visibleColumns.map((c) => (
                    <Td key={c.key} className={hideClass(c.hideBelow)}>
                      <Skeleton height="13px" width={`${40 + ((i * 17 + c.key.length * 7) % 50)}%`} />
                    </Td>
                  ))}
                  {rowActions && <Td />}
                </Tr>
              ))}

            {!loading &&
              pageRows.map((row) => {
                const id = rowKey(row);
                const isSelected = selection.includes(id);
                const isHighlighted = highlightRow?.(row) ?? false;
                return (
                  <Tr
                    key={id}
                    tabIndex={onRowClick ? 0 : undefined}
                    cursor={onRowClick ? "pointer" : undefined}
                    bg={isSelected ? "#f0f7fb" : isHighlighted ? "#fffbeb" : undefined}
                    _hover={{ bg: isSelected ? "#e6f1fa" : "#f8fafc" }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                  >
                    {selectable && (
                      <Td px="10px" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          isChecked={isSelected}
                          onChange={() => toggleRow(id)}
                          aria-label={`Select row ${id}`}
                          size="sm"
                        />
                      </Td>
                    )}
                    {visibleColumns.map((col) => (
                      <Td
                        key={col.key}
                        textAlign={col.align ?? "left"}
                        isNumeric={col.align === "right"}
                        whiteSpace={col.nowrap === false ? "normal" : "nowrap"}
                        className={`${hideClass(col.hideBelow)} ${col.mono ? "font-mono tnum" : ""}`}
                      >
                        {col.cell ? col.cell(row) : (row as unknown as Record<string, ReactNode>)[col.key]}
                      </Td>
                    ))}
                    {rowActions && (
                      <Td textAlign="right" px="8px" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </Td>
                    )}
                  </Tr>
                );
              })}

            {!loading && pageRows.length === 0 && (
              <Tr>
                <Td colSpan={colSpan} borderBottom="none">
                  <EmptyState
                    title={emptyTitle ?? "No records match the current filters"}
                    description={emptyDescription ?? "Adjust your filters or clear them to see more rows."}
                    action={emptyAction}
                  />
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2">
        <div className="flex items-center gap-3 text-2xs text-ink-3">
          <span className="tnum">
            {from}–{to} of {sorted.length} rows
          </span>
          {footerNote}
          {paginated && (
            <label className="flex items-center gap-1.5">
              <span className="hidden sm:inline">Rows</span>
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                w="68px"
                size="sm"
                aria-label="Rows per page"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </label>
          )}
          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              size="sm"
              variant="outline"
              colorScheme="gray"
              rightIcon={<ChevronDown size={13} />}
            >
              Columns
            </MenuButton>
            <MenuList minW="200px" zIndex={20}>
              <MenuOptionGroup
                title="Visible columns"
                type="checkbox"
                value={visibleColumns.map((c) => c.key)}
                onChange={(vals) =>
                  setHiddenCols(columns.filter((c) => !vals.includes(c.key)).map((c) => c.key))
                }
              >
                {columns.map((c) => (
                  <MenuItemOption key={c.key} value={c.key} fontSize="13px">
                    {c.header}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        </div>

        {paginated && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              leftIcon={<ChevronLeft size={13} />}
              isDisabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              Prev
            </Button>
            <span className="px-1 text-2xs tnum text-ink-3">
              Page {safePage} of {pageCount}
            </span>
            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              rightIcon={<ChevronRight size={13} />}
              isDisabled={safePage >= pageCount}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
