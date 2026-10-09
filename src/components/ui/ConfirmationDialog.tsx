import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useRef, type ReactNode } from "react";

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  details,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  details?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      isOpen={open}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay bg="rgba(16,24,40,0.45)" backdropFilter="blur(1px)">
        <AlertDialogContent maxW="440px" borderRadius="8px" borderWidth="1px" borderColor="#e4e7ec">
          <AlertDialogHeader fontSize="13px" fontWeight={600} pb={2}>
            {title}
          </AlertDialogHeader>
          <AlertDialogBody fontSize="13px" color="#475467" whiteSpace="pre-line">
            {message}
            {details && (
              <div className="mt-3 rounded-[6px] border border-line bg-surface-2 p-3 text-2xs text-ink-2">
                {details}
              </div>
            )}
          </AlertDialogBody>
          <AlertDialogFooter pt={2}>
            <Button ref={cancelRef} variant="outline" colorScheme="gray" onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button
              colorScheme={tone === "danger" ? "red" : "accent"}
              onClick={onConfirm}
              isLoading={loading}
              ml={3}
            >
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
