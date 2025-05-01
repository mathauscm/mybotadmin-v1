// // src/services/bot/whatsappMessageHandler.js
// const logger = require('../../utils/logger');
// const cookieCatalogService = require('../catalog/cookieCatalogService');
// const cookieOrderService = require('../order/cookieOrderService');
// const conversationService = require('./conversationService');

// // Taxa de entrega fixa
// const DELIVERY_FEE = 4.00;

// // Controle de estado dos usuários
// const userStates = new Map();

// // Cache de produtos
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
//         if (content === '1') {
//           // Selecionar produto
//           await loadCatalog();
//           response = formatCatalog();
//           userStates.set(phone, 'selecting_product');
//         } 
//         else if (content === '2') {
//           // Ver catálogo
//           await loadCatalog();
//           response = formatCatalog();
//           userStates.set(phone, 'catalog_view');
//         }
//         else if (content === '3') {
//           // Consultar pedido
//           response = await checkOrderStatus(phone);
//           userStates.set(phone, 'main_menu');
//         }
//         else if (content === '4') {
//           // Falar com atendente
//           response = `Um atendente entrará em contato em breve! Seu número já está na nossa fila de atendimento.`;
//           userStates.set(phone, 'main_menu');
//         }
//         else if (content === '5') {
//           // Horário de funcionamento
//           response = getBusinessHours();
//           userStates.set(phone, 'main_menu');
//         }
//         else {
//           // Resposta padrão
//           response = getMainMenu();
//         }
//         break;

//       case 'selecting_product':
//         // Verificar se é um número válido
//         if (/^[1-9]\d*$/.test(content)) {
//           const productIndex = parseInt(content) - 1;
          
//           if (productIndex >= 0 && productIndex < productCatalog.length) {
//             const selectedProduct = productCatalog[productIndex];
            
//             // Armazenar temporariamente o produto selecionado
//             userStates.set(phone, 'selecting_quantity');
//             userStates.set(phone + '_product', selectedProduct);
            
//             response = `Você selecionou: *${selectedProduct.name}*\nQuantos cookies deseja pedir? (Digite a quantidade, mínimo 1)`;
//           } else {
//             response = `❌ Opção inválida. Por favor, escolha um número entre 1 e ${productCatalog.length}.`;
//           }
//         } else {
//           response = "Por favor, digite apenas o número do produto que deseja.";
//         }
//         break;

//       case 'selecting_quantity':
//         // Verificar se é um número válido
//         if (/^[1-9]\d*$/.test(content)) {
//           const quantity = parseInt(content);
//           const selectedProduct = userStates.get(phone + '_product');
          
//           if (!selectedProduct) {
//             // Algo deu errado, voltar para o menu
//             response = getMainMenu();
//             userStates.set(phone, 'main_menu');
//             break;
//           }
          
//           // Inicializar ou obter carrinho
//           let cart = userStates.get(phone + '_cart') || [];
          
//           // Adicionar item ao carrinho
//           const item = {
//             flavor: selectedProduct.name,
//             quantity: quantity,
//             unitPrice: selectedProduct.price
//           };
          
//           cart.push(item);
//           userStates.set(phone + '_cart', cart);
          
//           // Calcular subtotal
//           const itemSubtotal = item.quantity * item.unitPrice;
//           const totalItems = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
//           const total = totalItems + DELIVERY_FEE;
          
//           // Construir mensagem
//           response = `✅ Adicionado ao carrinho: \n${quantity}x ${selectedProduct.name}\n\n`;
//           response += `Subtotal do item: R$ ${itemSubtotal.toFixed(2)}\n`;
//           response += `Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}\n\n`;
//           response += `Total parcial: R$ ${total.toFixed(2)}\n\n`;
//           response += `Deseja adicionar mais cookies ao pedido?\n\n`;
//           response += `1. Sim, quero mais cookies\n`;
//           response += `2. Não, finalizar pedido\n\n`;
//           response += `Digite 1 ou 2 para continuar.`;
          
