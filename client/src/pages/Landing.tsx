import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Bot } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Business Development Idea Agent
              </h1>
            </div>
            <Link href="/login">
              <Button className="btn-primary">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Bot className="h-4 w-4" />
                  <span>Powered by Gemini 2.5 AI</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Transform Your Business Ideas with{" "}
                  <span className="text-gradient">AI-Powered Insights</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Leverage industry-leading data, expert interviews, and intelligent analysis to refine your business concepts and accelerate your path to success.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                    <Button className="btn-primary">
                    Start Creating <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
                <Button variant="outline" className="btn-secondary">
                  Watch Demo <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Modern business innovation workspace" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform combines market intelligence, expert insights, and AI-powered guidance to accelerate your business development journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <div className="feature-card-icon bg-primary/10">
                <Bot className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Expert Interviews</h3>
              <p className="text-muted-foreground">Access transcripts from top CEOs and industry leaders to gain valuable insights and proven strategies.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon bg-accent/10">
                <Bot className="text-accent text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Market Intelligence</h3>
              <p className="text-muted-foreground">Upload and analyze market data to identify trends, opportunities, and competitive advantages.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon bg-yellow-500/10">
                <Bot className="text-yellow-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">AI Assistant</h3>
              <p className="text-muted-foreground">Get real-time guidance from our Gemini 2.5-powered AI to refine and improve your business concepts.</p>
            </div>

            <div className="feature-card">
              <div className="feature-card-icon bg-purple-500/10">
                <Bot className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Forms</h3>
              <p className="text-muted-foreground">Create comprehensive business plans with intelligent form assistance and automated suggestions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Business Ideas?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of entrepreneurs who are already using our AI-powered platform to build successful businesses.
          </p>
          <Link href="/login">
            <Button size="lg" className="btn-primary">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}