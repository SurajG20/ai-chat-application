'use client';

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const accentColors = [
  { name: 'Jelly Mint', value: '#3cffd0', description: 'Default accent color' },
  { name: 'Verge Ultraviolet', value: '#5200ff', description: 'Purple accent' },
  { name: 'Electric Blue', value: '#3860be', description: 'Blue accent' },
  { name: 'Sunset Orange', value: '#ff6b35', description: 'Orange accent' },
  { name: 'Hot Pink', value: '#ff2d92', description: 'Pink accent' },
  { name: 'Lime Green', value: '#7fff00', description: 'Green accent' },
];

interface ThemeCustomizerProps {
  onColorChange: (color: string) => void;
  currentColor: string;
}

export function ThemeCustomizer({ onColorChange, currentColor }: ThemeCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#949494] hover:text-white p-2 h-auto"
        title="Customize accent color"
      >
        <Palette className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-full mt-2 w-64 bg-[#2d2d2d] border-white/20 z-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-[#3cffd0]" />
                <h3 className="text-sm font-medium text-white">ACCENT COLOR</h3>
              </div>
              <div className="space-y-2">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      onColorChange(color.value);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#3cffd0]/10 transition-colors group"
                  >
                    <div className="relative w-6 h-6 rounded-full border-2 border-white/30">
                      <div
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      {currentColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-white">{color.name}</p>
                      <p className="text-xs text-[#949494]">{color.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
