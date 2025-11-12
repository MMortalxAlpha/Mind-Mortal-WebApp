import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { Star, Users } from "lucide-react";
import PostInteractions from "../social/PostInteractions";

export default function WisdomResourceCard({
  resource,
  getResourceTypeIcon,
  onViewDetails,
}) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getResourceTypeIcon(resource.resource_type)}
          {resource.title}
          {resource.is_featured && (
            <Badge variant="secondary" className="ml-2">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {resource.approved && (
            <Badge variant="default" className="ml-2">
              Approved
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span>
            Created on {new Date(resource.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {resource.views_count || 0} views
          </span>
          <Badge variant="outline">{resource.resource_type}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resource.description && (
          <p className="text-muted-foreground mb-3">{resource.description}</p>
        )}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {resource.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch">
        <PostInteractions
          postId={resource.id}
          postType="wisdom_resource"
          onUpdate={fetchResources}
        />
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(resource)}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
