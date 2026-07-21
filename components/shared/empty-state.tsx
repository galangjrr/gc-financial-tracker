import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-canvas rounded-[16px] border border-hairline">
      <div className="w-16 h-16 bg-surface-soft rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-ash" />
      </div>
      <h3 className="text-[22px] font-semibold text-ink mb-2 leading-[1.25]">{title}</h3>
      <p className="text-[16px] text-mute mb-8 max-w-sm leading-[1.4]">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-md h-10 px-4 text-[14px] font-bold bg-primary hover:bg-primary-pressed text-primary-foreground">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
