import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Cleanup
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      console.log("Signing up with:", email, userData);
      
      // Verificar se os times foram selecionados
      if (!userData.team_heart_id || !userData.team_defending_id) {
        return { 
          data: null, 
          error: { message: 'Por favor, selecione os times do coração e de defesa.' } 
        };
      }

      // 1. Criar o usuário de autenticação
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            team_heart_id: userData.team_heart_id,
            team_defending_id: userData.team_defending_id
          }
        }
      });

      if (error) throw error;
      
      console.log("User created successfully:", data.user?.id);
      
      // 2. Aguardar um momento para o trigger processar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { data, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return { user, loading, signIn, signUp, signOut };
};

export default useAuth;