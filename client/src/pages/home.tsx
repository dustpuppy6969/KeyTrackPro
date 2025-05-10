import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "@/components/ui/key-card";
import { useKeys } from "@/hooks/use-keys";
import { useSettings } from "@/hooks/use-settings";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Home() {
  const [_, navigate] = useLocation();
  const { 
    keys, 
    recentActivities, 
    activePendingVerification, 
    refetchActivePendingVerification,
    createVerification
  } = useKeys();
  const { settings } = useSettings();

  // Initialize with a random verification if enabled in settings
  useEffect(() => {
    let verificationInterval: NodeJS.Timeout | null = null;
    
    if (settings?.randomVerification) {
      // Check for a new verification every minute (in a real app, this would be based on settings)
      verificationInterval = setInterval(() => {
        refetchActivePendingVerification();
      }, 60000);
    }
    
    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    };
  }, [settings, refetchActivePendingVerification]);

  // Calculate stats
  const totalKeys = keys?.length || 0;
  const verifiedKeys = keys?.filter(key => key.isVerified).length || 0;
  const verificationPercentage = totalKeys > 0 ? (verifiedKeys / totalKeys) * 100 : 0;
  const successRate = 98; // Mock data - in a real app this would be calculated

  const handleScanNow = () => {
    navigate('/scan');
  };

  return (
    <div className="pb-16">
      {/* Key Request Alert */}
      {activePendingVerification && activePendingVerification.key && (
        <div className="bg-primary text-dark p-4 mx-4 my-4 rounded-lg shadow-lg">
          <div className="flex items-start">
            <span className="material-icons text-dark mr-2 text-2xl">priority_high</span>
            <div>
              <h2 className="font-bold text-lg">Verification Required</h2>
              <p className="text-sm">Please locate and scan Key #{activePendingVerification.key.keyNumber}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              className="bg-dark text-primary py-2 px-4 rounded-lg font-medium flex items-center"
              onClick={handleScanNow}
            >
              <span className="material-icons mr-1">qr_code_scanner</span>
              Scan Now
            </Button>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-medium mb-3">Recent Activity</h2>
        
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))
          ) : (
            <Card className="bg-surface rounded-lg p-4 shadow-md text-center">
              <p className="text-sm text-gray-400">No recent activity</p>
              <Button 
                className="mt-2 bg-primary text-dark"
                onClick={() => navigate('/keys')}
              >
                Add Keys
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-4 mt-8">
        <h2 className="text-lg font-medium mb-3">Stats Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-surface rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-400">Keys Verified</p>
            <p className="font-bold text-2xl mt-1 text-primary">{verifiedKeys}/{totalKeys}</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${verificationPercentage}%` }}
              ></div>
            </div>
          </Card>
          <Card className="bg-surface rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-400">Success Rate</p>
            <p className="font-bold text-2xl mt-1 text-success">{successRate}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-success h-2 rounded-full" 
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
