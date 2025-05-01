/**
 * @fileoverview Serviço para gerenciamento da integração entre o bot WhatsApp e o sistema de pedidos
 * @module cookie-bot-service
 */

const cookieOrderService = require('../order/cookieOrderService');
const cookieCatalogService = require('../catalog/cookieCatalogService');
const { client } = require('./whatsappClient');
const { addMessageToQueue } = require('../queue/messageQueue');
const logger = require('../../utils/logger');

/**
 * Serviço para gerenciamento da integração do bot
 */
const cookieBotService = {
    /**
     * Inicializa o serviço de bot
     */
    initialize: async function() {
        logger.info('Inicializando serviço de integração do bot...');
        
        try {
            // Registra callback para mudanças de status dos pedidos
            cookieOrderService.onStatusChange(this.handleOrderStatusChange);
            
            // Registra callback para mudanças no catálogo
            cookieCatalogService.onCatalogChange(async () => {
                try {
                    // Atualiza o catálogo usado pelo bot
                    const catalog = await cookieCatalogService.getCatalog();
                    const { setCatalog } = require('./whatsappMessageHandler');
                    setCatalog(catalog);
                    logger.info('Catálogo do bot atualizado após mudanças');
                } catch (error) {
                    logger.error('Erro ao atualizar catálogo do bot:', error);
                }
            });
            
            logger.info('Serviço de bot inicializado com sucesso!');
        } catch (error) {
            logger.error('Erro ao inicializar serviço de bot:', error);
            throw error;
        }
    },
    
    /**
     * Envia mensagem para um cliente via WhatsApp
     * @param {string} phone Número de telefone do cliente (com código do país)
     * @param {string} message Mensagem a ser enviada
     * @returns {Promise<boolean>} True se adicionado à fila com sucesso
     */
    sendMessage: async function(phone, message) {
        try {
            // Formata o número para o padrão esperado pelo WhatsApp Web
            const formattedPhone = phone.replace(/\D/g, '');
            
            // Adiciona a mensagem à fila
            await addMessageToQueue(formattedPhone, message);
            logger.info(`Mensagem para ${formattedPhone} adicionada à fila`);
            
            return true;
        } catch (error) {
            logger.error('Erro ao enfileirar mensagem:', error);
            return false;
        }
    },
    
    /**
     * Manipula mudanças de status dos pedidos para notificar clientes
     * @param {Object} order Pedido atualizado
     * @param {string} previousStatus Status anterior
     */
    handleOrderStatusChange: async function(order, previousStatus) {
        try {
            // Só envia notificação se tiver número de telefone
            if (!order.phone) return;
            
            // Mapeia status para mensagens amigáveis
            const statusMessages = {
                confirmed: `🍪 *Pedido Confirmado* 🍪\n\nOlá! Seu pedido #${order.id} foi confirmado e está na fila de preparação. Em breve iniciaremos o preparo dos seus deliciosos cookies!`,
                
                preparing: `🍪 *Pedido em Preparo* 🍪\n\nBoas notícias! Seu pedido #${order.id} já está sendo preparado. Nossos cookies estão indo para o forno quentinhos para você!`,
                
                delivering: `🍪 *Pedido em Entrega* 🍪\n\nSeu pedido #${order.id} saiu para entrega! O entregador deve chegar em aproximadamente 30 minutos. Prepare-se para saborear nossos deliciosos cookies!`,
                
                completed: `🍪 *Pedido Entregue* 🍪\n\nSeu pedido #${order.id} foi entregue com sucesso! Esperamos que você aproveite nossos cookies. Agradecemos a preferência!\n\nSe puder, avalie nosso atendimento respondendo esta mensagem com uma nota de 1 a 5.`,
                
                cancelled: `❌ *Pedido Cancelado* ❌\n\nLamentamos informar que seu pedido #${order.id} foi cancelado. Entre em contato conosco para mais informações ou para fazer um novo pedido.`
            };
            
            // Se tiver uma mensagem definida para este status, envia
            if (statusMessages[order.status]) {
                await cookieBotService.sendMessage(order.phone, statusMessages[order.status]);
            }
            
            // Caso específico para pagamento PIX pendente
            if (order.status === 'pending' && order.paymentMethod === 'pix') {
                const pixMessage = `🍪 *Pagamento Pendente* 🍪\n\nSeu pedido #${order.id} está aguardando o pagamento via PIX.\n\n*Chave PIX:* cookie@shop.com\n*Valor:* R$ ${order.total.toFixed(2)}\n\nAssim que recebermos a confirmação do pagamento, seu pedido será preparado!`;
                
                await cookieBotService.sendMessage(order.phone, pixMessage);
            }
        } catch (error) {
            logger.error('Erro ao notificar cliente sobre mudança de status:', error);
        }
    },
    
    /**
     * Verifica pagamentos pendentes
     * Útil para verificar se pagamentos PIX foram realizados e atualizar o status dos pedidos
     * @returns {Promise<number>} Número de pedidos atualizados
     */
    checkPendingPayments: async function() {
        try {
            logger.info('Verificando pagamentos pendentes...');
            
            // Obtém pedidos pendentes com pagamento via PIX
            const pendingOrders = await cookieOrderService.getOrdersByStatus('pending');
            const pendingPixOrders = pendingOrders.filter(order => order.paymentMethod === 'pix');
            
            if (pendingPixOrders.length === 0) {
                logger.info('Não há pagamentos PIX pendentes para verificar.');
                return 0;
            }
            
            logger.info(`Encontrados ${pendingPixOrders.length} pagamentos PIX pendentes.`);
            
            // Em um cenário real, aqui você faria a integração com a API do PIX
            // para verificar quais pagamentos foram realizados.
            // Para este exemplo, simularemos que alguns pagamentos foram feitos.
            
            let updatedCount = 0;
            
            // Simulação: confirma pagamentos mais antigos que 5 minutos
            const fiveMinutesAgo = new Date();
            fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
            
            for (const order of pendingPixOrders) {
                const orderDate = new Date(order.createdAt);
                
                // Pedidos mais antigos que 5 minutos são considerados pagos (simulação)
                if (orderDate < fiveMinutesAgo) {
                    await cookieOrderService.updateOrderStatus(order.id, 'confirmed');
                    
                    logger.info(`Pagamento do pedido ${order.id} confirmado e status atualizado.`);
                    updatedCount++;
                }
            }
            
            logger.info(`${updatedCount} pedidos tiveram pagamento confirmado.`);
            return updatedCount;
        } catch (error) {
            logger.error('Erro ao verificar pagamentos:', error);
            throw error;
        }
    },
    
    /**
     * Envia promoções para clientes recorrentes
     * @param {string} promoType Tipo de promoção (daily, weekend, special)
     * @returns {Promise<number>} Número de mensagens enviadas
     */
    sendPromotions: async function(promoType = 'daily') {
        try {
            logger.info(`Enviando promoções do tipo: ${promoType}`);
            
            // Obter todos os pedidos
            const allOrders = await cookieOrderService.getOrders();
            
            // Criar um mapa de clientes únicos com contagem de pedidos
            const customerMap = new Map();
            
            allOrders.orders.forEach(order => {
                if (order.phone && order.status === 'completed') {
                    if (customerMap.has(order.phone)) {
                        customerMap.set(order.phone, customerMap.get(order.phone) + 1);
                    } else {
                        customerMap.set(order.phone, 1);
                    }
                }
            });
            
            // Filtrar clientes recorrentes (com mais de um pedido)
            const recurringCustomers = [...customerMap.entries()]
                .filter(([_, count]) => count > 1)
                .map(([phone]) => phone);
            
            if (recurringCustomers.length === 0) {
                logger.info('Nenhum cliente recorrente encontrado para enviar promoções.');
                return 0;
            }
            
            // Obter produtos do catálogo
            const products = await cookieCatalogService.getCatalog();
            
            // Selecionar produtos para promoção (exemplo: 2 produtos aleatórios)
            const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
            const promoProducts = shuffledProducts.slice(0, 2);
            
            // Construir mensagem de promoção
            let promoMessage = '';
            
            switch (promoType) {
                case 'weekend':
                    promoMessage = `🍪 *Promoção de Fim de Semana!* 🍪\n\n`;
                    promoMessage += `Aproveite nossa promoção especial de fim de semana! Compre uma dúzia, leve outra pela metade do preço!\n\n`;
                    break;
                    
                case 'special':
                    promoMessage = `✨ *Promoção Especial!* ✨\n\n`;
                    promoMessage += `Cliente especial merece desconto especial! Use o cupom COOKIE20 e ganhe 20% de desconto em qualquer pedido!\n\n`;
                    break;
                    
                default: // daily
                    promoMessage = `🍪 *Promoção do Dia!* 🍪\n\n`;
                    promoMessage += `Estamos com uma super promoção hoje! Na compra de 2 dúzias ou mais, ganhe frete grátis!\n\n`;
            }
            
            promoMessage += `*Sugestões de Cookies:*\n`;
            promoProducts.forEach(product => {
                promoMessage += `- ${product.name}: ${product.description}\n`;
            });
            
            promoMessage += `\nPara fazer seu pedido, basta enviar *1* e aproveitar nossas delícias!`;
            
            // Enviar para clientes recorrentes
            let sentCount = 0;
            
            for (const phone of recurringCustomers) {
                const success = await this.sendMessage(phone, promoMessage);
                if (success) {
                    sentCount++;
                }
            }
            
            logger.info(`Promoção enviada para ${sentCount} de ${recurringCustomers.length} clientes.`);
            return sentCount;
        } catch (error) {
            logger.error('Erro ao enviar promoções:', error);
            throw error;
        }
    },
    
    /**
     * Processa uma resposta do cliente para uma avaliação
     * @param {string} phone Telefone do cliente
     * @param {string} message Mensagem recebida
     * @returns {Promise<boolean>} True se foi processado como avaliação
     */
    processRating: async function(phone, message) {
        try {
            // Verifica se a mensagem é um número de 1 a 5
            const rating = parseInt(message.trim());
            if (isNaN(rating) || rating < 1 || rating > 5) {
                return false; // Não é uma avaliação válida
            }
            
            // Busca pedidos recentes do cliente
            const customerOrders = await cookieOrderService.getOrdersByCustomer(phone);
            if (!customerOrders || customerOrders.length === 0) {
                return false;
            }
            
            // Ordena por data (mais recente primeiro)
            customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            const recentOrder = customerOrders[0];
            
            // Só considera para pedidos concluídos recentemente (últimas 24h)
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            
            if (recentOrder.status !== 'completed' || 
                new Date(recentOrder.updatedAt || recentOrder.createdAt) < oneDayAgo) {
                return false;
            }
            
            // Adiciona a avaliação ao pedido
            await cookieOrderService.updateOrder(recentOrder.id, { rating });
            
            // Envia agradecimento pela avaliação
            let thankYouMessage = '';
            
            if (rating >= 4) {
                thankYouMessage = `🌟 *Obrigado pela sua avaliação!* 🌟\n\n`;
                thankYouMessage += `Ficamos muito felizes em saber que você gostou de nossos cookies! Esperamos vê-lo novamente em breve!`;
            } else {
                thankYouMessage = `🙏 *Obrigado pelo feedback!* 🙏\n\n`;
                thankYouMessage += `Agradecemos sua avaliação e pedimos desculpas se não atendemos completamente suas expectativas. `;
                thankYouMessage += `Estamos sempre trabalhando para melhorar e adoraríamos saber como podemos tornar sua experiência melhor na próxima vez.`;
            }
            
            await this.sendMessage(phone, thankYouMessage);
            
            logger.info(`Avaliação ${rating}/5 registrada para o pedido ${recentOrder.id}`);
            return true;
        } catch (error) {
            logger.error('Erro ao processar avaliação:', error);
            return false;
        }
    }
};

module.exports = cookieBotService;