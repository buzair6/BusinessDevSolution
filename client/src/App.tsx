import { Switch, Route, Redirect } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopNavigation } from "@/components/TopNavigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Pages
import Landing from "@/pages/Landing";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SSDCTranscripts from "@/pages/SSDCTranscripts";
import MarketSurvey from "@/pages/MarketSurvey";
import BusinessForms from "@/pages/BusinessForms";
import CreateForm from "@/pages/CreateForm";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "@/pages/not-found";

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation onToggleSidebar={toggleSidebar} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main 
          className={`flex-1 main-content-transition ${
            sidebarOpen && !isMobile ? 'lg:ml-64' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <div className="loading-dot" />
            <div className="loading-dot" style={{ animationDelay: "0.1s" }} />
            <div className="loading-dot" style={{ animationDelay: "0.2s" }} />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <div className="loading-dot" />
            <div className="loading-dot" style={{ animationDelay: "0.1s" }} />
            <div className="loading-dot" style={{ animationDelay: "0.2s" }} />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Landing />}
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/ssdc-transcripts">
        <ProtectedRoute>
          <AppLayout>
            <SSDCTranscripts />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/market-survey">
        <ProtectedRoute>
          <AppLayout>
            <MarketSurvey />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/business-forms">
        <ProtectedRoute>
          <AppLayout>
            <BusinessForms />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/create-form">
        <ProtectedRoute>
          <AppLayout>
            <CreateForm />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AppLayout>
            <AdminPanel />
          </AppLayout>
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
