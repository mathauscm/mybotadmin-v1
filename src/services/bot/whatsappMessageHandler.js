// // src/services/bot/whatsappMessageHandler.js
// const logger = require('../../utils/logger');
// const cookieCatalogService = require('../catalog/cookieCatalogService');
// const cookieOrderService = require('../order/cookieOrderService');
// const conversationService = require('./conversationService');

// // Taxa de entrega fixa
// const DELIVERY_FEE = 4.00;

// // URL do catálogo digital - usar variável de ambiente ou URL padrão
// const CATALOG_URL = process.env.CATALOG_URL || 'https://cookier-catalogo.innovv8.tech';

// // Controle de estado dos usuários
// const userStates = new Map();

// // Cache de produtos
// let productCatalog = [];

// // Limite de mensagens para novos clientes
// const MAX_WELCOME_MESSAGES = 1;
// const welcomeMessageCounter = new Map();

// /**
//  * Define o catálogo de produtos
//  * @param {Array} catalog Array com produtos
//  */
// const setCatalog = (catalog) => {
//   productCatalog = catalog;
//   logger.info(`Catálogo atualizado com ${productCatalog.length} produtos.`);
// };

// /**
//  * Processa as mensagens recebidas
//  * @param {Object} client Cliente WhatsApp
//  * @param {Object} message Objeto da mensagem
//  */
// async function processMessage(client, message) {
//   try {
//     // Ignora mensagens de grupos
//     if (message.from.includes('@g.us')) return;

//     const phone = message.from.replace('@c.us', '');
//     const content = message.body.trim();

//     logger.info(`Mensagem recebida de ${phone}: ${content}`);

//     // Salvar a mensagem recebida
//     await conversationService.saveMessage(phone, content, false);

//     // Tenta obter o nome do contato
//     let contactName = '';
//     try {
//       const contact = await message.getContact();
//       contactName = contact.name || contact.pushname || '';
//     } catch (error) {
//       logger.warn(`Não foi possível obter o nome do contato: ${error.message}`);
//     }

//     // Verificar se é um novo cliente e controlar mensagens de boas-vindas
//     let isNewConversation = false;
//     if (!userStates.has(phone)) {
//       isNewConversation = true;

//       // Inicializar contador se for primeiro contato
//       if (!welcomeMessageCounter.has(phone)) {
//         welcomeMessageCounter.set(phone, 0);
//       }

//       const messageCount = welcomeMessageCounter.get(phone);
//       if (messageCount < MAX_WELCOME_MESSAGES) {
//         // Incrementar contador apenas se vamos enviar mensagem de boas-vindas
//         welcomeMessageCounter.set(phone, messageCount + 1);
//         userStates.set(phone, 'welcome');
//       } else {
//         // Se já enviamos mensagens de boas-vindas, ir direto ao menu principal
//         userStates.set(phone, 'main_menu');
//       }
//     }

//     // Verificar se cliente tem pedido em andamento para ajustar o menu
//     let hasActiveOrder = false;
//     let orderStatus = null;
//     try {
//       const orders = await cookieOrderService.getOrdersByCustomer(phone);
//       if (orders && orders.length > 0) {
//         // Ordenar do mais recente para o mais antigo
//         const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         const latestOrder = sortedOrders[0];

//         // Verificar se o pedido mais recente está em andamento
//         const activeStatuses = ['pending', 'confirmed', 'preparing', 'delivering'];
//         hasActiveOrder = activeStatuses.includes(latestOrder.status);
//         orderStatus = latestOrder.status;
//       }
//     } catch (error) {
//       logger.warn(`Erro ao verificar pedidos ativos: ${error.message}`);
//     }

//     // Determinar o estado atual e a resposta
//     let response = '';
//     let currentState = userStates.get(phone) || 'welcome';

//     logger.info(`Estado atual para ${phone}: ${currentState}`);

//     // Lógica de transição de estados simplificada
//     switch (currentState) {
//       case 'welcome':
//         // Mensagem de boas-vindas inicial
//         response = getWelcomeMessage(contactName);
//         userStates.set(phone, 'main_menu');
//         break;

