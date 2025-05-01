const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieOrderService = require('./order/cookieOrderService');
const cookieCatalogService = require('./catalog/cookieCatalogService');
const cookieBotService = require('./bot/cookieBotService');
const conversationService = require('./bot/conversationService'); 

// Importe o logger e a fila de mensagens
const logger = require('../utils/logger');
const { messageQueue } = require('./queue/messageQueue');
const { client, initialize } = require('./bot/whatsappClient');
const { swaggerUi, swaggerDocs } = require('../utils/swagger');

//rotas de categorias
const categoryCatalogService = require('./catalog/categoryCatalogService');

// Importar rotas de opções de produtos
const productOptionsRoutes = require('./catalog/routes/productOptionsRoutes');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3030;

// Configuração de CORS aprimorada
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3030', 'https://apimybot.innovv8.tech'],
  credentials: true
}));

// Add a proxy middleware for API requests
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create proxy for API requests
const apiProxy = createProxyMiddleware('/api', {
  target: process.env.API_URL || 'https://apimybot.innovv8.tech/api',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // Remove /api from the URL
  },
  headers: {
    'Authorization': `ApiKey ${process.env.API_KEY}`,
    'X-Tenant-ID': process.env.TENANT_ID,
    'Content-Type': 'application/json'
  },
  logLevel: 'debug'
});

// Use the proxy middleware
app.use('/api', apiProxy);

app.use(express.json());

// Configuração do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Usar rotas de opções de produtos
app.use('/api', productOptionsRoutes);

// Caminho para a pasta build do frontend
const buildPath = path.join(__dirname, '../../admin-client/build');

// Verifica se a pasta build existe antes de servir arquivos estáticos
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
} else {
  logger.warn('Build folder not found. Skipping static file serving.');
}

// Configurar processador de fila de mensagens
async function setupMessageQueueProcessor() {
  messageQueue.process(async (job) => {
    const { phone, message } = job.data;
    
    // CORREÇÃO: Verifica se o cliente WhatsApp está pronto usando client.info em vez de client.isReady()
    if (!client.info) {
      throw new Error('Cliente WhatsApp não está pronto');
    }
    
    // Envia a mensagem
    try {
      await client.sendMessage(`${phone}@c.us`, message);
      logger.info(`Mensagem processada e enviada para ${phone}`);
      
      return { success: true };
    } catch (err) {
      logger.error(`Erro ao enviar mensagem para ${phone}:`, err);
      throw err;
    }
  });
  
  logger.info('Processador de fila de mensagens configurado');
}

// Inicializa os serviços antes de iniciar o servidor
async function initializeServices() {
  try {
    await cookieOrderService.initialize();
    await cookieCatalogService.initialize();
    await cookieBotService.initialize();
    await conversationService.initialize(); // nova linha adicionada
    await categoryCatalogService.initialize();
    initialize(); // Inicializa o cliente WhatsApp
    await setupMessageQueueProcessor();
    logger.info('Serviços inicializados com sucesso!');
  } catch (error) {
    logger.error('Erro ao inicializar serviços:', error);
    process.exit(1);
  }
}

// Rotas da API

