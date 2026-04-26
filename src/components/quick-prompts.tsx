'use client';

import { Sparkles, Briefcase, TrendingUp, GraduationCap, DollarSign, ArrowRight, LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface QuickPrompt {
  id: string;
  icon: LucideIcon;
  label: string;
  prompt: string;
  category: string;
}

const quickPrompts: QuickPrompt[] = [
  {
    id: 'salary',
    icon: DollarSign,
    label: 'Salary Negotiation',
    prompt: 'How do I negotiate my salary effectively? What are the best strategies?',
    category: 'Negotiation'
  },
  {
    id: 'switch',
    icon: ArrowRight,
    label: 'Career Switch',
    prompt: 'How do I switch careers from [current field] to [new field]? What steps should I take?',
    category: 'Transition'
  },
  {
    id: 'growth',
    icon: TrendingUp,
    label: 'Career Growth',
    prompt: 'What skills do I need to develop to advance to the next level in my career?',
    category: 'Growth'
  },
  {
    id: 'skills',
    icon: Briefcase,
    label: 'Skill Assessment',
    prompt: 'Can you help me identify my key strengths and areas for improvement based on my background?',
    category: 'Assessment'
  },
  {
    id: 'learning',
    icon: GraduationCap,
    label: 'Learning Path',
    prompt: 'What courses or certifications should I pursue to reach my career goals?',
    category: 'Education'
  },
  {
    id: 'interview',
    icon: Sparkles,
    label: 'Interview Prep',
    prompt: 'What are the most common interview questions for [role] and how should I answer them?',
    category: 'Interview'
  }
];

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  accentColor?: string;
  onStartNewChat?: () => void;
}

export function QuickPrompts({ onSelectPrompt, accentColor = '#3cffd0', onStartNewChat }: QuickPromptsProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
        <h3 className="text-sm font-medium text-white">QUICK PROMPTS</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {quickPrompts.map((quickPrompt) => {
          const Icon = quickPrompt.icon;
          return (
            <Card
              key={quickPrompt.id}
              className="bg-[#2d2d2d] border-white/20 hover:bg-[#3cffd0]/10 transition-all duration-200 cursor-pointer group"
              style={{ borderColor: accentColor }}
              onClick={() => {
                if (onStartNewChat) {
                  onStartNewChat();
                }
                onSelectPrompt(quickPrompt.prompt);
              }}
            >
              <div className="p-3">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-[#3cffd0]/20 transition-colors" style={{ backgroundColor: `${accentColor}10` }}>
                    <Icon className="w-4 h-4" style={{ color: accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{quickPrompt.label}</p>
                    <p className="text-xs text-[#949494]">{quickPrompt.category}</p>
                  </div>
                </div>
                <p className="text-xs text-[#949494] line-clamp-2">{quickPrompt.prompt}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
