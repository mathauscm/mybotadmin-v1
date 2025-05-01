// admin-client/src/services/marketingService.js
import { getCustomers } from './customerService';

/**
 * Envia promoções para um segmento específico de clientes
 * @param {string} type Tipo de promoção ('daily', 'weekend', 'special')
 * @param {string} segment Segmento de clientes ('recurrent', 'highvalue', 'inactive', 'new', 'all')
 * @param {string} message Mensagem personalizada (opcional)
 * @returns {Promise<Object>} Resultado do envio
 */
export const sendPromotion = async (type, segment, message = '') => {
  try {
    const response = await fetch('/api/bot/send-promotions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        segment,
        message: message || undefined
      })
    });
    
    if (!response.ok) {
      throw new Error('Falha ao enviar promoções');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar promoção:', error);
    throw error;
  }
};

/**
 * Obtém clientes filtrados por segmento
 * @param {string} segment Segmento de clientes ('recurrent', 'highvalue', 'inactive', 'new', 'all')
 * @returns {Promise<Array>} Lista de clientes do segmento
 */
export const getCustomersBySegment = async (segment) => {
  try {
    const customers = await getCustomers();
    
    switch (segment) {
      case 'recurrent':
        return customers.filter(customer => customer.totalOrders > 1);
      case 'highvalue':
        // Clientes que gastaram mais que a média
        const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
        const avgSpent = totalSpent / customers.length;
        return customers.filter(customer => customer.totalSpent > avgSpent);
      case 'inactive':
        // Clientes cujo último pedido foi há mais de 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return customers.filter(customer => 
          new Date(customer.lastOrderDate) < thirtyDaysAgo
        );
      case 'new':
        return customers.filter(customer => customer.totalOrders === 1);
      case 'all':
      default:
        return customers;
    }
  } catch (error) {
    console.error('Erro ao buscar clientes por segmento:', error);
    throw error;
  }
};

/**
 * Obtém mensagem de promoção para prévia
 * @param {string} type Tipo de promoção ('daily', 'weekend', 'special')
 * @returns {string} Mensagem de promoção formatada
 */
export const getPromotionTemplate = (type) => {
  switch (type) {
    case 'weekend':
      return `🍪 *Promoção de Fim de Semana!* 🍪\n\n` +
             `Aproveite nossa promoção especial de fim de semana! Compre uma dúzia, leve outra pela metade do preço!\n\n` +
             `Sugestões de Cookies:\n` +
             `- Cookie Red Velvet 100g\n` +
             `- ChocoCaramelo 100g\n\n` +
             `Para fazer seu pedido, basta enviar *1* e aproveitar nossas delícias!`;
    case 'special':
      return `✨ *Promoção Especial!* ✨\n\n` +
             `Cliente especial merece desconto especial! Use o cupom COOKIE20 e ganhe 20% de desconto em qualquer pedido!\n\n` +
             `Sugestões de Cookies:\n` +
             `- Churros 100g\n` +
             `- Red Ninho 100g\n\n` +
             `Para fazer seu pedido, basta enviar *1* e aproveitar nossas delícias!`;
    default: // daily
      return `🍪 *Promoção do Dia!* 🍪\n\n` +
             `Estamos com uma super promoção hoje! Na compra de 2 dúzias ou mais, ganhe frete grátis!\n\n` +
             `Sugestões de Cookies:\n` +
             `- Nutella 100g\n` +
             `- ChocoNutella 100g\n\n` +
             `Para fazer seu pedido, basta enviar *1* e aproveitar nossas delícias!`;
  }
};