// admin-client/src/services/apiService.js

/**
 * Serviço centralizado para comunicação com a API
 */

import apiConfig from '../utils/apiConfig';

// Obtém variáveis de configuração do apiConfig
const API_URL = apiConfig.API_URL;
const API_KEY = apiConfig.API_KEY;
const TENANT_ID = apiConfig.TENANT_ID;
const LOGIN_EMAIL = apiConfig.LOGIN_EMAIL;
const LOGIN_PASSWORD = apiConfig.LOGIN_PASSWORD;

// Variável para armazenar o token JWT
let authToken = null;

/**
 * Realiza login na API e obtém um token JWT
 * @returns {Promise<string>} - Token JWT
 */
export const login = async () => {
  if (authToken) return authToken;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID
      },
      body: JSON.stringify({
        email: LOGIN_EMAIL,
        password: LOGIN_PASSWORD
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Login falhou: ${response.status}`);
    }
    
    const data = await response.json();
    authToken = data.token;
    return authToken;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

/**
 * Realiza requisições fetch com configurações padrão para a API
 * @param {string} endpoint - Endpoint da API sem a URL base
 * @param {Object} options - Opções do fetch (method, headers, body)
 * @returns {Promise<any>} - Resposta da API em JSON
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Garante que o endpoint comece sem a barra
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Obter token (tentar login se necessário)
  if (!authToken && endpoint !== 'auth/login') {
    try {
      await login();
    } catch (error) {
      console.error('Erro ao autenticar antes da requisição:', error);
    }
  }
  
  // Configura headers padrão
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': TENANT_ID,
    ...options.headers
  };
  
  // Adiciona token de autenticação se disponível
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  } else {
    // Fallback para a chave de API se a autenticação falhar
    headers['Authorization'] = `ApiKey ${API_KEY}`;
  }
  
  try {
    console.log(`Fazendo requisição para: ${API_URL}/${cleanEndpoint}`);
    console.log('Headers:', headers);
    
    // Adiciona opções de fetch
    const fetchOptions = {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit' // Desativar cookies para evitar problemas de CORS
    };
    
    const response = await fetch(`${API_URL}/${cleanEndpoint}`, fetchOptions);
    
    // Verifica se a resposta é bem-sucedida (código 2xx)
    if (!response.ok) {
      // Se o erro for 401 Unauthorized e temos um token, podemos tentar renovar o token e tentar novamente
      if (response.status === 401 && authToken) {
        authToken = null; // Resetar o token atual
        try {
          // Tentar login novamente
          await login();
          
          // Atualizar o header com o novo token
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
            fetchOptions.headers = headers;
            
            // Tentar a requisição novamente
            const retryResponse = await fetch(`${API_URL}/${cleanEndpoint}`, fetchOptions);
            
            if (retryResponse.ok) {
              // Se a segunda tentativa for bem-sucedida
              if (retryResponse.status === 204) {
                return null;
              }
              return await retryResponse.json();
            }
          }
        } catch (loginError) {
          console.error('Erro ao renovar token:', loginError);
        }
      }
      
      // Se chegou aqui, não conseguiu resolver com retry ou não era erro 401
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch (e) {
        errorDetails = { message: `HTTP error ${response.status}` };
      }
      
      throw new Error(errorDetails.message || `Erro na requisição: ${response.status}`);
    }
    
    // Para respostas 204 No Content
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro na API (${cleanEndpoint}):`, error);
    throw error;
  }
};

/**
 * Serviços específicos para cada recurso da API
 */

// Serviço para gerenciamento de pedidos
export const orderService = {
  // Obter todos os pedidos com paginação
  getOrders: (page = 1, limit = 20) => 
    apiRequest(`orders?page=${page}&limit=${limit}`),
  
  // Obter um pedido específico
  getOrder: (orderId) => 
    apiRequest(`orders/${orderId}`),
  
  // Atualizar o status de um pedido
  updateOrderStatus: (orderId, status) => 
    apiRequest(`orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    
  // Criar um novo pedido
  createOrder: (orderData) => 
    apiRequest('orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
};

// Serviço para gerenciamento do catálogo
export const catalogService = {
  // Obter todos os produtos
  getProducts: () => 
    apiRequest('catalog'),
  
  // Adicionar um novo produto
  addProduct: (productData) => 
    apiRequest('catalog', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),
  
  // Atualizar um produto existente
  updateProduct: (productId, productData) => 
    apiRequest(`catalog/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),
  
  // Remover um produto
  deleteProduct: (productId) => 
    apiRequest(`catalog/${productId}`, {
      method: 'DELETE'
    })
};

