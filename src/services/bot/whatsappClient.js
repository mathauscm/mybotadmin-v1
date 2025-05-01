/**
 * @fileoverview Configuração do cliente WhatsApp
 * @requires whatsapp-web.js
 * @requires qrcode-terminal
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('../../utils/logger');

const { processMessage } = require('./whatsappMessageHandler'); 

// Cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Inicialização do cliente
client.on('qr', (qr) => {
  // Gera o QR code para autenticação no terminal
  qrcode.generate(qr, { small: true });
  logger.info('QR Code gerado! Escaneie-o com o WhatsApp do seu telefone.');
});

client.on('ready', () => {
  logger.info('Bot está conectado e pronto para uso!');
});

client.on('authenticated', () => {
  logger.info('Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
  logger.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
  logger.warn('Cliente desconectado:', reason);
});

// Adicione um event listener para mensagens recebidas
client.on('message', async (message) => {
  try {
    await processMessage(client, message);
  } catch (error) {
    logger.error('Erro ao processar mensagem:', error);
  }
});

// Inicializa o cliente
const initialize = () => {
  client.initialize();
  return client;
};

module.exports = {
  client,
  initialize
};