import { useState, useEffect, useCallback } from "react";
import type { Comment, SortOption } from "@/lib/api/comments";
import { commentsApi } from "@/lib/api/comments";
import { useAuth } from "@/components/context/AuthContext";
import { socketService } from "@/lib/socket";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";

interface CommentSectionProps {
  pageId: string;
}

export default function CommentSection({ pageId }: CommentSectionProps) {
  const { token, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const limit = 10;

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await commentsApi.getComments(pageId, page, limit, sortBy);
      setComments(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalComments(response.pagination.totalComments);
    } catch (_error) {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [pageId, page, sortBy]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
      socketService.joinPage(pageId);

      socketService.onNewComment((comment) => {
        if (comment.pageId === pageId) {
          if (!comment.parentCommentId) {
            // Only add top-level comments to main list
            setComments((prev) => {
              // Avoid duplicates
              if (prev.some((c) => c._id === comment._id)) return prev;
              return sortBy === "newest" ? [comment, ...prev] : [...prev, comment];
            });
            setTotalComments((prev) => prev + 1);
          } else {
            // Handle reply comments - add to parent's replies
            setComments((prev) =>
              prev.map((c) => {
                if (c._id === comment.parentCommentId) {
                  const replies = c.replies || [];
                  // Avoid duplicates
                  if (replies.some((r) => r._id === comment._id)) return c;
                  return { ...c, replies: [...replies, comment] };
                }
                return c;
              })
            );
          }
        }
      });

      socketService.onUpdateComment((updatedComment) => {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === updatedComment._id) {
              return updatedComment;
            }
            // Update in replies
            if (comment.replies) {
              comment.replies = comment.replies.map((reply) =>
                reply._id === updatedComment._id ? updatedComment : reply
              );
            }
            return comment;
          })
        );
      });

      socketService.onDeleteComment(({ commentId }) => {
        setComments((prev) => {
          const filtered = prev.filter((comment) => {
            if (comment._id === commentId) return false;
            // Remove from replies
            if (comment.replies) {
              comment.replies = comment.replies.filter((reply) => reply._id !== commentId);
            }
            return true;
          });
          return filtered;
        });
        setTotalComments((prev) => Math.max(0, prev - 1));
      });

      socketService.onLikeComment((updatedComment) => {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === updatedComment._id) {
              return updatedComment;
            }
            if (comment.replies) {
              comment.replies = comment.replies.map((reply) =>
                reply._id === updatedComment._id ? updatedComment : reply
              );
            }
            return comment;
          })
        );
      });

      socketService.onDislikeComment((updatedComment) => {
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === updatedComment._id) {
              return updatedComment;
            }
            if (comment.replies) {
              comment.replies = comment.replies.map((reply) =>
                reply._id === updatedComment._id ? updatedComment : reply
              );
            }
            return comment;
          })
        );
      });

      return () => {
        socketService.leavePage(pageId);
        socketService.removeAllListeners();
      };
    }
  }, [isAuthenticated, token, pageId, sortBy]);

  const handleCreateComment = async (content: string) => {
    await commentsApi.createComment({ content, pageId });
    // Socket will handle adding the comment to the list
  };

  const handleLike = async (commentId: string) => {
    await commentsApi.likeComment(commentId);
    // Socket will handle updating the comment
  };

  const handleDislike = async (commentId: string) => {
    await commentsApi.dislikeComment(commentId);
    // Socket will handle updating the comment
  };

  const handleUpdate = async (commentId: string, content: string) => {
    await commentsApi.updateComment(commentId, { content });
    // Socket will handle updating the comment
  };

  const handleDelete = async (commentId: string) => {
    await commentsApi.deleteComment(commentId);
    // Socket will handle removing the comment
  };

  const handleReply = async (parentId: string, content: string) => {
    const response = await commentsApi.createComment({
      content,
      pageId,
      parentCommentId: parentId,
    });

    // Add reply to the parent comment
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id === parentId) {
          return {
            ...comment,
            replies: comment.replies ? [...comment.replies, response.data] : [response.data],
          };
        }
        return comment;
      })
    );
  };

  const handleLoadReplies = async (commentId: string) => {
    try {
      const response = await commentsApi.getReplies(commentId);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            return { ...comment, replies: response.data };
          }
          return comment;
        })
      );
    } catch (_error) {
      toast.error("Failed to load replies");
    }
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
              <span className="text-muted-foreground">({totalComments})</span>
            </CardTitle>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-45 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="cursor-pointer">Newest First</SelectItem>
                <SelectItem value="mostLiked" className="cursor-pointer">Most Liked</SelectItem>
                <SelectItem value="mostDisliked" className="cursor-pointer">Most Disliked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {isAuthenticated ? (
        <Card>
          <CardContent className="pt-6">
            {!showCommentForm ? (
              <Button 
                onClick={() => setShowCommentForm(true)} 
                variant="outline" 
                className="w-full cursor-pointer"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Write a comment...
              </Button>
            ) : (
              <div className="space-y-2">
                <CommentForm 
                  onSubmit={async (content) => {
                    await handleCreateComment(content);
                    setShowCommentForm(false);
                  }} 
                  onCancel={() => setShowCommentForm(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Please log in to leave a comment</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <CommentList
        comments={comments}
        loading={loading}
        onLike={handleLike}
        onDislike={handleDislike}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onReply={handleReply}
        onLoadReplies={handleLoadReplies}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