// Serviço para gerenciamento de categorias
export const categoryService = {
  // Obter todas as categorias
  getCategories: () => 
    apiRequest('categories'),
  
  // Adicionar uma nova categoria
  addCategory: (categoryData) => 
    apiRequest('categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    }),
  
  // Atualizar uma categoria existente
  updateCategory: (categoryId, categoryData) => 
    apiRequest(`categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    }),
  
  // Remover uma categoria
  deleteCategory: (categoryId) => 
    apiRequest(`categories/${categoryId}`, {
      method: 'DELETE'
    }),
  
  // Atualizar a ordem das categorias
  updateCategoriesOrder: (orderedCategories) => 
    apiRequest('categories/order', {
      method: 'PUT',
      body: JSON.stringify(orderedCategories)
    })
};

// Serviço para gerenciamento de conversas
export const conversationService = {
  // Obter todas as conversas
  getConversations: (page = 1, limit = 20) => 
    apiRequest(`conversations?page=${page}&limit=${limit}`),
  
  // Obter uma conversa específica
  getConversation: (phone) => 
    apiRequest(`conversations/${phone}`),
  
  // Enviar uma mensagem para um cliente
  sendMessage: (phone, message) => 
    apiRequest('bot/send-message', {
      method: 'POST',
      body: JSON.stringify({ phone, message })
    })
};

// Serviço para opções de produtos (pizza, etc)
export const productOptionsService = {
  // Tamanhos de pizza
  getPizzaSizes: () => 
    apiRequest('pizza-sizes'),
  
  addPizzaSize: (sizeData) => 
    apiRequest('pizza-sizes', {
      method: 'POST',
      body: JSON.stringify(sizeData)
    }),
  
  updatePizzaSize: (sizeId, sizeData) => 
    apiRequest(`pizza-sizes/${sizeId}`, {
      method: 'PUT',
      body: JSON.stringify(sizeData)
    }),
  
  deletePizzaSize: (sizeId) => 
    apiRequest(`pizza-sizes/${sizeId}`, {
      method: 'DELETE'
    }),
  
  // Bordas de pizza
  getPizzaCrusts: () => 
    apiRequest('pizza-crusts'),
  
  addPizzaCrust: (crustData) => 
    apiRequest('pizza-crusts', {
      method: 'POST',
      body: JSON.stringify(crustData)
    }),
  
  updatePizzaCrust: (crustId, crustData) => 
    apiRequest(`pizza-crusts/${crustId}`, {
      method: 'PUT',
      body: JSON.stringify(crustData)
    }),
  
  deletePizzaCrust: (crustId) => 
    apiRequest(`pizza-crusts/${crustId}`, {
      method: 'DELETE'
    }),
  
  // Adicionais de hambúrguer
  getBurgerAddons: () => 
    apiRequest('burger-addons'),
  
  addBurgerAddon: (addonData) => 
    apiRequest('burger-addons', {
      method: 'POST',
      body: JSON.stringify(addonData)
    }),
  
  updateBurgerAddon: (addonId, addonData) => 
    apiRequest(`burger-addons/${addonId}`, {
      method: 'PUT',
      body: JSON.stringify(addonData)
    }),
  
  deleteBurgerAddon: (addonId) => 
    apiRequest(`burger-addons/${addonId}`, {
      method: 'DELETE'
    })
};

// Serviço para gerenciamento de marketing
export const marketingService = {
  // Enviar promoções
  sendPromotions: (type = 'daily', segment = 'recurrent', message = '') => 
    apiRequest('bot/send-promotions', {
      method: 'POST',
      body: JSON.stringify({ type, segment, message })
    })
};

// Serviço para autenticação
export const authService = {
  login,
  checkAuth: async () => {
    try {
      return await login();
    } catch (error) {
      return null;
    }
  },
  logout: () => {
    authToken = null;
    console.log('Usuário deslogado');
  }
};

// Exportar todos os serviços
export default {
  orderService,
  catalogService,
  categoryService,
  conversationService,
  productOptionsService,
  marketingService,
  authService
};