//           userStates.set(phone, 'confirming_order');
//         } else {
//           response = "Por favor, digite apenas o número da quantidade desejada.";
//         }
//         break;

//       case 'confirming_order':
//         if (content === '1') {
//           // Adicionar mais cookies
//           await loadCatalog();
//           response = formatCatalog();
//           userStates.set(phone, 'selecting_product');
//         } 
//         else if (content === '2') {
//           // Finalizar pedido
//           const cart = userStates.get(phone + '_cart') || [];
          
//           if (cart.length === 0) {
//             response = "Seu carrinho está vazio. Vamos adicionar alguns cookies?";
//             userStates.set(phone, 'main_menu');
//             break;
//           }
          
//           // Calcular total
//           const totalItems = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
//           const total = totalItems + DELIVERY_FEE;
          
//           // Formatar itens
//           const itemsText = cart.map(item => 
//             `${item.quantity}x ${item.flavor} - R$ ${(item.quantity * item.unitPrice).toFixed(2)}`
//           ).join('\n');
          
//           response = `📦 *Resumo do Pedido:*\n\n${itemsText}\n\n`;
//           response += `*Subtotal dos itens: R$ ${totalItems.toFixed(2)}*\n`;
//           response += `*Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}*\n\n`;
//           response += `*Total: R$ ${total.toFixed(2)}*\n\n`;
//           response += `Por favor, digite seu nome completo:`;
          
//           userStates.set(phone, 'providing_name');
//           userStates.set(phone + '_order_total', total);
//         } else {
//           response = "Por favor, digite 1 para adicionar mais cookies ou 2 para finalizar o pedido.";
//         }
//         break;

//       case 'providing_name':
//         // Validar nome
//         if (content.length < 3) {
//           response = "Nome muito curto. Por favor, digite seu nome completo:";
//         } else {
//           // Salvar nome
//           userStates.set(phone + '_customer_name', content);
          
//           response = `Olá, ${content}! Agora, por favor, digite seu endereço completo para entrega:`;
//           userStates.set(phone, 'providing_address');
//         }
//         break;

//       case 'providing_address':
//         // Validar endereço
//         if (content.length < 10) {
//           response = "Endereço muito curto. Por favor, forneça seu endereço completo:";
//         } else {
//           // Salvar endereço
//           userStates.set(phone + '_address', content);
          
//           response = `📍 Endereço de entrega: ${content}\n\n`;
//           response += `Escolha a forma de pagamento:\n`;
//           response += `1. PIX\n`;
//           response += `2. Cartão de Crédito (na entrega)\n`;
//           response += `3. Dinheiro (na entrega)\n\n`;
//           response += `Digite o número da opção (1, 2 ou 3):`;
          
//           userStates.set(phone, 'selecting_payment');
//         }
//         break;

//       case 'selecting_payment':
//         let paymentMethod = '';
        
//         if (content === '1') paymentMethod = 'pix';
//         else if (content === '2') paymentMethod = 'credit-card';
//         else if (content === '3') paymentMethod = 'cash';
        
//         if (!paymentMethod) {
//           response = "Por favor, escolha uma forma de pagamento válida (1, 2 ou 3):";
//           break;
//         }
        
//         // Salvar forma de pagamento
//         userStates.set(phone + '_payment', paymentMethod);
        
//         // Se for dinheiro, perguntar sobre troco
//         if (paymentMethod === 'cash') {
//           const total = userStates.get(phone + '_order_total') || 0;
          
//           response = `Você selecionou pagamento em dinheiro.\n\n`;
//           response += `*Valor total do pedido: R$ ${total.toFixed(2)}*\n\n`;
//           response += `Para qual valor você precisa de troco? Digite apenas o número (exemplo: 50 para troco de R$ 50,00).\n`;
//           response += `Se não precisar de troco, digite 0.`;
          
