import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Terjadi Kesalahan", 
  message = "Maaf, sistem tidak dapat memproses permintaan Anda saat ini.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="bg-error/10 border border-error/20 rounded-[16px] p-6 flex items-start gap-4">
      <div className="bg-error/20 p-2 rounded-full shrink-0">
        <AlertTriangle className="w-6 h-6 text-error" />
      </div>
      <div className="flex-1">
        <h4 className="text-error font-bold mb-1">{title}</h4>
        <p className="text-mute text-[14px] mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="rounded-md h-10 border-error text-error hover:bg-error/10">
            Coba Lagi
          </Button>
        )}
      </div>
    </div>
  );
}
