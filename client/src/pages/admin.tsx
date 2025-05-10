import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useKeys } from "@/hooks/use-keys";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Admin() {
  const { toast } = useToast();
  const { 
    settings, 
    isLoadingSettings, 
    handleToggleSetting, 
    handleSliderChange,
    isUpdating
  } = useSettings();
  
  const { 
    keys, 
    createRandomVerificationRequest 
  } = useKeys();
  
  // Handle generating QR codes for all keys
  const handleBatchGenerateQR = () => {
    toast({
      title: "QR Codes Generated",
      description: `QR codes for ${keys?.length || 0} keys have been generated`,
    });
  };
  
  // Handle exporting QR codes
  const handleExportQR = () => {
    toast({
      title: "QR Codes Exported",
      description: "QR codes have been exported as PDF",
    });
  };
  
  // Handle sync now
  const handleSyncNow = () => {
    toast({
      title: "Sync Started",
      description: "Synchronizing data with the server...",
    });
    
    // Simulate sync
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "Data has been successfully synchronized",
        variant: "success",
      });
    }, 2000);
  };
  
  // Handle creating a test verification
  const handleTestVerification = async () => {
    if (!keys || keys.length === 0) {
      toast({
        title: "No Keys Found",
        description: "Please add keys before testing verification",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Creating Test Verification",
      description: "Randomly selecting a key for verification...",
    });
    
    const result = await createRandomVerificationRequest();
    
    if (result) {
      toast({
        title: "Test Verification Created",
        description: "Check the home screen for the verification request",
        variant: "success",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create test verification",
        variant: "destructive",
      });
    }
  };
  
  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-120px)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }
  
  if (!settings) {
    return (
      <div className="p-4">
        <Card className="bg-surface rounded-lg p-4 shadow-md text-center">
          <p className="text-gray-400">No settings found. Please restart the app.</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-4 pb-16">
      <h2 className="text-lg font-medium mb-4">Admin Settings</h2>
      
      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Verification Settings */}
        <Card className="bg-surface rounded-lg p-4 shadow-md">
          <h3 className="font-medium mb-3">Verification Settings</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Random Verification</p>
                <p className="text-xs text-gray-400">Randomly request key verification</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.randomVerification}
                  onChange={() => handleToggleSetting('randomVerification')}
                  disabled={isUpdating}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Verification Frequency</p>
                <span className="text-primary font-medium">{settings.verificationFrequency} Hours</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="24" 
                value={settings.verificationFrequency}
                onChange={(e) => handleSliderChange('verificationFrequency', parseInt(e.target.value))}
                disabled={isUpdating}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1h</span>
                <span>12h</span>
                <span>24h</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Require Photo Evidence</p>
                <p className="text-xs text-gray-400">Capture photo of keys during scan</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.requirePhotoEvidence}
                  onChange={() => handleToggleSetting('requirePhotoEvidence')}
                  disabled={isUpdating}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <Button 
              className="bg-surface border border-primary text-primary w-full"
              onClick={handleTestVerification}
              disabled={isUpdating}
            >
              Test Verification Request
            </Button>
          </div>
        </Card>
        
        {/* Alert Settings */}
        <Card className="bg-surface rounded-lg p-4 shadow-md">
          <h3 className="font-medium mb-3">Alert Settings</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Missing Key Alerts</p>
                <p className="text-xs text-gray-400">Send alerts for unverified keys</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.missingKeyAlerts}
                  onChange={() => handleToggleSetting('missingKeyAlerts')}
                  disabled={isUpdating}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Daily Summary</p>
                <p className="text-xs text-gray-400">Send daily key status summary</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.dailySummary}
                  onChange={() => handleToggleSetting('dailySummary')}
                  disabled={isUpdating}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Alert Response Time</p>
                <span className="text-primary font-medium">{settings.alertResponseTime} Min</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="120" 
                value={settings.alertResponseTime}
                onChange={(e) => handleSliderChange('alertResponseTime', parseInt(e.target.value))}
                disabled={isUpdating}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5m</span>
                <span>1h</span>
                <span>2h</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Data Sync Settings */}
        <Card className="bg-surface rounded-lg p-4 shadow-md">
          <h3 className="font-medium mb-3">Data Synchronization</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Auto Sync</p>
                <p className="text-xs text-gray-400">Automatically sync with cloud</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={() => handleToggleSetting('autoSync')}
                  disabled={isUpdating}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Sync Frequency</p>
                <span className="text-primary font-medium">{settings.syncFrequency} Min</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="60" 
                value={settings.syncFrequency}
                onChange={(e) => handleSliderChange('syncFrequency', parseInt(e.target.value))}
                disabled={isUpdating}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5m</span>
                <span>30m</span>
                <span>60m</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary text-dark py-2 rounded-lg font-medium flex items-center justify-center"
              onClick={handleSyncNow}
              disabled={isUpdating}
            >
              <span className="material-icons mr-1">sync</span>
              Sync Now
            </Button>
          </div>
        </Card>
        
        {/* QR Code Management */}
        <Card className="bg-surface rounded-lg p-4 shadow-md">
          <h3 className="font-medium mb-3">QR Code Management</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Batch Generate QR Codes</p>
                <p className="text-xs text-gray-400">Generate QR codes for multiple keys</p>
              </div>
              <Button 
                className="bg-primary text-dark px-3 py-1 rounded-lg text-sm font-medium"
                onClick={handleBatchGenerateQR}
                disabled={isUpdating}
              >
                Generate
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Export QR Codes</p>
                <p className="text-xs text-gray-400">Download QR codes as PDF</p>
              </div>
              <Button 
                className="bg-surface border border-primary text-primary px-3 py-1 rounded-lg text-sm font-medium"
                onClick={handleExportQR}
                disabled={isUpdating}
              >
                Export
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
