import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LightbulbOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type BusinessIdea } from "@shared/schema";
import { IdeaCard } from "@/components/ui/IdeaCard"; // Corrected import path for IdeaCard
import { Link } from "wouter";

export default function PublicIdeasPage() {
  const { toast } = useToast();

  const { data: ideas, isLoading, isError, error } = useQuery<BusinessIdea[]>({
    queryKey: ["approvedIdeas", "/api/ideas/approved"], // Combined queryKey
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const upvoteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/ideas/${id}/upvote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedIdeas", "/api/ideas/approved"] });
      toast({ title: "Idea Upvoted!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Upvote Failed",
        description: err.message || "Could not upvote the idea. Please login to vote.",
        variant: "destructive",
      });
    },
  });

  const downvoteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/ideas/${id}/downvote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvedIdeas", "/api/ideas/approved"] });
      toast({ title: "Idea Downvoted!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Downvote Failed",
        description: err.message || "Could not downvote the idea. Please login to vote.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading approved ideas...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Ideas</CardTitle>
            <CardDescription>
              We couldn't retrieve the business ideas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-destructive">
              <LightbulbOff className="h-5 w-5" />
              <p className="text-sm">{error?.message || "Unknown error"}</p>
            </div>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["approvedIdeas", "/api/ideas/approved"] })}
              className="w-full mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Community Business Ideas</h1>
      {ideas && ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onUpvote={(id) => upvoteMutation.mutate(id)}
              onDownvote={(id) => downvoteMutation.mutate(id)}
              isVoting={upvoteMutation.isPending || downvoteMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-10">
          No approved business ideas yet. Be the first to submit one!
          <p className="mt-2">
            <Button asChild variant="link">
                <Link href="/submit-idea">Submit an Idea</Link>
            </Button>
            {" "}or{" "}
            <Button asChild variant="link">
                <Link href="/login">Login</Link>
            </Button>
          </p>
        </div>
      )}
    </div>
  );
}