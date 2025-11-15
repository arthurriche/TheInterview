import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
}

export function Section({ className, title, subtitle, eyebrow, children, ...rest }: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)} {...rest}>
      {(eyebrow || title || subtitle) && (
        <header className="space-y-2">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.3em] text-[#4F46E5]">{eyebrow}</p>
          ) : null}
          {title ? <h2 className="text-2xl font-bold text-[#2A2D3A]">{title}</h2> : null}
          {subtitle ? <p className="text-sm text-[#6B7280]">{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}
