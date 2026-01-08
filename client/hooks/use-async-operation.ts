import { useState, useCallback } from "react";
import { useErrorHandler } from "./use-error-handler";
import { useToast } from "@/hooks/use-toast.hook";
import { SUCCESS_MESSAGES } from "@/constants/app.constants";

interface UseAsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorTitle?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useAsyncOperation<T = void>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  const execute = useCallback(
    async (
      operation: () => Promise<T>,
      options: UseAsyncOperationOptions<T> = {}
    ): Promise<T | undefined> => {
      const {
        onSuccess,
        onError,
        successMessage = SUCCESS_MESSAGES.SAVED,
        errorTitle = "Erro",
        showSuccessToast = true,
        showErrorToast = true,
      } = options;

      setLoading(true);
      setError(null);

      try {
        const result = await operation();

        if (showSuccessToast && successMessage) {
          toast({
            title: "Sucesso",
            description: successMessage,
            variant: "success",
          });
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err);

        if (showErrorToast) {
          handleError(err, { defaultTitle: errorTitle });
        }

        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError, toast]
  );

  return { execute, loading, error };
}