//           userStates.set(phone, 'providing_change');
//         } else {
//           // Finalizar pedido diretamente
//           response = await createOrder(phone, paymentMethod);
//           userStates.set(phone, 'main_menu');
//         }
//         break;

//       case 'providing_change':
//         // Verificar se é um número válido
//         const changeAmount = parseFloat(content.replace(',', '.'));
        
//         if (isNaN(changeAmount) || changeAmount < 0) {
//           response = "Por favor, digite um valor válido para o troco:";
//           break;
//         }
        
//         // Salvar valor do troco
//         userStates.set(phone + '_change', changeAmount);
        
//         // Finalizar pedido
//         response = await createOrder(phone, 'cash', changeAmount);
//         userStates.set(phone, 'main_menu');
//         break;

//       case 'catalog_view':
//         // Após ver o catálogo, perguntar se quer fazer pedido
//         response = `Deseja fazer um pedido agora?\n\n`;
//         response += `1. Sim, quero fazer um pedido\n`;
//         response += `2. Não, apenas estou olhando\n\n`;
//         response += `Digite 1 ou 2 para continuar.`;
        
//         userStates.set(phone, 'after_catalog');
//         break;

//       case 'after_catalog':
//         if (content === '1') {
//           // Iniciar pedido
//           await loadCatalog();
//           response = formatCatalog();
//           userStates.set(phone, 'selecting_product');
//         } else {
//           response = `Tudo bem! Quando quiser fazer um pedido é só me chamar novamente. Estou à disposição para ajudar! 😊`;
//           userStates.set(phone, 'main_menu');
//         }
//         break;

//       default:
//         // Estado desconhecido, resetar
//         response = getWelcomeMessage(contactName);
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

// 1. Fazer um pedido
// 2. Ver cardápio
// 3. Consultar meu pedido
// 4. Falar com atendente
// 5. Horário de funcionamento`;
// }

// /**
//  * Horário de funcionamento
//  * @returns {string} Mensagem com horários
//  */
// function getBusinessHours() {
//   return `🕒 *Horário de Funcionamento* 🕒

// Segunda a Sexta: 10h00 - 22h00
// Sábado: 10h00 - 23h00
// Domingo: 12h00 - 21h00

// Faça seu pedido e receba em casa! 🚚`;
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
//  * Cria um novo pedido
//  * @param {string} phone Número de telefone
//  * @param {string} paymentMethod Forma de pagamento
//  * @param {number} changeAmount Valor do troco (opcional)
//  * @returns {Promise<string>} Mensagem de confirmação
//  */
// async function createOrder(phone, paymentMethod, changeAmount = 0) {
//   try {
//     // Recuperar dados do pedido
//     const cart = userStates.get(phone + '_cart') || [];
//     const customerName = userStates.get(phone + '_customer_name') || '';
//     const address = userStates.get(phone + '_address') || '';
//     const total = userStates.get(phone + '_order_total') || 0;
    
//     if (cart.length === 0 || !customerName || !address) {
//       return `Dados incompletos para criar o pedido. Por favor, tente novamente.`;
//     }
    
//     // Criar objeto do pedido
//     const orderData = {
//       customer: customerName,
//       phone: phone,
//       items: cart,
//       deliveryAddress: address,
//       paymentMethod: paymentMethod,
//       total: total
//     };
    
//     // Adicionar valor do troco se aplicável
//     if (paymentMethod === 'cash' && changeAmount > 0) {
//       orderData.changeFor = changeAmount;
//     }
    
//     // Salvar pedido
//     const order = await cookieOrderService.createOrder(orderData);
    
//     // Limpar dados do pedido
//     userStates.delete(phone + '_cart');
//     userStates.delete(phone + '_customer_name');
//     userStates.delete(phone + '_address');
//     userStates.delete(phone + '_payment');
//     userStates.delete(phone + '_change');
//     userStates.delete(phone + '_order_total');
//     userStates.delete(phone + '_product');
    
