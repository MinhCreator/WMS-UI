import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { Calendar, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

export const rangePresets = [
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
  "This month",
  "Last month",
  "Quarter to date",
  "Year to date",
];

export function DateRangePicker({
  value,
  onChange,
  presets = rangePresets,
  size = "sm",
}: {
  value: string;
  onChange: (v: string) => void;
  presets?: string[];
  size?: "sm" | "md";
}) {
  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={Button}
        size={size}
        variant="outline"
        colorScheme="gray"
        leftIcon={<Calendar size={13} />}
        rightIcon={<ChevronDown size={13} />}
        className="min-w-[150px] justify-between"
      >
        {value}
      </MenuButton>
      <MenuList minW="190px" zIndex={30}>
        {presets.map((p) => (
          <MenuItem
            key={p}
            onClick={() => onChange(p)}
            fontSize="13px"
            bg={p === value ? "accent.50" : undefined}
            fontWeight={p === value ? 600 : 400}
          >
            <span className="flex w-full items-center justify-between gap-3">
              {p}
              {p === value && <Check size={13} className="text-accent" />}
            </span>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

export function useRange(initial = "Last 7 days") {
  return useState(initial);
}
