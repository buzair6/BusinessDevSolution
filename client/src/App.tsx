import { Switch, Route, Redirect } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopNavigation } from "@/components/TopNavigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary"; // Import the Error Boundary

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

/**
 * Main application layout for authenticated users.
 * It includes the top navigation bar and the sidebar.
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Root component that handles the main application logic and routing.
 */
function App() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // A wrapper for all authenticated routes that includes the main layout
  const AuthenticatedRoutes = () => (
    <AppLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/ssdc-transcripts" component={SSDCTranscripts} />
        <Route path="/market-survey" component={MarketSurvey} />
        <Route path="/business-forms" component={BusinessForms} />
        <Route path="/create-form" component={CreateForm} />
        <Route path="/admin" component={AdminPanel} />
        
        {/* Redirect root and login to dashboard if already authenticated */}
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
         <Route path="/login">
          <Redirect to="/dashboard" />
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );

  // A wrapper for unauthenticated routes
  const UnauthenticatedRoutes = () => (
    <Switch>
      <Route path="/login" component={LoginPage} />
      {/* Any other path goes to the landing page */}
      <Route path="/:rest*">
        <Landing />
      </Route>
    </Switch>
  );

  const renderContent = () => {
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
    
    return isAuthenticated ? <AuthenticatedRoutes /> : <UnauthenticatedRoutes />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;