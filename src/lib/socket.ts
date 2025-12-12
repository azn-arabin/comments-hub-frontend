import io, { Socket } from "socket.io-client";
import type { Comment } from "./api/comments";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinPage(pageId: string) {
    if (this.socket) {
      this.socket.emit("joinPage", pageId);
    }
  }

  leavePage(pageId: string) {
    if (this.socket) {
      this.socket.emit("leavePage", pageId);
    }
  }

  onNewComment(callback: (comment: Comment) => void) {
    if (this.socket) {
      this.socket.on("newComment", callback);
    }
  }

  onUpdateComment(callback: (comment: Comment) => void) {
    if (this.socket) {
      this.socket.on("updateComment", callback);
    }
  }

  onDeleteComment(callback: (data: { commentId: string }) => void) {
    if (this.socket) {
      this.socket.on("deleteComment", callback);
    }
  }

  onLikeComment(callback: (comment: Comment) => void) {
    if (this.socket) {
      this.socket.on("likeComment", callback);
    }
  }

  onDislikeComment(callback: (comment: Comment) => void) {
    if (this.socket) {
      this.socket.on("dislikeComment", callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();
