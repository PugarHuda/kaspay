import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-2 border-foreground rounded-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-brutal-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-brutal-sm",
        outline:
          "bg-card text-foreground shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-brutal-sm hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-brutal hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-brutal-sm",
        ghost: "border-transparent shadow-none hover:bg-muted",
        link: "border-transparent shadow-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
