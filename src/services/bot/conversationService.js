// src/services/bot/conversationService.js
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

// Caminho para o arquivo de conversas
const CONVERSATIONS_FILE = path.join(__dirname, '../../data/conversations.json');

const conversationService = {
  initialize: async function() {
    try {
      // Verificar se o diretório existe
      const dataDir = path.dirname(CONVERSATIONS_FILE);
      try {
        await fs.access(dataDir);
      } catch (error) {
        await fs.mkdir(dataDir, { recursive: true });
      }
      
      // Verificar se o arquivo existe
      try {
        await fs.access(CONVERSATIONS_FILE);
      } catch (error) {
        await fs.writeFile(
          CONVERSATIONS_FILE,
          JSON.stringify({ conversations: [] }),
          'utf8'
        );
      }
      
      logger.info('Serviço de conversas inicializado com sucesso!');
    } catch (error) {
      logger.error('Erro ao inicializar serviço de conversas:', error);
      throw error;
    }
  },
  
  // Salvar uma nova mensagem na conversa
  saveMessage: async function(phone, message, isFromBot) {
    try {
      const data = await fs.readFile(CONVERSATIONS_FILE, 'utf8');
      const conversationsData = JSON.parse(data);
      
      // Buscar conversa existente ou criar nova
      let conversation = conversationsData.conversations.find(c => c.phone === phone);
      
      if (!conversation) {
        conversation = {
          phone,
          messages: [],
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        conversationsData.conversations.push(conversation);
      }
      
      // Adicionar mensagem
      conversation.messages.push({
        content: message,
        timestamp: new Date().toISOString(),
        isFromBot
      });
      
      // Atualizar data da última atualização
      conversation.updatedAt = new Date().toISOString();
      
      // Salvar no arquivo
      await fs.writeFile(
        CONVERSATIONS_FILE,
        JSON.stringify(conversationsData, null, 2),
        'utf8'
      );
      
      return true;
    } catch (error) {
      logger.error('Erro ao salvar mensagem na conversa:', error);
      return false;
    }
  },
  
  // Obter conversas paginadas
  getConversations: async function(page = 1, limit = 20) {
    try {
      const data = await fs.readFile(CONVERSATIONS_FILE, 'utf8');
      const conversationsData = JSON.parse(data);
      
      // Ordenar por data de atualização (mais recente primeiro)
      conversationsData.conversations.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      
      // Paginar
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedConversations = conversationsData.conversations.slice(startIndex, endIndex);
      
      return {
        conversations: paginatedConversations,
        pagination: {
          totalItems: conversationsData.conversations.length,
          totalPages: Math.ceil(conversationsData.conversations.length / limit),
          currentPage: page,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      logger.error('Erro ao obter conversas:', error);
      throw error;
    }
  },
  
  // Obter uma conversa específica
  getConversation: async function(phone) {
    try {
      const data = await fs.readFile(CONVERSATIONS_FILE, 'utf8');
      const conversationsData = JSON.parse(data);
      
      return conversationsData.conversations.find(c => c.phone === phone) || null;
    } catch (error) {
      logger.error('Erro ao obter conversa:', error);
      throw error;
    }
  }
};

module.exports = conversationService;