//       case 'main_menu':
//         // Processar opções do menu principal
//         if (hasActiveOrder) {
//           // Se tem pedido em andamento, mostrar menu limitado
//           if (content === '3') {
//             // Consultar pedido
//             response = await checkOrderStatus(phone);
//             userStates.set(phone, 'main_menu');
//           }
//           else if (content === '4') {
//             // Falar com atendente
//             response = `Um atendente entrará em contato em breve! Seu número já está na nossa fila de atendimento.`;
//             userStates.set(phone, 'main_menu');
//           }
//           else {
//             // Mostrar menu limitado
//             response = getLimitedMenu(orderStatus);
//           }
//         } else {
//           // Menu completo para quem não tem pedido em andamento
//           if (content === '1') {
//             // Enviar link para o catálogo digital
//             response = `Para fazer seu pedido, acesse nosso catálogo digital:\n\n${CATALOG_URL}/${phone}\n\nLá você poderá ver todos os nossos produtos e finalizar seu pedido com facilidade! 🍪`;
//             userStates.set(phone, 'main_menu');
//           }
//           else if (content === '2') {
//             // Enviar link para o catálogo digital também
//             response = `Você pode acessar nosso cardápio completo em:\n\n${CATALOG_URL}/${phone}\n\nTemos diversas opções deliciosas esperando por você! 😋`;
//             userStates.set(phone, 'main_menu');
//           }
//           else if (content === '3') {
//             // Consultar pedido
//             response = await checkOrderStatus(phone);
//             userStates.set(phone, 'main_menu');
//           }
//           else if (content === '4') {
//             // Falar com atendente
//             response = `Um atendente entrará em contato em breve! Seu número já está na nossa fila de atendimento.`;
//             userStates.set(phone, 'main_menu');
//           }
//           else if (content === '5') {
//             // Horário de funcionamento
//             response = getBusinessHours();
//             userStates.set(phone, 'main_menu');
//           }
//           else {
//             // Resposta padrão
//             response = getMainMenu();
//           }
//         }
//         break;

//       // Remover estados relacionados ao fluxo de pedido no WhatsApp
//       // (selecting_product, selecting_quantity, etc.)

//       default:
//         // Estado desconhecido, resetar
//         response = hasActiveOrder ? getLimitedMenu(orderStatus) : getMainMenu();
//         userStates.set(phone, 'main_menu');
//     }

//     // Salvar a resposta do bot
//     await conversationService.saveMessage(phone, response, true);

//     // Enviar a resposta
//     await client.sendMessage(message.from, response);
//     logger.info(`Resposta enviada para ${phone}`);

//   } catch (error) {
//     logger.error(`Erro ao processar mensagem:`, error);
//     try {
//       const errorMessage = `❌ Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.`;
//       await client.sendMessage(message.from, errorMessage);
//     } catch (sendError) {
//       logger.error('Erro ao enviar mensagem de erro:', sendError);
//     }
//   }
// }

// /**
//  * Mensagem de boas-vindas
//  * @param {string} name Nome do contato
//  * @returns {string} Mensagem formatada
//  */
// function getWelcomeMessage(name = '') {
//   return `🍪 *Bem-vindo à Cookier!* 🍪

// Olá${name ? ' *' + name + '*' : ''}! 
// Sou o assistente virtual da Cookier. Como posso ajudar você hoje?

// *Escolha uma opção:*

// 1️⃣ *Fazer um pedido*
// 2️⃣ *Ver cardápio*
// 3️⃣ *Consultar meu pedido*
// 4️⃣ *Falar com atendente*
// 5️⃣ *Horário de funcionamento*

// Basta enviar o número da opção desejada!`;
// }

// /**
//  * Menu principal
//  * @returns {string} Mensagem do menu
//  */
// function getMainMenu() {
//   return `*Escolha uma opção:*

// 1️⃣ *Fazer um pedido*
// 2️⃣ *Ver cardápio*
// 3️⃣ *Consultar meu pedido*
// 4️⃣ *Falar com atendente*
// 5️⃣ *Horário de funcionamento*`;
// }

// /**
//  * Menu limitado para clientes com pedido em andamento
//  * @param {string} status Status do pedido atual
//  * @returns {string} Mensagem do menu limitado
//  */
// function getLimitedMenu(status) {
//   let statusInfo = '';

//   // Status em português
//   const statusMap = {
//     'pending': 'Pendente',
//     'confirmed': 'Confirmado',
//     'preparing': 'Em Preparo',
//     'delivering': 'Em Entrega'
//   };

//   if (status && statusMap[status]) {
//     statusInfo = `\n\nSeu pedido atual está: *${statusMap[status]}*`;
//   }