//     // Formatar mensagem de confirmação
//     const itemsTotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
//     let message = `🎉 *Pedido Confirmado!* 🎉\n\n`;
//     message += `Seu pedido #${order.id} foi registrado com sucesso.\n\n`;
//     message += `*Resumo:*\n`;
//     message += order.items.map(item => `${item.quantity}x ${item.flavor}`).join('\n');
//     message += `\n\n*Subtotal dos itens: R$ ${itemsTotal.toFixed(2)}*`;
//     message += `\n*Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}*`;
//     message += `\n*Total: R$ ${order.total.toFixed(2)}*\n\n`;
    
//     if (paymentMethod === 'pix') {
//       message += `*Forma de pagamento:* PIX\n`;
//       message += `Por favor, faça o pagamento via PIX para:\n`;
//       message += `*Chave PIX:* 88997372037\n`;
//       message += `*Valor:* R$ ${order.total.toFixed(2)}\n\n`;
//       message += `Seu pedido será preparado assim que o pagamento for confirmado.\n\n`;
//     } else if (paymentMethod === 'credit-card') {
//       message += `*Forma de pagamento:* Cartão de Crédito\n`;
//       message += `Pagamento será realizado na entrega.\n\n`;
//     } else {
//       message += `*Forma de pagamento:* Dinheiro\n`;
      
//       if (changeAmount > 0) {
//         const changeValue = changeAmount - order.total;
//         message += `*Troco para:* R$ ${changeAmount.toFixed(2)}\n`;
//         message += `*Valor do troco:* R$ ${changeValue.toFixed(2)}\n\n`;
//       } else {
//         message += `*Sem troco*\n\n`;
//       }
//     }
    
//     message += `Estamos preparando seu pedido! Você receberá atualizações sobre o status.\n\n`;
//     message += `Para acompanhar seu pedido, digite *3* a qualquer momento.\n\n`;
//     message += `Agradecemos a preferência! 🍪`;
    
//     return message;
//   } catch (error) {
//     logger.error('Erro ao criar pedido:', error);
//     return `Desculpe, ocorreu um erro ao criar seu pedido. Por favor, tente novamente.`;
//   }
// }

// // Inicializar o catálogo ao iniciar
// async function initializeCatalog() {
//   try {
//     const catalog = await cookieCatalogService.getCatalog();
//     setCatalog(catalog);
//   } catch (error) {
//     logger.error('Erro ao inicializar catálogo:', error);
//   }
// }

