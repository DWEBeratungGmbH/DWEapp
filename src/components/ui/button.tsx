// Button Komponente - CASCADE konform
// Alle Varianten zentral definiert mit CSS-Variablen

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Basis-Styles für alle Buttons
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // CASCADE Button-Varianten mit CSS-Variablen
      variant: {
        // Primary: Grün (Hauptaktion) - Dunkle Schrift für besseren Kontrast
        default: "bg-[var(--accent)] text-[#1F2121] hover:bg-[var(--accent-hover)]",
        
        // Secondary: Grauer Hintergrund
        secondary: "bg-[var(--bg-tertiary)] text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--accent-muted)]",
        
        // Outline: Transparenter Hintergrund mit Border
        outline: "border border-[var(--border)] bg-transparent text-[var(--primary)] hover:bg-[var(--bg-tertiary)]",
        
        // Ghost: Komplett transparent
        ghost: "bg-transparent text-[var(--primary)] hover:bg-[var(--accent-muted)]",
        
        // Destructive: Rot (Löschen/Gefahr)
        destructive: "bg-[var(--error)] text-white hover:bg-red-600",
        
        // Success: Grün (Erfolgreich) - Dunkle Schrift für Kontrast
        success: "bg-[var(--success)] text-[#1F2121] hover:bg-green-400",
        
        // Warning: Orange (Warnung)
        warning: "bg-[var(--warning)] text-white hover:bg-orange-600",
        
        // Info: Teal (Information)
        info: "bg-[var(--info)] text-white hover:bg-teal-600",
        
        // Link: Nur Text
        link: "text-[var(--accent)] underline-offset-4 hover:underline bg-transparent",
      },
      // Button-Größen
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
