import type { ButtonHTMLAttributes, ReactElement, Ref } from "react";
import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-[999px] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EEEFF3] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[#C7D2FE] via-[#8B5CF6] to-[#4F46E5] text-[#1C1F2B] shadow-[0_18px_40px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.3)]",
        secondary:
          "bg-white text-[#2A2D3A] border border-[#E3E6EC] hover:bg-[#F4F5F9] shadow-[6px_6px_16px_rgba(209,212,217,0.7)]",
        ghost: "text-[#4F46E5] hover:bg-[#4F46E5]/10",
        outline:
          "border border-[#4F46E5]/70 text-[#4F46E5] hover:bg-[#4F46E5]/10 shadow-[6px_6px_16px_rgba(209,212,217,0.7)]"
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-7 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild && children) {
      const child = Children.only(children) as ReactElement;
      if (!isValidElement(child)) {
        throw new Error("Button with asChild requires a valid React element child.");
      }
      return cloneElement(child, {
        className: cn(classes, child.props.className),
        ref,
        ...props
      });
    }

    return (
      <button ref={ref as Ref<HTMLButtonElement>} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
