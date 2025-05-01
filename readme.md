# 🍪 Cookier Shop

[![Versão](https://img.shields.io/badge/versão-1.0.0-blue.svg)](https://github.com/mathauscm/cookier-v1)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-green.svg)](https://github.com/mathauscm/cookier-v1)
[![Node.js](https://img.shields.io/badge/Node.js-v18.20.5-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/licença-ISC-orange.svg)](LICENSE)


Um sistema completo para gerenciamento de loja de cookies, integrando painel administrativo web e bot WhatsApp para automatização de pedidos e atendimento ao cliente.

## ✨ Funcionalidades

### Bot WhatsApp
- **Atendimento automatizado** 24/7 com fluxo de conversa intuitivo
- **Catálogo digital** completo com descrições e preços
- **Sistema de pedidos** com seleção de produtos, quantidades e métodos de pagamento
- **Notificações automáticas** sobre status dos pedidos
- **Acompanhamento em tempo real** para clientes
- **Promoções personalizadas** para clientes recorrentes

### Painel Administrativo
- **Dashboard** com métricas de vendas e visualização de desempenho
- **Gerenciamento de pedidos** com atualizações de status e notificações
- **Catálogo de produtos** completamente editável
- **Acompanhamento de conversas** com clientes via WhatsApp
- **Relatórios detalhados** para análise de vendas

## 🛠️ Tecnologias

- **Backend**: Node.js, Express
- **Frontend**: React, TailwindCSS, Recharts
- **Bot WhatsApp**: whatsapp-web.js, Puppeteer
- **Persistência**: Arquivos JSON (facilmente escalável para MongoDB/MySQL)
- **Filas de Mensagens**: Bull, Redis
- **Documentação API**: Swagger

## 📋 Requisitos

- Node.js (v14 ou superior)
- NPM ou Yarn
- Redis (opcional, para sistema de filas)
- WhatsApp no smartphone (para autenticação inicial do bot)

## 🚀 Instalação

### Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/cookier-shop.git
cd cookier-shop
```

### Instalando Dependências

```bash
# Instalar dependências do servidor
npm install

# Instalar dependências do cliente
cd admin-client
npm install
cd ..
```

### Configuração de Ambiente

1. Crie um arquivo `.env` na raiz do projeto:

```
PORT=3030
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Inicialização

```bash
# Inicia o servidor e o bot WhatsApp
npm start
```

Na primeira execução, um QR Code será exibido no terminal para autenticação do WhatsApp. Escaneie-o com seu smartphone para conectar o bot.

## 🗂️ Estrutura do Projeto

```
cookier-shop/
├── admin-client/       # Frontend React
│   ├── public/         # Arquivos estáticos
│   └── src/            # Código fonte do painel admin
│       ├── components/ # Componentes React 
│       └── hooks/      # Custom hooks React
├── src/
│   ├── services/       
│   │   ├── bot/        # Serviços do bot WhatsApp
│   │   ├── catalog/    # Gerenciamento de produtos
│   │   ├── order/      # Processamento de pedidos
│   │   └── queue/      # Sistema de filas
│   └── utils/          # Utilidades e configurações
├── data/               # Dados persistidos (JSON)
└── logs/               # Logs da aplicação
```

## 🔄 Fluxo de Pedidos via WhatsApp

1. **Cliente inicia conversa** com o número do WhatsApp
2. **Bot apresenta menu** com opções disponíveis
3. **Cliente escolhe fazer pedido** e visualiza catálogo
4. **Cliente seleciona produtos e quantidades**
5. **Bot calcula valores** e taxa de entrega
6. **Cliente confirma pedido** e fornece dados para entrega
7. **Cliente escolhe forma de pagamento**
8. **Sistema registra pedido** e notifica o administrativo
9. **Cliente recebe atualizações automáticas** sobre o status

## 📱 Funcionalidades do Bot WhatsApp

- **Menu interativo** com opções claras e simples
- **Consulta de cardápio** atualizado automaticamente
- **Acompanhamento de pedidos** por número de telefone
- **Avaliação pós-entrega** para feedback do cliente
- **Sistema de filas** para mensagens, evitando bloqueios
- **Notificações automáticas** de status do pedido

## 💻 Painel Administrativo

- **Dashboard em tempo real** com estatísticas de vendas
- **Listagem de pedidos** com filtros por status
- **Notificações sonoras** para novos pedidos
- **Gerenciamento de catálogo** com edição de produtos
- **Histórico completo de conversas** com clientes
- **Interface de chat integrada** para atendimento

## 📊 Documentação da API

A documentação completa da API está disponível em `http://localhost:3030/api-docs` quando o servidor está em execução, oferecendo:

- Endpoints detalhados com descrição
- Modelos de requisição e resposta
- Testes interativos de endpoints
- Documentação de esquemas

## 🚀 Implantação

### Ambiente de Produção

```bash
# Construir o cliente para produção
cd admin-client
npm run build
cd ..

# Iniciar em modo produção
NODE_ENV=production npm start
```

### Usando PM2 (recomendado para produção)

```bash
npm install -g pm2
pm2 start src/services/server.js --name cookier-shop
```

## 🛠️ Personalização

O sistema foi projetado para ser facilmente personalizável:

- **Catálogo de produtos**: Edite o arquivo `src/data/catalog.json` ou use o painel administrativo
- **Mensagens do bot**: Personalize as respostas no arquivo `src/services/bot/whatsappMessageHandler.js`
- **Interface administrativa**: Modifique os componentes React em `admin-client/src/components/`

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está licenciado sob a Licença MIT.