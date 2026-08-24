import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldWrapperProps {
  label: string;
  erro?: string;
  htmlFor: string;
  children: React.ReactNode;
  auxilio?: string;
}

export function FieldWrapper({ label, erro, htmlFor, children, auxilio }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-700">
        {label}
      </label>
      {children}
      {auxilio && !erro && <p className="text-xs text-ink-400">{auxilio}</p>}
      {erro && <p className="text-xs font-medium text-red-600">{erro}</p>}
    </div>
  );
}

const inputBase =
  'focus-ring w-full rounded-md border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 disabled:bg-ink-50';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string;
  auxilio?: string;
}

export const Input = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, erro, auxilio, id, className, ...props }, ref) => {
    const inputId = id ?? props.name ?? label;
    return (
      <FieldWrapper label={label} erro={erro} htmlFor={inputId} auxilio={auxilio}>
        <input
          ref={ref}
          id={inputId}
          className={cn(inputBase, erro ? 'border-red-300' : 'border-ink-200', className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
Input.displayName = 'Input';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  erro?: string;
  auxilio?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, erro, auxilio, id, className, ...props }, ref) => {
    const inputId = id ?? props.name ?? label;
    return (
      <FieldWrapper label={label} erro={erro} htmlFor={inputId} auxilio={auxilio}>
        <textarea
          ref={ref}
          id={inputId}
          className={cn(inputBase, 'resize-y', erro ? 'border-red-300' : 'border-ink-200', className)}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
Textarea.displayName = 'Textarea';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  erro?: string;
  auxilio?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, erro, auxilio, id, className, children, ...props }, ref) => {
    const inputId = id ?? props.name ?? label;
    return (
      <FieldWrapper label={label} erro={erro} htmlFor={inputId} auxilio={auxilio}>
        <select
          ref={ref}
          id={inputId}
          className={cn(inputBase, erro ? 'border-red-300' : 'border-ink-200', className)}
          {...props}
        >
          {children}
        </select>
      </FieldWrapper>
    );
  },
);
Select.displayName = 'Select';
