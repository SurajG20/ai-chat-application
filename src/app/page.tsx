'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
// Chat moved to dedicated /chat page
import { AuthButton } from '../components/auth-button';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  Target, 
  BookOpen, 
  MessageCircle, 
  Star, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Heart,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const services = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Career Assessment",
      description: "Discover your strengths, interests, and career preferences through our comprehensive AI-powered assessment tools that analyze your skills, experience, and aspirations."
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Skill Development",
      description: "Get personalized recommendations for courses, certifications, and skill-building opportunities tailored to your career goals and industry requirements."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Career Planning",
      description: "Create a strategic roadmap for your career growth with actionable steps, milestones, and timeline tracking powered by AI insights."
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "AI Counseling",
      description: "Get instant, personalized career advice from our advanced AI counselor available 24/7, trained on millions of successful career transitions."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content: "The AI counselor helped me transition from marketing to tech. The personalized advice was spot-on!",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      content: "I was stuck in my career for years. This platform gave me the clarity and direction I needed.",
      avatar: "MC",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      content: "The skill assessment was incredibly accurate. It helped me identify my true passion and pivot successfully.",
      avatar: "ER",
      rating: 5
    }
  ];

  const features = [
    "AI-powered career assessments",
    "Personalized skill recommendations",
    "Industry trend analysis",
    "Resume optimization tips",
    "Interview preparation",
    "Salary negotiation guidance"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Only show when not logged in */}
      {!session && (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <span className="font-display text-xl sm:text-2xl text-foreground tracking-tight">CareerPath AI</span>
              </div>
              <div className="sm:hidden">
                <span className="font-display text-lg text-foreground tracking-tight">CareerPath AI</span>
              </div>
            </div>

            {/* Desktop Navigation Links - Only show when not logged in */}
            {!session && (
              <div className="hidden md:flex items-center space-x-6">
                <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Services
                </a>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Success Stories
                </a>
          </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
            <AuthButton />
              {/* Mobile Menu Button - Only show when not logged in */}
              {!session && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2 text-foreground hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu - Only show when not logged in */}
          {!session && isMobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background">
              <div className="px-4 py-3 space-y-1">
                <a 
                  href="#services" 
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a 
                  href="#features" 
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Success Stories
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
      )}
      
      {status === 'loading' ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : session ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="py-24 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4 tracking-tight">Welcome back</h2>
              <p className="text-lg text-muted-foreground mb-8">Continue your conversations and get guidance tailored to you.</p>
              <Link href="/chat">
                <Button size="lg" className="text-base px-8 py-6 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  Go to Chat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="py-20 md:py-32 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-POWERED CAREER GUIDANCE
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground mb-6 tracking-tight leading-[1.1]">
                Transform Your
                <span className="text-primary block mt-2">Career Journey</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Get personalized career counseling, skill assessments, and strategic guidance from our advanced AI counselor. 
                Discover your potential and unlock new opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signin">  
                <Button size="lg" className="text-base px-8 py-6 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                </Link>
                <Link href="#services">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-lg">
                  Learn More
                </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="services" className="py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Target className="w-4 h-4" />
                WHY CHOOSE CAREERPATH AI?
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
                Comprehensive Career Guidance
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive platform combines cutting-edge AI technology with proven career counseling methodologies.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="text-center bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-200">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg text-foreground mb-2">{service.title}</CardTitle>
                  <CardContent className="p-0">
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <TrendingUp className="w-4 h-4" />
                HOW IT WORKS
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
                Simple Steps to Success
              </h2>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes and transform your career with our AI-powered guidance.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
                <div className="text-primary text-sm font-medium mb-2">STEP 1</div>
                <h3 className="font-display text-xl text-foreground mb-2">Sign Up</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create your free account in seconds. No credit card required to get started.
                </p>
              </Card>
              <Card className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
                <div className="text-primary text-sm font-medium mb-2">STEP 2</div>
                <h3 className="font-display text-xl text-foreground mb-2">Chat with AI</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tell our AI counselor about your skills, goals, and career aspirations.
                </p>
              </Card>
              <Card className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary" />
                <div className="text-primary text-sm font-medium mb-2">STEP 3</div>
                <h3 className="font-display text-xl text-foreground mb-2">Get Your Plan</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Receive personalized career roadmap with actionable steps and resources.
                </p>
              </Card>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 bg-primary/5 rounded-2xl px-6 md:px-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                TRUSTED BY THOUSANDS
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
                Join the Community
              </h2>
              <p className="text-base text-muted-foreground">
                Join the growing community of professionals who&apos;ve transformed their careers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="font-display text-4xl md:text-5xl text-foreground mb-2 tracking-tight">10,000+</div>
                <div className="text-sm text-muted-foreground font-medium">Successful Career Transitions</div>
              </div>
              <div>
                <div className="font-display text-4xl md:text-5xl text-foreground mb-2 tracking-tight">95%</div>
                <div className="text-sm text-muted-foreground font-medium">User Satisfaction Rate</div>
              </div>
              <div>
                <div className="font-display text-4xl md:text-5xl text-foreground mb-2 tracking-tight">24/7</div>
                <div className="text-sm text-muted-foreground font-medium">AI Counselor Availability</div>
              </div>
            </div>
          </section>

          {/* Features List */}
          <section id="features" className="py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <CheckCircle className="w-4 h-4" />
                  FEATURES
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
                  Everything You Need for Career Success
                </h2>
                <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                  Our comprehensive platform provides all the tools and guidance you need to advance your career, 
                  whether you&apos;re just starting out or looking to make a major transition.
                </p>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-base text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Card className="p-6 bg-card border border-border rounded-xl shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">AI</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground text-sm">CareerPath AI</div>
                        <div className="text-xs text-muted-foreground">YOUR PERSONAL CAREER COUNSELOR</div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                      <p className="text-sm text-foreground leading-relaxed">
                        &ldquo;Based on your skills and interests, I recommend exploring roles in Product Management. 
                        You have strong analytical thinking and communication skills that would be perfect for this field.&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-sm">U</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground text-sm">You</div>
                        <div className="text-xs text-muted-foreground">CAREER SEEKER</div>
                      </div>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <p className="text-sm text-foreground leading-relaxed">
                        &ldquo;That sounds interesting! What skills should I focus on developing?&rdquo;
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                SUCCESS STORIES
              </div>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
                Transform Your Career
              </h2>
              <p className="text-base text-muted-foreground">
                Hear from professionals who&apos;ve transformed their careers with our guidance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 italic leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold text-sm">{testimonial.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <Card className="p-8 md:p-12 bg-primary rounded-2xl border-none">
              <CardContent className="p-0 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-4">
                  <ArrowRight className="w-4 h-4" />
                  GET STARTED
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-4 tracking-tight">
                  Ready to Transform Your Career?
                </h2>
                <p className="text-base text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of professionals who&apos;ve already discovered their ideal career path. 
                  Start your journey today with our AI-powered career counseling.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/signin">  
                  <Button size="lg" className="text-base px-8 py-6 bg-primary-foreground text-primary rounded-lg hover:opacity-90 transition-opacity">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="py-12 border-t border-border">
          <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display text-lg text-foreground">CareerPath AI</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Empowering careers with AI-driven insights and personalized guidance.
              </p>
              <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              </div>
          </div>
          </footer>
        </div>
      )}
    </div>
  );
}
