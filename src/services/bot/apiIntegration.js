// /**
//  * @fileoverview Integração com APIs do sistema
//  * @requires axios
//  */

// const axios = require('axios');
// const logger = require('../../utils/logger');

// // Configuração da URL base da API
// const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3030/api';

// /**
//  * Consulta o status de um pedido
//  * @param {string} phone Número de telefone do cliente
//  * @returns {Promise<string>} Mensagem com o status do pedido
//  */
// async function checkOrderStatus(phone) {
//   try {
//     // Requisição para buscar os pedidos do cliente
//     const response = await axios.get(`${API_BASE_URL}/orders`);
//     const allOrders = response.data;
    
//     // Filtra os pedidos pelo telefone do cliente
//     const customerOrders = allOrders.filter(order => order.phone === phone);
    
//     if (customerOrders.length === 0) {
//       return `Você não possui pedidos recentes. Para fazer um novo pedido, digite *1*.`;
//     }
    
//     // Ordena os pedidos pelo mais recente
//     customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
//     // Pega o pedido mais recente
//     const latestOrder = customerOrders[0];
    
//     // Traduz o status do pedido
//     const statusTranslation = {
//       'pending': 'Pendente',
//       'confirmed': 'Confirmado',
//       'preparing': 'Em Preparo',
//       'delivering': 'Em Entrega',
//       'completed': 'Concluído',
//       'cancelled': 'Cancelado'
//     };
    
//     let message = `📋 *Informações do seu pedido mais recente:*\n\n`;
//     message += `*ID do Pedido:* ${latestOrder.id}\n`;
//     message += `*Status:* ${statusTranslation[latestOrder.status] || latestOrder.status}\n`;
//     message += `*Data:* ${new Date(latestOrder.createdAt).toLocaleString('pt-BR')}\n\n`;
    
//     message += `*Itens:*\n`;
//     latestOrder.items.forEach(item => {
//       message += `- ${item.quantity}x ${item.flavor}\n`;
//     });
    
//     message += `\n*Total:* R$ ${latestOrder.total.toFixed(2)}\n\n`;
    
//     if (latestOrder.status === 'pending' && latestOrder.paymentMethod === 'pix') {
//       message += `*Forma de pagamento:* PIX\n`;
//       message += `Chave PIX: cookie@shop.com\n`;
//       message += `Seu pedido será confirmado após o pagamento.\n\n`;
//     } else if (latestOrder.status === 'delivering') {
//       message += `Seu pedido está a caminho! Tempo estimado de chegada: 15 minutos.\n\n`;
//     } else if (latestOrder.status === 'preparing') {
//       message += `Seus cookies estão sendo preparados fresquinhos! Tempo estimado de entrega: 30-40 minutos.\n\n`;
//     }
    
//     message += `Para outras informações, digite *4* para falar com um atendente.`;
    
//     return message;
//   } catch (error) {
//     logger.error('Erro ao consultar pedido:', error);
//     return `❌ Desculpe, ocorreu um erro ao consultar seu pedido. Por favor, tente novamente ou entre em contato pelo telefone (XX) XXXX-XXXX.`;
//   }
// }

// /**
//  * Cria um novo pedido na API
//  * @param {Object} orderData Dados do pedido
//  * @returns {Promise<Object>} Pedido criado
//  */
// async function createOrder(orderData) {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
//     return response.data;
//   } catch (error) {
//     logger.error('Erro ao criar pedido na API:', error);
//     throw new Error('Falha ao criar pedido');
//   }
// }

// /**
//  * Busca o catálogo de produtos
//  * @returns {Promise<Array>} Lista de produtos
//  */
// async function fetchCatalog() {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/catalog`);
//     return response.data;
//   } catch (error) {
//     logger.error('Erro ao buscar catálogo:', error);
//     return [];
//   }
// }

// module.exports = {
//   checkOrderStatus,
//   createOrder,
//   fetchCatalog
// };

/**
 * @fileoverview Integração com APIs do sistema
 * @requires axios
 */

const axios = require('axios');
const logger = require('../../utils/logger');

// Configuração da URL base da API
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3030/api';

/**
 * Consulta o status de um pedido
 * @param {string} phone Número de telefone do cliente
 * @returns {Promise<string>} Mensagem com o status do pedido
 */
async function checkOrderStatus(phone) {
  try {
    // Requisição para buscar os pedidos do cliente
    const response = await axios.get(`${API_BASE_URL}/orders`);
    const data = response.data;
    
    // Verifica se temos dados de pedidos
    if (!data || !data.orders || !Array.isArray(data.orders)) {
      logger.error('Formato de resposta inválido:', data);
      return `❌ Não foi possível consultar seus pedidos. Por favor, tente novamente mais tarde.`;
    }
    
    // Filtra os pedidos pelo telefone do cliente
    const customerOrders = data.orders.filter(order => order.phone === phone);
    
    if (customerOrders.length === 0) {
      return `Você não possui pedidos recentes. Para fazer um novo pedido, digite *1*.`;
    }
    
    // Ordena os pedidos pelo mais recente
    customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pega o pedido mais recente
    const latestOrder = customerOrders[0];
    
    // Traduz o status do pedido
    const statusTranslation = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'preparing': 'Em Preparo',
      'delivering': 'Em Entrega',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    
    let message = `📋 *Informações do seu pedido mais recente:*\n\n`;
    message += `*ID do Pedido:* ${latestOrder.id}\n`;
    message += `*Status:* ${statusTranslation[latestOrder.status] || latestOrder.status}\n`;
    message += `*Data:* ${new Date(latestOrder.createdAt).toLocaleString('pt-BR')}\n\n`;
    
    message += `*Itens:*\n`;
    latestOrder.items.forEach(item => {
      message += `- ${item.quantity}x ${item.flavor}\n`;
    });
    
    message += `\n*Total:* R$ ${latestOrder.total.toFixed(2)}\n\n`;
    
    if (latestOrder.status === 'pending' && latestOrder.paymentMethod === 'pix') {
      message += `*Forma de pagamento:* PIX\n`;
      message += `Chave PIX: cookie@shop.com\n`;
      message += `Seu pedido será confirmado após o pagamento.\n\n`;
    } else if (latestOrder.status === 'delivering') {
      message += `Seu pedido está a caminho! Tempo estimado de chegada: 15 minutos.\n\n`;
    } else if (latestOrder.status === 'preparing') {
      message += `Seus cookies estão sendo preparados fresquinhos! Tempo estimado de entrega: 30-40 minutos.\n\n`;
    }
    
    message += `Para outras informações, digite *4* para falar com um atendente.`;
    
    return message;
  } catch (error) {
    logger.error('Erro ao consultar pedido:', error);
    return `❌ Desculpe, ocorreu um erro ao consultar seu pedido. Por favor, tente novamente ou entre em contato pelo telefone (XX) XXXX-XXXX.`;
  }
}

/**
 * Cria um novo pedido na API
 * @param {Object} orderData Dados do pedido
 * @returns {Promise<Object>} Pedido criado
 */
async function createOrder(orderData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    logger.error('Erro ao criar pedido na API:', error);
    throw new Error('Falha ao criar pedido');
  }
}

/**
 * Busca o catálogo de produtos
 * @returns {Promise<Array>} Lista de produtos
 */
async function fetchCatalog() {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalog`);
    return response.data;
  } catch (error) {
    logger.error('Erro ao buscar catálogo:', error);
    return [];
  }
}

module.exports = {
  checkOrderStatus,
  createOrder,
  fetchCatalog
};