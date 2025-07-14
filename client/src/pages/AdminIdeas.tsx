import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Edit, Trash2, Loader2, LightbulbOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type BusinessIdea } from "@shared/schema";
import { Link } from "wouter";

export default function AdminIdeasPage() {
  const { toast } = useToast();

  const {
    data: ideas,
    isLoading,
    isError,
    error,
  } = useQuery<BusinessIdea[]>({
    queryKey: ["adminAllIdeas", "/api/admin/ideas"], // Combined queryKey
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "pending" | "approved" | "rejected" }) =>
      apiRequest("PUT", `/api/admin/ideas/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllIdeas"] });
      queryClient.invalidateQueries({ queryKey: ["approvedIdeas"] });
      toast({ title: "Idea status updated!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Status Update Failed",
        description: err.message || "Could not update idea status.",
        variant: "destructive",
      });
    },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/ideas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAllIdeas"] });
      queryClient.invalidateQueries({ queryKey: ["approvedIdeas"] });
      toast({ title: "Idea deleted successfully!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Deletion Failed",
        description: err.message || "Could not delete the idea.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (id: number, status: "pending" | "approved" | "rejected") => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this idea?")) {
      deleteIdeaMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading ideas for admin review...
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
              We couldn't retrieve the business ideas for admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-destructive">
              <LightbulbOff className="h-5 w-5" />
              <p className="text-sm">{error?.message || "Unknown error"}</p>
            </div>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["adminAllIdeas"] })}
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
      <h1 className="text-3xl font-bold text-center mb-8">Admin Idea Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Business Ideas</CardTitle>
          <CardDescription>Review, approve, edit, or delete submitted business ideas.</CardDescription>
        </CardHeader>
        <CardContent>
          {ideas && ideas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Votes (Up/Down)</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ideas.map((idea) => (
                  <TableRow key={idea.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{idea.title}</TableCell>
                    <TableCell>
                      <Badge variant={
                        idea.status === "approved" ? "default" :
                        idea.status === "pending" ? "secondary" :
                        "destructive"
                      }>
                        {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{idea.upvotes} / {idea.downvotes}</TableCell>
                    <TableCell>{new Date(idea.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {idea.status !== "approved" && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(idea.id, "approved")} disabled={updateStatusMutation.isPending}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          {idea.status !== "rejected" && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(idea.id, "rejected")} disabled={updateStatusMutation.isPending}>
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <Link href={`/admin/ideas/${idea.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => handleDelete(idea.id)} className="text-destructive" disabled={deleteIdeaMutation.isPending}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-6">
              No business ideas to display.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}