//   return `Você tem um pedido em andamento!${statusInfo}

// *Escolha uma opção:*

// 3️⃣ *Consultar detalhes do pedido*
// 4️⃣ *Falar com atendente*`;
// }

// /**
//  * Carrega o catálogo
//  */
// async function loadCatalog() {
//   if (productCatalog.length === 0) {
//     productCatalog = await cookieCatalogService.getCatalog();
//   }
// }

// /**
//  * Formata o catálogo para exibição
//  * @returns {string} Catálogo formatado
//  */
// function formatCatalog() {
//   if (productCatalog.length === 0) {
//     return 'Desculpe, nosso catálogo está indisponível no momento.';
//   }

//   let message = `🍪 *Cardápio Cookier* 🍪\n\n`;

//   productCatalog.forEach((product, index) => {
//     message += `*${index + 1}.* ${product.name} - R$ ${product.price.toFixed(2)}\n`;
//     message += `   _${product.description}_\n\n`;
//   });

//   message += `\nPara fazer um pedido, digite o número da opção.\n`;
//   message += `*Obs: Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}*`;

//   return message;
// }

// /**
//  * Consulta o status de um pedido
//  * @param {string} phone Número de telefone
//  * @returns {Promise<string>} Mensagem com status
//  */
// async function checkOrderStatus(phone) {
//   try {
//     const orders = await cookieOrderService.getOrdersByCustomer(phone);

//     if (!orders || orders.length === 0) {
//       return `Você não possui pedidos recentes. Para fazer um novo pedido, digite *1*.`;
//     }

//     // Ordena por data (mais recente primeiro)
//     const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     const latestOrder = sortedOrders[0];

//     // Status em português
//     const statusMap = {
//       'pending': 'Pendente',
//       'confirmed': 'Confirmado',
//       'preparing': 'Em Preparo',
//       'delivering': 'Em Entrega',
//       'completed': 'Concluído',
//       'cancelled': 'Cancelado'
//     };

//     let message = `📋 *Informações do seu pedido mais recente:*\n\n`;
//     message += `*ID do Pedido:* ${latestOrder.id}\n`;
//     message += `*Status:* ${statusMap[latestOrder.status] || latestOrder.status}\n`;
//     message += `*Data:* ${new Date(latestOrder.createdAt).toLocaleString('pt-BR')}\n\n`;

//     message += `*Itens:*\n`;
//     latestOrder.items.forEach(item => {
//       message += `- ${item.quantity}x ${item.flavor}\n`;
//     });

//     message += `\n*Total:* R$ ${latestOrder.total.toFixed(2)}\n\n`;

//     return message;
//   } catch (error) {
//     logger.error('Erro ao consultar pedido:', error);
//     return `Desculpe, ocorreu um erro ao consultar seu pedido. Por favor, tente novamente.`;
//   }
// }

// /**
//  * Retorna o horário de funcionamento
//  * @returns {string} Mensagem com horários
//  */
// function getBusinessHours() {
//   return `🕒 *Horário de Funcionamento* 🕒

// Segunda a Sexta: 10h00 - 22h00
// Sábado: 10h00 - 23h00
// Domingo: 12h00 - 21h00

// Faça seu pedido através do nosso catálogo digital! 🚚`;
// }

// // Mantemos apenas a função de inicialização para manter o cache de produtos atualizado
// // (ainda é útil para quando precisamos exibir informações dos produtos em outras partes)
// async function initializeCatalog() {
//   try {
//     const catalog = await cookieCatalogService.getCatalog();
//     setCatalog(catalog);
//   } catch (error) {
//     logger.error('Erro ao inicializar catálogo:', error);
//   }
// }

// // Inicializar catálogo
// initializeCatalog();

// module.exports = {
//   processMessage,
//   setCatalog
// };
// src/services/bot/whatsappMessageHandler.js
const logger = require('../../utils/logger');
const cookieCatalogService = require('../catalog/cookieCatalogService');
const cookieOrderService = require('../order/cookieOrderService');
const conversationService = require('./conversationService');

// Taxa de entrega fixa
const DELIVERY_FEE = 4.00;

// URL do catálogo digital - usar variável de ambiente ou URL padrão
const CATALOG_URL = process.env.CATALOG_URL || 'https://cookier-catalogo.innovv8.tech';

// Controle de estado dos usuários
const userStates = new Map();

