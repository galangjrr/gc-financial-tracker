import React from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageShell({ title, subtitle, children, action, className }: PageShellProps) {
  return (
    <div className={cn("min-h-screen pb-20 md:pb-8 bg-surface-soft text-body w-full max-w-full overflow-x-hidden", className)}>
      {/* Header Area */}
      <div className="bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 py-4 md:px-8 w-full max-w-full">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-[20px] md:text-[22px] font-semibold text-ink tracking-tight leading-[1.25] truncate">{title}</h1>
            {subtitle && <p className="text-[13px] md:text-[14px] text-mute mt-0.5 leading-[1.4] truncate">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1280px] w-full mx-auto p-4 md:p-8 space-y-6 min-w-0 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
