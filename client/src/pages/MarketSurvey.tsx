import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, TrendingUp, Upload, Search } from "lucide-react";

const addDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  source: z.string().min(1, "Source is required"),
  industry: z.string().min(1, "Industry is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  keyInsights: z.string().optional(),
  dataType: z.string().min(1, "Data type is required"),
});

type AddDataForm = z.infer<typeof addDataSchema>;

export default function MarketSurvey() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedDataType, setSelectedDataType] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: marketData, isLoading } = useQuery({
    queryKey: ["/api/market-survey-data", { industry: selectedIndustry, dataType: selectedDataType }],
    enabled: true,
  });

  const form = useForm<AddDataForm>({
    resolver: zodResolver(addDataSchema),
    defaultValues: {
      title: "",
      source: "",
      industry: "",
      content: "",
      keyInsights: "",
      dataType: "trend",
    },
  });

  const addDataMutation = useMutation({
    mutationFn: async (data: AddDataForm) => {
      const keyInsightsArray = data.keyInsights 
        ? data.keyInsights.split('\n').filter(insight => insight.trim())
        : [];
      
      const response = await apiRequest("POST", "/api/market-survey-data", {
        ...data,
        keyInsights: keyInsightsArray,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-survey-data"] });
      toast({
        title: "Success",
        description: "Market data added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add market data",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddDataForm) => {
    addDataMutation.mutate(data);
  };

  const industries = ["Technology", "Finance", "Healthcare", "E-commerce", "Education"];
  const dataTypes = [
    { value: "trend", label: "Market Trend" },
    { value: "report", label: "Research Report" },
    { value: "analysis", label: "Data Analysis" },
    { value: "survey", label: "Survey Results" },
  ];

  const getDataTypeColor = (type: string) => {
    switch (type) {
      case "trend": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "report": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "analysis": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "survey": return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <div className="loading-dot" />
            <div className="loading-dot" style={{ animationDelay: "0.1s" }} />
            <div className="loading-dot" style={{ animationDelay: "0.2s" }} />
          </div>
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Market Survey Data</h1>
            <p className="text-muted-foreground mt-2">Upload and analyze market insights and trends</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Market Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Market Survey Data</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Market data title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <FormControl>
                            <Input placeholder="Data source URL or publication" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
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
                      name="dataType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select data type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dataTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed market data content..."
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keyInsights"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Insights (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Key insights, one per line..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={addDataMutation.isPending}
                      className="btn-primary"
                    >
                      {addDataMutation.isPending ? "Adding..." : "Add Data"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search market data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {dataTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Market Data Cards */}
        {marketData && marketData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketData.map((data: any) => (
              <Card key={data.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{data.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Source: {data.source}
                      </p>
                    </div>
                    <Badge className={getDataTypeColor(data.dataType)}>
                      {dataTypes.find(t => t.value === data.dataType)?.label || data.dataType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {data.content.substring(0, 150)}...
                  </p>
                  
                  {data.keyInsights && data.keyInsights.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">Key Insights:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {data.keyInsights.slice(0, 2).map((insight: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span className="line-clamp-1">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{data.industry}</Badge>
                    <p className="text-xs text-muted-foreground">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Market Data Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedIndustry || selectedDataType
                ? "Try adjusting your search filters" 
                : "Start by adding market survey data and insights"}
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="btn-primary">
              <Upload className="mr-2 h-4 w-4" />
              Add Market Data
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
