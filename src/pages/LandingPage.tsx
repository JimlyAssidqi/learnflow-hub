import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  Users,
  MessageSquare,
  Download,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Rich Learning Materials',
    description: 'Access PDFs, presentations, and videos uploaded by expert teachers.',
  },
  {
    icon: ClipboardList,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with auto-graded quizzes and instant feedback.',
  },
  {
    icon: MessageSquare,
    title: 'Discussion Forums',
    description: 'Engage with teachers and peers through material-specific discussions.',
  },
  {
    icon: Download,
    title: 'Offline Access',
    description: 'Download materials and study anytime, even without internet.',
  },
  {
    icon: Users,
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed analytics.',
  },
  {
    icon: Sparkles,
    title: 'Modern Interface',
    description: 'Enjoy a beautiful, intuitive learning experience.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-outfit text-xl font-bold text-foreground">EduLearn</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              Modern E-Learning Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
              Learn Without Limits,{' '}
              <span className="text-primary">Grow Beyond Boundaries</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive e-learning platform with rich materials, interactive quizzes, 
              real-time discussions, and offline access for seamless learning.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-base px-8">
                <Link to="/register">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>

            {/* Demo accounts hint */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="text-sm text-muted-foreground">Try demo:</span>
              {['Student', 'Teacher', 'Admin'].map((role) => (
                <span key={role} className="text-sm font-medium text-primary">
                  {role.toLowerCase()}@elearn.com
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything You Need to Learn
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern education
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="glass glass-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(0_0%_100%/0.1),transparent_50%)]" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start Learning?
                </h2>
                <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
                  Join thousands of students and teachers on our platform. 
                  Start your learning journey today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    asChild 
                    className="text-base px-8"
                  >
                    <Link to="/register">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-outfit font-bold text-foreground">EduLearn</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 EduLearn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
