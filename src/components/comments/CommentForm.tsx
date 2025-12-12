import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormTextAreaWithLabel } from "@/components/ui/form-components";
import { Card, CardContent } from "@/components/ui/card";
import { showToast } from "@/lib/utils/form";
import { Loader2, Send } from "lucide-react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  isReply?: boolean;
  onCancel?: () => void;
  initialValue?: string;
}

interface CommentFormData {
  content: string;
}

export default function CommentForm({
  onSubmit,
  placeholder = "Write a comment...",
  buttonText = "Post Comment",
  isReply = false,
  onCancel,
  initialValue = "",
}: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    defaultValues: { content: initialValue },
  });

  const content = watch("content");
  const characterCount = content?.length || 0;

  const onSubmitForm = async (data: CommentFormData) => {
    try {
      await onSubmit(data.content);
      reset();
      if (onCancel) onCancel();
    } catch (error: any) {
      showToast({
        title: error.response?.data?.message || "Failed to post comment",
        variant: "error",
      });
    }
  };

  return (
    <Card className={isReply ? "ml-8" : ""}>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <FormTextAreaWithLabel
            name="content"
            label={isReply ? "Reply" : "Comment"}
            placeholder={placeholder}
            register={register}
            error={errors.content}
            validators={{
              required: "Comment cannot be empty",
              maxLength: {
                value: 1000,
                message: "Comment must not exceed 1000 characters",
              },
              validate: (value: string) =>
                value.trim().length > 0 || "Comment cannot be empty",
            }}
            className="min-h-25 resize-none"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${characterCount > 1000 ? "text-red-500" : "text-muted-foreground"}`}>
              {characterCount}/1000 characters
            </span>
            <div className="flex gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || characterCount === 0 || characterCount > 1000}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {buttonText}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
