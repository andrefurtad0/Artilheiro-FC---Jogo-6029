import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const AllStarTeam = ({ topScorers = [] }) => {
  const [players, setPlayers] = useState([]);
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    // Se não houver jogadores, não mostrar nada
    if (!topScorers || topScorers.length === 0) {
      setPlayers([]);
      return;
    }

    // Pegar até 11 jogadores
    const filteredPlayers = topScorers.slice(0, 11);
    
    // Ordenar jogadores por gols na rodada atual em ordem decrescente
    const sortedPlayers = [...filteredPlayers].sort(
      (a, b) => b.gols_current_round - a.gols_current_round
    );

    // Definir posições com base nos gols (maior artilheiro é atacante, menor é goleiro)
    const positions = [
      { role: 'Centroavante', shortPos: 'CA', x: 50, y: 15 },     // 1º - Mais gols
      { role: 'Ponta Esquerda', shortPos: 'PE', x: 85, y: 25 },   // 2º
      { role: 'Ponta Direita', shortPos: 'PD', x: 15, y: 25 },    // 3º
      { role: 'Meio Campo', shortPos: 'MC', x: 50, y: 45 },       // 4º
      { role: 'Volante', shortPos: 'VOL', x: 30, y: 45 },         // 5º
      { role: 'Volante', shortPos: 'VOL', x: 70, y: 45 },         // 6º
      { role: 'Lateral Esquerdo', shortPos: 'LE', x: 85, y: 65 }, // 7º
      { role: 'Zagueiro Central', shortPos: 'ZAG', x: 65, y: 65 },// 8º
      { role: 'Zagueiro Central', shortPos: 'ZAG', x: 35, y: 65 },// 9º
      { role: 'Lateral Direito', shortPos: 'LD', x: 15, y: 65 },  // 10º
      { role: 'Goleiro', shortPos: 'GOL', x: 50, y: 85 }          // 11º - Menos gols
    ];

    // Encontrar posição original no ranking
    const playerRankings = {};
    topScorers.forEach((player, idx) => {
      playerRankings[player.id] = idx + 1;
    });

    // Combinar dados do jogador com posições
    const playersWithPositions = sortedPlayers.map((player, index) => ({
      ...player,
      ...positions[index],
      ranking: playerRankings[player.id] // Posição original no ranking
    }));

    setPlayers(playersWithPositions);
  }, [topScorers]);

  const getMedalIcon = (ranking) => {
    if (ranking === 1) return "🥇";
    if (ranking === 2) return "🥈";
    if (ranking === 3) return "🥉";
    return null;
  };

  // Se não houver jogadores suficientes, não mostrar o componente
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/90 via-gray-800/95 to-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-700/50 mb-8 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <SafeIcon icon={FiIcons.FiStar} className="text-yellow-400 mr-2" />
          Seleção de Artilheiros da Rodada
        </h2>
        <span className="text-sm text-gray-400">Top {players.length} Jogadores</span>
      </div>

      {/* Soccer field */}
      <div className="relative w-full h-[400px] md:h-[650px] bg-gradient-to-b from-green-800 to-green-700 rounded-xl mb-4 overflow-hidden">
        {/* Field markings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[90%] h-[90%] border-2 border-white/30 rounded-lg"></div>
          <div className="absolute w-[50%] h-[30%] border-2 border-white/30 bottom-[5%] left-1/4"></div>
          <div className="absolute w-[20%] h-[10%] border-2 border-white/30 bottom-[5%] left-[40%]"></div>
          <div className="absolute w-[50%] h-[30%] border-2 border-white/30 top-[5%] left-1/4"></div>
          <div className="absolute w-[20%] h-[10%] border-2 border-white/30 top-[5%] left-[40%]"></div>
          <div className="absolute w-[30%] h-[30%] border-2 border-white/30 rounded-full top-[35%] left-[35%]"></div>
          <div className="absolute w-[2%] h-[2%] bg-white/30 rounded-full top-[49%] left-[49%]"></div>
          <div className="absolute w-[90%] h-[0px] border-[1px] border-white/30 top-[50%]"></div>
        </div>

        {/* Players */}
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
            onClick={() => setShowDetails(showDetails === player.id ? null : player.id)}
          >
            {/* Player circle */}
            <motion.div className="relative" whileHover={{ scale: 1.1 }}>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-md border-2 border-green-400 shadow-lg flex items-center justify-center cursor-pointer">
                <span className="text-green-400 font-bold text-xs md:text-sm">{player.shortPos}</span>
              </div>

              {/* Player goals number */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white text-xs font-bold">{player.gols_current_round}</span>
              </div>

              {/* Medal for top 3 */}
              {getMedalIcon(player.ranking) && (
                <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-xs">{getMedalIcon(player.ranking)}</span>
                </div>
              )}

              {/* Player name below */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className="text-white text-xs font-medium bg-gray-900/70 px-2 py-1 rounded-full">
                  {player.name.split(' ')[0]}
                </span>
              </div>

              {/* Player details popup */}
              <AnimatedPlayerDetails
                player={player}
                isVisible={showDetails === player.id}
                position={player.y < 50 ? 'bottom' : 'top'}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-400">
        <p>Clique nos jogadores para ver seus detalhes</p>
      </div>
    </motion.div>
  );
};

const AnimatedPlayerDetails = ({ player, isVisible, position }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: position === 'top' ? -20 : 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 z-10`}
    >
      <div className="bg-gray-900/95 backdrop-blur-md p-3 rounded-lg shadow-lg border border-green-500/30 w-[180px]">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <span className="text-white font-bold">{player.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">{player.name}</h3>
            <p className="text-xs text-gray-400">{player.team_defending?.name || 'Time'}</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Posição:</span>
            <span className="text-xs text-white font-medium">{player.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Gols Rodada:</span>
            <span className="text-xs text-green-400 font-medium">{player.gols_current_round}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Gols Total:</span>
            <span className="text-xs text-green-400 font-medium">{player.total_goals}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Ranking:</span>
            <span className="text-xs text-yellow-400 font-medium">#{player.ranking}º</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AllStarTeam;