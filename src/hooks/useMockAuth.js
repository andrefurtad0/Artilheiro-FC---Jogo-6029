import { useState, useEffect } from 'react';
import { mockUsers } from '../config/mockData';

export const useMockAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem('demo-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({
          id: parsedUser.id,
          email: parsedUser.email,
          user_metadata: { name: parsedUser.name }
        });
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    // Simular autenticação
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        isAdmin: foundUser.is_admin,
        team_defending_id: foundUser.team_defending?.id,
        team_heart_id: foundUser.team_heart?.id,
        total_goals: foundUser.total_goals || 0,
        gols_current_round: foundUser.gols_current_round || 0,
        plan: foundUser.plan || 'free'
      };
      
      localStorage.setItem('demo-user', JSON.stringify(userData));
      localStorage.setItem('demo-mode', 'true');
      
      setUser({
        id: userData.id,
        email: userData.email,
        user_metadata: { name: userData.name }
      });
      
      return { data: { user: userData }, error: null };
    }
    
    return { data: null, error: { message: 'Email ou senha incorretos' } };
  };

  const signUp = async (email, password, userData) => {
    // Simular registro
    const existingUser = mockUsers.find(u => u.email === email);
    
    if (existingUser) {
      return { data: null, error: { message: 'Email já cadastrado' } };
    }
    
    // Generate random ID for new user
    const newId = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newUser = {
      id: newId,
      email,
      name: userData.name,
      gols_current_round: 0,
      total_goals: 0,
      team_defending: { 
        id: userData.team_defending_id,
        name: 'Time Demo'
      },
      team_heart: { 
        id: userData.team_heart_id, 
        name: 'Time Demo'
      },
      level: 1,
      plan: 'free'
    };
    
    // Store in localStorage
    localStorage.setItem('demo-user', JSON.stringify(newUser));
    localStorage.setItem('demo-mode', 'true');
    
    setUser({
      id: newUser.id,
      email: newUser.email,
      user_metadata: { name: newUser.name }
    });
    
    return { data: { user: newUser }, error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('demo-user');
    setUser(null);
    return { error: null };
  };

  return { user, loading, signIn, signUp, signOut };
};