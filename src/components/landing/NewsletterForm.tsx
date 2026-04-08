"use client";
import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RippleButton } from "@/components/ui/ripple-button";
import { useNewsletterSubscribe } from "@/hooks/useNewsletterSubscribe";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: subscribe, isPending } = useNewsletterSubscribe();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isPending) return;

    subscribe(email, {
      onSuccess: () => {
        setIsSuccess(true);
        setEmail("");
        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 text-primary animate-fade-in">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm">Merci pour votre inscription !</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
        Newsletter
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Recevez nos nouveautés et offres exclusives
      </p>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          className="bg-background/50 border-border/50 focus:border-primary/50 text-sm placeholder:text-muted-foreground/60"
          required
        />
        <RippleButton
          type="submit"
          disabled={isPending || !email.trim()}
          className="btn-luxury px-4 shrink-0"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </RippleButton>
      </div>
    </form>
  );
}
