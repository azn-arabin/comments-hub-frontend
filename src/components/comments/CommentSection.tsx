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
import { ChevronLeft, ChevronRight, MessageSquare, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

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
      socketService.connect(token);
      socketService.joinPage(pageId);

      socketService.onNewComment((comment) => {
        if (comment.pageId === pageId) {
          if (!comment.parentComment) {
            // Only add top-level comments to main list
            setComments((prev) => {
              // Avoid duplicates
              if (prev.some((c) => c._id === comment._id)) return prev;
              return sortBy === "newest" ? [comment, ...prev] : [...prev, comment];
            });
            setTotalComments((prev) => prev + 1);
          } else {
            // Handle reply comments - add to parent's replies (recursively handle nested replies)
            const addReplyToParent = (comments: Comment[]): Comment[] => {
              return comments.map((c) => {
                if (c._id === comment.parentComment) {
                  const replies = c.replies || [];
                  // Avoid duplicates
                  if (replies.some((r) => r._id === comment._id)) return c;
                  return { ...c, replies: [...replies, comment] };
                }
                // Check nested replies
                if (c.replies && c.replies.length > 0) {
                  return { ...c, replies: addReplyToParent(c.replies) };
                }
                return c;
              });
            };
            setComments((prev) => addReplyToParent(prev));
          }
        }
      });

      socketService.onUpdateComment((updatedComment) => {
        const updateCommentRecursively = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment._id === updatedComment._id) {
              return updatedComment;
            }
            // Update in nested replies
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: updateCommentRecursively(comment.replies) };
            }
            return comment;
          });
        };
        setComments((prev) => updateCommentRecursively(prev));
      });

      socketService.onDeleteComment(({ commentId }) => {
        const deleteCommentRecursively = (comments: Comment[]): Comment[] => {
          return comments
            .filter((comment) => comment._id !== commentId)
            .map((comment) => {
              if (comment.replies && comment.replies.length > 0) {
                return { ...comment, replies: deleteCommentRecursively(comment.replies) };
              }
              return comment;
            });
        };
        setComments((prev) => {
          const newComments = deleteCommentRecursively(prev);
          // Only decrement total if a top-level comment was deleted
          const wasTopLevel = prev.some((c) => c._id === commentId);
          if (wasTopLevel) {
            setTotalComments((count) => Math.max(0, count - 1));
          }
          return newComments;
        });
      });

      socketService.onLikeComment((updatedComment) => {
        const updateLikeRecursively = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment._id === updatedComment._id) {
              return updatedComment;
            }
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: updateLikeRecursively(comment.replies) };
            }
            return comment;
          });
        };
        setComments((prev) => updateLikeRecursively(prev));
      });

      socketService.onDislikeComment((updatedComment) => {
        const updateDislikeRecursively = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment._id === updatedComment._id) {
              return updatedComment;
            }
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: updateDislikeRecursively(comment.replies) };
            }
            return comment;
          });
        };
        setComments((prev) => updateDislikeRecursively(prev));
      });

      return () => {
        socketService.leavePage(pageId);
        socketService.removeAllListeners();
      };
    
  }, [ pageId, sortBy, token]);

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
    await commentsApi.createComment({
      content,
      pageId,
      parentCommentId: parentId,
    });
    // Socket will handle adding the reply to parent's replies array
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
              <span className="text-muted-foreground">({totalComments})</span>
            </CardTitle>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-auto cursor-pointer">
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
            <Button asChild variant="outline" className="cursor-pointer">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login to leave a comment
              </Link>
            </Button>
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
            className="cursor-pointer"
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
            className="cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
