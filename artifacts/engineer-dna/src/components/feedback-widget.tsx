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

export function GlobalFeedbackModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [rating, setRating] = React.useState<"up" | "down" | null>(null);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "general",
          rating,
          comment: comment.trim(),
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setRating(null);
        setComment("");
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg font-mono flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" /> Send Feedback
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground text-sm font-mono"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <Check className="w-5 h-5" />
            <span>Feedback sent! Thank you.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">How is your experience?</label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={rating === "up" ? "default" : "outline"}
                  onClick={() => setRating("up")}
                  className="flex-1 gap-2 font-medium"
                >
                  <ThumbsUp className="w-4 h-4" /> Good
                </Button>
                <Button
                  type="button"
                  variant={rating === "down" ? "destructive" : "outline"}
                  onClick={() => setRating("down")}
                  className="flex-1 gap-2 font-medium"
                >
                  <ThumbsDown className="w-4 h-4" /> Needs Work
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Your Comments or Feature Request</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you love or what we should build next..."
                rows={3}
                className="text-sm bg-background"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || (!rating && !comment.trim())} className="gap-2 font-bold">
                <Send className="w-4 h-4" /> Submit Feedback
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
