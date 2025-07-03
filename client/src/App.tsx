import { Switch, Route, Redirect } from "wouter";
import { Suspense, lazy } from "react";
import { useAuth } from "@/hooks/useAuth";

const LoginPage = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading page...</div>}>
      <Switch>
        <Route path="/login">
          {isAuthenticated ? <Redirect to="/" /> : <LoginPage />}
        </Route>
        <Route path="/:rest*">
          {isAuthenticated ? <Dashboard /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    </Suspense>
  );
}

export default App;
