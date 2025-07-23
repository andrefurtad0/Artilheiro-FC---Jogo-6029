import React,{useState,useEffect} from 'react';
import {motion} from 'framer-motion';
import {useAuth} from './hooks/useAuth';
import {useUserProfile} from './hooks/useUserProfile';
import {supabase} from './config/supabase';
import GameBackground from './components/ui/GameBackground';
import Dashboard from './components/dashboard/Dashboard';
import Rankings from './components/rankings/Rankings';
import RoundsList from './components/rounds/RoundsList';
import RoundDetail from './components/rounds/RoundDetail';
import Profile from './components/profile/Profile';
import GamificationPage from './components/gamification/GamificationPage';
import AuthScreen from './components/auth/AuthScreen';
import AdminPanel from './components/admin';
import BottomNav from './components/navigation/BottomNav';
import Logo from './components/ui/Logo';
import {ToastProvider} from './components/ui/Toast';
import './App.css';

const App=()=> {
  const {user,loading,signOut}=useAuth();
  const [activeTab,setActiveTab]=useState('dashboard');
  const [isAdmin,setIsAdmin]=useState(false);
  const [selectedRound,setSelectedRound]=useState(null);

  // Check if user is admin
  useEffect(()=> {
    const checkAdminStatus=async ()=> {
      if (!user) return;
      
      try {
        const {data,error}=await supabase
          .from('users')
          .select('is_admin')
          .eq('id',user.id)
          .single();
          
        if (!error && data) {
          setIsAdmin(data.is_admin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:',error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  },[user]);

  const handleNavigate=(tabId)=> {
    setActiveTab(tabId);
    setSelectedRound(null);
  };

  const handleLogout=async ()=> {
    await signOut();
    setActiveTab('dashboard');
  };

  // Loading component
  if (loading) {
    return (
      <GameBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Logo size="lg" variant="full" className="mx-auto mb-6" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="text-gray-400">Carregando...</p>
          </div>
        </div>
      </GameBackground>
    );
  }

  // Auth screen if no user
  if (!user) {
    return (
      <ToastProvider>
        <AuthScreen />
      </ToastProvider>
    );
  }

  // Admin panel for admins
  if (isAdmin && activeTab==='admin') {
    return (
      <ToastProvider>
        <AdminPanel onBackToApp={()=> setActiveTab('dashboard')} />
      </ToastProvider>
    );
  }

  // Render content based on active tab
  const renderContent=()=> {
    if (activeTab==='rounds') {
      if (selectedRound) {
        return <RoundDetail round={selectedRound} onBack={()=> setSelectedRound(null)} />;
      }
      return <RoundsList onSelectRound={setSelectedRound} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'rankings':
        return <Rankings />;
      case 'gamification':
        return <GamificationPage />;
      case 'profile':
        return <Profile onLogout={handleLogout} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <GameBackground>
        <div className="min-h-screen">
          {renderContent()}
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={handleNavigate} 
            isAdmin={isAdmin}
          />
        </div>
      </GameBackground>
    </ToastProvider>
  );
};

export default App;