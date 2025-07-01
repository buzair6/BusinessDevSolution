import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AIChat } from "@/components/AIChat";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, Send, Sparkles } from "lucide-react";

const businessFormSchema = z.object({
  title: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  problemStatement: z.string().min(10, "Problem statement must be at least 10 characters"),
  targetMarket: z.string().min(10, "Target market description is required"),
  revenueModel: z.string().min(1, "Revenue model is required"),
  competitiveAdvantage: z.string().optional(),
  fundingRequirement: z.coerce.number().optional(),
  status: z.string().default("draft"),
});

type BusinessFormData = z.infer<typeof businessFormSchema>;

export default function CreateForm() {
  const [, navigate] = useLocation();
  const [formId, setFormId] = useState<number | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>({});
  const { user } = useAuth();
  const { toast } = useToast();

  // Get edit ID from URL params
  const editId = new URLSearchParams(window.location.search).get('edit');

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      title: "",
      industry: "",
      problemStatement: "",
      targetMarket: "",
      revenueModel: "",
      competitiveAdvantage: "",
      fundingRequirement: 0,
      status: "draft",
    },
  });

  // Load existing form data if editing
  const { data: existingForm } = useQuery({
    queryKey: ["/api/business-forms", editId],
    queryFn: async () => {
      if (!editId) return null;
      const response = await fetch(`/api/business-forms/${editId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch form");
      return response.json();
    },
    enabled: !!editId,
  });

  // Update form when existing data loads
  useEffect(() => {
    if (existingForm) {
      setFormId(existingForm.id);
      form.reset({
        title: existingForm.title || "",
        industry: existingForm.industry || "",
        problemStatement: existingForm.problemStatement || "",
        targetMarket: existingForm.targetMarket || "",
        revenueModel: existingForm.revenueModel || "",
        competitiveAdvantage: existingForm.competitiveAdvantage || "",
        fundingRequirement: existingForm.fundingRequirement || 0,
        status: existingForm.status || "draft",
      });
      
      if (existingForm.aiSuggestions) {
        setAiSuggestions(existingForm.aiSuggestions);
      }
    }
  }, [existingForm, form]);

  const saveFormMutation = useMutation({
    mutationFn: async (data: BusinessFormData) => {
      const url = formId ? `/api/business-forms/${formId}` : "/api/business-forms";
      const method = formId ? "PUT" : "POST";
      
      const response = await apiRequest(method, url, {
        ...data,
        aiSuggestions,
        formData: data,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFormId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/business-forms"] });
      toast({
        title: "Success",
        description: formId ? "Form updated successfully" : "Form created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive",
      });
    },
  });

  const getAiSuggestionsMutation = useMutation({
    mutationFn: async (fieldName: string) => {
      const response = await apiRequest("POST", "/api/ai-refine-concept", {
        concept: form.getValues('problemStatement'),
        targetMarket: form.getValues('targetMarket'),
        industry: form.getValues('industry'),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiSuggestions(prev => ({
        ...prev,
        lastSuggestion: data.refinedConcept,
      }));
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    saveFormMutation.mutate(data);
  };

  const handleGetSuggestions = () => {
    const formData = form.getValues();
    if (!formData.problemStatement || !formData.industry) {
      toast({
        title: "Missing Information",
        description: "Please fill in the problem statement and industry first",
        variant: "destructive",
      });
      return;
    }
    getAiSuggestionsMutation.mutate('concept');
  };

  const industries = [
    "Technology",
    "Healthcare", 
    "Finance",
    "E-commerce",
    "Education",
    "Manufacturing",
    "Real Estate",
    "Transportation",
    "Entertainment",
    "Food & Beverage"
  ];

  const revenueModels = [
    { value: "subscription", label: "Subscription" },
    { value: "one-time", label: "One-time Purchase" },
    { value: "freemium", label: "Freemium" },
    { value: "commission", label: "Commission" },
    { value: "advertising", label: "Advertising" },
    { value: "marketplace", label: "Marketplace" },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {formId ? "Edit Business Form" : "AI-Assisted Form Creation"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Get real-time guidance while building your business plan
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate("/business-forms")}
              className="btn-secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Form Section */}
        <div className="flex-1 flex flex-col bg-background">
          <div className="flex-1 overflow-y-auto p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Business Concept Overview
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetSuggestions}
                        disabled={getAiSuggestionsMutation.isPending}
                        className="ml-auto"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {getAiSuggestionsMutation.isPending ? "Getting Suggestions..." : "Get AI Suggestions"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your business name" 
                              className="form-field"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="form-field">
                                <SelectValue placeholder="Select Industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="problemStatement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Problem Statement *</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={4}
                              placeholder="Describe the problem your business solves..."
                              className="form-field resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetMarket"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Market *</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3}
                              placeholder="Define your target audience..."
                              className="form-field resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="revenueModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Revenue Model *</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-3"
                            >
                              {revenueModels.map((model) => (
                                <div key={model.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={model.value} id={model.value} />
                                  <Label 
                                    htmlFor={model.value}
                                    className="text-sm cursor-pointer"
                                  >
                                    {model.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="competitiveAdvantage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Competitive Advantage</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3}
                              placeholder="What makes your business unique?"
                              className="form-field resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fundingRequirement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Requirement (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="0"
                              className="form-field"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* AI Suggestions Display */}
                {aiSuggestions.lastSuggestion && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-primary flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-sm text-foreground">
                        {aiSuggestions.lastSuggestion}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>
          </div>

          {/* Form Actions */}
          <div className="flex-shrink-0 p-6 border-t border-border bg-card">
            <div className="flex space-x-4">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={saveFormMutation.isPending}
                className="btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveFormMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                variant="outline"
                onClick={form.handleSubmit((data) => {
                  saveFormMutation.mutate({ ...data, status: "completed" });
                })}
                disabled={saveFormMutation.isPending}
                className="btn-secondary"
              >
                <Eye className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          </div>
        </div>

        {/* AI Chat Section */}
        <div className="w-96 border-l border-border">
          <AIChat 
            formId={formId || undefined}
            context={{
              formData: form.getValues(),
              suggestions: aiSuggestions,
            }}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
