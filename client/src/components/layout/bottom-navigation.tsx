import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import type { TabName } from "@/types";

interface BottomNavigationProps {
  className?: string;
}

export function BottomNavigation({ className }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabName>('home');
  
  // Map routes to tabs
  useEffect(() => {
    if (location === '/') {
      setActiveTab('home');
    } else if (location === '/scan') {
      setActiveTab('scan');
    } else if (location === '/keys') {
      setActiveTab('keys');
    } else if (location === '/admin') {
      setActiveTab('admin');
    }
  }, [location]);
  
  // Handle tab change
  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    
    // Navigate to the corresponding route
    if (tab === 'home') {
      setLocation('/');
    } else {
      setLocation(`/${tab}`);
    }
  };
  
  return (
    <nav className={cn("fixed bottom-0 w-full bg-surface shadow-lg px-2 py-1", className)}>
      <div className="flex justify-around items-center">
        <TabButton 
          icon="home" 
          label="Home" 
          isActive={activeTab === 'home'} 
          onClick={() => handleTabChange('home')} 
        />
        <TabButton 
          icon="qr_code_scanner" 
          label="Scan" 
          isActive={activeTab === 'scan'} 
          onClick={() => handleTabChange('scan')} 
        />
        <TabButton 
          icon="vpn_key" 
          label="Keys" 
          isActive={activeTab === 'keys'} 
          onClick={() => handleTabChange('keys')} 
        />
        <TabButton 
          icon="settings" 
          label="Admin" 
          isActive={activeTab === 'admin'} 
          onClick={() => handleTabChange('admin')} 
        />
      </div>
    </nav>
  );
}

interface TabButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button 
      className={cn(
        "flex flex-col items-center py-2 px-3 relative",
        isActive ? "active" : ""
      )}
      onClick={onClick}
    >
      <span 
        className={cn(
          "material-icons",
          isActive ? "text-primary" : "text-gray-400"
        )}
      >
        {icon}
      </span>
      <span 
        className={cn(
          "text-xs mt-1",
          isActive ? "text-primary" : "text-gray-400"
        )}
      >
        {label}
      </span>
      {isActive && <div className="nav-indicator"></div>}
    </button>
  );
}
