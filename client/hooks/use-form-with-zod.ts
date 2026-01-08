import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema, TypeOf } from "zod";

/**
 * Hook wrapper para simplificar o uso de React Hook Form com Zod
 * 
 * @example
 * ```tsx
 * const form = useFormWithZod(medicineSchema, {
 *   defaultValues: { name: "", substance: "" }
 * });
 * ```
 */
export function useFormWithZod<T extends ZodSchema>(
  schema: T,
  options?: Omit<UseFormProps<TypeOf<T>>, "resolver">
): UseFormReturn<TypeOf<T>> {
  return useForm<TypeOf<T>>({
    resolver: zodResolver(schema),
    ...options,
  });
}

