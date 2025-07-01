import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Search, Mic } from "lucide-react";

export default function SSDCTranscripts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const { user } = useAuth();

  const { data: transcripts = [] as any[], isLoading } = useQuery<any[]>({
    queryKey: ["/api/ssdc-transcripts"],
  });

  const industries = ["Technology", "Finance", "Healthcare", "E-commerce", "Education"];

  if (isLoading) {
    return (
      <div className="page-content flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <div className="loading-dot" />
            <div className="loading-dot" style={{ animationDelay: "0.1s" }} />
            <div className="loading-dot" style={{ animationDelay: "0.2s" }} />
          </div>
          <p className="text-muted-foreground">Loading transcripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">SSDC Interview Transcripts</h1>
            <p className="text-muted-foreground mt-2">Access insights from top industry leaders and CEOs</p>
          </div>
          {user?.isAdmin && (
            <Button className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Transcript
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transcripts..."
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transcript Cards */}
        {transcripts && transcripts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {transcripts.map((transcript: any) => (
              <Card key={transcript.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {transcript.imageUrl && (
                  <img 
                    src={transcript.imageUrl} 
                    alt={`${transcript.intervieweeName} interview`}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src={transcript.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=50&h=50&fit=crop&crop=face`}
                      alt={transcript.intervieweeName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {transcript.intervieweeName} - {transcript.intervieweeRole}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {transcript.industry} | {transcript.duration} min interview
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {transcript.content.substring(0, 200)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {transcript.tags?.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium text-sm">
                      Read Transcript
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Mic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Transcripts Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedIndustry 
                ? "Try adjusting your search filters" 
                : "No SSDC transcripts have been added yet"}
            </p>
            {user?.isAdmin && (
              <Button className="mt-4 btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add First Transcript
              </Button>
            )}
          </div>
        )}

        {/* Load More */}
        {transcripts && transcripts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="btn-secondary">
              Load More Transcripts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
