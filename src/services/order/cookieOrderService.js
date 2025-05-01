/**
 * @fileoverview Serviço para gerenciamento de pedidos da loja de cookies
 * @module cookie-order-service
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Caminho para o arquivo de dados dos pedidos
const ORDERS_FILE = path.join(__dirname, '../../data/orders.json');

// Eventos e callbacks
const statusChangeCallbacks = [];

/**
 * Serviço para gerenciamento de pedidos
 */
const cookieOrderService = {
    /**
     * Inicializa o serviço de pedidos
     */
    initialize: async function () {
        console.log('Inicializando serviço de pedidos...');

        try {
            // Verifica se o diretório de dados existe
            const dataDir = path.dirname(ORDERS_FILE);
            try {
                await fs.access(dataDir);
            } catch (error) {
                // Se não existir, cria o diretório
                await fs.mkdir(dataDir, { recursive: true });
            }

            // Verifica se o arquivo de pedidos existe
            try {
                await fs.access(ORDERS_FILE);
                console.log('Arquivo de pedidos encontrado.');
            } catch (error) {
                // Se não existir, cria um arquivo inicial vazio
                console.log('Criando arquivo de pedidos inicial...');
                await fs.writeFile(
                    ORDERS_FILE,
                    JSON.stringify({ orders: [] }),
                    'utf8'
                );
                console.log('Arquivo de pedidos inicial criado com sucesso.');
            }

            console.log('Serviço de pedidos inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar serviço de pedidos:', error);
            throw error;
        }
    },

    /**
     * Obtém todos os pedidos
     * @returns {Promise<Object>} Objeto contendo array de pedidos
     */
    getOrders: async function () {
        try {
            const data = await fs.readFile(ORDERS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Erro ao ler pedidos:', error);
            throw error;
        }
    },

    /**
 * Obtém todos os pedidos com paginação
 * @param {number} page Número da página (começa em 1)
 * @param {number} limit Quantidade de itens por página
 * @returns {Promise<Object>} Objeto contendo array de pedidos e metadados de paginação
 */
    getOrders: async function (page = 1, limit = 20) {
        try {
            const data = await fs.readFile(ORDERS_FILE, 'utf8');
            const parsedData = JSON.parse(data);
            const { orders } = parsedData;

            // Cálculo para paginação
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;

            // Itens da página atual
            const paginatedOrders = orders.slice(startIndex, endIndex);

            // Total de páginas
            const totalPages = Math.ceil(orders.length / limit);

            return {
                orders: paginatedOrders,
                pagination: {
                    totalItems: orders.length,
                    totalPages,
                    currentPage: page,
                    itemsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            logger.error('Erro ao ler pedidos:', error);
            throw error;
        }
    },

    /**
     * Gera um ID único para o pedido
     * @returns {string} ID do pedido
     */
    generateOrderId: function () {
        const timestamp = Math.floor(Date.now() / 1000);
        const randomPart = crypto.randomBytes(3).toString('hex');
        return `ORD-${timestamp}-${randomPart}`;
    },

    /**
     * Cria um novo pedido
     * @param {Object} orderData Dados do pedido
     * @returns {Promise<Object>} Pedido criado
     */
    createOrder: async function (orderData) {
        try {
            // Validação expandida
            if (!orderData) {
                throw new Error('Dados do pedido não fornecidos');
            }
            if (!orderData.customer) {
                throw new Error('Nome do cliente é obrigatório');
            }
            if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                throw new Error('Itens do pedido são obrigatórios');
            }

            // Validar cada item do pedido
            for (const item of orderData.items) {
                if (!item.flavor || !item.quantity || item.quantity <= 0) {
                    throw new Error('Itens do pedido com informações inválidas');
                }
            }

            const data = await this.getOrders();

            // Calcula o valor total do pedido
            const totalValue = orderData.items.reduce((total, item) => {
                // Preço base de 5 reais por cookie (normalmente viria do catálogo)
                const pricePerCookie = 6;
                return total + (item.quantity * pricePerCookie);
            }, 0);

            // Cria o novo pedido com dados padrão
            const newOrder = {
                id: this.generateOrderId(),
                status: 'pending',
                createdAt: new Date().toISOString(),
                total: totalValue,
                ...orderData
            };

            // Adiciona o pedido à lista
            data.orders.push(newOrder);

            // Salva os dados atualizados
            await fs.writeFile(ORDERS_FILE, JSON.stringify(data, null, 2), 'utf8');

            console.log(`Novo pedido criado: ${newOrder.id}`);

            return newOrder;
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw error;
        }
    },

    /**
     * Atualiza o status de um pedido
     * @param {string} orderId ID do pedido
     * @param {string} newStatus Novo status
     * @returns {Promise<Object|null>} Pedido atualizado ou null se não encontrado
     */
    updateOrderStatus: async function (orderId, newStatus) {
        try {
            const data = await this.getOrders();

            // Encontra o pedido
            const orderIndex = data.orders.findIndex(order => order.id === orderId);

            if (orderIndex === -1) {
                return null;
            }

            const order = data.orders[orderIndex];
            const previousStatus = order.status;

            // Se o status for o mesmo, não faz nada
            if (previousStatus === newStatus) {
                return order;
            }

            // Atualiza o status
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();

            // Atualiza o pedido na lista
            data.orders[orderIndex] = order;

            // Salva os dados atualizados
            await fs.writeFile(ORDERS_FILE, JSON.stringify(data, null, 2), 'utf8');

            console.log(`Status do pedido ${orderId} atualizado de ${previousStatus} para ${newStatus}`);

            // Notifica os listeners sobre a mudança de status
            this.notifyStatusChange(order, previousStatus);

            return order;
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            throw error;
        }
    },

    /**
     * Obtém os pedidos filtrados por status
     * @param {string} status Status para filtrar
     * @returns {Promise<Array>} Pedidos filtrados
     */
    getOrdersByStatus: async function (status) {
        try {
            const data = await this.getOrders();
            return data.orders.filter(order => order.status === status);
        } catch (error) {
            console.error('Erro ao filtrar pedidos por status:', error);
            throw error;
        }
    },

    /**
     * Obtém os pedidos de um cliente específico
     * @param {string} phone Número de telefone do cliente
     * @returns {Promise<Array>} Pedidos do cliente
     */
    getOrdersByCustomer: async function (phone) {
        try {
            const data = await this.getOrders();
            return data.orders.filter(order => order.phone === phone);
        } catch (error) {
            console.error('Erro ao buscar pedidos do cliente:', error);
            throw error;
        }
    },

    /**
     * Calcula estatísticas básicas dos pedidos
     * @returns {Promise<Object>} Estatísticas dos pedidos
     */
    getOrderStats: async function () {
        try {
            const data = await this.getOrders();
            const { orders } = data;

            // Inicializa contadores
            const statsByStatus = {
                pending: 0,
                confirmed: 0,
                preparing: 0,
                delivering: 0,
                completed: 0,
                cancelled: 0
            };

            let totalRevenue = 0;
            let totalOrders = orders.length;

            // Calcula as estatísticas
            orders.forEach(order => {
                // Incrementa contador de status
                if (statsByStatus.hasOwnProperty(order.status)) {
                    statsByStatus[order.status]++;
                }

                // Soma receita para pedidos concluídos
                if (order.status === 'completed' && order.total) {
                    totalRevenue += order.total;
                }
            });

            // Ordena pedidos por data (mais recentes primeiro)
            const recentOrders = [...orders]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            return {
                totalOrders,
                totalRevenue,
                statsByStatus,
                recentOrders
            };
        } catch (error) {
            console.error('Erro ao calcular estatísticas de pedidos:', error);
            throw error;
        }
    },

    /**
     * Atualiza os dados de um pedido existente
     * @param {string} orderId ID do pedido
     * @param {Object} updatedData Dados atualizados
     * @returns {Promise<Object|null>} Pedido atualizado ou null se não encontrado
     */
    updateOrder: async function (orderId, updatedData) {
        try {
            const data = await this.getOrders();

            // Encontra o pedido
            const orderIndex = data.orders.findIndex(order => order.id === orderId);

            if (orderIndex === -1) {
                return null;
            }

            // Salva o status atual para verificar se foi alterado
            const previousStatus = data.orders[orderIndex].status;

            // Remove propriedades que não devem ser alteradas
            const safeUpdatedData = { ...updatedData };
            delete safeUpdatedData.id;
            delete safeUpdatedData.createdAt;

            // Atualiza o pedido com os novos dados
            const updatedOrder = {
                ...data.orders[orderIndex],
                ...safeUpdatedData,
                updatedAt: new Date().toISOString()
            };

            // Atualiza o pedido na lista
            data.orders[orderIndex] = updatedOrder;

            // Salva os dados atualizados
            await fs.writeFile(ORDERS_FILE, JSON.stringify(data, null, 2), 'utf8');

            console.log(`Pedido ${orderId} atualizado`);

            // Se o status foi alterado, notifica os listeners
            if (previousStatus !== updatedOrder.status) {
                this.notifyStatusChange(updatedOrder, previousStatus);
            }

            return updatedOrder;
        } catch (error) {
            console.error('Erro ao atualizar pedido:', error);
            throw error;
        }
    },

    /**
     * Remove um pedido
     * @param {string} orderId ID do pedido
     * @returns {Promise<boolean>} True se removido com sucesso, false se não encontrado
     */
    deleteOrder: async function (orderId) {
        try {
            const data = await this.getOrders();

            // Encontra o índice do pedido
            const orderIndex = data.orders.findIndex(order => order.id === orderId);

            if (orderIndex === -1) {
                return false;
            }

            // Remove o pedido
            data.orders.splice(orderIndex, 1);

            // Salva os dados atualizados
            await fs.writeFile(ORDERS_FILE, JSON.stringify(data, null, 2), 'utf8');

            console.log(`Pedido ${orderId} removido`);

            return true;
        } catch (error) {
            console.error('Erro ao remover pedido:', error);
            throw error;
        }
    },

    /**
     * Registra um callback para mudanças de status
     * @param {Function} callback Função a ser chamada quando o status mudar
     */
    onStatusChange: function (callback) {
        if (typeof callback === 'function') {
            statusChangeCallbacks.push(callback);
        }
    },

    /**
     * Notifica todos os callbacks registrados sobre mudança de status
     * @param {Object} order Pedido atualizado
     * @param {string} previousStatus Status anterior
     */
    notifyStatusChange: function (order, previousStatus) {
        statusChangeCallbacks.forEach(callback => {
            try {
                callback(order, previousStatus);
            } catch (error) {
                console.error('Erro ao executar callback de mudança de status:', error);
            }
        });
    }
};

module.exports = cookieOrderService;