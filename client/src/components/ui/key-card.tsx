import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { KeyWithStatus, ActivityItem } from "@/types";

interface KeyCardProps {
  keyData: KeyWithStatus;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export function KeyCard({ keyData, onClick, actions }: KeyCardProps) {
  const statusClass = keyData.isMissing 
    ? 'missing' 
    : keyData.isVerified 
      ? 'verified' 
      : '';
  
  const statusIcon = keyData.isMissing 
    ? 'error' 
    : keyData.isVerified 
      ? 'check_circle' 
      : keyData.isPending 
        ? 'pending' 
        : 'vpn_key';
  
  const statusColor = keyData.isMissing 
    ? 'text-error' 
    : keyData.isVerified 
      ? 'text-success' 
      : keyData.isPending 
        ? 'text-primary' 
        : 'text-gray-400';

  return (
    <Card 
      className={cn(
        "key-card rounded-lg p-4 shadow-md flex justify-between items-center cursor-pointer",
        statusClass
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-dark flex items-center justify-center mr-3 border-2 border-primary">
          <span className="font-bold text-primary">{keyData.keyPrefix}</span>
        </div>
        <div>
          <p className="font-medium">{keyData.keyNumber}</p>
          <p className="text-xs text-gray-400">{keyData.locationName}</p>
        </div>
      </div>
      <div className="flex items-center">
        {keyData.isPending && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded mr-2">
            Verification Needed
          </span>
        )}
        <span className={`material-icons ${statusColor} mr-2`}>{statusIcon}</span>
        {actions}
      </div>
    </Card>
  );
}

interface ActivityCardProps {
  activity: ActivityItem;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  let statusIcon: string;
  let statusColor: string;
  
  if (activity.status === 'verified') {
    statusIcon = 'check_circle';
    statusColor = 'text-success';
  } else if (activity.status === 'missing') {
    statusIcon = 'error';
    statusColor = 'text-error';
  } else {
    statusIcon = 'pending';
    statusColor = 'text-primary';
  }

  return (
    <Card className="bg-surface rounded-lg p-3 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <span className={`material-icons ${statusColor} mr-2`}>{statusIcon}</span>
        <div>
          <p className="font-medium">Key #{activity.keyNumber}</p>
          <p className="text-xs text-gray-400">{activity.timeAgo}</p>
        </div>
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-dark/50">
        {activity.status === 'verified' 
          ? 'Verified' 
          : activity.status === 'missing' 
            ? 'Missing' 
            : 'Pending'}
      </span>
    </Card>
  );
}