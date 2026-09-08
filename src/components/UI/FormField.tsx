import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';

import { Input, type InputProps } from '@/components/UI/Input';

// id/aria-invalid/aria-describedby are also omitted — Input derives them
// from the error state; caller overrides would break that wiring.
type FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = Omit<
  InputProps,
  | 'name'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'onBlur'
  | 'ref'
  | 'error'
  | 'id'
  | 'aria-invalid'
  | 'aria-describedby'
> & {
  control: Control<TFieldValues>;
  name: TName;
};

/**
 * Type-safe field bridge between react-hook-form and `<Input>`.
 *
 * Validation messages come from the resolver attached to `useForm`
 * (e.g. `zodResolver(schema)`) — no need to thread errors manually.
 *
 * @example
 * const schema = z.object({ email: z.string().email() });
 * const { control, handleSubmit } = useForm({ resolver: zodResolver(schema) });
 *
 * <form onSubmit={handleSubmit(onSubmit)}>
 *   <FormField control={control} name="email" label="Email" type="email" />
 * </form>
 */
function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  control,
  name,
  ...rest
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...rest}
          name={field.name}
          value={String(field.value ?? '')}
          onChange={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
          error={fieldState.error?.message ?? null}
        />
      )}
    />
  );
}

export { FormField };
export type { FormFieldProps };
