// const fs = require('fs').promises;
// const path = require('path');

// const NodeCache = require('node-cache');
// const catalogCache = new NodeCache({ stdTTL: 600 }); // Cache por 10 minutos

// // Caminho para o arquivo de dados do catálogo
// const CATALOG_FILE = path.join(__dirname, '../../data/catalog.json');

// // Array para armazenar callbacks de notificação de mudanças no catálogo
// const catalogChangeCallbacks = [];

// const cookieCatalogService = {

//     initialize: async function() {
//         console.log('Inicializando serviço de catálogo...');
        
//         try {
//             // Verifica se o diretório de dados existe
//             const dataDir = path.dirname(CATALOG_FILE);
//             try {
//                 await fs.access(dataDir);
//             } catch (error) {
//                 // Se não existir, cria o diretório
//                 await fs.mkdir(dataDir, { recursive: true });
//             }
            
//             // Verifica se o arquivo de catálogo existe
//             try {
//                 await fs.access(CATALOG_FILE);
//                 console.log('Arquivo de catálogo encontrado.');
//             } catch (error) {
//                 // Se não existir, cria um arquivo inicial com produtos padrão
//                 console.log('Criando arquivo de catálogo inicial...');
                
//                 // Produtos iniciais
//                 const initialCatalog = {
//                     products: [
//                         {
//                             id: 'cookie-001',
//                             name: 'Nutella 100g',
//                             description: 'Cookie recheado com Nutella e gotas de chocolate meio amargo.',
//                             price: 10.00,
//                             image: 'chocolate-chip.jpg',
//                             available: true,
//                             category: 'tradicional'
//                         },
//                         {
//                             id: 'cookie-002',
//                             name: 'ChocoNutella 100g',
//                             description: 'Cookie intenso com massa de chocolate, recheio de Nutella e gotas de chocolate.',
//                             price: 10.00,
//                             image: 'double-chocolate.jpg',
//                             available: true,
//                             category: 'tradicional'
//                         },
//                         {
//                             id: 'cookie-003',
//                             name: 'Cookie Red Velvet 100g',
//                             description: 'Cookie macio de Red Velvet com gotas de chocolate branco.',
//                             price: 10.00,
//                             image: 'red-velvet.jpg',
//                             available: true,
//                             category: 'especial'
//                         },
//                         {
//                             id: 'cookie-004',
//                             name: 'ChocoCaramelo 100g',
//                             description: 'Cookie de chocolate recheado com caramelo cremoso, sem ingredientes de origem animal.',
//                             price: 10.00,
//                             image: 'vegan.jpg',
//                             available: true,
//                             category: 'especial'
//                         },
//                         {
//                             id: 'cookie-005',
//                             name: 'Churros 100g',
//                             description: 'Cookie inspirado em churros, com canela e recheio de doce de leite.',
//                             price: 10.00,
//                             image: 'gluten-free.jpg',
//                             available: true,
//                             category: 'especial'
//                         },
//                         {
//                             id: 'cookie-006',
//                             name: 'Red Ninho 100g',
//                             description: 'Cookie Red Velvet recheado com creme de Leite Ninho.',
//                             price: 10.00,
//                             image: 'gluten-free.jpg',
//                             available: true,
//                             category: 'especial'
//                         },
//                         {
//                             id: 'cookie-007',
//                             name: `M&M's 100g`,
//                             description: `Cookie crocante com M&M's coloridos e gotas de chocolate.`,
//                             price: 10.00,
//                             image: 'gluten-free.jpg',
//                             available: true,
//                             category: 'especial'
//                         },
//                         {
//                             id: 'cookie-008',
//                             name: 'Cookie Tradicional 50g',
//                             description: 'Clássico cookie com gotas de chocolate ao leite.',
//                             price: 5.00,
//                             image: 'gluten-free.jpg',
//                             available: true,
//                             category: 'tradicional'
//                         },
//                     ]
//                 };
                
//                 await fs.writeFile(
//                     CATALOG_FILE, 
//                     JSON.stringify(initialCatalog, null, 2),
//                     'utf8'
//                 );
//                 console.log('Arquivo de catálogo inicial criado com sucesso.');
//             }
            
//             console.log('Serviço de catálogo inicializado com sucesso!');
//         } catch (error) {
//             console.error('Erro ao inicializar serviço de catálogo:', error);
//             throw error;
//         }
//     },
    
