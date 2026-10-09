import { useRef, useState } from "react";
import { ScanLine, Check, Keyboard } from "lucide-react";

export function BarcodeScanner({
  label = "Scan barcode",
  placeholder = "Scan or type code, then press Enter",
  onScan,
  hint,
  large = false,
}: {
  label?: string;
  placeholder?: string;
  onScan?: (code: string) => void;
  hint?: string;
  large?: boolean;
}) {
  const [value, setValue] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const code = value.trim();
    if (!code) return;
    setLast(code);
    setOk(true);
    onScan?.(code);
    setValue("");
    window.setTimeout(() => setOk(false), 1400);
  };

  return (
    <div className="rounded-[8px] border border-line bg-surface-2 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-2xs font-semibold tracking-[0.06em] text-ink-3 uppercase">
          {label}
        </span>
        <span className="inline-flex items-center gap-1.5 text-2xs text-ok">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ok" />
          Scanner ready
        </span>
      </div>

      <div className={`relative flex items-center ${large ? "h-14" : "h-10"}`}>
        <ScanLine
          size={large ? 22 : 16}
          className="pointer-events-none absolute left-3 text-accent"
          aria-hidden
        />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={placeholder}
          aria-label={label}
          autoComplete="off"
          className={`h-full w-full rounded-[6px] border border-line-strong bg-white pr-3 font-mono tracking-wide text-ink placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-4 focus:border-accent focus:outline-none ${
            large ? "pl-11 text-[20px]" : "pl-9 text-tn"
          }`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute right-3 flex items-center gap-1 text-2xs transition-opacity ${
            ok ? "text-ok opacity-100" : "opacity-0"
          }`}
        >
          <Check size={13} /> Accepted
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-2xs text-ink-3">
        <span className="inline-flex items-center gap-1">
          <Keyboard size={11} aria-hidden /> Enter to submit
          {hint ? ` · ${hint}` : ""}
        </span>
        {last && (
          <span className="font-mono text-ink-2">
            Last scan: <span className="font-semibold text-ink">{last}</span>
          </span>
        )}
      </div>
    </div>
  );
}
