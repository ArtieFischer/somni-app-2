// apps/mobile/src/api/auth.ts
import { supabase } from '../lib/supabase';
import { z } from 'zod';

export const SignUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(24, "Username can be at most 24 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type SignUpData = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type SignInData = z.infer<typeof SignInSchema>;

export async function signUpWithEmail(data: SignUpData) {
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        username: data.username, // This will be available in our trigger
      },
      emailRedirectTo: process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL,
    },
  });
  if (error) throw error;
  // The onAuthStateChange listener will handle setting the session
}

export async function signInWithEmail(data: SignInData) {
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) throw error;
  // The onAuthStateChange listener will handle setting the session
}