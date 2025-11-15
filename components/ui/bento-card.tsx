import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const bentoCardVariants = cva(
  "bento-card relative overflow-hidden rounded-[28px] border border-[#E3E6EC] bg-white shadow-[25px_25px_60px_rgba(201,204,211,0.6),-25px_-25px_60px_#FFFFFF]",
  {
    variants: {
      emphasis: {
        default: "",
        primary: "ring-1 ring-[#4F46E5]/30",
        accent: "ring-1 ring-[#F59E0B]/40"
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      }
    },
    defaultVariants: {
      emphasis: "default",
      padding: "md"
    }
  }
);

export interface BentoCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoCardVariants> {}

export function BentoCard({ className, emphasis, padding, ...props }: BentoCardProps) {
  return (
    <div className={cn(bentoCardVariants({ emphasis, padding }), className)} {...props} />
  );
}
