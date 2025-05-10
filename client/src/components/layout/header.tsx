import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("bg-surface p-4 flex items-center justify-between shadow-md", className)}>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary p-1 flex items-center justify-center">
          <span className="material-icons text-dark">vpn_key</span>
        </div>
        <h1 className="ml-2 text-xl font-bold text-primary">KeyTrack Pro</h1>
      </div>
      <div className="flex items-center gap-2">
        <SyncIndicator />
        <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-dark/50">
          <span className="material-icons text-lightgray">more_vert</span>
        </button>
      </div>
    </header>
  );
}

function SyncIndicator() {
  // In a real app, this would check sync status
  const isSyncing = false;
  
  return (
    <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-dark/50">
      <span 
        className={cn(
          "material-icons",
          isSyncing ? "text-primary animate-spin" : "text-primary"
        )}
      >
        sync
      </span>
    </button>
  );
}
