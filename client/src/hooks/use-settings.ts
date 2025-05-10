import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Setting } from "@shared/schema";
import { getDeviceId } from "@/lib/utils";

export function useSettings() {
  const queryClient = useQueryClient();
  const deviceId = getDeviceId();
  
  // Fetch settings for the current device
  const { 
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery<Setting>({ 
    queryKey: [`/api/settings?deviceId=${deviceId}`],
    enabled: !!deviceId && deviceId !== 'temporary-id',
  });
  
  // Mutation for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: Partial<Setting>) => {
      if (!settings) throw new Error("Settings not found");
      return apiRequest('PUT', `/api/settings/${settings.id}`, updatedSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/settings?deviceId=${deviceId}`] });
    },
  });
  
  // Handle toggle changes
  const handleToggleSetting = (setting: keyof Setting) => {
    if (!settings) return;
    
    const value = settings[setting];
    if (typeof value === 'boolean') {
      updateSettingsMutation.mutate({ [setting]: !value });
    }
  };
  
  // Handle slider changes
  const handleSliderChange = (setting: keyof Setting, value: number) => {
    if (!settings) return;
    
    updateSettingsMutation.mutate({ [setting]: value });
  };
  
  return {
    settings,
    isLoadingSettings,
    settingsError,
    refetchSettings,
    updateSettings: updateSettingsMutation.mutate,
    handleToggleSetting,
    handleSliderChange,
    isUpdating: updateSettingsMutation.isPending,
  };
}
