import * as React from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackWidgetProps {
  context: string;
  contextId?: string;
  title?: string;
}

export function FeedbackWidget({ context, contextId, title = "Was this helpful?" }: FeedbackWidgetProps) {
  const [rating, setRating] = React.useState<"up" | "down" | null>(null);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleRating = async (selectedRating: "up" | "down") => {
    setRating(selectedRating);
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          contextId,
          rating: selectedRating,
        }),
      });
    } catch (err) {
      console.error("Failed to submit rating:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          contextId,
          rating,
          comment: comment.trim(),
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit feedback comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <Check className="w-4 h-4" />
        <span>Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md space-y-3 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={rating === "up" ? "default" : "outline"}
            disabled={submitting}
            onClick={() => handleRating("up")}
            className="h-8 w-8 p-0"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={rating === "down" ? "destructive" : "outline"}
            disabled={submitting}
            onClick={() => handleRating("down")}
            className="h-8 w-8 p-0"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {rating && (
        <form onSubmit={handleCommentSubmit} className="space-y-2 animate-in fade-in duration-200">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional: What could be improved?"
            rows={2}
            className="text-xs font-sans bg-background resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={submitting || !comment.trim()} className="h-7 text-xs gap-1">
              <Send className="w-3 h-3" /> Send
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
