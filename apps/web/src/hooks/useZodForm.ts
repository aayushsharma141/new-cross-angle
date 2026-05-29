import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Standardized form hook combining react-hook-form with Zod validation.
 * Use this for all new admin forms. Existing forms using manual safeParse
 * should be migrated to this pattern when touched.
 *
 * @example
 * const form = useZodForm(leadSchema, { defaultValues: { name: "", email: "" } });
 * <form onSubmit={form.handleSubmit(onValid)}>
 *   <input {...form.register("name")} />
 *   {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
 * </form>
 */
export function useZodForm<T extends z.ZodType>(
  schema: T,
  props?: Omit<UseFormProps<z.infer<T>>, "resolver">
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    ...props,
  });
}
