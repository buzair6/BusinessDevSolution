import { Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";

// The QueryClientProvider and Toaster have been removed from this file
// as they are correctly placed in `main.tsx`.

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // A simple loading indicator while authentication status is checked
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
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

export default App;