//     /**
//      * Registra um callback para quando o catálogo for alterado
//      * @param {Function} callback Função a ser chamada quando o catálogo mudar
//      */
//     onCatalogChange: function(callback) {
//         if (typeof callback === 'function') {
//             catalogChangeCallbacks.push(callback);
//         }
//     },
    
//     /**
//      * Notifica todos os callbacks registrados sobre mudanças no catálogo
//      */
//     notifyCatalogChange: function() {
//         this.clearCatalogCache(); // Limpa o cache
        
//         // Notifica todos os callbacks registrados
//         catalogChangeCallbacks.forEach(callback => {
//             try {
//                 callback();
//             } catch (error) {
//                 console.error('Erro ao executar callback de mudança de catálogo:', error);
//             }
//         });
//     },
    
//     /**
//      * Obtém todos os produtos do catálogo
//      * @returns {Promise<Array>} Array de produtos
//      */
//     getCatalog: async function() {
//         try {
//             const cacheKey = 'product_catalog';
            
//             // Verifica se existe no cache
//             if (catalogCache.has(cacheKey)) {
//                 console.log('Retornando catálogo do cache');
//                 return catalogCache.get(cacheKey);
//             }
            
//             // Se não está no cache, lê do arquivo
//             const data = await fs.readFile(CATALOG_FILE, 'utf8');
//             const catalog = JSON.parse(data);
            
//             // Armazena no cache
//             catalogCache.set(cacheKey, catalog.products);
            
//             return catalog.products;
//         } catch (error) {
//             console.error('Erro ao ler catálogo:', error);
//             throw error;
//         }
//     },
    
//     /**
//      * Limpa o cache do catálogo
//      */
//     clearCatalogCache: function() {
//         catalogCache.del('product_catalog');
//         console.log('Cache do catálogo limpo');
//     },
    
//     /**
//      * Obtém os detalhes de um produto específico
//      * @param {string} productId ID do produto
//      * @returns {Promise<Object|null>} Dados do produto ou null se não encontrado
//      */
//     getProductDetails: async function(productId) {
//         try {
//             const products = await this.getCatalog();
//             return products.find(product => product.id === productId) || null;
//         } catch (error) {
//             console.error('Erro ao buscar detalhes do produto:', error);
//             throw error;
//         }
//     },
    
//     /**
//      * Adiciona um novo produto ao catálogo
//      * @param {Object} productData Dados do produto
//      * @returns {Promise<Object>} Produto adicionado
//      */
//     addProduct: async function(productData) {
//         try {
//             // Validação básica
//             if (!productData.name || !productData.price) {
//                 throw new Error('Dados do produto incompletos');
//             }
            
//             // Lê o catálogo atual
//             const data = await fs.readFile(CATALOG_FILE, 'utf8');
//             const catalog = JSON.parse(data);
            
//             // Gera um ID para o novo produto
//             const productId = `cookie-${String(catalog.products.length + 1).padStart(3, '0')}`;
            
//             // Cria o novo produto
//             const newProduct = {
//                 id: productId,
//                 available: true,
//                 ...productData
//             };
            
//             // Adiciona o produto ao catálogo
//             catalog.products.push(newProduct);
            
//             // Salva o catálogo atualizado
//             await fs.writeFile(
//                 CATALOG_FILE, 
//                 JSON.stringify(catalog, null, 2),
//                 'utf8'
//             );
            
//             // Notifica sobre a mudança no catálogo
//             this.notifyCatalogChange();
            
//             console.log(`Novo produto adicionado: ${newProduct.id}`);
            
//             return newProduct;
//         } catch (error) {
//             console.error('Erro ao adicionar produto:', error);
//             throw error;
//         }
//     },
    
//     /**
//      * Atualiza um produto existente
//      * @param {string} productId ID do produto
//      * @param {Object} updatedData Dados atualizados
//      * @returns {Promise<Object|null>} Produto atualizado ou null se não encontrado
//      */
//     updateProduct: async function(productId, updatedData) {
//         try {
//             // Lê o catálogo atual
//             const data = await fs.readFile(CATALOG_FILE, 'utf8');
//             const catalog = JSON.parse(data);
            
//             // Encontra o índice do produto
//             const productIndex = catalog.products.findIndex(product => product.id === productId);
            
//             if (productIndex === -1) {
//                 return null;
//             }
            
//             // Remove propriedades que não devem ser alteradas
//             const safeUpdatedData = { ...updatedData };
//             delete safeUpdatedData.id;
            
