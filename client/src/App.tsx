import { Switch, Route, Redirect } from "wouter";
import { useState, lazy, Suspense } from "react";
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
const Landing = lazy(() => import("@/pages/Landing"));
const LoginPage = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SSDCTranscripts = lazy(() => import("@/pages/SSDCTranscripts"));
const MarketSurvey = lazy(() => import("@/pages/MarketSurvey"));
const BusinessForms = lazy(() => import("@/pages/BusinessForms"));
const CreateForm = lazy(() => import("@/pages/CreateForm"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const NotFound = lazy(() => import("@/pages/not-found"));
const TestError = lazy(() => import("@/pages/TestError"));

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
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/ssdc-transcripts" component={SSDCTranscripts} />
          <Route path="/market-survey" component={MarketSurvey} />
          <Route path="/business-forms" component={BusinessForms} />
          <Route path="/create-form" component={CreateForm} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/error-test" component={TestError} />
          
          {/* Redirect root and login to dashboard if already authenticated */}
          <Route path="/">
            <Redirect to="/dashboard" />
          </Route>
          <Route path="/login">
            <Redirect to="/dashboard" />
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppLayout>
  );

  // A wrapper for unauthenticated routes
  const UnauthenticatedRoutes = () => (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        {/* Any other path goes to the landing page */}
        <Route path="/:rest*">
          <Landing />
        </Route>
        <Route path="/error-test" component={TestError} />
      </Switch>
    </Suspense>
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