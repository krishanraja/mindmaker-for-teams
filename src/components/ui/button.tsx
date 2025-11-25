import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-mint text-ink hover:bg-mint/90 shadow-lg hover:shadow-xl hover:scale-105 transition-all",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-mint text-mint hover:bg-mint/10 hover:border-mint/80 transition-all",
        secondary: "bg-ink text-white hover:bg-ink/90 transition-colors",
        ghost: "hover:bg-mint/10 hover:text-ink transition-colors",
        link: "text-mint underline-offset-4 hover:underline",
        hero: "bg-mint text-ink hover:bg-mint/90 transform hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold",
        "hero-primary": "bg-mint text-ink hover:bg-mint/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold",
        "hero-secondary": "bg-transparent text-white border-2 border-mint/50 hover:bg-mint/10 hover:border-mint shadow-md hover:shadow-lg transition-all duration-300 font-medium backdrop-blur-sm",
        cta: "bg-mint text-ink hover:bg-mint/90 shadow-md hover:shadow-lg hover:scale-105 font-semibold transition-all",
        enterprise: "bg-card text-card-foreground border-2 border-border hover:border-mint hover:bg-mint/5 shadow-sm hover:shadow-md transition-all",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-full",
        sm: "h-9 rounded-full px-4",
        lg: "h-12 rounded-full px-6",
        xl: "h-14 rounded-full px-10 text-base",
        icon: "h-10 w-10 rounded-full",
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