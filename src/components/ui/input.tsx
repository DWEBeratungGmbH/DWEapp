// Input Komponente - CASCADE konform
// Zentral definiert mit CSS-Variablen

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  // Basis-Styles für alle Inputs
  "flex w-full rounded-lg text-sm text-[var(--primary)] bg-[var(--bg-primary)] border border-[var(--border)] transition-colors placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
  {
    variants: {
      // Input-Varianten
      variant: {
        // Standard: Weißer Hintergrund
        default: "bg-[var(--bg-primary)]",
        
        // Filled: Grauer Hintergrund
        filled: "bg-[var(--bg-tertiary)] border-transparent focus-visible:border-[var(--accent)]",
        
        // Error: Roter Border
        error: "border-[var(--error)] focus-visible:ring-[var(--error)]",
        
        // Success: Grüner Border
        success: "border-[var(--success)] focus-visible:ring-[var(--success)]",
      },
      // Input-Größen
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-2 py-1 text-xs",
        lg: "h-12 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
