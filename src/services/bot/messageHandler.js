// /**
//  * @fileoverview Manipulação de mensagens do WhatsApp
//  */

// const logger = require('../../utils/logger');
// const apiIntegration = require('./apiIntegration');

// // Estado possíveis para a sessão do usuário
// const SessionState = {
//   IDLE: 'idle',
//   AWAITING_ORDER: 'awaiting_order',
//   SELECTING_PRODUCT: 'selecting_product',
//   SELECTING_QUANTITY: 'selecting_quantity',
//   CONFIRMING_ORDER: 'confirming_order',
//   PROVIDING_ADDRESS: 'providing_address',
//   SELECTING_PAYMENT: 'selecting_payment'
// };

// // Opções de pagamento
// const paymentMethods = {
//   'pix': 'PIX',
//   'credit-card': 'Cartão de Crédito',
//   'cash': 'Dinheiro'
// };

// // Mapa para controlar a sessão de cada usuário
// const userSessions = new Map();

// // Catálogo de produtos em cache
// let productCatalog = [];

// /**
//  * Define o catálogo de produtos
//  * @param {Array} catalog Array com produtos
//  */
// const setCatalog = (catalog) => {
//   productCatalog = catalog;
//   logger.info(`Catálogo atualizado com ${productCatalog.length} produtos.`);
// };

// /**
//  * Mensagem de boas-vindas e menu principal
//  * @returns {string} Mensagem formatada
//  */
// function getWelcomeMessage() {
//   return `🍪 *Bem-vindo à Cookie Shop!* 🍪

// Olá! Sou o assistente virtual da Cookie Shop. Como posso ajudar você hoje?

// *Escolha uma opção:*

// 1️⃣ *Fazer um pedido*
// 2️⃣ *Ver cardápio*
// 3️⃣ *Consultar meu pedido*
// 4️⃣ *Falar com atendente*
// 5️⃣ *Horário de funcionamento*

// Basta enviar o número da opção desejada!`;
// }

// /**
//  * Formata o catálogo para exibição no WhatsApp
//  * @returns {string} Catálogo formatado
//  */
// function formatCatalog() {
//   if (productCatalog.length === 0) {
//     return 'Desculpe, nosso catálogo está indisponível no momento. Tente novamente mais tarde.';
//   }

//   let message = `🍪 *Cardápio Cookier* 🍪\n\n`;
  
//   productCatalog.forEach((product, index) => {
//     message += `*${index + 1}.* ${product.name} - R$ ${product.price.toFixed(2)}\n`;
//     message += `   _${product.description}_\n\n`;
//   });
  
//   message += `\nPara fazer um pedido, digite *1*.`;
  
//   return message;
// }

// // Outras funções manipuladoras de mensagens aqui (startOrder, handleProductSelection, etc.)
// // ...

// /**
//  * Processa as mensagens recebidas
//  * @param {object} client Cliente WhatsApp
//  * @param {object} message Objeto de mensagem do WhatsApp
//  */
// async function processMessage(client, message) {
//   try {
//     // Ignora mensagens de grupos
//     if (message.from.includes('@g.us')) return;
    
//     const phone = message.from.replace('@c.us', '');
//     const content = message.body.trim();
    
//     logger.info(`Mensagem recebida de ${phone}: ${content}`);
    
//     // Verifica se o usuário tem uma sessão ativa
//     const session = userSessions.get(phone);
    
//     let response;
    
//     // Se não tem sessão ou está no estado IDLE
//     if (!session || session.state === SessionState.IDLE) {
//       // Processa comandos básicos
//       switch (content) {
//         case '1':
//           response = startOrder(phone);
//           break;
          
//         case '2':
//           response = formatCatalog();
//           break;
          
//         case '3':
//           response = await apiIntegration.checkOrderStatus(phone);
//           break;
          
//         case '4':
//           response = `Um atendente entrará em contato em breve! Seu número já está na nossa fila de atendimento.`;
//           break;
          
//         case '5':
//           response = getBusinessHours();
//           break;
          
//         default:
//           // Mensagem de boas-vindas para qualquer outra entrada
//           response = getWelcomeMessage();
//       }
//     } else {
//       // Aqui viria a lógica existente de processamento baseado no estado
//       // ...
//     }
    
