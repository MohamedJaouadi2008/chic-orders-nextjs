"use client";
import { useState, useEffect } from "react";
import {  useRouter  } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAdmin } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

type LoginForm = z.infer<typeof loginSchema>;

const AdminLoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const { signIn, isAdmin, isLoading } = useAdmin();
  const navigate = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // If already logged in as admin, redirect via useEffect to avoid render-time state updates
  useEffect(() => {
    if (isAdmin && !isLoading) {
      router.push("/gestion-de-commande-3xCCM21/dashboard", { replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const result = await signIn(data.email, data.password);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/gestion-de-commande-3xCCM21/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-[0.2em] uppercase mb-2">
            MyLady Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Connexion à l'espace de gestion
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@miss.ma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full btn-luxury"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
