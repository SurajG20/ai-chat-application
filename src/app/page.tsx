'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChatInterface } from '../components/chat-interface';
import { AuthButton } from '../components/auth-button';
import { ThemeToggle } from '../components/theme-toggle';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { 
  Users, 
  Target, 
  BookOpen, 
  MessageCircle, 
  Star, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Heart,
  Menu,
  X
} from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const services = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Career Assessment",
      description: "Discover your strengths, interests, and career preferences through our comprehensive assessment tools."
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Skill Development",
      description: "Get personalized recommendations for courses, certifications, and skill-building opportunities."
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Career Planning",
      description: "Create a strategic roadmap for your career growth with actionable steps and milestones."
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "AI Counseling",
      description: "Get instant, personalized career advice from our advanced AI counselor available 24/7."
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg sm:text-xl font-bold text-foreground">CareerPath AI</span>
                <div className="text-xs text-muted-foreground -mt-1">Your Career Companion</div>
              </div>
              <div className="sm:hidden">
                <span className="text-lg font-bold text-foreground">CareerPath AI</span>
              </div>
            </div>

            {/* Desktop Navigation Links - Only show when not logged in */}
            {!session && (
              <div className="hidden md:flex items-center space-x-8">
                <a href="#services" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
                  Services
                </a>
                <a href="#features" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
                  Features
                </a>
                <a href="#testimonials" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
                  Success Stories
                </a>
                <a href="#about" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
                  About
                </a>
          </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <AuthButton />
              {/* Mobile Menu Button - Only show when not logged in */}
              {!session && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu - Only show when not logged in */}
          {!session && isMobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 space-y-2">
                <a 
                  href="#services" 
                  className="block px-3 py-3 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a 
                  href="#features" 
                  className="block px-3 py-3 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  className="block px-3 py-3 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Success Stories
                </a>
                <a 
                  href="#about" 
                  className="block px-3 py-3 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {status === 'loading' ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : session ? (
        <ChatInterface userId={parseInt((session.user as { id?: string })?.id || '0')} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 text-sm">
                <Lightbulb className="h-4 w-4 mr-2" />
                AI-Powered Career Guidance
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Transform Your
                <span className="text-primary"> Career Journey</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get personalized career counseling, skill assessments, and strategic guidance from our advanced AI counselor. 
                Discover your potential and unlock new opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Try AI Counselor
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="services" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose CareerPath AI?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive platform combines cutting-edge AI technology with proven career counseling methodologies.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                      {service.icon}
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 bg-primary/5 rounded-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-lg text-muted-foreground">
                Join the growing community of professionals who've transformed their careers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-muted-foreground">Successful Career Transitions</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-muted-foreground">User Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">AI Counselor Availability</div>
              </div>
            </div>
          </section>

          {/* Features List */}
          <section id="features" className="py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Everything You Need for Career Success
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our comprehensive platform provides all the tools and guidance you need to advance your career, 
                  whether you're just starting out or looking to make a major transition.
                </p>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Card className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">CareerPath AI</div>
                        <div className="text-sm text-muted-foreground">Your Personal Career Counselor</div>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">
                        "Based on your skills and interests, I recommend exploring roles in Product Management. 
                        You have strong analytical thinking and communication skills that would be perfect for this field."
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">You</div>
                        <div className="text-sm text-muted-foreground">Career Seeker</div>
                      </div>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p className="text-sm">
                        "That sounds interesting! What skills should I focus on developing?"
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Success Stories
              </h2>
              <p className="text-lg text-muted-foreground">
                Hear from professionals who've transformed their careers with our guidance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 text-center">
            <Card className="p-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-0">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to Transform Your Career?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who've already discovered their ideal career path. 
                  Start your journey today with our AI-powered career counseling.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="py-12 border-t border-border">
          <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">CareerPath AI</span>
              </div>
              <p className="text-muted-foreground mb-4">
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
