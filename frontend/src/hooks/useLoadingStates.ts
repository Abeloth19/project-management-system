import { useState } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingStatesReturn {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
}

export const useLoadingStates = (initialStates: LoadingState = {}): UseLoadingStatesReturn => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialStates);

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key: string): boolean => {
    return loadingStates[key] || false;
  };

  const isAnyLoading = (): boolean => {
    return Object.values(loadingStates).some(loading => loading);
  };

  const startLoading = (key: string) => {
    setLoading(key, true);
  };

  const stopLoading = (key: string) => {
    setLoading(key, false);
  };

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    startLoading,
    stopLoading
  };
};