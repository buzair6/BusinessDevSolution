import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Wrench } from "lucide-react";
import { type BusinessIdea, updateBusinessIdeaSchema } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type EditIdeaFormValues = z.infer<typeof updateBusinessIdeaSchema>;

export default function AdminEditIdeaPage() {
  const [match, params] = useRoute("/admin/ideas/:id/edit");
  const ideaId = match ? parseInt(params.id) : null;
  const { toast } = useToast();

  const {
    data: idea,
    isLoading,
    isError,
    error,
  } = useQuery<BusinessIdea>({
    queryKey: ["adminIdea", ideaId, `/api/admin/ideas/${ideaId}`], // Combined queryKey, include ideaId for uniqueness
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: ideaId !== null,
  });

  const form = useForm<EditIdeaFormValues>({
    resolver: zodResolver(updateBusinessIdeaSchema),
    defaultValues: { title: "", description: "", status: "pending" },
  });

  // Populate form with fetched data
  useEffect(() => {
    if (idea) {
      form.reset({
        title: idea.title,
        description: idea.description,
        status: idea.status,
      });
    }
  }, [idea, form]);

  const updateIdeaMutation = useMutation({
    mutationFn: (data: EditIdeaFormValues) =>
      apiRequest("PUT", `/api/admin/ideas/${ideaId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminIdea", ideaId] });
      queryClient.invalidateQueries({ queryKey: ["adminAllIdeas"] });
      queryClient.invalidateQueries({ queryKey: ["approvedIdeas"] });
      toast({ title: "Idea updated successfully!" });
    },
    onError: (err: Error) => {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update the idea.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EditIdeaFormValues) => {
    if (ideaId) {
      updateIdeaMutation.mutate(values);
    }
  };

  if (!ideaId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Idea ID</CardTitle>
            <CardDescription>No idea ID provided in the URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/ideas">Back to Admin Ideas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading idea details...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Idea</CardTitle>
            <CardDescription>
              We couldn't retrieve details for this idea.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-destructive">
              <Wrench className="h-5 w-5" />
              <p className="text-sm">{error?.message || "Unknown error"}</p>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href="/admin/ideas">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Ideas
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Wrench className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Edit Business Idea</CardTitle>
          <CardDescription>Modify the details of the business idea.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idea Title</FormLabel>
                    <FormControl>
                      <Input placeholder="A revolutionary new app..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your idea in detail..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={updateIdeaMutation.isPending}
              >
                {updateIdeaMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/admin/ideas">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Ideas
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}