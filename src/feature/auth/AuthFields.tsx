import { AlertCircle, ChevronDown, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

const inputBase =
  "h-9 w-full rounded-[6px] border bg-surface text-tn text-ink transition-colors outline-none placeholder:text-ink-4 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3";

function borderState(invalid?: boolean) {
  return invalid
    ? "border-danger! hover:border-danger! focus:border-danger! focus:ring-2 focus:ring-danger/10"
    : "border-line-strong! hover:border-ink-4! focus:border-accent! focus:ring-2 focus:ring-accent/20";
}

function Field({
  id,
  label,
  action,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  action?: ReactNode;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-tn font-medium text-ink">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 flex items-center gap-1 text-2xs font-medium text-danger"
        >
          <AlertCircle size={11} className="shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-2xs text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  error?: string;
  hint?: string;
  action?: ReactNode;
}

export function TextInput({
  id,
  label,
  icon,
  trailing,
  error,
  hint,
  action,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <Field id={id} label={label} action={action} error={error} hint={hint}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center text-ink-4">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`${inputBase} ${borderState(!!error)} ${
            icon ? "pl-9" : "pl-3"
          } ${trailing ? "pr-10" : "pr-3"} ${className}`}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />
        {trailing}
      </div>
    </Field>
  );
}

export function PasswordInput({
  ...props
}: Omit<TextInputProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <TextInput
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[4px] text-ink-4 transition-colors hover:bg-surface-2 hover:text-ink-2"
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      }
    />
  );
}

export interface SelectInputProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
  action?: ReactNode;
}

export function SelectInput({
  id,
  label,
  icon,
  error,
  hint,
  action,
  children,
  className = "",
  ...props
}: SelectInputProps) {
  return (
    <Field id={id} label={label} action={action} error={error} hint={hint}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center text-ink-4">
            {icon}
          </span>
        )}
        <select
          id={id}
          className={`${inputBase} cursor-pointer appearance-none ${borderState(!!error)} ${
            icon ? "pl-9" : "pl-3"
          } pr-8 ${className}`}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center text-ink-4">
          <ChevronDown size={14} />
        </span>
      </div>
    </Field>
  );
}

export function AuthButton({
  loading = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-accent px-3 text-tn font-semibold text-white shadow-[0_1px_2px_rgb(16_24_40/0.10)] transition-colors hover:bg-accent-strong active:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-2xs font-medium text-ink-4">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
