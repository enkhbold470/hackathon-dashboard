'use client';

import { useState } from 'react';
import { coreColors, cssVariables } from '@/lib/colors';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ThemeCustomizer() {
  const [colors, setColors] = useState({
    primary: coreColors.primary,
    secondary: coreColors.secondary,
    background: coreColors.background,
    surface: coreColors.surface,
    error: coreColors.error,
  });

  const hexToHsl = (hex: string): string => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    // Find greatest and smallest channel values
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    
    let h = 0, s = 0, l = 0;
    
    // Calculate hue
    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    // Calculate lightness
    l = (cmax + cmin) / 2;
    
    // Calculate saturation
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
    // Convert to percentages
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    
    return `${h} ${s}% ${l}%`;
  };

  const handleColorChange = (colorKey: keyof typeof colors, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const applyColors = () => {
    // Apply primary color
    document.documentElement.style.setProperty('--primary', hexToHsl(colors.primary));
    document.documentElement.style.setProperty('--ring', hexToHsl(colors.primary));
    
    // Apply secondary color
    document.documentElement.style.setProperty('--secondary', hexToHsl(colors.secondary));
    document.documentElement.style.setProperty('--accent', hexToHsl(colors.secondary));
    
    // Apply background color
    document.documentElement.style.setProperty('--background', hexToHsl(colors.background));
    
    // Apply surface colors
    document.documentElement.style.setProperty('--card', hexToHsl(colors.surface));
    document.documentElement.style.setProperty('--popover', hexToHsl(colors.surface));
    document.documentElement.style.setProperty('--muted', hexToHsl(colors.surface));
    document.documentElement.style.setProperty('--input', hexToHsl(colors.surface));
    
    // Apply error color
    document.documentElement.style.setProperty('--destructive', hexToHsl(colors.error));
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <h2 className="text-lg font-bold mb-4">Theme Customizer</h2>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="primary">Primary Color</Label>
          <div className="flex gap-2">
            <Input
              id="primary"
              type="color"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-10 h-10 p-1"
            />
            <Input
              type="text"
              value={colors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="secondary">Secondary Color</Label>
          <div className="flex gap-2">
            <Input
              id="secondary"
              type="color"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-10 h-10 p-1"
            />
            <Input
              type="text"
              value={colors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="background">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="background"
              type="color"
              value={colors.background}
              onChange={(e) => handleColorChange('background', e.target.value)}
              className="w-10 h-10 p-1"
            />
            <Input
              type="text"
              value={colors.background}
              onChange={(e) => handleColorChange('background', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="surface">Surface Color</Label>
          <div className="flex gap-2">
            <Input
              id="surface"
              type="color"
              value={colors.surface}
              onChange={(e) => handleColorChange('surface', e.target.value)}
              className="w-10 h-10 p-1"
            />
            <Input
              type="text"
              value={colors.surface}
              onChange={(e) => handleColorChange('surface', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="error">Error Color</Label>
          <div className="flex gap-2">
            <Input
              id="error"
              type="color"
              value={colors.error}
              onChange={(e) => handleColorChange('error', e.target.value)}
              className="w-10 h-10 p-1"
            />
            <Input
              type="text"
              value={colors.error}
              onChange={(e) => handleColorChange('error', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        
        <Button onClick={applyColors} className="mt-2">
          Apply Theme
        </Button>
      </div>
      
      <div className="mt-6 grid gap-4">
        <h3 className="text-md font-bold">Preview</h3>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full bg-primary"></div>
          <div className="w-10 h-10 rounded-full bg-secondary"></div>
          <div className="w-10 h-10 rounded-full bg-destructive"></div>
        </div>
        <div className="grid gap-2">
          <div className="p-4 bg-card rounded-md border">Card Element</div>
          <div className="p-4 bg-popover rounded-md border">Popover Element</div>
          <div className="p-4 bg-muted rounded-md border">Muted Element</div>
        </div>
      </div>
    </div>
  );
} 