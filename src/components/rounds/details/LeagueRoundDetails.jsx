import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../config/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../../common/SafeIcon';

const { FiTrophy, FiArrowRight, FiArrowLeft } = FiIcons;

const LeagueRoundDetails = ({ championship }) => {
  const [standings, setStandings] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeRound, setActiveRound] = useState(1);
  
  useEffect(() => {
    if (championship) {
      fetchLeagueData();
    }
  }, [championship]);
  
  const fetchLeagueData = async () => {
    setLoading(true);
    try {
      // Buscar todas as rodadas do campeonato
      const { data: roundsData, error: roundsError } = await supabase
        .from('rounds')
        .select('*')
        .eq('championship_id', championship.id)
        .order('round_number', { ascending: true });
        
      if (!roundsError && roundsData) {
        setRounds(roundsData);
        setActiveRound(championship.current_round || 1);
        
        // Buscar todos os jogos de todas as rodadas
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            team_a:teams!team_a_id(*),
            team_b:teams!team_b_id(*),
            round:rounds(*)
          `)
          .eq('championship_id', championship.id)
          .order('created_at', { ascending: true });
          
        if (!matchesError && matchesData) {
          // Organizar jogos por rodada
          const organizedMatches = {};
          
          roundsData.forEach(round => {
            organizedMatches[round.round_number] = matchesData.filter(
              match => match.round_id === round.id
            );
          });
          
          setMatches(organizedMatches);
        }
        
        // Calcular classificação
        await calculateStandings(championship.id, matchesData);
      }
    } catch (error) {
      console.error('Error fetching league data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStandings = async (championshipId, matchesData) => {
    // Buscar todos os times do campeonato
    const { data: teamsData, error: teamsError } = await supabase
      .from('championship_teams')
      .select(`
        team:teams(*)
      `)
      .eq('championship_id', championshipId);
      
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return;
    }
    
    // Inicializar tabela
    const table = teamsData.map(ct => ({
      team: ct.team,
      points: 0,
      games: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0
    }));
    
    // Processar jogos finalizados
    matchesData
      .filter(match => match.status === 'finished')
      .forEach(match => {
        // Encontrar os times na tabela
        const teamA = table.find(t => t.team.id === match.team_a_id);
        const teamB = table.find(t => t.team.id === match.team_b_id);
        
        if (!teamA || !teamB) return;
        
        // Atualizar estatísticas
        teamA.games += 1;
        teamB.games += 1;
        
        teamA.goalsFor += match.score_team_a;
        teamA.goalsAgainst += match.score_team_b;
        
        teamB.goalsFor += match.score_team_b;
        teamB.goalsAgainst += match.score_team_a;
        
        // Definir resultado
        if (match.score_team_a > match.score_team_b) {
          // Vitória do time A
          teamA.wins += 1;
          teamA.points += 3;
          teamB.losses += 1;
        } else if (match.score_team_a < match.score_team_b) {
          // Vitória do time B
          teamB.wins += 1;
          teamB.points += 3;
          teamA.losses += 1;
        } else {
          // Empate
          teamA.draws += 1;
          teamA.points += 1;
          teamB.draws += 1;
          teamB.points += 1;
        }
      });
    
    // Calcular saldo de gols
    table.forEach(team => {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    });
    
    // Ordenar tabela (pontos, saldo, gols pró)
    table.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
    
    setStandings(table);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Navegador de rodadas */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setActiveRound(prev => Math.max(1, prev - 1))}
          disabled={activeRound === 1}
          className={`px-3 py-1 rounded-lg ${
            activeRound === 1 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 text-white hover:bg-gray-600'
          } transition-colors`}
        >
          <SafeIcon icon={FiArrowLeft} />
        </button>
        
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">Rodada {activeRound}</h3>
          <p className="text-sm text-gray-400">
            {rounds.find(r => r.round_number === activeRound)?.status === 'active' 
              ? 'Em andamento' 
              : rounds.find(r => r.round_number === activeRound)?.status === 'finished'
                ? 'Finalizada'
                : 'Agendada'
            }
          </p>
        </div>
        
        <button
          onClick={() => setActiveRound(prev => Math.min(rounds.length, prev + 1))}
          disabled={activeRound === rounds.length}
          className={`px-3 py-1 rounded-lg ${
            activeRound === rounds.length 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-700 text-white hover:bg-gray-600'
          } transition-colors`}
        >
          <SafeIcon icon={FiArrowRight} />
        </button>
      </div>
      
      {/* Jogos da rodada */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Jogos</h3>
        
        {matches[activeRound] && matches[activeRound].length > 0 ? (
          matches[activeRound].map((match, idx) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: match.team_a.primary_color }}
                  >
                    <span className="text-white font-bold">
                      {match.team_a.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium text-white">
                    {match.team_a.name}
                  </span>
                </div>
                
                <div className="text-center px-4">
                  <div className="text-2xl font-bold text-white">
                    {match.score_team_a} × {match.score_team_b}
                  </div>
                  <div className="text-xs text-gray-400 uppercase">
                    {match.status === 'finished' ? 'Encerrado' : 
                     match.status === 'active' ? 'Em andamento' : 'Agendado'}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-white">
                    {match.team_b.name}
                  </span>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: match.team_b.primary_color }}
                  >
                    <span className="text-white font-bold">
                      {match.team_b.name.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Nenhum jogo encontrado para esta rodada</p>
          </div>
        )}
      </div>
      
      {/* Tabela de classificação */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Classificação</h3>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  P
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  J
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  V
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  E
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  D
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  GP
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  GC
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  SG
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {standings.map((team, index) => (
                <tr 
                  key={team.team.id} 
                  className={`${index < 4 ? 'bg-gray-700/30' : ''} hover:bg-gray-700/50`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-white">{index + 1}</span>
                      {index === 0 && championship.status === 'finished' && (
                        <span className="ml-1 text-yellow-500">👑</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: team.team.primary_color }}
                      ></div>
                      <span className="text-sm font-medium text-white">{team.team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-white">{team.points}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-300">{team.games}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-green-400">{team.wins}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-300">{team.draws}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-red-400">{team.losses}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-300">{team.goalsFor}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-300">{team.goalsAgainst}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`text-sm font-medium ${
                      team.goalDifference > 0 ? 'text-green-400' : 
                      team.goalDifference < 0 ? 'text-red-400' : 'text-gray-300'
                    }`}>
                      {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legenda */}
        {standings.length > 0 && (
          <div className="mt-3 text-xs text-gray-400">
            <p>P: Pontos, J: Jogos, V: Vitórias, E: Empates, D: Derrotas, GP: Gols Pró, GC: Gols Contra, SG: Saldo de Gols</p>
          </div>
        )}
        
        {/* Campeão (se o campeonato estiver finalizado) */}
        {championship.status === 'finished' && standings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center py-6 bg-gray-800 rounded-lg border border-yellow-500/30"
          >
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
              <SafeIcon icon={FiTrophy} className="text-4xl text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Campeão</h3>
            <div className="inline-flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-full border border-yellow-500/50">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: standings[0]?.team.primary_color }}
              ></div>
              <span className="text-white text-lg font-bold">
                {standings[0]?.team.name}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LeagueRoundDetails;