// Cache de produtos
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
 * Processa as mensagens recebidas
 * @param {Object} client Cliente WhatsApp
 * @param {Object} message Objeto da mensagem
 */
async function processMessage(client, message) {
  try {
    // Ignora mensagens de grupos
    if (message.from.includes('@g.us')) return;

    const phone = message.from.replace('@c.us', '');
    const content = message.body.trim();

    logger.info(`Mensagem recebida de ${phone}: ${content}`);

    // Salvar a mensagem recebida
    await conversationService.saveMessage(phone, content, false);

    // Tenta obter o nome do contato
    let contactName = '';
    try {
      const contact = await message.getContact();
      contactName = contact.name || contact.pushname || '';
    } catch (error) {
      logger.warn(`Não foi possível obter o nome do contato: ${error.message}`);
    }

    // Lógica simplificada para determinar se é um novo usuário
    const isNewUser = !userStates.has(phone);
    
    // Verificar se cliente tem pedido em andamento para ajustar o menu
    let hasActiveOrder = false;
    let orderStatus = null;
    try {
      const orders = await cookieOrderService.getOrdersByCustomer(phone);
      if (orders && orders.length > 0) {
        // Ordenar do mais recente para o mais antigo
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestOrder = sortedOrders[0];

        // Verificar se o pedido mais recente está em andamento
        const activeStatuses = ['pending', 'confirmed', 'preparing', 'delivering'];
        hasActiveOrder = activeStatuses.includes(latestOrder.status);
        orderStatus = latestOrder.status;
      }
    } catch (error) {
      logger.warn(`Erro ao verificar pedidos ativos: ${error.message}`);
    }

    // Determinar a resposta com base no estado do usuário
    let response = '';

    if (isNewUser) {
      // Novo usuário - enviar apenas a mensagem de boas-vindas
      response = getWelcomeMessage(contactName);
      userStates.set(phone, 'main_menu');
    } else {
      // Usuário já conhecido - processar comandos
      // Determinar o estado atual
      const currentState = userStates.get(phone) || 'main_menu';
      
      logger.info(`Estado atual para ${phone}: ${currentState}`);

      // Lógica para usuário recorrente
      if (hasActiveOrder) {
        // Menu limitado para quem tem pedido em andamento
        if (content === '3') {
          // Consultar pedido
          response = await checkOrderStatus(phone);
        }
        else if (content === '4') {
          // Falar com atendente
          response = `Um atendente entrará em contato em breve! Seu número já está na nossa fila de atendimento.`;
        }
        else {
          // Mostrar menu limitado
          response = getLimitedMenu(orderStatus);
        }
      } else {
        // Menu completo para quem não tem pedido em andamento
        if (content === '1') {
          // Enviar link para o catálogo digital
          response = `Para fazer seu pedido, acesse nosso catálogo digital:\n\n${CATALOG_URL}/${phone}\n\nLá você poderá ver todos os nossos produtos e finalizar seu pedido com facilidade! 🍪`;
        }
        else if (content === '2') {
          // Enviar link para o catálogo digital também
          response = `Você pode acessar nosso cardápio completo em:\n\n${CATALOG_URL}/${phone}\n\nTemos diversas opções deliciosas esperando por você! 😋`;
        }
        else if (content === '3') {
          // Consultar pedido
          response = await checkOrderStatus(phone);
        }
        else if (content === '4') {
          // Falar com atendente
          response = `Um atendente entrará em contato em breve! Seu número já está na nossa fila de atendimento.`;
        }
        else if (content === '5') {
          // Horário de funcionamento
          response = getBusinessHours();
        }
        else {
          // Resposta padrão - mostrar menu principal
          response = getMainMenu();
        }
      }
    }

    // Salvar a resposta do bot
    await conversationService.saveMessage(phone, response, true);

    // Enviar a resposta
    await client.sendMessage(message.from, response);
    logger.info(`Resposta enviada para ${phone}`);

  } catch (error) {
    logger.error(`Erro ao processar mensagem:`, error);
    try {
      const errorMessage = `❌ Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.`;
      await client.sendMessage(message.from, errorMessage);
    } catch (sendError) {
      logger.error('Erro ao enviar mensagem de erro:', sendError);
    }
  }
}

/**
 * Mensagem de boas-vindas
 * @param {string} name Nome do contato
 * @returns {string} Mensagem formatada
 */
