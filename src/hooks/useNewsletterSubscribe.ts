"use client";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Adresse email invalide").max(255, "Email trop long");

interface SubscribeResult {
  success: boolean;
  message: string;
}

async function sendWelcomeEmail(email: string) {
  try {
    const { error } = await supabase.functions.invoke("send-newsletter-welcome", {
      body: { email },
    });
    if (error) {
      console.error("Failed to send welcome email:", error);
    }
  } catch (err) {
    console.error("Error invoking welcome email function:", err);
  }
}

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: async (email: string): Promise<SubscribeResult> => {
      // Validate email format
      const validation = emailSchema.safeParse(email.trim().toLowerCase());
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const cleanEmail = validation.data;

      // Insert into newsletter_subscribers table
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: cleanEmail });

      if (error) {
        // Handle duplicate email
        if (error.code === "23505") {
          throw new Error("Cette adresse email est déjà inscrite");
        }
        throw new Error("Une erreur s'est produite. Veuillez réessayer.");
      }

      // Fire and forget - send welcome email
      sendWelcomeEmail(cleanEmail);

      return { success: true, message: "Inscription réussie !" };
    },
    onSuccess: () => {
      toast({
        title: "Merci !",
        description: "Vous êtes maintenant inscrit à notre newsletter.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
