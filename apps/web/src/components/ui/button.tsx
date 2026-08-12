import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-[44px] max-w-full items-center justify-center gap-2 whitespace-normal rounded-lg text-center text-sm font-medium leading-tight ring-offset-background transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] sm:whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-orange-deep shadow-soft hover:shadow-card",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Promorang custom variants
        hero: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-elevated font-semibold",
        warm: "bg-cream-dark text-charcoal hover:bg-cream border border-border",
        accent: "bg-accent text-accent-foreground hover:bg-yellow-bright shadow-soft",
        moment: "bg-card text-card-foreground border-2 border-primary/20 hover:border-primary hover:shadow-card",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-10 rounded-md px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
