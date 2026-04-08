"use client";
import { useState, useEffect, useCallback } from "react";
import {  useRouter  } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UseAdminReturn {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export function useAdmin(): UseAdminReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useRouter();

  const checkAdminRole = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc("has_role", { _user_id: userId, _role: "admin" });
      
      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }
      return data === true;
    } catch (err) {
      console.error("Error checking admin role:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST (sync callback to avoid deadlock)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer async role check to avoid Supabase deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            if (!mounted) return;
            checkAdminRole(currentSession.user.id).then(hasAdmin => {
              if (mounted) {
                setIsAdmin(hasAdmin);
                setIsLoading(false);
              }
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return;
      
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        checkAdminRole(existingSession.user.id).then(hasAdmin => {
          if (mounted) {
            setIsAdmin(hasAdmin);
            setIsLoading(false);
          }
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const hasAdmin = await checkAdminRole(data.user.id);
        if (!hasAdmin) {
          await supabase.auth.signOut();
          return { error: "Accès non autorisé" };
        }
        setIsAdmin(true);
      }

      return { error: null };
    } catch (err) {
      return { error: "Une erreur est survenue" };
    }
  }, [checkAdminRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    router.push("/gestion-de-commande-3xCCM21");
  }, [navigate]);

  return {
    user,
    session,
    isAdmin,
    isLoading,
    signIn,
    signOut,
  };
}
