'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AuthButton } from '../components/auth-button';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  Target,
  BookOpen,
  MessageCircle,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  GraduationCap,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

// Spacing system:
// - Container: mx-auto max-w-6xl px-6 lg:px-8
// - Section rhythm: py-20 md:py-24
// - Section header: badge + title + copy, followed by mt-12 md:mt-16 content
// - Cards: uniform p-6, gap-6 grids

function BrandMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
      <GraduationCap className={`${className} text-primary-foreground`} />
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#features', label: 'Features' },
    { href: '#testimonials', label: 'Success Stories' },
  ];

  const services = [
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Career Assessment',
      description:
        'Discover your strengths, interests, and career preferences through comprehensive AI-powered assessment tools.',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Skill Development',
      description:
        'Get personalized recommendations for courses, certifications, and skill-building opportunities tailored to your goals.',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Career Planning',
      description:
        'Create a strategic roadmap for your career growth with actionable steps, milestones, and timeline tracking.',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'AI Counseling',
      description:
        'Get instant, personalized career advice from an advanced AI counselor available around the clock.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      content:
        'The AI counselor helped me transition from marketing to tech. The personalized advice was spot-on!',
      avatar: 'SJ',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager',
      content:
        'I was stuck in my career for years. This platform gave me the clarity and direction I needed.',
      avatar: 'MC',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      content:
        'The skill assessment was incredibly accurate. It helped me identify my true passion and pivot successfully.',
      avatar: 'ER',
      rating: 5,
    },
  ];

  const features = [
    'AI-powered career assessments',
    'Personalized skill recommendations',
    'Industry trend analysis',
    'Resume optimization tips',
    'Interview preparation',
    'Salary negotiation guidance',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {!session && (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <BrandMark />
                <span className="font-display text-xl tracking-tight text-foreground">
                  CareerPath AI
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden items-center gap-8 md:flex">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3">
                <AuthButton />
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-foreground hover:text-primary md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="border-t border-border py-3 md:hidden">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      )}

      {status === 'loading' ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : session ? (
        /* Logged-in welcome */
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <section className="py-24 text-center md:py-32">
            <div className="mx-auto max-w-2xl">
              <BrandMark className="mx-auto mb-6 h-10 w-10" />
              <h1 className="font-display mb-4 text-4xl tracking-tight text-foreground sm:text-5xl">
                Welcome back{session.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Continue your conversations and get guidance tailored to you.
              </p>
              <Link href="/chat">
                <Button size="lg" className="gap-2 text-base">
                  Go to Chat
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Hero */}
          <section className="py-20 text-center md:py-28">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Compass className="h-4 w-4" />
                AI-Powered Career Guidance
              </div>
              <h1 className="font-display mb-6 text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Navigate Your Career
                <span className="block text-primary">with Confidence</span>
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Personalized career counseling, skill assessments, and strategic guidance from an
                advanced AI counselor. Discover your potential and unlock new opportunities.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full gap-2 text-base sm:w-auto">
                    Start Your Journey
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#services">
                  <Button variant="outline" size="lg" className="w-full text-base sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Services */}
          <section id="services" className="py-20 md:py-24">
            <div className="mb-12 text-center md:mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Target className="h-4 w-4" />
                Why CareerPath AI
              </div>
              <h2 className="font-display mb-4 text-3xl tracking-tight text-foreground md:text-4xl">
                Comprehensive Career Guidance
              </h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                A platform that combines modern AI technology with proven career counseling
                methodologies.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {service.icon}
                  </div>
                  <h3 className="font-display mb-2 text-lg text-foreground">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="border-y border-border bg-muted/30 py-20 md:py-24">
            <div className="mb-12 text-center md:mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                How It Works
              </div>
              <h2 className="font-display mb-4 text-3xl tracking-tight text-foreground md:text-4xl">
                Simple Steps to Success
              </h2>
              <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                Get started in minutes and transform your career with AI-powered guidance.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  step: 'Step 1',
                  title: 'Create Your Account',
                  description:
                    'Sign up for free in seconds. No credit card required to get started.',
                },
                {
                  step: 'Step 2',
                  title: 'Chat with the AI Counselor',
                  description:
                    'Tell the AI counselor about your skills, goals, and career aspirations.',
                },
                {
                  step: 'Step 3',
                  title: 'Receive Your Plan',
                  description:
                    'Get a personalized career roadmap with actionable steps and resources.',
                },
              ].map((item, index) => (
                <Card key={index} className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 to-primary" />
                  <div className="label-mono mb-3 text-primary">{item.step}</div>
                  <h3 className="font-display mb-2 text-xl text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="py-20 md:py-24">
            <div className="mb-12 text-center md:mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Star className="h-4 w-4" />
                Trusted by Thousands
              </div>
              <h2 className="font-display mb-4 text-3xl tracking-tight text-foreground md:text-4xl">
                Join the Community
              </h2>
              <p className="text-base text-muted-foreground">
                Join professionals who&apos;ve transformed their careers with structured guidance.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
              {[
                { value: '10,000+', label: 'Successful Career Transitions' },
                { value: '95%', label: 'User Satisfaction Rate' },
                { value: '24/7', label: 'AI Counselor Availability' },
              ].map((stat, index) => (
                <div key={index} className="rounded-xl border border-border bg-card p-8">
                  <div className="font-display mb-2 text-4xl tracking-tight text-primary md:text-5xl">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section id="features" className="border-y border-border bg-muted/30 py-20 md:py-24">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                  <CheckCircle className="h-4 w-4" />
                  Features
                </div>
                <h2 className="font-display mb-4 text-3xl tracking-tight text-foreground md:text-4xl">
                  Everything You Need for Career Success
                </h2>
                <p className="mb-8 text-base leading-relaxed text-muted-foreground">
                  All the tools and guidance you need to advance your career &mdash; whether
                  you&apos;re just starting out or planning a major transition.
                </p>
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      </span>
                      <span className="text-base text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-foreground">CareerPath AI</div>
                      <div className="label-mono-sm text-muted-foreground">Your Career Counselor</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm leading-relaxed text-foreground">
                      &ldquo;Based on your skills and interests, I recommend exploring roles in
                      product management. Your analytical thinking and communication skills would
                      transfer well to this field.&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold text-foreground">You</div>
                      <div className="label-mono-sm text-muted-foreground">Career Seeker</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm leading-relaxed text-foreground">
                      &ldquo;That sounds interesting! What skills should I focus on developing
                      first?&rdquo;
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-20 md:py-24">
            <div className="mb-12 text-center md:mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Star className="h-4 w-4" />
                Success Stories
              </div>
              <h2 className="font-display mb-4 text-3xl tracking-tight text-foreground md:text-4xl">
                Transform Your Career
              </h2>
              <p className="text-base text-muted-foreground">
                Hear from professionals who&apos;ve transformed their careers with our guidance.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="rounded-xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-md"
                >
                  <CardContent className="space-y-4 p-0">
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm italic leading-relaxed text-muted-foreground">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="pb-20 md:pb-24">
            <Card className="rounded-2xl border-none bg-primary p-8 md:p-12">
              <CardContent className="p-0 text-center">
                <h2 className="font-display mb-4 text-3xl tracking-tight text-primary-foreground md:text-4xl">
                  Ready to Transform Your Career?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-primary-foreground/80">
                  Join thousands of professionals who&apos;ve already discovered their ideal career
                  path. Start your journey today.
                </p>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="gap-2 bg-primary-foreground text-base text-primary hover:bg-primary-foreground/90"
                  >
                    Get Started Now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="border-t border-border py-12">
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <BrandMark />
                <span className="font-display text-lg text-foreground">CareerPath AI</span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                Empowering careers with AI-driven insights and personalized guidance.
              </p>
              <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                <a href="#" className="transition-colors hover:text-foreground">
                  Privacy Policy
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Terms of Service
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Contact
                </a>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
