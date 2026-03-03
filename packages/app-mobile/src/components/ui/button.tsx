import { cn } from "@readany/core/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm active:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-sm active:bg-destructive/90",
        outline:
          "border border-border bg-background shadow-sm active:bg-accent active:text-accent-foreground",
        secondary:
          "bg-muted text-foreground shadow-sm active:bg-muted/80",
        ghost: "active:bg-accent active:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "bg-neutral-200/60 text-neutral-900 active:bg-neutral-200",
      },
      size: {
        default: "h-11 px-4 py-3",
        sm: "h-9 rounded-md gap-1.5 px-3",
        lg: "h-12 rounded-md px-6",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