// // Inicializar
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

    // Determinar o estado atual e a resposta
    let response = '';
    let currentState = userStates.get(phone) || 'welcome';

    logger.info(`Estado atual para ${phone}: ${currentState}`);

    // Lógica de transição de estados simplificada
    switch (currentState) {
      case 'welcome':
        // Mensagem de boas-vindas inicial
        response = getWelcomeMessage(contactName);
        userStates.set(phone, 'main_menu');
        break;

      case 'main_menu':
        // Processar opções do menu principal
        if (content === '1') {
          // Selecionar produto
          await loadCatalog();
          response = formatCatalog();
          userStates.set(phone, 'selecting_product');
        } 
        else if (content === '2') {
          // Ver catálogo
          await loadCatalog();
          response = formatCatalog();
          userStates.set(phone, 'catalog_view');
        }
        else if (content === '3') {
          // Consultar pedido
          response = await checkOrderStatus(phone);
          userStates.set(phone, 'main_menu');
        }
        else if (content === '4') {
          // Falar com atendente
          response = `Um atendente entrará em contato em breve! Seu número já está na nossa fila de atendimento.`;
          userStates.set(phone, 'main_menu');
        }
        else if (content === '5') {
          // Horário de funcionamento
          response = getBusinessHours();
          userStates.set(phone, 'main_menu');
        }
        else {
          // Resposta padrão
          response = getMainMenu();
        }
        break;

      case 'selecting_product':
        // Verificar se é um número válido
        if (/^[1-9]\d*$/.test(content)) {
          const productIndex = parseInt(content) - 1;
          
          if (productIndex >= 0 && productIndex < productCatalog.length) {
            const selectedProduct = productCatalog[productIndex];
            
            // Armazenar temporariamente o produto selecionado
            userStates.set(phone, 'selecting_quantity');
            userStates.set(phone + '_product', selectedProduct);
            
            response = `Você selecionou: *${selectedProduct.name}*\nQuantos cookies deseja pedir? (Digite a quantidade, mínimo 1)`;
          } else {
            response = `❌ Opção inválida. Por favor, escolha um número entre 1 e ${productCatalog.length}.`;
          }
        } else {
          response = "Por favor, digite apenas o número do produto que deseja.";
        }
        break;

      case 'selecting_quantity':
        // Verificar se é um número válido
        if (/^[1-9]\d*$/.test(content)) {
          const quantity = parseInt(content);
          const selectedProduct = userStates.get(phone + '_product');
          
          if (!selectedProduct) {
            // Algo deu errado, voltar para o menu
            response = getMainMenu();
            userStates.set(phone, 'main_menu');
            break;
          }
          
          // Inicializar ou obter carrinho
          let cart = userStates.get(phone + '_cart') || [];
          
          // Adicionar item ao carrinho
          const item = {
            flavor: selectedProduct.name,
            quantity: quantity,
            unitPrice: selectedProduct.price
          };
          
          cart.push(item);
          userStates.set(phone + '_cart', cart);
          
          // Calcular subtotal
          const itemSubtotal = item.quantity * item.unitPrice;
          const totalItems = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const total = totalItems + DELIVERY_FEE;
          
          // Construir mensagem
          response = `✅ Adicionado ao carrinho: \n${quantity}x ${selectedProduct.name}\n\n`;
          response += `Subtotal do item: R$ ${itemSubtotal.toFixed(2)}\n`;
          response += `Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}\n\n`;
          response += `Total parcial: R$ ${total.toFixed(2)}\n\n`;
          response += `Deseja adicionar mais cookies ao pedido?\n\n`;
          response += `1. Sim, quero mais cookies\n`;
          response += `2. Não, finalizar pedido\n\n`;
          response += `Digite 1 ou 2 para continuar.`;
          
          userStates.set(phone, 'confirming_order');
        } else {
          response = "Por favor, digite apenas o número da quantidade desejada.";
        }
        break;

      case 'confirming_order':
        if (content === '1') {
          // Adicionar mais cookies
          await loadCatalog();
          response = formatCatalog();
          userStates.set(phone, 'selecting_product');
        } 
        else if (content === '2') {
          // Finalizar pedido
          const cart = userStates.get(phone + '_cart') || [];
          
          if (cart.length === 0) {
            response = "Seu carrinho está vazio. Vamos adicionar alguns cookies?";
            userStates.set(phone, 'main_menu');
            break;
          }
          
          // Calcular total
          const totalItems = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const total = totalItems + DELIVERY_FEE;
          
          // Formatar itens
          const itemsText = cart.map(item => 
            `${item.quantity}x ${item.flavor} - R$ ${(item.quantity * item.unitPrice).toFixed(2)}`
          ).join('\n');
          
          response = `📦 *Resumo do Pedido:*\n\n${itemsText}\n\n`;
          response += `*Subtotal dos itens: R$ ${totalItems.toFixed(2)}*\n`;
          response += `*Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}*\n\n`;
          response += `*Total: R$ ${total.toFixed(2)}*\n\n`;
          response += `Por favor, digite seu nome completo:`;
          
          userStates.set(phone, 'providing_name');
          userStates.set(phone + '_order_total', total);
        } else {
          response = "Por favor, digite 1 para adicionar mais cookies ou 2 para finalizar o pedido.";
        }
        break;

      case 'providing_name':
        // Validar nome
        if (content.length < 3) {
          response = "Nome muito curto. Por favor, digite seu nome completo:";
        } else {
          // Salvar nome
          userStates.set(phone + '_customer_name', content);
          
          response = `Olá, ${content}! Agora, por favor, digite seu endereço completo para entrega:`;
          userStates.set(phone, 'providing_address');
        }
        break;

      case 'providing_address':
        // Validar endereço
        if (content.length < 10) {
          response = "Endereço muito curto. Por favor, forneça seu endereço completo:";
        } else {
          // Salvar endereço
          userStates.set(phone + '_address', content);
          
          response = `📍 Endereço de entrega: ${content}\n\n`;
          response += `Escolha a forma de pagamento:\n`;
          response += `1. PIX\n`;
          response += `2. Cartão de Crédito (na entrega)\n`;
          response += `3. Dinheiro (na entrega)\n\n`;
          response += `Digite o número da opção (1, 2 ou 3):`;
          
          userStates.set(phone, 'selecting_payment');
        }
        break;

      case 'selecting_payment':
        let paymentMethod = '';
        
        if (content === '1') paymentMethod = 'pix';
        else if (content === '2') paymentMethod = 'credit-card';
        else if (content === '3') paymentMethod = 'cash';
        
        if (!paymentMethod) {
          response = "Por favor, escolha uma forma de pagamento válida (1, 2 ou 3):";
          break;
        }
        
        // Salvar forma de pagamento
        userStates.set(phone + '_payment', paymentMethod);
        
        // Se for dinheiro, perguntar sobre troco
        if (paymentMethod === 'cash') {
          const total = userStates.get(phone + '_order_total') || 0;
          
          response = `Você selecionou pagamento em dinheiro.\n\n`;
          response += `*Valor total do pedido: R$ ${total.toFixed(2)}*\n\n`;
          response += `Para qual valor você precisa de troco? Digite apenas o número (exemplo: 50 para troco de R$ 50,00).\n`;
          response += `Se não precisar de troco, digite 0.`;
          
          userStates.set(phone, 'providing_change');
        } else {
          // Finalizar pedido diretamente
          response = await createOrder(phone, paymentMethod);
          userStates.set(phone, 'main_menu');
        }
        break;

      case 'providing_change':
        // Verificar se é um número válido
        const changeAmount = parseFloat(content.replace(',', '.'));
        
        if (isNaN(changeAmount) || changeAmount < 0) {
          response = "Por favor, digite um valor válido para o troco:";
          break;
        }
        
        // Salvar valor do troco
        userStates.set(phone + '_change', changeAmount);
        
        // Finalizar pedido
        response = await createOrder(phone, 'cash', changeAmount);
        userStates.set(phone, 'main_menu');
        break;

      case 'catalog_view':
        // Após ver o catálogo, perguntar se quer fazer pedido
        response = `Deseja fazer um pedido agora?\n\n`;
        response += `1. Sim, quero fazer um pedido\n`;
        response += `2. Não, apenas estou olhando\n\n`;
        response += `Digite 1 ou 2 para continuar.`;
        
        userStates.set(phone, 'after_catalog');
        break;

      case 'after_catalog':
        if (content === '1') {
          // Iniciar pedido
          await loadCatalog();
          response = formatCatalog();
          userStates.set(phone, 'selecting_product');
        } else {
          response = `Tudo bem! Quando quiser fazer um pedido é só me chamar novamente. Estou à disposição para ajudar! 😊`;
          userStates.set(phone, 'main_menu');
        }
        break;

      default:
        // Estado desconhecido, resetar
        response = getWelcomeMessage(contactName);
        userStates.set(phone, 'main_menu');
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

1. Fazer um pedido
2. Ver cardápio
3. Consultar meu pedido
4. Falar com atendente
5. Horário de funcionamento`;
}

/**
 * Horário de funcionamento
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
    // Garantir que price seja um número antes de chamar toFixed()
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    message += `*${index + 1}.* ${product.name} - R$ ${price.toFixed(2)}\n`;
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
 * Cria um novo pedido
 * @param {string} phone Número de telefone
 * @param {string} paymentMethod Forma de pagamento
 * @param {number} changeAmount Valor do troco (opcional)
 * @returns {Promise<string>} Mensagem de confirmação
 */
async function createOrder(phone, paymentMethod, changeAmount = 0) {
  try {
    // Recuperar dados do pedido
    const cart = userStates.get(phone + '_cart') || [];
    const customerName = userStates.get(phone + '_customer_name') || '';
    const address = userStates.get(phone + '_address') || '';
    const total = userStates.get(phone + '_order_total') || 0;
    
    if (cart.length === 0 || !customerName || !address) {
      return `Dados incompletos para criar o pedido. Por favor, tente novamente.`;
    }
    
    // Criar objeto do pedido
    const orderData = {
      customer: customerName,
      phone: phone,
      items: cart,
      deliveryAddress: address,
      paymentMethod: paymentMethod,
      total: total
    };
    
    // Adicionar valor do troco se aplicável
    if (paymentMethod === 'cash' && changeAmount > 0) {
      orderData.changeFor = changeAmount;
    }
    
    // Salvar pedido
    const order = await cookieOrderService.createOrder(orderData);
    
    // Limpar dados do pedido
    userStates.delete(phone + '_cart');
    userStates.delete(phone + '_customer_name');
    userStates.delete(phone + '_address');
    userStates.delete(phone + '_payment');
    userStates.delete(phone + '_change');
    userStates.delete(phone + '_order_total');
    userStates.delete(phone + '_product');
    
    // Formatar mensagem de confirmação
    const itemsTotal = order.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    let message = `🎉 *Pedido Confirmado!* 🎉\n\n`;
    message += `Seu pedido #${order.id} foi registrado com sucesso.\n\n`;
    message += `*Resumo:*\n`;
    message += order.items.map(item => `${item.quantity}x ${item.flavor}`).join('\n');
    message += `\n\n*Subtotal dos itens: R$ ${itemsTotal.toFixed(2)}*`;
    message += `\n*Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)}*`;
    message += `\n*Total: R$ ${order.total.toFixed(2)}*\n\n`;
    
    if (paymentMethod === 'pix') {
      message += `*Forma de pagamento:* PIX\n`;
      message += `Por favor, faça o pagamento via PIX para:\n`;
      message += `*Chave PIX:* 88997372037\n`;
      message += `*Valor:* R$ ${order.total.toFixed(2)}\n\n`;
      message += `Seu pedido será preparado assim que o pagamento for confirmado.\n\n`;
    } else if (paymentMethod === 'credit-card') {
      message += `*Forma de pagamento:* Cartão de Crédito\n`;
      message += `Pagamento será realizado na entrega.\n\n`;
    } else {
      message += `*Forma de pagamento:* Dinheiro\n`;
      
      if (changeAmount > 0) {
        const changeValue = changeAmount - order.total;
        message += `*Troco para:* R$ ${changeAmount.toFixed(2)}\n`;
        message += `*Valor do troco:* R$ ${changeValue.toFixed(2)}\n\n`;
      } else {
        message += `*Sem troco*\n\n`;
      }
    }
    
    message += `Estamos preparando seu pedido! Você receberá atualizações sobre o status.\n\n`;
    message += `Para acompanhar seu pedido, digite *3* a qualquer momento.\n\n`;
    message += `Agradecemos a preferência! 🍪`;
    
    return message;
  } catch (error) {
    logger.error('Erro ao criar pedido:', error);
    return `Desculpe, ocorreu um erro ao criar seu pedido. Por favor, tente novamente.`;
  }
}

// Inicializar o catálogo ao iniciar
async function initializeCatalog() {
  try {
    const catalog = await cookieCatalogService.getCatalog();
    setCatalog(catalog);
  } catch (error) {
    logger.error('Erro ao inicializar catálogo:', error);
  }
}

// Inicializar
initializeCatalog();

module.exports = {
  processMessage,
  setCatalog
};