'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User, Heart, ArrowLeft } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // Handle signup
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (response.ok) {
          // Auto sign in after successful registration
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (result?.ok) {
            window.location.href = '/chat';
          } else {
            setError('Registration successful, but sign in failed. Please try signing in manually.');
          }
        } else {
          setError(data.error || 'Registration failed. Please try again.');
        }
      } else {
        // Handle signin
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.ok) {
          window.location.href = '/chat';
        } else {
          setError('Invalid credentials. Please try again.');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  const switchMode = () => {
    resetForm();
    onModeChange(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-primary/20">
      <CardHeader className="space-y-4 pb-6">
        {/* Back to Home Link */}
        <div className="flex items-center justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">
            {mode === 'signin' ? 'Welcome back!' : 'Join CareerPath AI'}
          </CardTitle>
          <CardDescription className="text-base">
            {mode === 'signin' 
              ? 'Sign in to continue your career journey' 
              : 'Start your career transformation today'
            }
          </CardDescription>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={mode === 'signup' ? 6 : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button
            type="submit"
            className="w-full py-6 text-lg font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>

          <div className="relative w-full">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground font-medium">
                OR
              </span>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-medium text-primary hover:text-primary/80 ml-1"
              onClick={switchMode}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {mode === 'signin' 
                ? 'Secure sign-in with industry-standard encryption'
                : 'Join 10,000+ professionals transforming their careers'
              }
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
