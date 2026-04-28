import { supabase } from './supabase';

export type AdminUser = {
  id: string;
  email: string | null;
  role: 'user' | 'admin';
};

export async function loadUsersForAdmin(): Promise<AdminUser[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,role')
    .order('created_at', { ascending: false });
  if (!error) return (data ?? []) as AdminUser[];

  if (error.code === '42703') {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('profiles')
      .select('id,role')
      .order('created_at', { ascending: false });
    if (fallbackError) throw fallbackError;
    return (fallbackData ?? []).map((row) => ({
      id: row.id as string,
      email: null,
      role: (row.role as 'user' | 'admin') ?? 'user',
    }));
  }

  throw error;
}
