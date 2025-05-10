import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Key } from "@shared/schema";
import { KeyWithStatus, ActivityItem } from "@/types";
import { formatTimeAgo, getKeyStatus } from "@/lib/utils";

export function useKeys() {
  const queryClient = useQueryClient();
  
  // Fetch all keys
  const { 
    data: keys,
    isLoading: isLoadingKeys,
    error: keysError,
    refetch: refetchKeys
  } = useQuery<Key[]>({ 
    queryKey: ['/api/keys'],
  });
  
  // Fetch verifications
  const { 
    data: verifications,
    isLoading: isLoadingVerifications,
    error: verificationsError
  } = useQuery({ 
    queryKey: ['/api/verifications'],
  });
  
  // Fetch pending verifications
  const { 
    data: pendingVerifications,
    isLoading: isLoadingPendingVerifications,
    error: pendingVerificationsError
  } = useQuery({ 
    queryKey: ['/api/pending-verifications'],
  });
  
  // Get active pending verification
  const { 
    data: activePendingVerification,
    isLoading: isLoadingActivePendingVerification,
    error: activePendingVerificationError,
    refetch: refetchActivePendingVerification
  } = useQuery({ 
    queryKey: ['/api/pending-verifications/active'],
    retry: false,
  });
  
  // Mutation for creating a key
  const createKeyMutation = useMutation({
    mutationFn: (newKey: Omit<Key, 'id' | 'lastVerified'>) => {
      return apiRequest('POST', '/api/keys', newKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
    },
  });
  
  // Mutation for updating a key
  const updateKeyMutation = useMutation({
    mutationFn: ({ id, key }: { id: number, key: Partial<Key> }) => {
      return apiRequest('PUT', `/api/keys/${id}`, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
    },
  });
  
  // Mutation for deleting a key
  const deleteKeyMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
    },
  });
  
  // Mutation for creating a verification
  const createVerificationMutation = useMutation({
    mutationFn: (verification: { keyId: number, status: 'available' | 'verified' | 'missing', deviceId: string }) => {
      return apiRequest('POST', '/api/verifications', verification);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/verifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pending-verifications/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
    },
  });
  
  // Process keys with status
  const keysWithStatus: KeyWithStatus[] = keys?.map(key => {
    // Check if the key has any verifications
    const keyVerifications = verifications?.filter(v => v.keyId === key.id) || [];
    
    // Check if there is a pending verification for this key
    const isPending = pendingVerifications?.some(
      pv => pv.keyId === key.id && !pv.isCompleted
    ) || false;
    
    // Determine the key status
    const status = getKeyStatus(key.lastVerified);
    const isVerified = status === 'verified';
    const isMissing = status === 'missing';
    
    return {
      ...key,
      isVerified,
      isMissing,
      isPending,
    };
  }) || [];
  
  // Get recent activities
  const recentActivities: ActivityItem[] = [];
  
  // Add verified keys to activities
  if (verifications) {
    verifications.slice(0, 5).forEach(verification => {
      const key = keys?.find(k => k.id === verification.keyId);
      if (key) {
        recentActivities.push({
          id: verification.id,
          keyNumber: key.keyNumber,
          status: verification.status,
          timestamp: verification.verifiedAt.toString(),
          timeAgo: formatTimeAgo(verification.verifiedAt),
        });
      }
    });
  }
  
  // Add pending verifications to activities
  if (pendingVerifications) {
    pendingVerifications
      .filter(pv => !pv.isCompleted)
      .slice(0, 3)
      .forEach(pendingVerification => {
        const key = keys?.find(k => k.id === pendingVerification.keyId);
        if (key) {
          recentActivities.push({
            id: pendingVerification.id,
            keyNumber: key.keyNumber,
            status: 'pending',
            timestamp: pendingVerification.requestedAt.toString(),
            timeAgo: `In ${Math.floor(Math.random() * 45) + 5} minutes`,
          });
        }
      });
  }
  
  // Sort activities by timestamp (most recent first)
  recentActivities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Create a random key verification request
  const createRandomVerificationRequest = async () => {
    if (!keys || keys.length === 0) return null;
    
    // Randomly select a key
    const randomIndex = Math.floor(Math.random() * keys.length);
    const randomKey = keys[randomIndex];
    
    try {
      const response = await apiRequest('POST', '/api/pending-verifications', {
        keyId: randomKey.id
      });
      
      await refetchActivePendingVerification();
      return response;
    } catch (error) {
      console.error('Error creating random verification request:', error);
      return null;
    }
  };
  
  return {
    keys: keysWithStatus,
    isLoadingKeys,
    keysError,
    refetchKeys,
    
    verifications,
    isLoadingVerifications,
    verificationsError,
    
    pendingVerifications,
    isLoadingPendingVerifications,
    pendingVerificationsError,
    
    activePendingVerification,
    isLoadingActivePendingVerification,
    activePendingVerificationError,
    refetchActivePendingVerification,
    
    createKey: createKeyMutation.mutate,
    updateKey: updateKeyMutation.mutate,
    deleteKey: deleteKeyMutation.mutate,
    createVerification: createVerificationMutation.mutate,
    
    recentActivities,
    createRandomVerificationRequest,
  };
}
