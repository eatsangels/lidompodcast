import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url' || supabaseAnonKey === 'your-anon-key') {
    throw new Error('Por favor, conecte Supabase haciendo clic en el botón "Connect to Supabase" en la esquina superior derecha');
  }

  try {
    // Validate URL format
    new URL(supabaseUrl);
    
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
  } catch (error) {
    throw new Error('La URL de Supabase no es válida. Por favor, reconecte Supabase haciendo clic en el botón "Connect to Supabase"');
  }
};