import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; //
import { Button } from "@/components/ui/button"; //
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { type BusinessIdea } from "@shared/schema"; // Import the type

interface IdeaCardProps {
  idea: BusinessIdea;
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  isVoting: boolean; // Prop to indicate if a vote is in progress
}

export const IdeaCard = ({ idea, onUpvote, onDownvote, isVoting }: IdeaCardProps) => {
  return (
    <Card className="w-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-xl">{idea.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Submitted on: {new Date(idea.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-foreground mb-4 line-clamp-4">{idea.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpvote(idea.id)}
              disabled={isVoting}
              className="px-2"
            >
              <ThumbsUp className="h-4 w-4 mr-1" /> {idea.upvotes}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownvote(idea.id)}
              disabled={isVoting}
              className="px-2"
            >
              <ThumbsDown className="h-4 w-4 mr-1" /> {idea.downvotes}
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            Status: <span className={`font-semibold ${idea.status === 'approved' ? 'text-accent' : idea.status === 'pending' ? 'text-yellow-500' : 'text-destructive'}`}>
                {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};