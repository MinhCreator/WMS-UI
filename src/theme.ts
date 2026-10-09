import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const accent = {
  50: "#f0f7fb",
  100: "#dceefa",
  200: "#bfe3f7",
  300: "#93d2f1",
  400: "#54b7e5",
  500: "#2196c9",
  600: "#0369a1",
  700: "#075985",
  800: "#0c4a6e",
  900: "#0c3a54",
};

const theme = extendTheme({
  config,
  fonts: { heading: FONT, body: FONT, mono: MONO },
  colors: { accent },
  radii: { sm: "4px", md: "6px", lg: "8px", xl: "10px", "2xl": "12px" },
  styles: {
    global: {
      "html, body": { bg: "#f2f4f7", color: "#101828" },
      body: { fontSize: "13px", fontFamily: FONT },
      table: { fontVariantNumeric: "tabular-nums" },
      "::selection": { bg: "#bae6fd" },
    },
  },
  components: {
    Button: {
      baseStyle: { borderRadius: "6px", fontWeight: 600, letterSpacing: "0" },
      sizes: {
        sm: { h: "32px", minW: "32px", px: "12px", fontSize: "13px" },
        md: { h: "36px", minW: "36px", px: "14px", fontSize: "13px" },
        lg: { h: "48px", minW: "48px", px: "22px", fontSize: "16px" },
        xl: { h: "60px", minW: "60px", px: "28px", fontSize: "18px" },
      },
      defaultProps: { colorScheme: "accent", size: "sm" },
    },
    Input: {
      sizes: { sm: { field: { h: "32px", fontSize: "13px", px: "10px" } } },
      defaultProps: { size: "sm", focusBorderColor: "accent.500" },
    },
    Select: {
      sizes: {
        sm: {
          field: { h: "32px", fontSize: "13px", pr: "26px" },
          addon: { h: "32px", fontSize: "13px" },
        },
      },
      defaultProps: { size: "sm", focusBorderColor: "accent.500" },
    },
    Textarea: { defaultProps: { focusBorderColor: "accent.500" } },
    NumberInput: { defaultProps: { size: "sm" } },
    Table: {
      variants: {
        wms: {
          th: {
            fontSize: "11px",
            fontWeight: 600,
            color: "#667085",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            borderBottomWidth: "1px",
            borderBottomColor: "#e4e7ec",
            bg: "#f8fafc",
            px: "12px",
            py: "8px",
          },
          td: {
            fontSize: "13px",
            color: "#101828",
            borderBottomWidth: "1px",
            borderBottomColor: "#eef1f5",
            px: "12px",
            py: "7px",
          },
        },
      },
      defaultProps: { variant: "wms", size: "sm" },
    },
    Tabs: {
      variants: {
        line: {
          tab: {
            fontSize: "13px",
            fontWeight: 500,
            color: "#667085",
            px: "12px",
            py: "8px",
            _selected: { color: "#101828", fontWeight: 600 },
          },
          indicator: { bg: "#0369a1", borderRadius: "0", height: "2px" },
        },
      },
      defaultProps: { variant: "line", size: "sm" },
    },
    Drawer: {
      sizes: { xs: "340px", sm: "440px", md: "560px", lg: "720px", xl: "900px" },
    },
    Modal: { borderRadius: "8px" },
    Menu: {
      baseStyle: {
        list: { borderRadius: "8px", border: "1px solid #e4e7ec", boxShadow: "0 6px 16px -4px rgb(16 24 40 / 0.12)", minW: "180px" },
        item: { fontSize: "13px", py: "7px", borderRadius: "0" },
      },
    },
    Tooltip: {
      baseStyle: {
        fontSize: "12px",
        borderRadius: "6px",
        bg: "#101828",
        px: "8px",
        py: "4px",
      },
    },
    Badge: { baseStyle: { fontWeight: 600, borderRadius: "4px", textTransform: "none" } },
    Tag: { baseStyle: { borderRadius: "4px" } },
    Switch: { baseStyle: { track: { bg: "#d0d5dd" } } },
    Checkbox: { baseStyle: { control: { borderRadius: "4px" } } },
    Card: { baseStyle: { container: { borderRadius: "8px" } } },
  },
});

export default theme;