//             // Atualiza o produto
//             catalog.products[productIndex] = {
//                 ...catalog.products[productIndex],
//                 ...safeUpdatedData
//             };
            
//             // Salva o catálogo atualizado
//             await fs.writeFile(
//                 CATALOG_FILE, 
//                 JSON.stringify(catalog, null, 2),
//                 'utf8'
//             );
            
//             // Notifica sobre a mudança no catálogo
//             this.notifyCatalogChange();
            
//             console.log(`Produto ${productId} atualizado`);
            
//             return catalog.products[productIndex];
//         } catch (error) {
//             console.error('Erro ao atualizar produto:', error);
//             throw error;
//         }
//     },
    
//     /**
//      * Remove um produto do catálogo
//      * @param {string} productId ID do produto
//      * @returns {Promise<boolean>} True se removido com sucesso, false se não encontrado
//      */
//     removeProduct: async function(productId) {
//         try {
//             // Lê o catálogo atual
//             const data = await fs.readFile(CATALOG_FILE, 'utf8');
//             const catalog = JSON.parse(data);
            
//             // Encontra o índice do produto
//             const productIndex = catalog.products.findIndex(product => product.id === productId);
            
//             if (productIndex === -1) {
//                 return false;
//             }
            
//             // Remove o produto
//             catalog.products.splice(productIndex, 1);
            
//             // Salva o catálogo atualizado
//             await fs.writeFile(
//                 CATALOG_FILE, 
//                 JSON.stringify(catalog, null, 2),
//                 'utf8'
//             );
            
//             // Notifica sobre a mudança no catálogo
//             this.notifyCatalogChange();
            
//             console.log(`Produto ${productId} removido`);
            
//             return true;
//         } catch (error) {
//             console.error('Erro ao remover produto:', error);
//             throw error;
//         }
//     },
    
//     /**
//      * Atualiza a disponibilidade de um produto
//      * @param {string} productId ID do produto
//      * @param {boolean} available Nova disponibilidade
//      * @returns {Promise<Object|null>} Produto atualizado ou null se não encontrado
//      */
//     setProductAvailability: async function(productId, available) {
//         return this.updateProduct(productId, { available });
//     },
    
//     /**
//      * Obtém produtos por categoria
//      * @param {string} category Categoria dos produtos
//      * @returns {Promise<Array>} Produtos da categoria
//      */
//     getProductsByCategory: async function(category) {
//         try {
//             const products = await this.getCatalog();
//             return products.filter(product => product.category === category);
//         } catch (error) {
//             console.error('Erro ao filtrar produtos por categoria:', error);
//             throw error;
//         }
//     },
    
//     /**
//      * Busca produtos por nome ou descrição
//      * @param {string} query Termo de busca
//      * @returns {Promise<Array>} Produtos encontrados
//      */
//     searchProducts: async function(query) {
//         try {
//             if (!query) {
//                 return [];
//             }
            
//             const products = await this.getCatalog();
//             const searchTerm = query.toLowerCase();
            
//             return products.filter(product => 
//                 product.name.toLowerCase().includes(searchTerm) || 
//                 (product.description && product.description.toLowerCase().includes(searchTerm))
//             );
//         } catch (error) {
//             console.error('Erro na busca de produtos:', error);
//             throw error;
//         }
//     }
// };

// module.exports = cookieCatalogService;
const fs = require('fs').promises;
const path = require('path');

const NodeCache = require('node-cache');
const catalogCache = new NodeCache({ stdTTL: 600 }); // Cache por 10 minutos

// Caminho para o arquivo de dados do catálogo
const CATALOG_FILE = path.join(__dirname, '../../data/catalog.json');

// Array para armazenar callbacks de notificação de mudanças no catálogo
const catalogChangeCallbacks = [];

