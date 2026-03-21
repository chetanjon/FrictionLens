import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionWrapperProps = {
  id?: string;
  label?: string;
  title?: string;
  children: ReactNode;
  alt?: boolean;
};

export function SectionWrapper({
  id,
  label,
  title,
  children,
  alt = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("py-13", alt && "bg-slate-100/50")}
    >
      <div className="mx-auto max-w-[920px] px-7">
        {title && (
          <div className="mb-8">
            {label && (
              <div className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-friction-blue">
                {label}
              </div>
            )}
            <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
