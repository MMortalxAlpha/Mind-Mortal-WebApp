import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import PostInteractions from "@/components/social/PostInteractions";

interface PostDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  postType: string;
  onUpdate?: () => void;
}

const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  isOpen,
  onClose,
  post,
  postType,
  onUpdate,
}) => {
  if (!post) return null;

  const renderContent = (content: any) => {
    if (!content)
      return <p className="text-muted-foreground">No content available</p>;

    if (typeof content === "string") {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    if (content && typeof content === "object") {
      if (content.text) {
        return <p>{content.text}</p>;
      } else if (content.html) {
        return <div dangerouslySetInnerHTML={{ __html: content.html }} />;
      }
    }

    return <p>{String(content)}</p>;
  };

  const getPostTypeDisplay = () => {
    switch (postType) {
      case "legacy_post":
        return post.subcategory === "time-capsule"
          ? "Time Capsule"
          : "Legacy Post";
      case "idea_post":
        return "Idea Post";
      case "wisdom_resource":
        return "Wisdom Resource";
      case "timeless_message":
        return "Timeless Message";
      default:
        return "Post";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline">{getPostTypeDisplay()}</Badge>
            {post.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Created: {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>

            {post.release_date && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {postType === "timeless_message" ? "Delivery: " : "Release: "}
                  {new Date(
                    post.release_date || post.delivery_date
                  ).toLocaleDateString()}
                </span>
              </div>
            )}

            {post.delivery_date && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Delivery: {new Date(post.delivery_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.categories.map((category: string, index: number) => (
                <Badge key={index} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {post.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{post.description}</p>
            </div>
          )}
          {post.experience && (
            <div>
              <h4 className="font-semibold mb-2">Experience</h4>
              <p className="text-muted-foreground">{post.experience}</p>
            </div>
          )}

          {/* Legacy Post medial */}
          {postType === "legacy_post" && (
            <div className="mb-4">
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {post.media_urls.map((url: string) => (
                    <img
                      key={url}
                      src={url}
                      alt="Media"
                      className="object-cover border size-full rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}

          {postType !== "wisdom_resource" && (
            <div>
              <h4 className="font-semibold mb-2">Content</h4>
              <div className="prose prose-sm max-w-none">
                {renderContent(post.content)}
              </div>
            </div>
          )}

          {/* Recipients for timeless messages */}
          {postType === "timeless_message" &&
            post.recipient_emails &&
            post.recipient_emails.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recipients</h4>
                <div className="flex flex-wrap gap-2">
                  {post.recipient_emails.map((email: string, index: number) => (
                    <Badge key={index} variant="outline">
                      <User className="h-3 w-3 mr-1" />
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Delivery Information for timeless messages */}
          {postType === "timeless_message" && (
            <div>
              <h4 className="font-semibold mb-2">Delivery Information</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p>
                  <strong>Type:</strong>{" "}
                  {post.delivery_type === "date"
                    ? "Scheduled Date"
                    : "Event Triggered"}
                </p>
                {post.delivery_type === "date" && post.delivery_date && (
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(post.delivery_date).toLocaleDateString()}
                  </p>
                )}
                {post.delivery_type === "event" && post.delivery_event && (
                  <p>
                    <strong>Event:</strong> {post.delivery_event}
                  </p>
                )}
                <p>
                  <strong>Status:</strong> {post.status}
                </p>
                {post.is_recurring && (
                  <p>
                    <strong>Recurring:</strong> {post.recurrence_frequency}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Interactions */}
          <div>
            <PostInteractions
              postId={post.id}
              postType={postType}
              onUpdate={onUpdate}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailsModal;
