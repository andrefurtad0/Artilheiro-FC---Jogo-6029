# ⚽ Futebol Digital Gamificado

Uma plataforma web gamificada de futebol digital onde usuários podem escolher times, participar de partidas de 24h e competir em rankings.

## 🚀 Características

- **Sistema de Autenticação**: Login/registro com Supabase Auth
- **Gamificação**: 10 níveis com nomes engraçados e prêmios
- **Partidas 24h**: Rodadas com duração fixa de 24 horas
- **Sistema de Chutes**: Intervalos baseados no plano do usuário
- **Rankings**: Da rodada, temporada e campeonatos
- **Loja**: Boosts e planos pagos via Stripe
- **Painel Admin**: CRUD completo para gestão
- **Responsivo**: Design mobile-first

## 🛠️ Stack Tecnológica

- **Frontend**: React.js + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Pagamentos**: Stripe Checkout
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: React Icons

## 📱 Funcionalidades

### Para Usuários
- ✅ Criar conta e escolher times
- ✅ Participar de partidas com sistema de chutes
- ✅ Acompanhar rankings em tempo real
- ✅ Evoluir através de 10 níveis gamificados
- ✅ Comprar boosts e planos premium
- ✅ Visualizar perfil e estatísticas

### Para Administradores
- 🔧 CRUD de usuários
- 🔧 CRUD de times fictícios
- 🔧 CRUD de campeonatos (liga/copa)
- 🔧 CRUD de rodadas
- 🔧 CRUD de níveis de gamificação
- 🔧 Geração automática de jogos

## 🎯 Sistema de Níveis

| Nível | Nome | Meta Gols | Prêmio |
|-------|------|-----------|--------|
| 1 | Estreante da Várzea | 0-9 | Nenhum |
| 2 | Matador da Pelada | 10-19 | Sorteio brinde |
| 3 | Craque da Vila | 20-49 | Cupom boost |
| 4 | Artilheiro do Bairro | 50-99 | Sorteio R$50 boost |
| 5 | Ídolo Local | 100-199 | Sorteio camisa |
| 6 | Astro Estadual | 200-399 | Sorteio ticket |
| 7 | Maestro Nacional | 400-699 | Gift Card R$100 |
| 8 | Bola de Ouro Regional | 700-999 | Sorteio prêmio exclusivo |
| 9 | Lenda do Futebol | 1000-1499 | Sorteio mensal camisa |
| 10 | Imortal das Quatro Linhas | 1500+ | Sorteio anual viagem |

## ⚙️ Configuração

### 1. Variáveis de Ambiente
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Configuração do Supabase
1. Crie um projeto no Supabase
2. Execute o script SQL em `src/database/schema.sql`
3. Configure as políticas RLS
4. Ative a autenticação por email

### 3. Configuração do Stripe
1. Crie uma conta no Stripe
2. Configure os produtos e preços
3. Configure webhook para `/api/stripe/webhook`
4. Implemente as Edge Functions do Supabase

## 🚀 Instalação

```bash
# Clone o repositório
git clone [repository-url]

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📊 Banco de Dados

### Tabelas Principais
- `users`: Perfis dos usuários
- `teams`: Times fictícios
- `championships`: Campeonatos
- `rounds`: Rodadas/partidas
- `levels`: Níveis de gamificação
- `championship_teams`: Relação many-to-many

### Funcionalidades do Sistema
- **Intervalos de Chute**: 
  - Gratuito: 20 min
  - Mensal/Anual: 10 min
  - Boost: 5 min
- **Duração das Partidas**: 24h fixo
- **Tipos de Campeonato**: Liga (todos x todos) e Copa (eliminatório)

## 🎮 Como Jogar

1. **Cadastre-se**: Crie sua conta e escolha seus times
2. **Entre na Partida**: Participe da rodada ativa
3. **Chute**: Clique no botão "CHUTAR" respeitando os intervalos
4. **Evolua**: Acumule gols para subir de nível
5. **Compete**: Apareça nos rankings e ganhe prêmios

## 🛡️ Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) habilitado
- Validações no frontend e backend
- Pagamentos seguros via Stripe

## 📱 Responsividade

- Design mobile-first
- Interface otimizada para smartphones
- Navegação por tabs na parte inferior
- Componentes adaptáveis a diferentes telas

## 🎨 Design

- Interface moderna e minimalista
- Cores temáticas de futebol
- Animações suaves com Framer Motion
- Feedback visual para todas as ações

## 🔄 Atualizações Futuras

- [ ] Notificações push
- [ ] Chat entre jogadores
- [ ] Estatísticas avançadas
- [ ] Torneios especiais
- [ ] Sistema de amigos
- [ ] Compartilhamento social

## 📄 Licença

Este projeto está sob a licença MIT.