import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type TextSize = 'standard' | 'large' | 'extra';
type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState<TextSize>('standard');
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  useEffect(() => {
    const root = document.documentElement;
    
    // Text Size
    if (textSize === 'large') {
      root.style.fontSize = '110%';
    } else if (textSize === 'extra') {
      root.style.fontSize = '125%';
    } else {
      root.style.fontSize = '100%';
    }

    // Color Mode
    if (colorMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [textSize, colorMode]);

  return (
    <ThemeContext.Provider value={{ textSize, setTextSize, colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
