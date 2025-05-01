/**
 * @fileoverview Sistema de filas para mensagens
 * @requires bull
 */

const Queue = require('bull');
const logger = require('../../utils/logger');

// Cria uma fila para mensagens do WhatsApp
const messageQueue = new Queue('whatsapp-messages', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  }
});

// Configura manipuladores de eventos da fila
messageQueue.on('error', (error) => {
  logger.error('Erro na fila de mensagens:', error);
});

messageQueue.on('failed', (job, error) => {
  logger.error(`Falha ao processar mensagem (tentativa ${job.attemptsMade}):`, error);
});

messageQueue.on('completed', (job) => {
  logger.info(`Mensagem enviada com sucesso: ${job.id}`);
});

/**
 * Adiciona uma mensagem à fila para envio
 * @param {string} phone Número de telefone do destinatário
 * @param {string} message Conteúdo da mensagem
 * @returns {Promise<Object>} Job adicionado à fila
 */
async function addMessageToQueue(phone, message) {
  try {
    const job = await messageQueue.add({
      phone,
      message,
      timestamp: new Date().toISOString()
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
    
    logger.info(`Mensagem adicionada à fila: ${job.id} para ${phone}`);
    return job;
  } catch (error) {
    logger.error('Erro ao adicionar mensagem à fila:', error);
    throw error;
  }
}

module.exports = {
  messageQueue,
  addMessageToQueue
};