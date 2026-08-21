'use client';

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const accentColors = [
  { name: 'Corporate Blue', value: '#2563eb', description: 'Default accent color' },
  { name: 'Executive Navy', value: '#1e40af', description: 'Deep navy accent' },
  { name: 'Royal Indigo', value: '#4f46e5', description: 'Indigo accent' },
  { name: 'Forest Green', value: '#059669', description: 'Emerald accent' },
  { name: 'Burgundy', value: '#9f1239', description: 'Classic red accent' },
  { name: 'Graphite', value: '#475569', description: 'Slate gray accent' },
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
        className="text-muted-foreground hover:text-foreground p-2 h-auto"
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
          <Card className="absolute right-0 top-full mt-2 w-64 bg-popover border-border z-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-medium text-foreground">Accent Color</h3>
              </div>
              <div className="space-y-2">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      onColorChange(color.value);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="relative w-6 h-6 rounded-full border-2 border-border">
                      <div
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      {currentColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-medium text-foreground">{color.name}</p>
                      <p className="text-xs text-muted-foreground">{color.description}</p>
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