//     // Envia a resposta ao cliente
//     await client.sendMessage(message.from, response);
//     logger.info(`Resposta enviada para ${phone}`);
    
//   } catch (error) {
//     logger.error('Erro ao processar mensagem:', error);
//     try {
//       await client.sendMessage(message.from, 
//         `❌ Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente ou entre em contato conosco pelo telefone (XX) XXXX-XXXX.`);
//     } catch (sendError) {
//       logger.error('Erro ao enviar mensagem de erro:', sendError);
//     }
//   }
// }

// module.exports = {
//   processMessage,
//   setCatalog,
//   userSessions,
//   SessionState
// };



/**
 * @fileoverview Manipulação de mensagens do WhatsApp
 */

const logger = require('../../utils/logger');
const apiIntegration = require('./apiIntegration');
const cookieCatalogService = require('../catalog/cookieCatalogService');

// Estado possíveis para a sessão do usuário
const SessionState = {
  IDLE: 'idle',
  AWAITING_ORDER: 'awaiting_order',
  SELECTING_PRODUCT: 'selecting_product',
  SELECTING_QUANTITY: 'selecting_quantity',
  CONFIRMING_ORDER: 'confirming_order',
  PROVIDING_ADDRESS: 'providing_address',
  SELECTING_PAYMENT: 'selecting_payment'
};

// Opções de pagamento
const paymentMethods = {
  'pix': 'PIX',
  'credit-card': 'Cartão de Crédito',
  'cash': 'Dinheiro'
};

// Mapa para controlar a sessão de cada usuário
const userSessions = new Map();

// Catálogo de produtos em cache
let productCatalog = [];

/**
 * Define o catálogo de produtos
 * @param {Array} catalog Array com produtos
 */
const setCatalog = (catalog) => {
  productCatalog = catalog;
  logger.info(`Catálogo atualizado com ${productCatalog.length} produtos.`);
};

/**
 * Mensagem de boas-vindas e menu principal
 * @returns {string} Mensagem formatada
 */
function getWelcomeMessage() {
  return `🍪 *Bem-vindo à Cookie Shop!* 🍪

Olá! Sou o assistente virtual da Cookie Shop. Como posso ajudar você hoje?

*Escolha uma opção:*

1️⃣ *Fazer um pedido*
2️⃣ *Ver cardápio*
3️⃣ *Consultar meu pedido*
4️⃣ *Falar com atendente*
5️⃣ *Horário de funcionamento*

Basta enviar o número da opção desejada!`;
}

/**
 * Retorna o horário de funcionamento
 * @returns {string} Mensagem com horários
 */
function getBusinessHours() {
  return `🕒 *Horário de Funcionamento* 🕒

Segunda a Sexta: 10h00 - 22h00
Sábado: 10h00 - 23h00
Domingo: 12h00 - 21h00

Faça seu pedido e receba em casa! 🚚`;
}

/**
 * Formata o catálogo para exibição no WhatsApp
 * @returns {string} Catálogo formatado
 */
function formatCatalog() {
  if (productCatalog.length === 0) {
    return 'Desculpe, nosso catálogo está indisponível no momento. Tente novamente mais tarde.';
  }

  let message = `🍪 *Cardápio Cookier* 🍪\n\n`;
  
  productCatalog.forEach((product, index) => {
    message += `*${index + 1}.* ${product.name} - R$ ${product.price.toFixed(2)}\n`;
    message += `   _${product.description}_\n\n`;
  });
  
  message += `\nPara fazer um pedido, digite *1*.`;
  
  return message;
}

// Adicione os métodos do seu código anterior (startOrder, handleProductSelection, etc.)
// ... (o código que você compartilhou anteriormente)

// Inicialização do catálogo
async function initializeCatalog() {
  try {
    const catalog = await cookieCatalogService.getCatalog();
    setCatalog(catalog);
  } catch (error) {
    logger.error('Erro ao inicializar catálogo:', error);
  }
}

// Chama a inicialização do catálogo
initializeCatalog();

module.exports = {
  processMessage,
  setCatalog,
  userSessions,
  SessionState
};