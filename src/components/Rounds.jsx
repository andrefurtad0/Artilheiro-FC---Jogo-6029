import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { mockRounds } from '../config/mockData';
import SafeIcon from '../common/SafeIcon';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Rounds = () => {
  const [selectedRound, setSelectedRound] = useState(null);

  const getStatusInfo = (round) => {
    const now = new Date();
    const startTime = new Date(round.start_time);
    const endTime = new Date(round.end_time);

    if (now < startTime) {
      return {
        status: 'upcoming',
        label: 'Agendada',
        color: 'bg-blue-600 text-blue-100',
        icon: FiIcons.FiClock
      };
    } else if (now >= startTime && now <= endTime) {
      return {
        status: 'active',
        label: 'Ativa',
        color: 'bg-green-600 text-green-100',
        icon: FiIcons.FiPlay
      };
    } else {
      return {
        status: 'finished',
        label: 'Encerrada',
        color: 'bg-gray-600 text-gray-300',
        icon: FiIcons.FiPause
      };
    }
  };

  return (
    <div className="min-h-screen text-white pb-24">
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <SafeIcon icon={FiIcons.FiCalendar} className="inline mr-2" />
            Rodadas
          </h1>
          <p className="text-gray-400">Acompanhe as partidas atuais e futuras</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {mockRounds.map((round, index) => {
            const statusInfo = getStatusInfo(round);
            return (
              <motion.div
                key={round.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${statusInfo.color}`}>
                      <SafeIcon icon={statusInfo.icon} />
                      <span>{statusInfo.label}</span>
                    </div>
                    {round.championship && (
                      <span className="text-sm text-gray-400">
                        {round.championship.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Team A */}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">
                          {round.team_a?.name?.charAt(0)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {round.team_a?.name}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {round.score_team_a} × {round.score_team_b}
                      </div>
                      <p className="text-xs text-gray-400">PLACAR</p>
                    </div>

                    {/* Team B */}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">
                          {round.team_b?.name?.charAt(0)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {round.team_b?.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400 mb-1">
                      Início: {format(new Date(round.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-400">
                      Fim: {format(new Date(round.end_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default Rounds;