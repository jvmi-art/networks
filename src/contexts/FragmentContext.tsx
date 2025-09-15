/** @format */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Fragment is a 5x5 grid of colors
export interface Fragment {
  id: string;
  name: string;
  colors: string[][]; // 5x5 array of hex colors
  createdAt: number;
}

interface FragmentContextType {
  fragments: Fragment[];
  selectedFragmentId: string | null;
  addFragment: (fragment: Omit<Fragment, 'id' | 'createdAt'>) => void;
  deleteFragment: (id: string) => void;
  selectFragment: (id: string | null) => void;
  getFragment: (id: string) => Fragment | undefined;
}

const FragmentContext = createContext<FragmentContextType | undefined>(undefined);

export const useFragments = () => {
  const context = useContext(FragmentContext);
  if (context === undefined) {
    throw new Error('useFragments must be used within a FragmentProvider');
  }
  return context;
};

interface FragmentProviderProps {
  children: ReactNode;
}

// Generate some default fragments for the MVP
const generateDefaultFragments = (): Fragment[] => {
  const defaultPatterns = [
    {
      name: 'Solid Green',
      colors: Array(5).fill(null).map(() => Array(5).fill('#00ff00'))
    },
    {
      name: 'Gradient',
      colors: Array(5).fill(null).map((_, row) => 
        Array(5).fill(null).map((_, col) => {
          const intensity = Math.floor((row + col) * 255 / 8);
          return `#${intensity.toString(16).padStart(2, '0')}ff${intensity.toString(16).padStart(2, '0')}`;
        })
      )
    },
    {
      name: 'Checkerboard',
      colors: Array(5).fill(null).map((_, row) => 
        Array(5).fill(null).map((_, col) => 
          (row + col) % 2 === 0 ? '#ffffff' : '#000000'
        )
      )
    },
    {
      name: 'Center Dot',
      colors: Array(5).fill(null).map((_, row) => 
        Array(5).fill(null).map((_, col) => 
          row === 2 && col === 2 ? '#ff0000' : '#ffcccc'
        )
      )
    }
  ];

  return defaultPatterns.map((pattern, index) => ({
    id: `default-${index}`,
    name: pattern.name,
    colors: pattern.colors,
    createdAt: Date.now() - (1000 * index)
  }));
};

export const FragmentProvider: React.FC<FragmentProviderProps> = ({ children }) => {
  const [fragments, setFragments] = useState<Fragment[]>(generateDefaultFragments());
  const [selectedFragmentId, setSelectedFragmentId] = useState<string | null>(null);

  const addFragment = (fragment: Omit<Fragment, 'id' | 'createdAt'>) => {
    const newFragment: Fragment = {
      ...fragment,
      id: `fragment-${Date.now()}`,
      createdAt: Date.now()
    };
    setFragments(prev => [newFragment, ...prev]);
    // Auto-select the newly created fragment
    setSelectedFragmentId(newFragment.id);
  };

  const deleteFragment = (id: string) => {
    setFragments(prev => prev.filter(f => f.id !== id));
    if (selectedFragmentId === id) {
      setSelectedFragmentId(null);
    }
  };

  const selectFragment = (id: string | null) => {
    setSelectedFragmentId(id);
  };

  const getFragment = (id: string) => {
    return fragments.find(f => f.id === id);
  };

  const value = {
    fragments,
    selectedFragmentId,
    addFragment,
    deleteFragment,
    selectFragment,
    getFragment
  };

  return (
    <FragmentContext.Provider value={value}>
      {children}
    </FragmentContext.Provider>
  );
};