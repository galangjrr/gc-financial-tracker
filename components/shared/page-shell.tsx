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
    <div className={cn("min-h-screen pb-20 md:pb-8 bg-surface-soft text-body", className)}>
      {/* Header Area */}
      <div className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 py-4 md:px-8">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-ink tracking-tight leading-[1.25]">{title}</h1>
            {subtitle && <p className="text-[14px] text-mute mt-1 leading-[1.4]">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto p-4 md:p-8 space-y-8">
        {children}
      </main>
    </div>
  );
}
