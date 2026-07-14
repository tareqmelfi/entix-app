import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const baseField =
  "focus-ring w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 transition focus:border-violet disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input ref={ref} id={inputId} className={cn(baseField, error && "border-danger", className)} {...props} />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(baseField, "min-h-[80px] resize-y", error && "border-danger", className)}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <select ref={ref} id={inputId} className={cn(baseField, "cursor-pointer", className)} {...props}>
          {children}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
