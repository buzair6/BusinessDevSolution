import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { FileText, Plus, Eye, Edit } from "lucide-react";

export default function BusinessForms() {
  const { user } = useAuth();

  const { data: forms, isLoading } = useQuery({
    queryKey: ["/api/business-forms"],
    enabled: true,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "draft": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "submitted": return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return "✓";
      case "draft": return "⚡";
      case "submitted": return "📋";
      default: return "📄";
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
          <p className="text-muted-foreground">Loading business forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Forms</h1>
            <p className="text-muted-foreground mt-2">
              {user?.isAdmin 
                ? "Manage all business development forms" 
                : "View and manage your business development forms"}
            </p>
          </div>
          <Link href="/create-form">
            <Button className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create New Form
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        {forms && forms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Forms</p>
                    <p className="text-2xl font-bold text-foreground">{forms.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-300 text-lg">⚡</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                    <p className="text-2xl font-bold text-foreground">
                      {forms.filter((form: any) => form.status === "draft").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-300 text-lg">✓</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-foreground">
                      {forms.filter((form: any) => form.status === "completed").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 text-lg">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                    <p className="text-2xl font-bold text-foreground">
                      {forms.filter((form: any) => form.status === "submitted").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Forms Grid */}
        {forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form: any) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{form.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {form.industry && (
                          <Badge variant="outline" className="mr-2">
                            {form.industry}
                          </Badge>
                        )}
                        Updated {new Date(form.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(form.status)}>
                      {getStatusIcon(form.status)} {form.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {form.problemStatement && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-1">Problem Statement:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {form.problemStatement}
                      </p>
                    </div>
                  )}
                  
                  {form.targetMarket && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-1">Target Market:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {form.targetMarket}
                      </p>
                    </div>
                  )}
                  
                  {form.revenueModel && (
                    <div className="mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {form.revenueModel} Model
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Link href={`/create-form?edit=${form.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                    {user?.isAdmin && (
                      <p className="text-xs text-muted-foreground">
                        by {form.userId}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Business Forms Found</h3>
            <p className="text-muted-foreground mb-4">
              Start creating business forms to develop and refine your ideas with AI assistance.
            </p>
            <Link href="/create-form">
              <Button className="btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Form
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
