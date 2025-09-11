'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, LogIn, UserPlus, ArrowRight, Target, TrendingUp } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="text-center shadow-2xl border-primary/20">
          <CardHeader className="space-y-6 pb-8">
            {/* Logo */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            
            {/* Branding */}
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                <Target className="h-3 w-3 mr-1" />
                AI-Powered Career Guidance
              </Badge>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Welcome to CareerPath AI
              </CardTitle>
              <CardDescription className="text-base max-w-md mx-auto">
                Transform your career with personalized AI counseling, skill assessments, and strategic guidance. 
                Discover your potential and unlock new opportunities.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Career Assessment</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Target className="h-4 w-4 text-primary" />
                <span>Skill Development</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/auth/signin" className="block">
                <Button className="w-full text-lg py-6" size="lg">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In to Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full text-lg py-6 border-primary/20 hover:bg-primary/5" size="lg">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create New Account
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Join 10,000+ professionals who&apos;ve transformed their careers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
