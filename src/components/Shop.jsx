// Shop component with Stripe integration
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../config/supabase'
import { useAuth } from '../hooks/useHooks'
import stripePromise from '../config/stripe'
import * as FiIcons from 'react-icons/fi'

const { FiShoppingCart, FiZap, FiCalendar, FiClock, FiCheck } = FiIcons

const Shop = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState({})

  const products = [
    {
      id: 'boost_24h',
      name: 'Boost 24h',
      description: 'Reduza o tempo entre chutes para 5 minutos por 24 horas',
      price: 'R$ 9,90',
      priceId: 'price_boost_24h',
      icon: FiZap,
      color: 'bg-yellow-500',
      features: [
        'Chutes a cada 5 minutos',
        'Válido por 24 horas',
        'Ativação imediata'
      ]
    },
    {
      id: 'monthly_plan',
      name: 'Plano Mensal',
      description: 'Chutes mais rápidos e benefícios exclusivos',
      price: 'R$ 19,90/mês',
      priceId: 'price_monthly_plan',
      icon: FiCalendar,
      color: 'bg-blue-500',
      features: [
        'Chutes a cada 10 minutos',
        'Acesso a recursos premium',
        'Suporte prioritário'
      ]
    },
    {
      id: 'annual_plan',
      name: 'Plano Anual',
      description: 'Melhor custo-benefício com desconto especial',
      price: 'R$ 199,90/ano',
      priceId: 'price_annual_plan',
      icon: FiClock,
      color: 'bg-green-500',
      features: [
        'Chutes a cada 10 minutos',
        'Todos os recursos premium',
        'Desconto de 2 meses',
        'Suporte VIP'
      ]
    }
  ]

  const handlePurchase = async (product) => {
    if (!user) return
    setLoading(prev => ({ ...prev, [product.id]: true }))

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: product.priceId,
          userId: user.id,
          productType: product.id
        }
      })

      if (error) throw error

      const stripe = await stripePromise
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (stripeError) throw stripeError
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(prev => ({ ...prev, [product.id]: false }))
    }
  }

  return (
    <div className="min-h-screen pitaco-gradient text-white">
      <div className="container mx-auto px-4 py-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <FiShoppingCart className="inline mr-2" />
            Loja
          </h1>
          <p className="text-gray-400">Melhore sua experiência com nossos produtos</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="pitaco-card rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className={`${product.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <product.icon className="text-3xl" />
                  <span className="text-2xl font-bold">{product.price}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-white/90 text-sm">{product.description}</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <FiCheck className="text-green-400 text-sm" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase(product)}
                  disabled={loading[product.id]}
                  className={`
                    w-full py-3 px-4 rounded-lg font-medium transition-all
                    ${loading[product.id]
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'pitaco-button text-white hover:opacity-90 hover:scale-105'
                    }
                  `}
                >
                  {loading[product.id] ? 'Processando...' : 'Comprar Agora'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 pitaco-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Informações Importantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Pagamento Seguro</h3>
              <p className="text-sm text-gray-400">
                Todos os pagamentos são processados com segurança através do Stripe,
                garantindo a proteção dos seus dados.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Ativação Automática</h3>
              <p className="text-sm text-gray-400">
                Após a confirmação do pagamento, os benefícios são ativados
                automaticamente em sua conta.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Shop