import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | undefined;
  helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, children, ...props }, ref) => {
    const id = props.id || props.name;

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#4A4E5E]">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-[var(--radius)] border border-[#E0E4EE] bg-white px-4 py-3 text-sm text-[#2A2D3A] shadow-[inset_4px_4px_12px_rgba(209,212,217,0.6)]",
            "focus:border-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error && "border-rose-300 focus:ring-rose-200",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-rose-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#6B7280]">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
