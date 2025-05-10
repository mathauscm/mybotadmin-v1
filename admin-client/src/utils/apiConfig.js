// admin-client/src/utils/apiConfig.js

/**
 * Configuração centralizada para endpoints da API
 */

// Obtém a URL da API das variáveis de ambiente ou usa o valor padrão
const API_URL = process.env.REACT_APP_API_URL || 'https://apimybot.innovv8.tech/api';
const API_KEY = process.env.REACT_APP_API_KEY || 'a005529cf26656d7291bdebbaabce7f7192a12d918bbdfb1b4c9ad23fc859c0f';
const TENANT_ID = process.env.REACT_APP_TENANT_ID || '6813fab1dab14b9a1289ec45';

const LOGIN_EMAIL = 'admin@cookier.com';
const LOGIN_PASSWORD = 'cookier123';

/**
 * Retorna a URL completa para um endpoint da API
 * @param {string} endpoint - Endpoint da API sem a URL base
 * @returns {string} - URL completa para o endpoint
 */
export const getApiUrl = (endpoint) => {
  // Garante que o endpoint comece sem a barra
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_URL}/${cleanEndpoint}`;
};

/**
 * Retorna os headers padrão para requisições à API
 * @param {Object} additionalHeaders - Headers adicionais
 * @returns {Object} - Headers para requisições à API
 */
export const getApiHeaders = (additionalHeaders = {}) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `ApiKey ${API_KEY}`,
    'X-Tenant-ID': TENANT_ID,
    ...additionalHeaders
  };
};

export default {
  API_URL,
  API_KEY,
  TENANT_ID,
  LOGIN_EMAIL,
  LOGIN_PASSWORD,
  getApiUrl,
  getApiHeaders
};