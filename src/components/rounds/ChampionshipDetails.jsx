import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import LeagueRoundDetails from './details/LeagueRoundDetails';
import CupRoundDetails from './details/CupRoundDetails';

const { FiArrowLeft, FiTrophy, FiCalendar, FiUsers } = FiIcons;

const ChampionshipDetails = () => {
  const [championship, setChampionship] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchChampionshipDetails();
  }, [id]);
  
  const fetchChampionshipDetails = async () => {
    setLoading(true);
    try {
      // Buscar detalhes do campeonato
      const { data, error } = await supabase
        .from('championships')
        .select(`
          *,
          championship_teams (
            team:teams (*)
          )
        `)
        .eq('id', id)
        .single();
        
      if (!error && data) {
        setChampionship(data);
      } else {
        navigate('/championships');
      }
    } catch (error) {
      console.error('Error fetching championship details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      finished: { label: 'Finalizado', color: 'bg-gray-100 text-gray-800' },
      scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      league: { label: 'Liga', color: 'bg-blue-100 text-blue-800' },
      cup: { label: 'Copa', color: 'bg-purple-100 text-purple-800' }
    };

    const config = typeConfig[type] || typeConfig.league;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiTrophy} className="text-5xl text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Campeonato não encontrado</h2>
          <button
            onClick={() => navigate('/championships')}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Voltar para Campeonatos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/championships')}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Voltar</span>
          </button>
        </motion.div>
        
        {/* Championship Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiTrophy} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{championship.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                {getTypeBadge(championship.type)}
                {getStatusBadge(championship.status)}
                <div className="flex items-center space-x-1 text-gray-400 text-sm">
                  <SafeIcon icon={FiCalendar} className="text-xs" />
                  <span>Rodada {championship.current_round}/{championship.total_rounds}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <SafeIcon icon={FiUsers} className="text-gray-400" />
            <span className="text-sm text-gray-400">
              {championship.championship_teams.length} times participantes
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {championship.championship_teams.map(ct => (
              <div
                key={ct.team.id}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-700 rounded-full"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ct.team.primary_color }}
                />
                <span className="text-sm text-white">{ct.team.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Championship Details based on type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          {championship.type === 'league' ? (
            <LeagueRoundDetails championship={championship} />
          ) : (
            <CupRoundDetails championship={championship} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChampionshipDetails;