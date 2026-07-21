"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showSearch?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, icon, showSearch, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--fg-primary)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {(icon || showSearch) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]">
              {icon || <Search className="w-4 h-4" />}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-lg border bg-[var(--surface-1)] text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)]
              ${icon || showSearch ? "pl-10" : "pl-3"}
              pr-3 py-2.5 text-sm
              ${error ? "border-[var(--state-danger)]" : "border-[var(--border-default)] focus:border-[var(--accent-primary)]"}
              focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20
              ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-[var(--state-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