const cookieCatalogService = {

    initialize: async function() {
        console.log('Inicializando serviço de catálogo...');
        
        try {
            // Verifica se o diretório de dados existe
            const dataDir = path.dirname(CATALOG_FILE);
            try {
                await fs.access(dataDir);
            } catch (error) {
                // Se não existir, cria o diretório
                await fs.mkdir(dataDir, { recursive: true });
            }
            
            // Verifica se o arquivo de catálogo existe
            try {
                await fs.access(CATALOG_FILE);
                console.log('Arquivo de catálogo encontrado.');
            } catch (error) {
                // Se não existir, cria um arquivo inicial com produtos padrão
                console.log('Criando arquivo de catálogo inicial...');
                
                // Produtos iniciais
                const initialCatalog = {
                    products: [
                        {
                            id: 'cookie-001',
                            name: 'Nutella 100g',
                            description: 'Cookie recheado com Nutella e gotas de chocolate meio amargo.',
                            price: 10.00,
                            image: 'chocolate-chip.jpg',
                            available: true,
                            category: 'tradicional',
                            productType: 'standard'
                        },
                        {
                            id: 'cookie-002',
                            name: 'ChocoNutella 100g',
                            description: 'Cookie intenso com massa de chocolate, recheio de Nutella e gotas de chocolate.',
                            price: 10.00,
                            image: 'double-chocolate.jpg',
                            available: true,
                            category: 'tradicional',
                            productType: 'standard'
                        },
                        {
                            id: 'cookie-003',
                            name: 'Cookie Red Velvet 100g',
                            description: 'Cookie macio de Red Velvet com gotas de chocolate branco.',
                            price: 10.00,
                            image: 'red-velvet.jpg',
                            available: true,
                            category: 'especial',
                            productType: 'standard'
                        },
                        {
                            id: 'cookie-004',
                            name: 'ChocoCaramelo 100g',
                            description: 'Cookie de chocolate recheado com caramelo cremoso, sem ingredientes de origem animal.',
                            price: 10.00,
                            image: 'vegan.jpg',
                            available: true,
                            category: 'especial',
                            productType: 'standard'
                        },
                        {
                            id: 'cookie-005',
                            name: 'Churros 100g',
                            description: 'Cookie inspirado em churros, com canela e recheio de doce de leite.',
                            price: 10.00,
                            image: 'gluten-free.jpg',
                            available: true,
                            category: 'especial',
                            productType: 'standard'
                        },
                        {
                            id: 'cookie-006',
                            name: 'Red Ninho 100g',
                            description: 'Cookie Red Velvet recheado com creme de Leite Ninho.',
                            price: 10.00,
                            image: 'gluten-free.jpg',
                            available: true,
                            category: 'especial',
                            productType: 'standard'
                        },
                        {
                            id: 'cookie-007',
                            name: `M&M's 100g`,
                            description: `Cookie crocante com M&M's coloridos e gotas de chocolate.`,
                            price: 10.00,
                            image: 'gluten-free.jpg',
                            available: true,
                            category: 'especial',
                            productType: 'standard'
                        },
                        {
                            id: 'cookie-008',
                            name: 'Cookie Tradicional 50g',
                            description: 'Clássico cookie com gotas de chocolate ao leite.',
                            price: 5.00,
                            image: 'gluten-free.jpg',
                            available: true,
                            category: 'tradicional',
                            productType: 'standard'
                        },
                        {
                            id: 'pizza-001',
                            name: 'Pizza Margherita',
                            description: 'Pizza clássica com molho de tomate, mussarela e manjericão fresco.',
                            price: 34.90, // Preço base (menor tamanho)
                            image: 'pizza-margherita.jpg',
                            available: true,
                            category: 'pizza',
                            productType: 'pizza',
                            sizesPrices: [
                                { sizeId: '1', sizeName: 'Broto 4 fatias', price: 34.90 },
                                { sizeId: '2', sizeName: 'Pequena (6 fatias)', price: 44.90 },
                                { sizeId: '3', sizeName: 'Média (8 fatias)', price: 54.90 },
                                { sizeId: '4', sizeName: 'Grande (10 fatias)', price: 64.90 }
                            ]
                        },
                        {
                            id: 'pizza-002',
                            name: 'Pizza Calabresa',
                            description: 'Pizza com molho de tomate, mussarela e calabresa fatiada.',
                            price: 36.90, // Preço base (menor tamanho)
                            image: 'pizza-calabresa.jpg',
                            available: true,
                            category: 'pizza',
                            productType: 'pizza',
                            sizesPrices: [
                                { sizeId: '1', sizeName: 'Broto 4 fatias', price: 36.90 },
                                { sizeId: '2', sizeName: 'Pequena (6 fatias)', price: 46.90 },
                                { sizeId: '3', sizeName: 'Média (8 fatias)', price: 56.90 },
                                { sizeId: '4', sizeName: 'Grande (10 fatias)', price: 66.90 }
                            ]
                        },
                    ]
                };
                
                await fs.writeFile(
                    CATALOG_FILE, 
                    JSON.stringify(initialCatalog, null, 2),
                    'utf8'
                );
                console.log('Arquivo de catálogo inicial criado com sucesso.');
            }
            
            console.log('Serviço de catálogo inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar serviço de catálogo:', error);
            throw error;
        }
    },
    
    /**
     * Registra um callback para quando o catálogo for alterado
     * @param {Function} callback Função a ser chamada quando o catálogo mudar
     */
    onCatalogChange: function(callback) {
        if (typeof callback === 'function') {
            catalogChangeCallbacks.push(callback);
        }
    },
    
    /**
     * Notifica todos os callbacks registrados sobre mudanças no catálogo
     */
    notifyCatalogChange: function() {
        this.clearCatalogCache(); // Limpa o cache
        
        // Notifica todos os callbacks registrados
        catalogChangeCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Erro ao executar callback de mudança de catálogo:', error);
            }
        });
    },
    
    /**
     * Obtém todos os produtos do catálogo
     * @returns {Promise<Array>} Array de produtos
     */
    getCatalog: async function() {
        try {
            const cacheKey = 'product_catalog';
            
            // Verifica se existe no cache
            if (catalogCache.has(cacheKey)) {
                console.log('Retornando catálogo do cache');
                return catalogCache.get(cacheKey);
            }
            
            // Se não está no cache, lê do arquivo
            const data = await fs.readFile(CATALOG_FILE, 'utf8');
            const catalog = JSON.parse(data);
            
            // Armazena no cache
            catalogCache.set(cacheKey, catalog.products);
            
            return catalog.products;
        } catch (error) {
            console.error('Erro ao ler catálogo:', error);
            throw error;
        }
    },
    
    /**
     * Limpa o cache do catálogo
     */
    clearCatalogCache: function() {
        catalogCache.del('product_catalog');
        console.log('Cache do catálogo limpo');
    },
    
    /**
     * Obtém os detalhes de um produto específico
     * @param {string} productId ID do produto
     * @returns {Promise<Object|null>} Dados do produto ou null se não encontrado
     */
    getProductDetails: async function(productId) {
        try {
            const products = await this.getCatalog();
            return products.find(product => product.id === productId) || null;
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
            throw error;
        }
    },
    
    /**
     * Adiciona um novo produto ao catálogo
     * @param {Object} productData Dados do produto
     * @returns {Promise<Object>} Produto adicionado
     */
    addProduct: async function(productData) {
        try {
            // Validação básica
            if (!productData.name) {
              throw new Error('Nome do produto é obrigatório');
            }

            // Verificar o tipo de produto e validar campos especiais
            if (productData.productType === 'pizza') {
              // Para produtos do tipo pizza, verificamos se há preços por tamanho
              if (!productData.sizesPrices || productData.sizesPrices.length === 0) {
                throw new Error('Produtos do tipo pizza precisam de ao menos um preço por tamanho');
              }
            } else {
              // Para outros tipos de produto, validamos o preço
              if (productData.price === undefined || productData.price === null) {
                throw new Error('Preço do produto é obrigatório');
              }
            }
            
            // Lê o catálogo atual
            const data = await fs.readFile(CATALOG_FILE, 'utf8');
            const catalog = JSON.parse(data);
            
            // Gera um ID para o novo produto
            const productId = `cookie-${String(catalog.products.length + 1).padStart(3, '0')}`;
            
            // Cria o novo produto
            const newProduct = {
              id: productId,
              available: true,
              ...productData
            };
            
            // Adiciona o produto ao catálogo
            catalog.products.push(newProduct);
            
            // Salva o catálogo atualizado
            await fs.writeFile(
              CATALOG_FILE, 
              JSON.stringify(catalog, null, 2),
              'utf8'
            );
            
            // Notifica sobre a mudança no catálogo
            this.notifyCatalogChange();
            
            console.log(`Novo produto adicionado: ${newProduct.id}`);
            
            return newProduct;
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            throw error;
        }
    },
    
    /**
     * Atualiza um produto existente
     * @param {string} productId ID do produto
     * @param {Object} updatedData Dados atualizados
     * @returns {Promise<Object|null>} Produto atualizado ou null se não encontrado
     */
    updateProduct: async function(productId, updatedData) {
        try {
            // Validações para produtos tipo pizza
            if (updatedData.productType === 'pizza') {
              // Para produtos do tipo pizza, verificamos se há preços por tamanho
              if (!updatedData.sizesPrices || updatedData.sizesPrices.length === 0) {
                throw new Error('Produtos do tipo pizza precisam de ao menos um preço por tamanho');
              }
            }
            
            // Lê o catálogo atual
            const data = await fs.readFile(CATALOG_FILE, 'utf8');
            const catalog = JSON.parse(data);
            
            // Encontra o índice do produto
            const productIndex = catalog.products.findIndex(p => p.id === productId);
            
            if (productIndex === -1) {
                return null;
            }
            
            // Remove propriedades que não devem ser alteradas
            const safeUpdatedData = { ...updatedData };
            delete safeUpdatedData.id;
            
            // Atualiza o produto
            catalog.products[productIndex] = {
                ...catalog.products[productIndex],
                ...safeUpdatedData
            };
            
            // Salva o catálogo atualizado
            await fs.writeFile(
                CATALOG_FILE, 
                JSON.stringify(catalog, null, 2),
                'utf8'
            );
            
            // Notifica sobre a mudança no catálogo
            this.notifyCatalogChange();
            
            console.log(`Produto ${productId} atualizado`);
            
            return catalog.products[productIndex];
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    },
    
    /**
     * Remove um produto do catálogo
     * @param {string} productId ID do produto
     * @returns {Promise<boolean>} True se removido com sucesso, false se não encontrado
     */
    removeProduct: async function(productId) {
        try {
            // Lê o catálogo atual
            const data = await fs.readFile(CATALOG_FILE, 'utf8');
            const catalog = JSON.parse(data);
            
            // Encontra o índice do produto
            const productIndex = catalog.products.findIndex(product => product.id === productId);
            
            if (productIndex === -1) {
                return false;
            }
            
            // Remove o produto
            catalog.products.splice(productIndex, 1);
            
            // Salva o catálogo atualizado
            await fs.writeFile(
                CATALOG_FILE, 
                JSON.stringify(catalog, null, 2),
                'utf8'
            );
            
            // Notifica sobre a mudança no catálogo
            this.notifyCatalogChange();
            
            console.log(`Produto ${productId} removido`);
            
            return true;
        } catch (error) {
            console.error('Erro ao remover produto:', error);
            throw error;
        }
    },
    
    /**
     * Atualiza a disponibilidade de um produto
     * @param {string} productId ID do produto
     * @param {boolean} available Nova disponibilidade
     * @returns {Promise<Object|null>} Produto atualizado ou null se não encontrado
     */
    setProductAvailability: async function(productId, available) {
        return this.updateProduct(productId, { available });
    },
    
    /**
     * Obtém produtos por categoria
     * @param {string} category Categoria dos produtos
     * @returns {Promise<Array>} Produtos da categoria
     */
    getProductsByCategory: async function(category) {
        try {
            const products = await this.getCatalog();
            return products.filter(product => product.category === category);
        } catch (error) {
            console.error('Erro ao filtrar produtos por categoria:', error);
            throw error;
        }
    },
    
    /**
     * Busca produtos por nome ou descrição
     * @param {string} query Termo de busca
     * @returns {Promise<Array>} Produtos encontrados
     */
    searchProducts: async function(query) {
        try {
            if (!query) {
                return [];
            }
            
            const products = await this.getCatalog();
            const searchTerm = query.toLowerCase();
            
            return products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                (product.description && product.description.toLowerCase().includes(searchTerm))
            );
        } catch (error) {
            console.error('Erro na busca de produtos:', error);
            throw error;
        }
    },
    
    /**
     * Obtém o preço de um produto com base no tamanho (para pizzas)
     * @param {string} productId ID do produto
     * @param {string} sizeId ID do tamanho (opcional, apenas para pizzas)
     * @returns {Promise<number|null>} Preço do produto ou null se não encontrado
     */
    getProductPrice: async function(productId, sizeId = null) {
      try {
        const product = await this.getProductDetails(productId);
        
        if (!product) {
          return null;
        }
        
        // Se for produto do tipo pizza e um tamanho foi especificado
        if (product.productType === 'pizza' && sizeId && product.sizesPrices) {
          // Busca o preço para o tamanho especificado
          const sizePrice = product.sizesPrices.find(sp => sp.sizeId === sizeId);
          if (sizePrice) {
            return parseFloat(sizePrice.price);
          }
          
          // Se não encontrou o tamanho específico, retorna o preço base
          return parseFloat(product.price);
        }
        
        // Para outros tipos de produto, retorna o preço padrão
        return parseFloat(product.price);
      } catch (error) {
        console.error('Erro ao buscar preço do produto:', error);
        throw error;
      }
    }
};

module.exports = cookieCatalogService;