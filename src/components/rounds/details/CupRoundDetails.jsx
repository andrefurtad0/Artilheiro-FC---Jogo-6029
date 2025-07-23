import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../../config/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../../common/SafeIcon';

const { FiTrophy, FiArrowRight } = FiIcons;

const CupRoundDetails = ({ championship }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rounds, setRounds] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  
  useEffect(() => {
    if (championship) {
      fetchRounds();
    }
  }, [championship]);
  
  const fetchRounds = async () => {
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
        
        // Agrupar rodadas por fases (ida e volta)
        const phases = [];
        for (let i = 0; i < roundsData.length; i += 2) {
          if (i + 1 < roundsData.length) {
            phases.push({
              ida: roundsData[i],
              volta: roundsData[i + 1],
              phase: Math.floor(i / 2) + 1
            });
          }
        }
        
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
          .order('match_number', { ascending: true });
          
        if (!matchesError && matchesData) {
          // Organizar jogos por fase
          const organizedMatches = {};
          
          phases.forEach(phase => {
            const phaseMatches = matchesData.filter(match => 
              match.round_id === phase.ida.id || 
              match.round_id === phase.volta.id
            );
            
            // Agrupar jogos por confronto (ida e volta)
            const confrontos = [];
            const confrontoMap = {};
            
            phaseMatches.forEach(match => {
              const matchKey = `${match.match_number}`;
              
              if (!confrontoMap[matchKey]) {
                confrontoMap[matchKey] = {
                  ida: null,
                  volta: null,
                  match_number: match.match_number
                };
                confrontos.push(confrontoMap[matchKey]);
              }
              
              // Determinar se é jogo de ida ou volta
              if (match.round_id === phase.ida.id) {
                confrontoMap[matchKey].ida = match;
              } else {
                confrontoMap[matchKey].volta = match;
              }
            });
            
            organizedMatches[phase.phase] = confrontos;
          });
          
          setMatches(organizedMatches);
          
          // Definir fase ativa (a atual do campeonato)
          const currentPhase = Math.ceil(championship.current_round / 2);
          setActiveRound(currentPhase);
        }
      }
    } catch (error) {
      console.error('Error fetching cup details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Determinar o nome da fase com base no número de fases total
  const getPhaseName = (phase, totalPhases) => {
    const phaseNames = {
      1: { 4: 'Quartas de Final', 3: 'Semi-Final', 2: 'Final', 1: 'Final' },
      2: { 4: 'Semi-Final', 3: 'Final', 2: 'Final' },
      3: { 4: 'Final', 3: 'Final' },
      4: { 4: 'Final' }
    };
    
    return phaseNames[phase]?.[totalPhases] || `Fase ${phase}`;
  };
  
  // Calcular placar agregado
  const getAggregateScore = (confronto) => {
    if (!confronto.ida || !confronto.volta) return { teamA: 0, teamB: 0 };
    
    const teamAAggregate = confronto.ida.score_team_a + confronto.volta.score_team_b;
    const teamBAggregate = confronto.ida.score_team_b + confronto.volta.score_team_a;
    
    return { teamA: teamAAggregate, teamB: teamBAggregate };
  };
  
  // Determinar o vencedor do confronto
  const getWinner = (confronto) => {
    if (!confronto.ida || !confronto.volta) return null;
    if (confronto.ida.team_a_id === null || confronto.ida.team_b_id === null) return null;
    
    const { teamA, teamB } = getAggregateScore(confronto);
    
    if (teamA > teamB) {
      return confronto.ida.team_a;
    } else if (teamB > teamA) {
      return confronto.ida.team_b;
    } else {
      // Empate no agregado, verificar gols fora
      if (confronto.volta.score_team_b > confronto.ida.score_team_b) {
        return confronto.ida.team_a;
      } else if (confronto.ida.score_team_b > confronto.volta.score_team_b) {
        return confronto.ida.team_b;
      }
      // Se ainda empatado, retorna o time A (simplificação)
      return confronto.ida.team_a;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  const totalPhases = Object.keys(matches).length;
  
  return (
    <div className="space-y-8">
      {/* Navegação de fases */}
      <div className="flex justify-center space-x-2 mb-6">
        {Array.from({ length: totalPhases }, (_, i) => i + 1).map(phase => (
          <button
            key={phase}
            onClick={() => setActiveRound(phase)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeRound === phase 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {getPhaseName(phase, totalPhases)}
          </button>
        ))}
      </div>
      
      {/* Fase atual */}
      {activeRound && matches[activeRound] && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white text-center">
            {getPhaseName(activeRound, totalPhases)}
          </h3>
          
          {matches[activeRound].map((confronto, idx) => (
            <motion.div
              key={`confronto-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700"
            >
              {/* Jogo de ida */}
              {confronto.ida && confronto.ida.team_a && confronto.ida.team_b ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: confronto.ida.team_a.primary_color }}
                      >
                        <span className="text-white font-bold">
                          {confronto.ida.team_a.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-white">
                        {confronto.ida.team_a.name}
                      </span>
                    </div>
                    
                    <div className="text-center px-4">
                      <div className="text-xl font-bold text-white">
                        {confronto.ida.score_team_a} × {confronto.ida.score_team_b}
                      </div>
                      <div className="text-xs text-gray-400">IDA</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-white">
                        {confronto.ida.team_b.name}
                      </span>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: confronto.ida.team_b.primary_color }}
                      >
                        <span className="text-white font-bold">
                          {confronto.ida.team_b.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Jogo de volta */}
                  {confronto.volta && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: confronto.volta.team_a.primary_color }}
                        >
                          <span className="text-white font-bold">
                            {confronto.volta.team_a.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-white">
                          {confronto.volta.team_a.name}
                        </span>
                      </div>
                      
                      <div className="text-center px-4">
                        <div className="text-xl font-bold text-white">
                          {confronto.volta.score_team_a} × {confronto.volta.score_team_b}
                        </div>
                        <div className="text-xs text-gray-400">VOLTA</div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-white">
                          {confronto.volta.team_b.name}
                        </span>
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: confronto.volta.team_b.primary_color }}
                        >
                          <span className="text-white font-bold">
                            {confronto.volta.team_b.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Placar agregado e classificado */}
                  {confronto.ida.status === 'finished' && confronto.volta?.status === 'finished' && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="text-gray-400 text-sm">
                        Agregado: <span className="text-white font-bold">
                          {getAggregateScore(confronto).teamA} × {getAggregateScore(confronto).teamB}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Classificado:</span>
                        {getWinner(confronto) && (
                          <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getWinner(confronto).primary_color }}
                            ></div>
                            <span className="text-white text-sm font-medium">
                              {getWinner(confronto).name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <SafeIcon icon={FiTrophy} className="text-4xl text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">Aguardando classificados</p>
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Próxima fase */}
          {activeRound < totalPhases && (
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => setActiveRound(activeRound + 1)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <span>Ver {getPhaseName(activeRound + 1, totalPhases)}</span>
                <SafeIcon icon={FiArrowRight} />
              </button>
            </div>
          )}
          
          {/* Campeão */}
          {activeRound === totalPhases && championship.status === 'finished' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
                <SafeIcon icon={FiTrophy} className="text-4xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Campeão</h3>
              {matches[totalPhases]?.[0]?.ida?.team_a && (
                <div className="inline-flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-yellow-500/50">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: getWinner(matches[totalPhases][0])?.primary_color }}
                  ></div>
                  <span className="text-white text-lg font-bold">
                    {getWinner(matches[totalPhases][0])?.name}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default CupRoundDetails;