function getWelcomeMessage(name = '') {
  return `🍪 *Bem-vindo à Cookier!* 🍪

Olá${name ? ' *' + name + '*' : ''}! 
Sou o assistente virtual da Cookier. Como posso ajudar você hoje?

*Escolha uma opção:*

1️⃣ *Fazer um pedido*
2️⃣ *Ver cardápio*
3️⃣ *Consultar meu pedido*
4️⃣ *Falar com atendente*
5️⃣ *Horário de funcionamento*

Basta enviar o número da opção desejada!`;
}

/**
 * Menu principal
 * @returns {string} Mensagem do menu
 */
function getMainMenu() {
  return `*Escolha uma opção:*

1️⃣ *Fazer um pedido*
2️⃣ *Ver cardápio*
3️⃣ *Consultar meu pedido*
4️⃣ *Falar com atendente*
5️⃣ *Horário de funcionamento*`;
}

/**
 * Menu limitado para clientes com pedido em andamento
 * @param {string} status Status do pedido atual
 * @returns {string} Mensagem do menu limitado
 */
function getLimitedMenu(status) {
  let statusInfo = '';

  // Status em português
  const statusMap = {
    'pending': 'Pendente',
    'confirmed': 'Confirmado',
    'preparing': 'Em Preparo',
    'delivering': 'Em Entrega'
  };

  if (status && statusMap[status]) {
    statusInfo = `\n\nSeu pedido atual está: *${statusMap[status]}*`;
  }

  return `Você tem um pedido em andamento!${statusInfo}

*Escolha uma opção:*

3️⃣ *Consultar detalhes do pedido*
4️⃣ *Falar com atendente*`;
}

/**
 * Carrega o catálogo
 */
async function loadCatalog() {
  if (productCatalog.length === 0) {
    productCatalog = await cookieCatalogService.getCatalog();
  }
}

/**
 * Formata o catálogo para exibição
 * @returns {string} Catálogo formatado
 */
function formatCatalog() {
  if (productCatalog.length === 0) {
    return 'Desculpe, nosso catálogo está indisponível no momento.';
  }

  let message = `🍪 *Cardápio Cookier* 🍪\n\n`;

  productCatalog.forEach((product, index) => {
    message += `*${index + 1}.* ${product.name} - R$ ${product.price.toFixed(2)}\n`;
    message += `   _${product.description}_\n\n`;
  });

  message += `\nPara fazer um pedido, digite o número da opção.\n`;
  message += `*Obs: Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}*`;

  return message;
}

/**
 * Consulta o status de um pedido
 * @param {string} phone Número de telefone
 * @returns {Promise<string>} Mensagem com status
 */
async function checkOrderStatus(phone) {
  try {
    const orders = await cookieOrderService.getOrdersByCustomer(phone);

    if (!orders || orders.length === 0) {
      return `Você não possui pedidos recentes. Para fazer um novo pedido, digite *1*.`;
    }

    // Ordena por data (mais recente primeiro)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestOrder = sortedOrders[0];

    // Status em português
    const statusMap = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'preparing': 'Em Preparo',
      'delivering': 'Em Entrega',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };

    let message = `📋 *Informações do seu pedido mais recente:*\n\n`;
    message += `*ID do Pedido:* ${latestOrder.id}\n`;
    message += `*Status:* ${statusMap[latestOrder.status] || latestOrder.status}\n`;
    message += `*Data:* ${new Date(latestOrder.createdAt).toLocaleString('pt-BR')}\n\n`;

    message += `*Itens:*\n`;
    latestOrder.items.forEach(item => {
      message += `- ${item.quantity}x ${item.flavor}\n`;
    });

    message += `\n*Total:* R$ ${latestOrder.total.toFixed(2)}\n\n`;

    return message;
  } catch (error) {
    logger.error('Erro ao consultar pedido:', error);
    return `Desculpe, ocorreu um erro ao consultar seu pedido. Por favor, tente novamente.`;
  }
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

Faça seu pedido através do nosso catálogo digital! 🚚`;
}

// Mantemos apenas a função de inicialização para manter o cache de produtos atualizado
// (ainda é útil para quando precisamos exibir informações dos produtos em outras partes)
async function initializeCatalog() {
  try {
    const catalog = await cookieCatalogService.getCatalog();
    setCatalog(catalog);
  } catch (error) {
    logger.error('Erro ao inicializar catálogo:', error);
  }
}

// Inicializar catálogo
initializeCatalog();

module.exports = {
  processMessage,
  setCatalog
};