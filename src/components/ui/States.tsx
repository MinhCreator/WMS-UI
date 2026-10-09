import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw, ServerCrash } from "lucide-react";
import { Button, Spinner } from "@chakra-ui/react";

export function EmptyState({
  title = "No records found",
  description,
  action,
  icon,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] border border-line bg-surface-2 text-ink-4">
        {icon ?? <Inbox size={18} />}
      </div>
      <div className="text-tn font-semibold text-ink">{title}</div>
      {description && (
        <p className="mt-1 max-w-sm text-2xs text-ink-3">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "The request failed. Check your connection and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[8px] border border-danger-line bg-danger-bg text-danger">
        <ServerCrash size={18} />
      </div>
      <div className="text-tn font-semibold text-ink">{title}</div>
      <p className="mt-1 max-w-sm text-2xs text-ink-3">{description}</p>
      {onRetry && (
        <Button mt={4} size="sm" variant="outline" colorScheme="gray" leftIcon={<RefreshCw size={13} />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-12 text-ink-3">
      <Spinner size="sm" color="accent.500" />
      <span className="text-2xs font-medium">{label}</span>
    </div>
  );
}

export function WarningBanner({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-[6px] border border-warn-line bg-warn-bg px-3 py-2.5">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" />
      <div className="min-w-0 flex-1">
        <div className="text-tn font-semibold text-warn">{title}</div>
        {children && <div className="mt-0.5 text-2xs text-ink-2">{children}</div>}
      </div>
      {action}
    </div>
  );
}
