import { useState, useEffect } from "react";
import { ScanResult } from "@/types";
import { getDeviceId } from "@/lib/utils";

export function useScanner(onScanSuccess?: (result: ScanResult) => void) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Mock the camera scanning functionality
  // In a real app, this would use Expo Camera or a similar library
  const startScanning = () => {
    setIsScanning(true);
    setCameraError(null);
    
    // Check for camera permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setHasCameraPermission(true);
        })
        .catch(error => {
          console.error('Camera permission error:', error);
          setHasCameraPermission(false);
          setCameraError("Camera access denied. Please grant permission to use the scanner.");
        });
    } else {
      setHasCameraPermission(false);
      setCameraError("Camera not available on this device or browser.");
    }
  };
  
  const stopScanning = () => {
    setIsScanning(false);
  };
  
  // Mock function to simulate scanning a QR code
  // In a real app, this would be automatically called when a QR code is detected
  const handleScan = (keyNumber: string, keyId?: number) => {
    if (!isScanning) return;
    
    const result: ScanResult = {
      keyId,
      keyNumber,
      success: true,
      message: `Successfully scanned key #${keyNumber}`,
    };
    
    setLastScanned(result);
    setRecentScans(prev => [result, ...prev].slice(0, 5));
    
    if (onScanSuccess) {
      onScanSuccess(result);
    }
    
    // Automatically stop scanning after successful scan
    stopScanning();
  };
  
  // Function to handle scanning errors
  const handleScanError = (message: string) => {
    const result: ScanResult = {
      success: false,
      message,
    };
    
    setLastScanned(result);
  };
  
  // Mock function to request camera permissions
  const requestCameraPermission = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setHasCameraPermission(true);
          setCameraError(null);
        })
        .catch(error => {
          console.error('Camera permission error:', error);
          setHasCameraPermission(false);
          setCameraError("Camera access was denied.");
        });
    } else {
      setCameraError("Camera not available on this device or browser.");
    }
  };
  
  return {
    isScanning,
    lastScanned,
    recentScans,
    hasCameraPermission,
    cameraError,
    startScanning,
    stopScanning,
    handleScan,
    handleScanError,
    requestCameraPermission,
  };
}
