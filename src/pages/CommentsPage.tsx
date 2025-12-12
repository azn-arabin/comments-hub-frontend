import CommentSection from "@/components/comments/CommentSection";
import Header from "@/components/Header";

export default function CommentsPage() {
  // You can make this dynamic with URL params if needed
  const pageId = "page-123";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      <main className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Discussion</h1>
            <p className="text-muted-foreground">
              Share your thoughts and engage with the community
            </p>
          </div>
          <CommentSection pageId={pageId} />
        </div>
      </main>
    </div>
  );
}
