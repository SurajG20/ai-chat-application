'use client';

import { memo } from 'react';
import { Plus, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { QuickPrompts } from '../quick-prompts';
import type { AccentColor } from '../../types/chat';

interface WelcomeScreenProps {
  accentColor: AccentColor;
  onStartNewChat: () => void;
  onSelectQuickPrompt: (prompt: string, onStartNewChat?: () => void) => void;
}

export const WelcomeScreen = memo(function WelcomeScreen({
  accentColor,
  onStartNewChat,
  onSelectQuickPrompt,
}: WelcomeScreenProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        <Card className="text-center bg-[#131313] border-white rounded-[24px] mb-6">
          <CardContent className="p-8">
            <div 
              className="w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-6" 
              style={{ backgroundColor: accentColor }}
            >
              <Heart className="h-8 w-8 text-black" />
            </div>
            <h2 className="font-display text-2xl text-white mb-3">
              Welcome to CareerPath AI
            </h2>
            <p className="text-[#949494] mb-6 leading-relaxed">
              Start a new conversation to get personalized career advice, skill assessments, and strategic guidance from our AI counselor.
            </p>
            <Button 
              size="lg" 
              className="w-full text-black rounded-full border-none label-mono" 
              style={{ backgroundColor: accentColor }} 
              onClick={onStartNewChat}
            >
              <Plus className="w-4 h-4 mr-2" />
              START NEW CHAT
            </Button>
          </CardContent>
        </Card>
        <QuickPrompts 
          onSelectPrompt={onSelectQuickPrompt} 
          accentColor={accentColor} 
          onStartNewChat={onStartNewChat} 
        />
      </div>
    </div>
  );
});
