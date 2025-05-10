import { cn } from "@/lib/utils";

interface ScanOverlayProps {
  className?: string;
}

export function ScanOverlay({ className }: ScanOverlayProps) {
  return (
    <div className={cn("scan-overlay flex items-center justify-center", className)}>
      <div className="scan-corner top-left"></div>
      <div className="scan-corner top-right"></div>
      <div className="scan-corner bottom-left"></div>
      <div className="scan-corner bottom-right"></div>
      <div className="scan-line"></div>
    </div>
  );
}
