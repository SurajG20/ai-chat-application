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
  X
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
    <div className="min-h-screen bg-[#131313]">
      {/* Navigation - Only show when not logged in */}
      {!session && (
        <nav className="sticky top-0 z-50 bg-[#131313] border-b border-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Verge-style wordmark */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <span className="font-display text-2xl sm:text-3xl text-white tracking-wide" style={{ lineHeight: 0.95 }}>CareerPath AI</span>
              </div>
              <div className="sm:hidden">
                <span className="font-display text-xl text-white tracking-wide" style={{ lineHeight: 0.95 }}>CareerPath AI</span>
              </div>
            </div>

            {/* Desktop Navigation Links - Only show when not logged in */}
            {!session && (
              <div className="hidden md:flex items-center space-x-8">
                <a href="#services" className="label-mono-sm text-white text-xs">
                  Services
                </a>
                <a href="#features" className="label-mono-sm text-white text-xs">
                  Features
                </a>
                <a href="#testimonials" className="label-mono-sm text-white text-xs">
                  Success Stories
                </a>
                <a href="#about" className="label-mono-sm text-white text-xs">
                  About
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
                  className="md:hidden p-2 text-white hover:text-[#3860be]"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu - Only show when not logged in */}
          {!session && isMobileMenuOpen && (
            <div className="md:hidden border-t border-white bg-[#131313]">
              <div className="px-4 py-3 space-y-2">
                <a 
                  href="#services" 
                  className="block px-3 py-3 label-mono-sm text-white text-xs"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a 
                  href="#features" 
                  className="block px-3 py-3 label-mono-sm text-white text-xs"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  className="block px-3 py-3 label-mono-sm text-white text-xs"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Success Stories
                </a>
                <a 
                  href="#about" 
                  className="block px-3 py-3 label-mono-sm text-white text-xs"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
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
            <div className="w-8 h-8 border-4 border-[#3cffd0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#949494]">Loading...</p>
          </div>
        </div>
      ) : session ? (
        <div className="max-w-[1280px] mx-auto px-6">
          <section className="py-20 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-5xl sm:text-6xl text-white mb-4" style={{ lineHeight: 0.95 }}>Welcome back</h2>
              <p className="text-lg text-[#949494] mb-8">Continue your conversations and get guidance tailored to you.</p>
              <Link href="/chat">
                <Button size="lg" className="text-lg px-8 py-6 bg-[#3cffd0] text-black rounded-full hover:bg-[rgba(255,255,255,0.2)] border-none">
                  Go to Chat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      ) : (
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Hero Section - Verge-style massive wordmark */}
          <section className="py-16 md:py-24 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="label-mono text-[#3cffd0] text-xs mb-4">
                AI-POWERED CAREER GUIDANCE
              </div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-[90px] text-white mb-4" style={{ lineHeight: 0.85, letterSpacing: '0.05px' }}>
                Transform Your<br />
                <span className="text-[#3cffd0]">Career Journey</span>
              </h1>
              <p className="text-sm md:text-base text-[#949494] mb-6 max-w-2xl mx-auto leading-relaxed">
                Get personalized career counseling, skill assessments, and strategic guidance from our advanced AI counselor. 
                Discover your potential and unlock new opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/signin">  
                <Button size="default" className="text-sm px-6 py-3 bg-[#3cffd0] text-black rounded-full hover:bg-[rgba(255,255,255,0.2)] border-none label-mono">
                  START YOUR JOURNEY
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section - StoryStream style tiles with glass effect */}
          <section id="services" className="py-16">
            <div className="text-center mb-12">
              <div className="label-mono text-[#3cffd0] text-xs mb-3">WHY CHOOSE CAREERPATH AI?</div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-3" style={{ lineHeight: 0.95 }}>
                Comprehensive Career Guidance
              </h2>
              <p className="text-sm text-[#949494] max-w-2xl mx-auto">
                Our comprehensive platform combines cutting-edge AI technology with proven career counseling methodologies.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service, index) => (
                <Card key={index} className="text-center bg-[#131313]/80 backdrop-blur-sm border border-white/30 rounded-[20px] p-5 hover:border-[#3cffd0] transition-all duration-150 hover:bg-[#131313]/90">
                  <div className="mx-auto w-12 h-12 bg-[#3cffd0] rounded-full flex items-center justify-center text-black mb-3">
                    {service.icon}
                  </div>
                  <CardTitle className="text-base text-white mb-2">{service.title}</CardTitle>
                  <CardContent>
                    <CardDescription className="text-sm text-[#949494] leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16">
            <div className="text-center mb-12">
              <div className="label-mono text-[#3cffd0] text-xs mb-3">HOW IT WORKS</div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-3" style={{ lineHeight: 0.95 }}>
                Simple Steps to Success
              </h2>
              <p className="text-sm text-[#949494] max-w-2xl mx-auto">
                Get started in minutes and transform your career with our AI-powered guidance.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#131313]/80 backdrop-blur-sm border border-white/30 rounded-[20px] p-6">
                <div className="label-mono text-[#3cffd0] text-xs mb-2">STEP 1</div>
                <h3 className="font-display text-xl text-white mb-2">Sign Up</h3>
                <p className="text-sm text-[#949494] leading-relaxed">
                  Create your free account in seconds. No credit card required to get started.
                </p>
              </Card>
              <Card className="bg-[#131313]/80 backdrop-blur-sm border border-white/30 rounded-[20px] p-6">
                <div className="label-mono text-[#3cffd0] text-xs mb-2">STEP 2</div>
                <h3 className="font-display text-xl text-white mb-2">Chat with AI</h3>
                <p className="text-sm text-[#949494] leading-relaxed">
                  Tell our AI counselor about your skills, goals, and career aspirations.
                </p>
              </Card>
              <Card className="bg-[#131313]/80 backdrop-blur-sm border border-white/30 rounded-[20px] p-6">
                <div className="label-mono text-[#3cffd0] text-xs mb-2">STEP 3</div>
                <h3 className="font-display text-xl text-white mb-2">Get Your Plan</h3>
                <p className="text-sm text-[#949494] leading-relaxed">
                  Receive personalized career roadmap with actionable steps and resources.
                </p>
              </Card>
            </div>
          </section>

          {/* Stats Section - Color block tile */}
          <section className="py-16 bg-[#5200ff]/90 backdrop-blur-sm rounded-[24px] p-6 md:p-10">
            <div className="text-center mb-10">
              <div className="label-mono text-white text-xs mb-3">TRUSTED BY THOUSANDS</div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-3" style={{ lineHeight: 0.95 }}>
                Join the Community
              </h2>
              <p className="text-sm text-white/80">
                Join the growing community of professionals who&apos;ve transformed their careers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-display text-3xl md:text-4xl text-white mb-2" style={{ lineHeight: 0.95 }}>10,000+</div>
                <div className="label-mono-sm text-white/80 text-xs">SUCCESSFUL CAREER TRANSITIONS</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl text-white mb-2" style={{ lineHeight: 0.95 }}>95%</div>
                <div className="label-mono-sm text-white/80 text-xs">USER SATISFACTION RATE</div>
              </div>
              <div>
                <div className="font-display text-3xl md:text-4xl text-white mb-2" style={{ lineHeight: 0.95 }}>24/7</div>
                <div className="label-mono-sm text-white/80 text-xs">AI COUNSELOR AVAILABILITY</div>
              </div>
            </div>
          </section>

          {/* Features List */}
          <section id="features" className="py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="label-mono text-[#3cffd0] text-xs mb-3">FEATURES</div>
                <h2 className="font-display text-2xl md:text-3xl text-white mb-4" style={{ lineHeight: 0.95 }}>
                  Everything You Need for Career Success
                </h2>
                <p className="text-sm text-[#949494] mb-6 leading-relaxed">
                  Our comprehensive platform provides all the tools and guidance you need to advance your career, 
                  whether you&apos;re just starting out or looking to make a major transition.
                </p>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-[#3cffd0] flex-shrink-0" />
                      <span className="text-sm text-white">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Card className="p-6 bg-[#131313]/80 backdrop-blur-sm border border-white/30 rounded-[24px]">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="bg-[#3cffd0] text-black w-8 h-8">
                        <AvatarFallback className="bg-[#3cffd0] text-black font-bold text-xs">AI</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white text-sm">CareerPath AI</div>
                        <div className="label-mono-sm text-[#949494] text-xs">YOUR PERSONAL CAREER COUNSELOR</div>
                      </div>
                    </div>
                    <div className="bg-[#2d2d2d]/80 backdrop-blur-sm p-3 rounded-[20px] border border-white/30">
                      <p className="text-xs text-white leading-relaxed">
                        &ldquo;Based on your skills and interests, I recommend exploring roles in Product Management. 
                        You have strong analytical thinking and communication skills that would be perfect for this field.&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Avatar className="bg-[#5200ff] text-white w-8 h-8">
                        <AvatarFallback className="bg-[#5200ff] text-white font-bold text-xs">U</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white text-sm">You</div>
                        <div className="label-mono-sm text-[#949494] text-xs">CAREER SEEKER</div>
                      </div>
                    </div>
                    <div className="bg-[#3cffd0]/10 p-3 rounded-[20px] border border-[#3cffd0]/50">
                      <p className="text-xs text-white leading-relaxed">
                        &ldquo;That sounds interesting! What skills should I focus on developing?&rdquo;
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Testimonials - StoryStream timeline style */}
          <section id="testimonials" className="py-16">
            <div className="text-center mb-12">
              <div className="label-mono text-[#3cffd0] text-xs mb-3">SUCCESS STORIES</div>
              <h2 className="font-display text-3xl md:text-4xl text-white mb-3" style={{ lineHeight: 0.95 }}>
                Transform Your Career
              </h2>
              <p className="text-sm text-[#949494]">
                Hear from professionals who&apos;ve transformed their careers with our guidance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-5 bg-[#131313]/80 backdrop-blur-sm border border-white/30 rounded-[20px]">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[#3cffd0] text-[#3cffd0]" />
                      ))}
                    </div>
                    <p className="text-xs text-[#949494] mb-4 italic leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center space-x-3">
                      <Avatar className="bg-[#5200ff] text-white w-8 h-8">
                        <AvatarFallback className="bg-[#5200ff] text-white font-bold text-xs">{testimonial.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                        <div className="label-mono-sm text-[#949494] text-xs">{testimonial.role.toUpperCase()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section - Mint color block */}
          <section className="py-16 text-center">
            <Card className="p-8 md:p-10 bg-[#3cffd0]/90 backdrop-blur-sm rounded-[24px] border-none">
              <CardContent className="p-0">
                <div className="label-mono text-black text-xs mb-3">GET STARTED</div>
                <h2 className="font-display text-2xl md:text-3xl text-black mb-3" style={{ lineHeight: 0.95 }}>
                  Ready to Transform Your Career?
                </h2>
                <p className="text-sm text-black/80 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of professionals who&apos;ve already discovered their ideal career path. 
                  Start your journey today with our AI-powered career counseling.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/auth/signin">  
                  <Button size="default" className="text-sm px-6 py-3 bg-black text-white rounded-full hover:bg-[rgba(255,255,255,0.2)] border-none label-mono">
                    GET STARTED NOW
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="py-10 border-t border-white/50">
          <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-5 h-5 bg-[#3cffd0] rounded flex items-center justify-center">
                  <Heart className="h-3 w-3 text-black" />
                </div>
                <span className="font-display text-base text-white">CareerPath AI</span>
              </div>
              <p className="text-xs text-[#949494] mb-3">
                Empowering careers with AI-driven insights and personalized guidance.
              </p>
              <div className="flex justify-center space-x-4 text-xs text-[#949494]">
                <a href="#" className="hover:text-[#3860be] transition-colors label-mono-sm">Privacy Policy</a>
                <a href="#" className="hover:text-[#3860be] transition-colors label-mono-sm">Terms of Service</a>
                <a href="#" className="hover:text-[#3860be] transition-colors label-mono-sm">Contact</a>
              </div>
          </div>
          </footer>
        </div>
      )}
    </div>
  );
}
