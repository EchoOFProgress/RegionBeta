"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { dbSubmitFeedback } from "@/lib/db";
import { useLanguage } from "@/lib/language-context";
import { MessageSquare, Bug, Lightbulb, Send, Loader2 } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [type, setType] = useState<"bug" | "idea">("bug");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: t("feedback.empty_content"),
        description: t("feedback.empty_desc"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await dbSubmitFeedback(type, content);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: type === "bug" ? t("feedback.success_bug") : t("feedback.success_idea"),
        description: t("feedback.success_desc"),
      });
      setContent("");
      onClose();
    } else {
      toast({
        title: t("notif.error"),
        description: result.error || t("feedback.error_submit"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-2 border-primary/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-2xl font-black uppercase tracking-tighter">
            <MessageSquare className="text-primary" size={20} />
            {t("feedback.title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            {t("feedback.desc")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-primary/70">
            {t("feedback.type")}
            </label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className="w-full bg-background/50 border-2 border-primary/10 focus:border-primary/30 transition-all h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <div className="flex items-center gap-2">
                    <Bug size={16} className="text-destructive" />
                    <span>{t("feedback.type_bug")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="idea">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-500" />
                    <span>{t("feedback.type_idea")}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-primary/70">
            {t("feedback.description")}
            </label>
            <Textarea
              placeholder={type === "bug" ? t("feedback.placeholder_bug") : t("feedback.placeholder_idea")}
              className="min-h-[150px] bg-background/50 border-2 border-primary/10 focus:border-primary/30 transition-all resize-none p-4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto uppercase tracking-widest font-black text-xs border-2 hover:bg-primary/5"
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto uppercase tracking-widest font-black text-xs h-10 px-6"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {t("feedback.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
