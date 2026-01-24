// Exemplos de autenticação usando Supabase (além do Clerk já configurado)
// Nota: Clerk já está sendo usado para auth web. Estes são exemplos para Supabase auth, se quiser alternar.

// ... (código anterior)

// Enviar convite por email (SERVER-SIDE ONLY - usa service_role_key)
// IMPORTANTE: Nunca use service_role_key no cliente! Use em backend (ex.: Vercel Functions).
// Exemplo de uso em server (não no frontend):
// const supabaseAdmin = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
// const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail('someone@email.com');

// Para web, considere usar Clerk para invites, que é mais seguro e fácil.

import { supabase } from "./supabase";

// Sign Up com email e senha
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Login com email e senha
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Login com Magic Link (email)
export const signInWithMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });
  if (error) throw error;
  return data;
};

// Login com OAuth (ex.: Google)
export const signInWithOAuth = async (
  provider: "google" | "github" | "facebook",
) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
  });
  if (error) throw error;
  return data;
};

// Logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Obter usuário atual
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Resetar senha
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
};

// Atualizar usuário
export const updateUser = async (updates: {
  email?: string;
  password?: string;
  data?: any;
}) => {
  const { data, error } = await supabase.auth.updateUser(updates);
  if (error) throw error;
  return data;
};
