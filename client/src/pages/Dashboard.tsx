import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

export default function Dashboard() {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40">
      <div className="p-8 bg-background rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        <p className="text-muted-foreground mb-6">
          You are successfully logged in. This is your dashboard.
        </p>
        <Button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            variant="outline"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </div>
  );
}
