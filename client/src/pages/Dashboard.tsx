import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  PlusCircle, 
  Upload, 
  MessageCircle, 
  TrendingUp,
  FileText,
  Bot,
  ArrowRight,
  Play 
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: recentForms } = useQuery({
    queryKey: ["/api/business-forms"],
    // Fix: Safely handle data by checking if it exists before slicing.
    // Provide a default empty array to prevent errors.
    select: (data: any[] | undefined) => (data ? data.slice(0, 3) : []),
  });

  const { data: marketInsights } = useQuery({
    queryKey: ["/api/market-survey-data"],
    // Fix: Safely handle data by checking if it exists before slicing.
    // Provide a default empty array to prevent errors.
    select: (data: any[] | undefined) => (data ? data.slice(0, 2) : []),
  });

  return (
    <div className="page-content">
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
                <Link href="/create-form">
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

      {/* Feature Overview */}
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
                <TrendingUp className="text-accent text-xl" />
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
                <FileText className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Forms</h3>
              <p className="text-muted-foreground">Create comprehensive business plans with intelligent form assistance and automated suggestions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Forms */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">Recent Forms</CardTitle>
                <Link href="/business-forms">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentForms && recentForms.length > 0 ? (
                  recentForms.map((form: any) => (
                    <div key={form.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className={`status-indicator ${
                        form.status === 'completed' ? 'status-completed' : 
                        form.status === 'draft' ? 'status-draft' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{form.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {new Date(form.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No forms yet</p>
                    <Link href="/create-form">
                      <Button size="sm" className="mt-2">Create your first form</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Insights */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">Market Insights</CardTitle>
                <Link href="/market-survey">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketInsights && marketInsights.length > 0 ? (
                  marketInsights.map((insight: any) => (
                    <div key={insight.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">{insight.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {insight.keyInsights?.[0] || insight.content.substring(0, 80) + "..."}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {insight.industry}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No market data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Assistant Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
                <div className="flex items-center space-x-2 text-xs text-accent">
                  <div className="status-indicator status-online" />
                  <span>Online</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    Ready to help you refine your business idea! What would you like to work on today?
                  </p>
                </div>
                <Link href="/create-form">
                  <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary">
                    Start Conversation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/create-form">
              <div className="quick-action-card">
                <PlusCircle className="text-primary quick-action-icon" />
                <span className="font-medium text-sm">New Form</span>
              </div>
            </Link>
            
            <Link href="/market-survey">
              <div className="quick-action-card">
                <Upload className="text-accent quick-action-icon" />
                <span className="font-medium text-sm">Upload Data</span>
              </div>
            </Link>
            
            <Link href="/create-form">
              <div className="quick-action-card">
                <MessageCircle className="text-yellow-600 quick-action-icon" />
                <span className="font-medium text-sm">AI Chat</span>
              </div>
            </Link>
            
            <Link href="/market-survey">
              <div className="quick-action-card">
                <TrendingUp className="text-purple-600 quick-action-icon" />
                <span className="font-medium text-sm">Analytics</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}