// rotas para conversações
app.get('/api/conversations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const data = await conversationService.getConversations(page, limit);
    res.json(data);
  } catch (error) {
    logger.error('Erro ao buscar conversas:', error);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

app.get('/api/conversations/:phone', async (req, res) => {
  try {
    const conversation = await conversationService.getConversation(req.params.phone);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }
    
    res.json(conversation);
  } catch (error) {
    logger.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro ao buscar conversa' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Retorna a lista de pedidos paginados
 *     tags: [Pedidos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       500:
 *         description: Erro do servidor
 */
app.get('/api/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const data = await cookieOrderService.getOrders(page, limit);
    res.json(data);
  } catch (error) {
    logger.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer
 *               - items
 *             properties:
 *               customer:
 *                 type: string
 *                 description: Nome do cliente
 *               phone:
 *                 type: string
 *                 description: Número de telefone do cliente
 *               items:
 *                 type: array
 *                 description: Itens do pedido
 *                 items:
 *                   type: object
 *                   properties:
 *                     flavor:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               deliveryAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [pix, credit-card, cash]
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dados de entrada inválidos
 *       500:
 *         description: Erro do servidor
 */
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validação de entrada
    if (!orderData || !orderData.customer || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Dados do pedido inválidos ou incompletos' });
    }
    
    const newOrder = await cookieOrderService.createOrder(orderData);
    res.status(201).json(newOrder);
  } catch (error) {
    logger.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtém detalhes de um pedido específico
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Detalhes do pedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro do servidor
 */
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await cookieOrderService.getOrderDetails(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(order);
  } catch (error) {
    logger.error('Erro ao buscar detalhes do pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do pedido' });
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Atualiza o status de um pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, delivering, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dados de entrada inválidos
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro do servidor
 */
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }
    
    const order = await cookieOrderService.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    res.json(order);
  } catch (error) {
    logger.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do pedido' });
  }
});

/**
 * @swagger
 * /api/catalog:
 *   get:
 *     summary: Retorna o catálogo de produtos
 *     tags: [Catálogo]
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Erro do servidor
 */
app.get('/api/catalog', async (req, res) => {
  try {
    const catalog = await cookieCatalogService.getCatalog();
    res.json(catalog);
  } catch (error) {
    logger.error('Erro ao buscar catálogo:', error);
    res.status(500).json({ error: 'Erro ao buscar catálogo' });
  }
});

/**
 * @swagger
 * /api/catalog:
 *   post:
 *     summary: Adiciona um novo produto ao catálogo
 *     tags: [Catálogo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Produto adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro do servidor
 */
app.post('/api/catalog', async (req, res) => {
  try {
    const productData = req.body;
    
    if (!productData.name || !productData.price) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }
    
    const newProduct = await cookieCatalogService.addProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    logger.error('Erro ao adicionar produto:', error);
    res.status(500).json({ error: 'Erro ao adicionar produto' });
  }
});

/**
 * @swagger
 * /api/catalog/{id}:
 *   put:
 *     summary: Atualiza um produto existente
 *     tags: [Catálogo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro do servidor
 */
