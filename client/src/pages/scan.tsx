import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanOverlay } from "@/components/ui/scan-overlay";
import { useScanner } from "@/hooks/use-scanner";
import { useKeys } from "@/hooks/use-keys";
import { useToast } from "@/hooks/use-toast";
import { getDeviceId } from "@/lib/utils";
import { ScanResult } from "@/types";

export default function Scan() {
  const { toast } = useToast();
  const { keys, createVerification, activePendingVerification } = useKeys();
  const [searchKeyNumber, setSearchKeyNumber] = useState('');
  
  const handleScanSuccess = (result: ScanResult) => {
    if (result.success && result.keyNumber) {
      const key = keys?.find(k => k.keyNumber === result.keyNumber);
      
      if (key) {
        // Create a verification for this key
        createVerification({
          keyId: key.id,
          status: 'verified',
          deviceId: getDeviceId()
        });
        
        toast({
          title: "Key Verified",
          description: `Successfully verified key #${key.keyNumber}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Unknown Key",
          description: `Key #${result.keyNumber} is not registered in the system`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Scan Failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };
  
  const { 
    isScanning, 
    recentScans, 
    hasCameraPermission, 
    cameraError,
    startScanning, 
    stopScanning, 
    handleScan,
    requestCameraPermission 
  } = useScanner(handleScanSuccess);
  
  // Check if there's a pending verification we need to scan
  const pendingKey = activePendingVerification?.key;
  
  // Handle manual key search (for demo purposes)
  const handleManualSearch = () => {
    if (!searchKeyNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a key number",
        variant: "destructive",
      });
      return;
    }
    
    handleScan(searchKeyNumber);
    setSearchKeyNumber('');
  };
  
  return (
    <div className="p-4 pb-16">
      <h2 className="text-lg font-medium mb-3">Scan Key</h2>
      
      {/* For verification checks */}
      {pendingKey && (
        <Card className="bg-primary text-dark p-3 mb-4 rounded-lg">
          <p className="font-medium">Please scan Key #{pendingKey.keyNumber}</p>
          <p className="text-sm">Location: {pendingKey.locationName}</p>
        </Card>
      )}
      
      {/* Camera View */}
      <div className="scan-area rounded-lg overflow-hidden bg-black aspect-[4/3] mb-4">
        {/* In a real app, this would be a camera component */}
        <div className="w-full h-full relative flex items-center justify-center bg-gray-900">
          {isScanning ? (
            <>
              <ScanOverlay />
              <p className="text-white text-center absolute bottom-4 left-0 right-0">
                Scanning for QR codes...
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="material-icons text-primary text-4xl mb-2">qr_code_scanner</span>
              <Button 
                className="bg-primary text-dark" 
                onClick={startScanning}
              >
                Start Scanning
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Camera Permission Placeholder (Shown if camera not available) */}
      {hasCameraPermission === false && (
        <Card className="p-4 bg-surface mx-4 my-4 rounded-lg">
          <div className="flex items-center justify-center flex-col p-8">
            <span className="material-icons text-yellow-500 text-4xl mb-4">videocam_off</span>
            <p className="text-center mb-4">{cameraError || "Camera access is required for scanning keys"}</p>
            <Button 
              className="bg-primary text-dark py-2 px-6 rounded-lg font-medium"
              onClick={requestCameraPermission}
            >
              Grant Permission
            </Button>
          </div>
        </Card>
      )}
      
      {/* Manual Key Entry (for demo purposes) */}
      <Card className="bg-surface rounded-lg p-4 shadow-md mb-4">
        <h3 className="font-medium mb-2">Manual Key Entry</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter key number..."
            className="flex-1 bg-dark rounded-lg px-3 py-2 text-lightgray border border-gray-700 focus:border-primary focus:outline-none"
            value={searchKeyNumber}
            onChange={(e) => setSearchKeyNumber(e.target.value)}
          />
          <Button 
            className="bg-primary text-dark"
            onClick={handleManualSearch}
          >
            Verify
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Use this for demo purposes as an alternative to QR scanning.</p>
      </Card>
      
      {/* Scanning Instructions */}
      <Card className="bg-surface rounded-lg p-4 shadow-md mb-4">
        <div className="flex items-center">
          <span className="material-icons text-primary mr-2">info</span>
          <p className="text-sm">Please center the QR code within the frame to scan</p>
        </div>
      </Card>
      
      {/* Recent Scans */}
      <h3 className="text-md font-medium mb-2">Recent Scans</h3>
      <div className="space-y-2">
        {recentScans.length > 0 ? (
          recentScans.map((scan, index) => (
            <Card 
              key={index} 
              className="bg-surface rounded-lg p-3 shadow-md flex justify-between items-center"
            >
              <div className="flex items-center">
                <span 
                  className={`material-icons mr-2 ${scan.success ? 'text-success' : 'text-error'}`}
                >
                  {scan.success ? 'check_circle' : 'error'}
                </span>
                <div>
                  <p className="font-medium">Key #{scan.keyNumber || 'N/A'}</p>
                  <p className="text-xs text-gray-400">Scanned just now</p>
                </div>
              </div>
              <span className="material-icons text-primary">arrow_forward</span>
            </Card>
          ))
        ) : (
          <Card className="bg-surface rounded-lg p-4 shadow-md text-center">
            <p className="text-sm text-gray-400">No recent scans</p>
          </Card>
        )}
      </div>
    </div>
  );
}
