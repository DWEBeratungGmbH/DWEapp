// Card Komponente - CASCADE konform
// Zentral definiert mit CSS-Variablen

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  // Basis-Styles für alle Cards
  "rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--primary)] transition-shadow",
  {
    variants: {
      // Card-Varianten
      variant: {
        // Standard: Weißer Hintergrund
        default: "bg-[var(--bg-secondary)] shadow-[var(--shadow-sm)]",
        
        // Elevated: Mit Schatten
        elevated: "bg-[var(--bg-secondary)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
        
        // Outline: Nur Border, kein Schatten
        outline: "bg-transparent border-[var(--border)]",
        
        // Muted: Grauer Hintergrund
        muted: "bg-[var(--bg-tertiary)] border-transparent",
        
        // Success: Grüner Akzent
        success: "bg-[var(--bg-secondary)] border-l-4 border-l-[var(--success)]",
        
        // Warning: Oranger Akzent
        warning: "bg-[var(--bg-secondary)] border-l-4 border-l-[var(--warning)]",
        
        // Error: Roter Akzent
        error: "bg-[var(--bg-secondary)] border-l-4 border-l-[var(--error)]",
        
        // Info: Teal Akzent
        info: "bg-[var(--bg-secondary)] border-l-4 border-l-[var(--info)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-[var(--primary)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--secondary)]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-2 p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