app.put('/api/catalog/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    
    const updatedProduct = await cookieCatalogService.updateProduct(productId, productData);
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    logger.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

/**
 * @swagger
 * /api/catalog/{id}:
 *   delete:
 *     summary: Remove um produto do catálogo
 *     tags: [Catálogo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto removido com sucesso
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro do servidor
 */
app.delete('/api/catalog/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await cookieCatalogService.removeProduct(productId);
    
    if (!result) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.json({ success: true, message: 'Produto removido com sucesso' });
  } catch (error) {
    logger.error('Erro ao remover produto:', error);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retorna todas as categorias
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias
 *       500:
 *         description: Erro do servidor
 */
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await categoryCatalogService.getCategories();
    res.json(categories);
  } catch (error) {
    logger.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Adiciona uma nova categoria
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro do servidor
 */
app.post('/api/categories', async (req, res) => {
  try {
    const categoryData = req.body;
    
    if (!categoryData.name || !categoryData.slug) {
      return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
    }
    
    const newCategory = await categoryCatalogService.addCategory(categoryData);
    res.status(201).json(newCategory);
  } catch (error) {
    logger.error('Erro ao adicionar categoria:', error);
    res.status(500).json({ error: 'Erro ao adicionar categoria' });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria existente
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro do servidor
 */
app.put('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const updatedData = req.body;
    
    const updatedCategory = await categoryCatalogService.updateCategory(categoryId, updatedData);
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    logger.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Remove uma categoria
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria removida
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro do servidor
 */
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const result = await categoryCatalogService.removeCategory(categoryId);
    
    if (!result) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    res.json({ success: true, message: 'Categoria removida com sucesso' });
  } catch (error) {
    logger.error('Erro ao remover categoria:', error);
    res.status(500).json({ error: 'Erro ao remover categoria' });
  }
});

/**
 * @swagger
 * /api/categories/order:
 *   put:
 *     summary: Atualiza a ordem das categorias
 *     tags: [Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - id
 *                 - order
 *               properties:
 *                 id:
 *                   type: string
 *                 order:
 *                   type: number
 *     responses:
 *       200:
 *         description: Ordem atualizada
 *       500:
 *         description: Erro do servidor
 */
app.put('/api/categories/order', async (req, res) => {
  try {
    const orderedCategories = req.body;
    
    if (!Array.isArray(orderedCategories)) {
      return res.status(400).json({ error: 'Formato inválido, deve ser um array' });
    }
    
    const updatedCategories = await categoryCatalogService.updateCategoriesOrder(orderedCategories);
    res.json(updatedCategories);
  } catch (error) {
    logger.error('Erro ao atualizar ordem das categorias:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem das categorias' });
  }
});


/**
 * @swagger
 * /api/bot/send-message:
 *   post:
 *     summary: Envia uma mensagem para o cliente via WhatsApp
 *     tags: [Bot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - message
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Número de telefone do cliente (com código do país)
 *               message:
 *                 type: string
 *                 description: Conteúdo da mensagem
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *       400:
 *         description: Dados de entrada inválidos
 *       500:
 *         description: Erro ao enviar mensagem
 */
app.post('/api/bot/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }
    
    // Salvar a mensagem no serviço de conversas
    await conversationService.saveMessage(phone, message, true);
    
    // Chama o método do bot para enviar mensagem
    const success = await cookieBotService.sendMessage(phone, message);
    
    if (success) {
      res.json({ success: true, message: 'Mensagem enviada com sucesso' });
    } else {
      res.status(500).json({ success: false, message: 'Falha ao enviar mensagem' });
    }
  } catch (error) {
    logger.error('Erro ao enviar mensagem via bot:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

/**
 * @swagger
 * /api/bot/check-payments:
 *   post:
 *     summary: Verifica pagamentos pendentes
 *     tags: [Bot]
 *     responses:
 *       200:
 *         description: Verificação concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 updatedCount:
 *                   type: integer
 *                   description: Número de pedidos atualizados
 *       500:
 *         description: Erro ao verificar pagamentos
 */
app.post('/api/bot/check-payments', async (req, res) => {
  try {
    const updatedCount = await cookieBotService.checkPendingPayments();
    res.json({ 
      success: true, 
      message: 'Verificação de pagamentos concluída',
      updatedCount: updatedCount
    });
  } catch (error) {
    logger.error('Erro ao verificar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao verificar pagamentos' });
  }
});

/**
 * @swagger
 * /api/bot/send-promotions:
 *   post:
 *     summary: Envia promoções para segmentos específicos de clientes
 *     tags: [Bot]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [daily, weekend, special]
 *                 default: daily
 *                 description: Tipo de promoção
 *               message:
 *                 type: string
 *                 description: Mensagem personalizada (opcional)
 *               segment:
 *                 type: string
 *                 enum: [recurrent, highvalue, inactive, new, all]
 *                 default: recurrent
 *                 description: Segmento de clientes a receber a promoção
 *     responses:
 *       200:
 *         description: Promoções enviadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 sentCount:
 *                   type: integer
 *                   description: Número de mensagens enviadas
 *       500:
 *         description: Erro ao enviar promoções
 */
app.post('/api/bot/send-promotions', async (req, res) => {
  try {
    const { type = 'daily', message, segment = 'recurrent' } = req.body;
    
    // Obter todos os pedidos
    const allOrders = await cookieOrderService.getOrders();
    
    if (!allOrders || !allOrders.orders) {
      return res.json({ 
        success: true, 
        message: 'Nenhum cliente encontrado para enviar promoções',
        sentCount: 0
      });
    }
    
    // Extrair clientes únicos dos pedidos
    const customerMap = new Map();
    
    allOrders.orders.forEach(order => {
      if (order.phone && order.customer) {
        if (!customerMap.has(order.phone)) {
          customerMap.set(order.phone, {
            phone: order.phone,
            name: order.customer,
            totalOrders: 1,
            totalSpent: order.total || 0,
            lastOrderDate: order.createdAt
          });
        } else {
          const customer = customerMap.get(order.phone);
          customer.totalOrders += 1;
          customer.totalSpent += order.total || 0;
          
          // Atualiza a data do último pedido se este for mais recente
          if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
            customer.lastOrderDate = order.createdAt;
          }
        }
      }
    });
    
    const customers = Array.from(customerMap.values());
    
    // Filtrar clientes com base no segmento
    let targetCustomers = [];
    
    switch (segment) {
      case 'recurrent':
        targetCustomers = customers.filter(customer => customer.totalOrders > 1);
        break;
      case 'highvalue':
        // Clientes que gastaram mais que a média
        const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
        const avgSpent = totalSpent / customers.length;
        targetCustomers = customers.filter(customer => customer.totalSpent > avgSpent);
        break;
      case 'inactive':
        // Clientes cujo último pedido foi há mais de 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        targetCustomers = customers.filter(customer => 
          new Date(customer.lastOrderDate) < thirtyDaysAgo
        );
        break;
      case 'new':
        targetCustomers = customers.filter(customer => customer.totalOrders === 1);
        break;
      case 'all':
      default:
        targetCustomers = customers;
    }
    
    // Obter produtos do catálogo para sugestões
    const products = await cookieCatalogService.getCatalog();
    const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
    const promoProducts = shuffledProducts.slice(0, 2);
    
    // Construir mensagem de promoção ou usar a mensagem personalizada
    let promoMessage = message;
    
    if (!promoMessage) {
      switch (type) {
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
      
      // Adicionar sugestões de produtos
      promoMessage += `*Sugestões de Cookies:*\n`;
      promoProducts.forEach(product => {
        promoMessage += `- ${product.name}: ${product.description}\n`;
      });
      
      promoMessage += `\nPara fazer seu pedido, basta enviar *1* e aproveitar nossas delícias!`;
    }
    
    // Enviar para clientes do segmento
    let sentCount = 0;
    
    for (const customer of targetCustomers) {
      const success = await cookieBotService.sendMessage(customer.phone, promoMessage);
      if (success) {
        sentCount++;
      }
    }
    
    logger.info(`Promoção do tipo ${type} enviada para ${sentCount} clientes do segmento ${segment}.`);
    
    res.json({ 
      success: true, 
      message: `Promoção enviada com sucesso para o segmento selecionado.`,
      sentCount
    });
  } catch (error) {
    logger.error('Erro ao enviar promoções:', error);
    res.status(500).json({ error: 'Erro ao enviar promoções' });
  }
});

/**
 * Rota para servir o aplicativo React
 * @route GET *
 */
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(buildPath, 'index.html'))) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    // Durante o desenvolvimento, redireciona para o servidor de desenvolvimento do React
    res.redirect('http://localhost:3000');
  }
});

// Configura job para verificar pagamentos periodicamente (a cada 5 minutos)
function setupPaymentCheckScheduler() {
  setInterval(async () => {
    try {
      await cookieBotService.checkPendingPayments();
    } catch (error) {
      logger.error('Erro no job de verificação de pagamentos:', error);
    }
  }, 5 * 60 * 1000); // 5 minutos
}

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  logger.error('Erro na aplicação:', err);
  
  // Envia resposta de erro adequada
  res.status(err.statusCode || 500).json({ 
    error: err.message || 'Erro interno do servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Inicializa os serviços e inicia o servidor
initializeServices().then(() => {
  app.listen(port, () => {
    logger.info(`Servidor administrativo rodando em http://localhost:${port}`);
    logger.info(`Documentação da API disponível em http://localhost:${port}/api-docs`);
    
    // Inicia o agendador de verificação de pagamentos
    setupPaymentCheckScheduler();
  });
});