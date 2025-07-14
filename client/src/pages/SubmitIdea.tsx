import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; //
import { Button } from "@/components/ui/button"; //
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; //
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; //
import { Input } from "@/components/ui/input"; //
import { Textarea } from "@/components/ui/textarea"; //
import { useToast } from "@/hooks/use-toast"; //
import { Lightbulb } from "lucide-react";

// Define the schema for idea submission form using Zod
// This should match the structure of insertBusinessIdeaSchema in shared/schema.ts
const ideaFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(256, "Title cannot exceed 256 characters."),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
});

type IdeaFormValues = z.infer<typeof ideaFormSchema>;

export default function SubmitIdeaPage() {
  const { toast } = useToast();

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: { title: "", description: "" },
  });

  const submitIdeaMutation = useMutation({
    mutationFn: (data: IdeaFormValues) => apiRequest("POST", "/api/ideas", data),
    onSuccess: () => {
      toast({
        title: "Idea Submitted",
        description: "Your business idea has been submitted for review!",
      });
      form.reset(); // Clear form after successful submission
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your idea.",
        variant: "destructive", //
      });
    },
  });

  const onSubmit = (values: IdeaFormValues) => {
    submitIdeaMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Submit Your Business Idea</CardTitle>
          <CardDescription>
            Share your innovative business concept with us. It will be reviewed by an admin.
          </CardDescription>
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
                        placeholder="Describe your idea in detail, including its purpose, target audience, and unique selling points."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={submitIdeaMutation.isPending}
              >
                {submitIdeaMutation.isPending ? "Submitting..." : "Submit Idea"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}