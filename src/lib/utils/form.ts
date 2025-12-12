import type { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

export const showToast = ({
  title,
  variant = "default",
  description,
}: {
  title: string;
  variant?: "default" | "error" | "success";
  description?: string;
}) => {
  if (variant === "error") {
    toast.error(title, { description });
  } else if (variant === "success") {
    toast.success(title, { description });
  } else {
    toast(title, { description });
  }
};

export const handleFormError = ({
  setError,
  error,
}: {
  setError: UseFormSetError<any>;
  error: any;
}) => {
  if (error.response) {
    const errors = error.response.data?.errors ?? {};
    if (errors.common) {
      showToast({
        title: errors.common?.msg,
        variant: "error",
      });
      return;
    }
    const arrayErrors = Object.values(errors) ?? [];

    arrayErrors.map((error: any) =>
      setError(error.path, { message: error.msg })
    );
  } else {
    showToast({
      title: error.response?.data?.errors?.common?.msg || "An error occurred",
      variant: "error",
    });
  }
};
