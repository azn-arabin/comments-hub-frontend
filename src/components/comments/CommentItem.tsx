import { useState } from "react";
import type { Comment } from "@/lib/api/comments";
import { useAuth } from "@/components/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/date";
import { ThumbsUp, ThumbsDown, MessageSquare, Edit2, Trash2, MoreVertical, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => Promise<void>;
  onDislike: (commentId: string) => Promise<void>;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
  onLoadReplies?: (commentId: string) => Promise<void>;
  depth?: number;
}

export default function CommentItem({
  comment,
  onLike,
  onDislike,
  onUpdate,
  onDelete,
  onReply,
  onLoadReplies,
  depth = 0,
}: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor = user?.id === comment.author._id;
  const hasLiked = user ? comment.likes.includes(user.id) : false;
  const hasDisliked = user ? comment.dislikes.includes(user.id) : false;

  const handleLike = async () => {
    setLoading(true);
    try {
      await onLike(comment._id);
    } catch (_error) {
      toast.error("Failed to like comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async () => {
    setLoading(true);
    try {
      await onDislike(comment._id);
    } catch (_error) {
      toast.error("Failed to dislike comment");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await onUpdate(comment._id, editContent);
      setIsEditing(false);
      toast.success("Comment updated");
    } catch (_error) {
      toast.error("Failed to update comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(comment._id);
      toast.success("Comment deleted");
      setShowDeleteDialog(false);
    } catch (_error) {
      toast.error("Failed to delete comment");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (content: string) => {
    await onReply(comment._id, content);
    setShowReplyForm(false);
    setShowReplies(true);
  };

  const handleLoadReplies = async () => {
    if (onLoadReplies && !showReplies) {
      await onLoadReplies(comment._id);
    }
    setShowReplies(!showReplies);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={depth > 0 ? "ml-8 mt-4" : ""}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(comment.author.username)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{comment.author.username}</span>
                    {isAuthor && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                    {comment.createdAt !== comment.updatedAt && " (edited)"}
                  </span>
                </div>

                {isAuthor && !isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-20"
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdate} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap wrap-break-word">{comment.content}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant={hasLiked ? "default" : "ghost"}
                  size="sm"
                  onClick={handleLike}
                  disabled={loading}
                  className="gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{comment.likes.length}</span>
                </Button>

                <Button
                  variant={hasDisliked ? "default" : "ghost"}
                  size="sm"
                  onClick={handleDislike}
                  disabled={loading}
                  className="gap-1"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{comment.dislikes.length}</span>
                </Button>

                {depth < 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Reply
                  </Button>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleLoadReplies} className="gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
                    {comment.replies.length === 1 ? "reply" : "replies"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showReplyForm && (
        <div className="mt-4">
          <CommentForm
            onSubmit={handleReply}
            placeholder="Write a reply..."
            buttonText="Post Reply"
            isReply
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onLike={onLike}
              onDislike={onDislike}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              onLoadReplies={onLoadReplies}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
