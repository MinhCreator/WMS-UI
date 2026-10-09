import { useToast } from "@chakra-ui/react";

export interface ToastInput {
  title: string;
  description?: string;
  status?: "success" | "error" | "info" | "warning";
}

export function useAppToast() {
  const toast = useToast();
  return ({ title, description, status = "success" }: ToastInput) =>
    toast({
      title,
      description,
      status,
      duration: 4000,
      isClosable: true,
      position: "top-right",
      containerStyle: { fontSize: "13px", maxWidth: "380px", marginTop: "56px" },
    });
}
