/** @format */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/theme-provider';
import { useCanvasSettings } from '../contexts/CanvasSettingsContext';
import { NODE_MODE_CONFIG, BLOCK_MODE_CONFIG } from '../constants';

export type ModeType = 'node' | 'block';

interface ModeTabsProps {
  activeTab: ModeType;
  onTabChange: (tab: ModeType) => void;
}

const ModeTabs: React.FC<ModeTabsProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const { setSettings } = useCanvasSettings();

  const handleTabChange = (tab: ModeType) => {
    onTabChange(tab);
    const config = tab === 'node' ? NODE_MODE_CONFIG : BLOCK_MODE_CONFIG;
    setSettings(config);
  };

  return (
    <div className={`flex items-center rounded-full p-1 backdrop-blur-md ${
      theme === 'light' 
        ? 'bg-white/90 border border-gray-200' 
        : 'bg-black/90 border border-white/10'
    }`}>
      {(['node', 'block'] as ModeType[]).map((tab) => (
        <motion.button
          key={tab}
          onClick={() => handleTabChange(tab)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors relative ${
            activeTab === tab
              ? theme === 'light'
                ? 'text-white'
                : 'text-black'
              : theme === 'light'
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-gray-400 hover:text-gray-200'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeTab === tab && (
            <motion.div
              className={`absolute inset-0 rounded-full ${
                theme === 'light' ? 'bg-gray-800' : 'bg-white'
              }`}
              layoutId="activeTab"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative capitalize">{tab}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default ModeTabs;