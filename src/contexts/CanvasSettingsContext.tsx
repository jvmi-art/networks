/** @format */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CanvasSettings } from '../types/canvas';

interface CanvasSettingsContextType {
  settings: CanvasSettings;
  updateSettings: (newSettings: Partial<CanvasSettings>) => void;
  setSettings: (newSettings: CanvasSettings) => void;
}

const CanvasSettingsContext = createContext<CanvasSettingsContextType | undefined>(undefined);

export const useCanvasSettings = () => {
  const context = useContext(CanvasSettingsContext);
  if (context === undefined) {
    throw new Error('useCanvasSettings must be used within a CanvasSettingsProvider');
  }
  return context;
};

interface CanvasSettingsProviderProps {
  children: ReactNode;
  initialSettings: CanvasSettings;
}

export const CanvasSettingsProvider: React.FC<CanvasSettingsProviderProps> = ({
  children,
  initialSettings
}) => {
  const [settings, setSettingsState] = useState<CanvasSettings>(initialSettings);

  const updateSettings = (newSettings: Partial<CanvasSettings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const setSettings = (newSettings: CanvasSettings) => {
    setSettingsState(newSettings);
  };

  const value = {
    settings,
    updateSettings,
    setSettings
  };

  return (
    <CanvasSettingsContext.Provider value={value}>
      {children}
    </CanvasSettingsContext.Provider>
  );
};