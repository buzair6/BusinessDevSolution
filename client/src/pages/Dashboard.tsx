import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Shield, User as UserIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Terminal } from "lucide-react"; // Import an icon for errors

export default function Dashboard() {
  const { user, isLoading, error } = useAuth(); // Destructure error from useAuth
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Logged out successfully." });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading user data...
      </div>
    );
  }

  // Display error if useAuth returns one
  if (error) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Could not load dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                {error.message || "Failed to fetch user data. Please try logging in again."}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button
                onClick={() => logoutMutation.mutate()} // Allow user to try logging out
                disabled={logoutMutation.isPending}
                className="w-full"
                variant="outline"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Return to Login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback if user is null after loading (e.g., session expired without an explicit error)
  if (!user) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/login")} // Redirect to login
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome, {user?.firstName || user?.email}!</CardTitle>
          <CardDescription>You are logged in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 rounded-md border p-4">
            {user?.isAdmin ? (
              <Shield className="h-6 w-6 text-primary" />
            ) : (
              <UserIcon className="h-6 w-6 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">Account Role</p>
              <p className="text-sm text-muted-foreground">
                You are an {user?.isAdmin ? "Admin" : "User"}.
              </p>
            </div>
          </div>
          <Button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full"
            variant="outline"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}