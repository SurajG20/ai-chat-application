'use client';

import { BookOpen, ExternalLink, Star, Clock, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useState } from 'react';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  readTime: string;
  featured: boolean;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'The Complete Guide to Salary Negotiation',
    description: 'Learn proven strategies to negotiate your salary and get paid what you deserve.',
    url: 'https://www.harvard.edu/office-career-development/salary-negotiation',
    category: 'Negotiation',
    readTime: '8 min',
    featured: true
  },
  {
    id: '2',
    title: 'Career Switching: A Step-by-Step Guide',
    description: 'How to successfully transition to a new career field without starting from scratch.',
    url: 'https://www.forbes.com/career-switch-guide',
    category: 'Transition',
    readTime: '10 min',
    featured: true
  },
  {
    id: '3',
    title: 'Top Skills for 2024 and Beyond',
    description: 'Discover the most in-demand skills that employers are looking for this year.',
    url: 'https://www.linkedin.com/learning/top-skills-2024',
    category: 'Skills',
    readTime: '5 min',
    featured: false
  },
  {
    id: '4',
    title: 'Mastering the Behavioral Interview',
    description: 'STAR method techniques to ace behavioral interview questions.',
    url: 'https://www.themuse.com/advice/star-interview-method',
    category: 'Interview',
    readTime: '7 min',
    featured: true
  },
  {
    id: '5',
    title: 'Building Your Personal Brand',
    description: 'Strategies to establish and grow your professional presence online.',
    url: 'https://www.fastcompany.com/personal-brand-guide',
    category: 'Growth',
    readTime: '6 min',
    featured: false
  },
  {
    id: '6',
    title: 'Remote Work Career Advancement',
    description: 'How to grow your career while working remotely in a distributed team.',
    url: 'https://remote.co/remote-work-career-tips',
    category: 'Growth',
    readTime: '9 min',
    featured: false
  },
  {
    id: '7',
    title: 'Resume Writing Best Practices',
    description: 'Modern resume tips to get past ATS and impress recruiters.',
    url: 'https://www.resumewriting.com/best-practices',
    category: 'Resume',
    readTime: '12 min',
    featured: true
  },
  {
    id: '8',
    title: 'Networking for Introverts',
    description: 'Comfortable networking strategies for those who find it challenging.',
    url: 'https://www.inc.com/networking-introverts',
    category: 'Networking',
    readTime: '8 min',
    featured: false
  }
];

const categories = ['All', 'Negotiation', 'Transition', 'Skills', 'Interview', 'Growth', 'Resume', 'Networking'];

interface ResourceLibraryProps {
  isOpen?: boolean;
  onToggle?: () => void;
  accentColor?: string;
}

export function ResourceLibrary({ isOpen = false, onToggle, accentColor = '#3cffd0' }: ResourceLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filteredResources = resources.filter(resource => {
    const categoryMatch = selectedCategory === 'All' || resource.category === selectedCategory;
    const featuredMatch = !showFeaturedOnly || resource.featured;
    return categoryMatch && featuredMatch;
  });

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-[#949494] hover:text-white p-2 h-auto"
        title="Resource Library"
      >
        <BookOpen className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="bg-[#131313] border-white rounded-[24px] max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
              <h2 className="text-xl font-display text-white">RESOURCE LIBRARY</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-[#949494] hover:text-white"
            >
              ✕
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Filter className="w-4 h-4 text-[#949494]" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? 'text-black border-none'
                      : 'bg-transparent border-white/30 text-white hover:bg-white/10'
                  }
                  style={selectedCategory === category ? { backgroundColor: accentColor } : undefined}
                >
                  {category}
                </Button>
              ))}
            </div>
            <Button
              variant={showFeaturedOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={`ml-auto ${
                showFeaturedOnly
                  ? 'text-black border-none'
                  : 'bg-transparent border-white/30 text-white hover:bg-white/10'
              }`}
              style={showFeaturedOnly ? { backgroundColor: accentColor } : undefined}
            >
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[60vh] space-y-3 pr-2">
            {filteredResources.map((resource) => (
              <Card
                key={resource.id}
                className="bg-[#2d2d2d] border-white/20 hover:bg-[#3cffd0]/10 transition-all duration-200"
                style={{ borderColor: accentColor }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {resource.featured && (
                          <Star className="w-3 h-3" style={{ color: accentColor, fill: accentColor }} />
                        )}
                        <span className="text-xs text-[#949494] label-mono-sm">{resource.category}</span>
                        <span className="text-xs text-[#949494] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {resource.readTime}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-white mb-1">{resource.title}</h3>
                      <p className="text-xs text-[#949494] line-clamp-2">{resource.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="shrink-0 text-[#3cffd0] hover:text-white"
                    >
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <p className="text-xs text-[#949494]">
              Showing {filteredResources.length} of {resources.length} resources
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
