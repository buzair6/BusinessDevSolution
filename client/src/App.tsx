import { Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth"; //
import LoginPage from "@/pages/Login"; //
import Dashboard from "@/pages/Dashboard"; //
import SubmitIdeaPage from "@/pages/SubmitIdea"; // New: Import the new page
import PublicIdeasPage from "@/pages/PublicIdeas"; // New: Import the new page
import AdminIdeasPage from "@/pages/AdminIdeas"; // New: Import the new page
import AdminEditIdeaPage from "@/pages/AdminEditIdea"; // New: Import the new page

// The QueryClientProvider and Toaster have been removed from this file
// as they are correctly placed in `main.tsx`.

function App() {
  const { user, isLoading } = useAuth(); //

  if (isLoading) {
    // A simple loading indicator while authentication status is checked
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const isAdmin = user?.isAdmin; // Helper for admin check

  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <Switch>
        {/* Public/Shared Root Page - redirect to Ideas or Login */}
        <Route path="/">
          <Redirect to="/ideas" /> {/* Default to public ideas page */}
        </Route>
        
        {/* Public Ideas Page (view and vote) */}
        <Route path="/ideas">
          <PublicIdeasPage />
        </Route>

        {/* Authentication Pages */}
        <Route path="/login">
          {user ? <Redirect to="/dashboard" /> : <LoginPage />}
        </Route>

        {/* Authenticated User Pages */}
        <Route path="/dashboard">
          {user ? <Dashboard /> : <Redirect to="/login" />}
        </Route>
        <Route path="/submit-idea">
          {user ? <SubmitIdeaPage /> : <Redirect to="/login" />}
        </Route>

        {/* Admin-Specific Pages - protected */}
        <Route path="/admin/ideas">
          {isAdmin ? <AdminIdeasPage /> : <Redirect to="/login" />}
        </Route>
        <Route path="/admin/ideas/:id/edit">
          {isAdmin ? <AdminEditIdeaPage /> : <Redirect to="/login" />}
        </Route>

        {/* Fallback 404 Route */}
        <Route>404: Not Found!</Route>
      </Switch>
    </Suspense>
  );
}

export default App;