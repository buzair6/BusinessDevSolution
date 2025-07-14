import { Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

// --- UI Components ---
import { Toaster } from "@/components/ui/toaster";

// --- API, State, and Pages ---
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper spinner component
  }

  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <Switch>
        <Route path="/">
          {user ? <Redirect to="/dashboard" /> : <LoginPage />}
        </Route>
        <Route path="/login">
          {user ? <Redirect to="/dashboard" /> : <LoginPage />}
        </Route>
        <Route path="/dashboard">
          {user ? <Dashboard /> : <Redirect to="/login" />}
        </Route>
        {/* Add other routes here */}
        <Route>404: Not Found!</Route>
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AppContent />
    </QueryClientProvider>
  );
}