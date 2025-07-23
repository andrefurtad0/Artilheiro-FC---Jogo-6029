import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiTrendingUp, FiBarChart2, FiPieChart, FiActivity } = FiIcons;

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Goals Distribution Chart
  const getGoalsDistributionOption = () => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      borderColor: '#374151',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#9CA3AF' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#9CA3AF' },
      splitLine: { lineStyle: { color: '#374151' } }
    },
    series: [{
      data: [12, 8, 15, 10, 18, 20, 14],
      type: 'bar',
      name: 'Gols',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10B981' },
          { offset: 1, color: '#059669' }
        ])
      }
    }]
  });

  // Success Rate Chart
  const getSuccessRateOption = () => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      borderColor: '#374151',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderColor: '#1F2937',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '14',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 75, name: 'Gols', itemStyle: { color: '#10B981' } },
        { value: 25, name: 'Chutes Defendidos', itemStyle: { color: '#EF4444' } }
      ]
    }]
  });

  // Performance Trend Chart
  const getPerformanceTrendOption = () => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      borderColor: '#374151',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#9CA3AF' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#9CA3AF' },
      splitLine: { lineStyle: { color: '#374151' } }
    },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      name: 'Performance',
      smooth: true,
      lineStyle: {
        width: 3,
        color: '#3B82F6'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
        ])
      }
    }]
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <SafeIcon icon={FiTrendingUp} className="inline mr-2" />
            Analytics
          </h1>
          <p className="text-gray-400">Análise detalhada do seu desempenho</p>
        </motion.div>

        {/* Period Selector */}
        <div className="flex justify-center space-x-2 mb-8">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedPeriod === period
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total de Gols', value: '157', icon: FiTrendingUp, color: 'green' },
            { label: 'Média por Jogo', value: '2.8', icon: FiBarChart2, color: 'blue' },
            { label: 'Taxa de Sucesso', value: '75%', icon: FiPieChart, color: 'yellow' },
            { label: 'Sequência Atual', value: '12', icon: FiActivity, color: 'red' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <SafeIcon
                  icon={stat.icon}
                  className={`text-2xl text-${stat.color}-400`}
                />
                <span className="text-3xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-4">Distribuição de Gols</h3>
            <ReactECharts
              option={getGoalsDistributionOption()}
              style={{ height: '300px' }}
            />
          </motion.div>

          {/* Success Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-4">Taxa de Sucesso</h3>
            <ReactECharts
              option={getSuccessRateOption()}
              style={{ height: '300px' }}
            />
          </motion.div>

          {/* Performance Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 lg:col-span-2"
          >
            <h3 className="text-lg font-bold text-white mb-4">Tendência de Performance</h3>
            <ReactECharts
              option={getPerformanceTrendOption()}
              style={{ height: '300px' }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;