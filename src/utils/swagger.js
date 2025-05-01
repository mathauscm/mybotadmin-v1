const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Metadados da API
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cookie Shop API',
      version: '1.0.0',
      description: 'API de gerenciamento para loja de cookies',
      contact: {
        name: 'Suporte Cookie Shop',
        email: 'suporte@cookieshop.com'
      },
      servers: [
        {
          url: 'http://localhost:3030',
          description: 'Servidor de desenvolvimento'
        }
      ]
    },
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Adicione seu token JWT com o prefixo "Bearer " (exemplo: "Bearer abcdef123456")'
        }
      },
      schemas: {
        Order: {
          type: 'object',
          required: ['customer', 'items'],
          properties: {
            id: {
              type: 'string',
              description: 'ID único do pedido'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'],
              description: 'Status atual do pedido'
            },
            customer: {
              type: 'string',
              description: 'Nome do cliente'
            },
            phone: {
              type: 'string',
              description: 'Número de telefone do cliente'
            },
            items: {
              type: 'array',
              description: 'Itens do pedido',
              items: {
                type: 'object',
                properties: {
                  flavor: {
                    type: 'string',
                    description: 'Sabor do cookie'
                  },
                  quantity: {
                    type: 'integer',
                    description: 'Quantidade'
                  }
                }
              }
            },
            deliveryAddress: {
              type: 'string',
              description: 'Endereço de entrega'
            },
            paymentMethod: {
              type: 'string',
              enum: ['pix', 'credit-card', 'cash'],
              description: 'Método de pagamento'
            },
            total: {
              type: 'number',
              description: 'Valor total do pedido'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do pedido'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do produto'
            },
            name: {
              type: 'string',
              description: 'Nome do produto'
            },
            description: {
              type: 'string',
              description: 'Descrição do produto'
            },
            price: {
              type: 'number',
              description: 'Preço unitário'
            },
            available: {
              type: 'boolean',
              description: 'Indica se o produto está disponível'
            },
            category: {
              type: 'string',
              description: 'Categoria do produto'
            }
          }
        }
      }
    }
  },
  apis: [
    './src/services/server.js',
    './src/utils/swagger-tags.js'
  ], // Caminhos para os arquivos com anotações
};

// Inicialização do Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs
};