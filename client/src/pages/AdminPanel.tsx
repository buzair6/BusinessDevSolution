import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  TrendingUp, 
  Mic,
  Settings,
  UserPlus,
  Shield 
} from "lucide-react";
import { useEffect } from "react";

const createUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

const transcriptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  intervieweeName: z.string().min(1, "Interviewee name is required"),
  intervieweeRole: z.string().min(1, "Role is required"),
  intervieweeCompany: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  duration: z.coerce.number().min(1, "Duration is required"),
  content: z.string().min(10, "Content is required"),
  tags: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type TranscriptForm = z.infer<typeof transcriptSchema>;

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isTranscriptDialogOpen, setIsTranscriptDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      window.history.back();
    }
  }, [user, toast]);

  // Stats queries
  const { data: businessForms = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/business-forms"],
    enabled: !!user?.isAdmin,
  });

  const { data: transcripts = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/ssdc-transcripts"],
    enabled: !!user?.isAdmin,
  });

  const { data: marketData = [] as any[] } = useQuery<any[]>({
    queryKey: ["/api/market-survey-data"],
    enabled: !!user?.isAdmin,
  });

  // Forms
  const userForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      isAdmin: false,
    },
  });

  const transcriptForm = useForm<TranscriptForm>({
    resolver: zodResolver(transcriptSchema),
    defaultValues: {
      title: "",
      intervieweeName: "",
      intervieweeRole: "",
      intervieweeCompany: "",
      industry: "",
      duration: 0,
      content: "",
      tags: "",
      imageUrl: "",
      profileImageUrl: "",
    },
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserForm) => {
      const response = await apiRequest("POST", "/api/admin/create-user", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsUserDialogOpen(false);
      userForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const createTranscriptMutation = useMutation({
    mutationFn: async (data: TranscriptForm) => {
      const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
      const response = await apiRequest("POST", "/api/ssdc-transcripts", {
        ...data,
        tags,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssdc-transcripts"] });
      toast({
        title: "Success",
        description: "Transcript added successfully",
      });
      setIsTranscriptDialogOpen(false);
      transcriptForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add transcript",
        variant: "destructive",
      });
    },
  });

  const onCreateUser = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const onCreateTranscript = (data: TranscriptForm) => {
    createTranscriptMutation.mutate(data);
  };

  const industries = ["Technology", "Finance", "Healthcare", "E-commerce", "Education"];

  if (!user?.isAdmin) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">Manage users, content, and system settings</p>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Admin Access
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Business Forms</p>
                      <p className="text-2xl font-bold text-foreground">
                        {businessForms?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Mic className="h-8 w-8 text-accent" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">SSDC Transcripts</p>
                      <p className="text-2xl font-bold text-foreground">
                        {transcripts?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Market Data</p>
                      <p className="text-2xl font-bold text-foreground">
                        {marketData?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold text-foreground">
                        {businessForms ? new Set(businessForms.map((f: any) => f.userId)).size : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessForms?.slice(0, 5).map((form: any) => (
                    <div key={form.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium text-sm">{form.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {form.userId} • {new Date(form.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{form.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">User Management</h2>
              
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onCreateUser)} className="space-y-4">
                      <FormField
                        control={userForm.control}
                        name="id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User ID *</FormLabel>
                            <FormControl>
                              <Input placeholder="unique-user-id" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="user@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={userForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={userForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={userForm.control}
                        name="isAdmin"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Admin Privileges</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Grant admin access to this user
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-4 pt-4">
                        <Button 
                          type="submit" 
                          disabled={createUserMutation.isPending}
                          className="btn-primary"
                        >
                          {createUserMutation.isPending ? "Creating..." : "Create User"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsUserDialogOpen(false)}
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

            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">User management features will be expanded to show user lists and management options.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">Content Management</h2>
              
              <Dialog open={isTranscriptDialogOpen} onOpenChange={setIsTranscriptDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transcript
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add SSDC Transcript</DialogTitle>
                  </DialogHeader>
                  <Form {...transcriptForm}>
                    <form onSubmit={transcriptForm.handleSubmit(onCreateTranscript)} className="space-y-4">
                      <FormField
                        control={transcriptForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Interview title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={transcriptForm.control}
                          name="intervieweeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interviewee Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={transcriptForm.control}
                          name="intervieweeRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role *</FormLabel>
                              <FormControl>
                                <Input placeholder="CEO" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={transcriptForm.control}
                          name="intervieweeCompany"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={transcriptForm.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
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
                      </div>

                      <FormField
                        control={transcriptForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes) *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="45" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={transcriptForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content *</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={6}
                                placeholder="Interview transcript content..."
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={transcriptForm.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags (comma-separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="AI, Scaling, Investment" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={transcriptForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input type="url" placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={transcriptForm.control}
                          name="profileImageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image URL</FormLabel>
                              <FormControl>
                                <Input type="url" placeholder="https://..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <Button 
                          type="submit" 
                          disabled={createTranscriptMutation.isPending}
                          className="btn-primary"
                        >
                          {createTranscriptMutation.isPending ? "Adding..." : "Add Transcript"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsTranscriptDialogOpen(false)}
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

            {/* Content Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mic className="h-5 w-5 mr-2" />
                    SSDC Transcripts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {transcripts?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expert interviews and insights
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Market Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {marketData?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Market research and trends
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Business Forms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {businessForms?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    User-generated forms
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">System Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Gemini API Status</h4>
                      <p className="text-sm text-muted-foreground">Current AI service status</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Database Status</h4>
                      <p className="text-sm text-muted-foreground">PostgreSQL connection</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      Connected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
