/**
 * @fileoverview Serviço para gerenciamento de categorias de produtos
 * @module category-catalog-service
 */

const fs = require('fs').promises;
const path = require('path');
const NodeCache = require('node-cache');

// Cache para categorias (10 minutos)
const categoryCache = new NodeCache({ stdTTL: 600 });

// Caminho para o arquivo de dados das categorias
const CATEGORIES_FILE = path.join(__dirname, '../../data/categories.json');

/**
 * Serviço para gerenciamento de categorias
 */
const categoryCatalogService = {
    /**
     * Inicializa o serviço de categorias
     */
    initialize: async function() {
        console.log('Inicializando serviço de categorias...');

        try {
            // Verifica se o diretório de dados existe
            const dataDir = path.dirname(CATEGORIES_FILE);
            try {
                await fs.access(dataDir);
            } catch (error) {
                // Se não existir, cria o diretório
                await fs.mkdir(dataDir, { recursive: true });
            }

            // Verifica se o arquivo de categorias existe
            try {
                await fs.access(CATEGORIES_FILE);
                console.log('Arquivo de categorias encontrado.');
            } catch (error) {
                // Se não existir, cria um arquivo inicial com categorias padrão
                console.log('Criando arquivo de categorias inicial...');
                
                // Categorias iniciais
                const initialCategories = {
                    categories: [
                        {
                            id: 'tradicional',
                            name: 'Tradicional',
                            slug: 'tradicional',
                            description: 'Produtos tradicionais da loja',
                            order: 1,
                            active: true
                        },
                        {
                            id: 'especial',
                            name: 'Especial',
                            slug: 'especial',
                            description: 'Produtos especiais com sabores diferenciados',
                            order: 2,
                            active: true
                        },
                        {
                            id: 'vegano',
                            name: 'Vegano',
                            slug: 'vegano',
                            description: 'Produtos veganos sem ingredientes de origem animal',
                            order: 3,
                            active: true
                        },
                        {
                            id: 'sem-gluten',
                            name: 'Sem Glúten',
                            slug: 'sem-gluten',
                            description: 'Produtos sem glúten para intolerantes',
                            order: 4,
                            active: true
                        }
                    ]
                };
                
                await fs.writeFile(
                    CATEGORIES_FILE, 
                    JSON.stringify(initialCategories, null, 2),
                    'utf8'
                );
                console.log('Arquivo de categorias inicial criado com sucesso.');
            }
            
            console.log('Serviço de categorias inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar serviço de categorias:', error);
            throw error;
        }
    },

    /**
     * Obtém todas as categorias
     * @returns {Promise<Array>} Array de categorias
     */
    getCategories: async function() {
        try {
            const cacheKey = 'categories_list';
            
            // Verifica se existe no cache
            if (categoryCache.has(cacheKey)) {
                console.log('Retornando categorias do cache');
                return categoryCache.get(cacheKey);
            }
            
            // Se não está no cache, lê do arquivo
            const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
            const categoriesData = JSON.parse(data);
            
            // Ordena por ordem
            const sortedCategories = categoriesData.categories.sort((a, b) => 
                (a.order || 0) - (b.order || 0)
            );
            
            // Armazena no cache
            categoryCache.set(cacheKey, sortedCategories);
            
            return sortedCategories;
        } catch (error) {
            console.error('Erro ao ler categorias:', error);
            throw error;
        }
    },

    /**
     * Limpa o cache de categorias
     */
    clearCategoriesCache: function() {
        categoryCache.del('categories_list');
        console.log('Cache de categorias limpo');
    },

    /**
     * Adiciona uma nova categoria
     * @param {Object} categoryData Dados da categoria
     * @returns {Promise<Object>} Categoria adicionada
     */
    addCategory: async function(categoryData) {
        try {
            // Validação básica
            if (!categoryData.name || !categoryData.slug) {
                throw new Error('Nome e slug são obrigatórios');
            }
            
            // Lê o arquivo de categorias
            const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
            const categoriesData = JSON.parse(data);
            
            // Verifica se o slug já existe
            if (categoriesData.categories.some(c => c.slug === categoryData.slug)) {
                throw new Error('Já existe uma categoria com este slug');
            }
            
            // Determina a próxima ordem
            const nextOrder = categoriesData.categories.length > 0 
                ? Math.max(...categoriesData.categories.map(c => c.order || 0)) + 1 
                : 1;
            
            // Cria a nova categoria
            const newCategory = {
                id: categoryData.slug,
                name: categoryData.name,
                slug: categoryData.slug,
                description: categoryData.description || '',
                order: categoryData.order || nextOrder,
                active: categoryData.active !== false
            };
            
            // Adiciona a nova categoria
            categoriesData.categories.push(newCategory);
            
            // Salva o arquivo
            await fs.writeFile(
                CATEGORIES_FILE, 
                JSON.stringify(categoriesData, null, 2),
                'utf8'
            );
            
            // Limpa o cache
            this.clearCategoriesCache();
            
            console.log(`Nova categoria adicionada: ${newCategory.slug}`);
            
            return newCategory;
        } catch (error) {
            console.error('Erro ao adicionar categoria:', error);
            throw error;
        }
    },

    /**
     * Atualiza uma categoria existente
     * @param {string} categoryId ID da categoria
     * @param {Object} updatedData Dados atualizados
     * @returns {Promise<Object|null>} Categoria atualizada ou null se não encontrada
     */
    updateCategory: async function(categoryId, updatedData) {
        try {
            // Lê o arquivo de categorias
            const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
            const categoriesData = JSON.parse(data);
            
            // Encontra o índice da categoria
            const categoryIndex = categoriesData.categories.findIndex(c => c.id === categoryId);
            
            if (categoryIndex === -1) {
                return null;
            }
            
            // Atualiza a categoria
            const updatedCategory = {
                ...categoriesData.categories[categoryIndex],
                ...updatedData
            };
            
            // Se o slug foi atualizado, atualiza também o ID
            if (updatedData.slug && updatedData.slug !== categoriesData.categories[categoryIndex].slug) {
                updatedCategory.id = updatedData.slug;
            }
            
            // Atualiza a categoria no array
            categoriesData.categories[categoryIndex] = updatedCategory;
            
            // Salva o arquivo
            await fs.writeFile(
                CATEGORIES_FILE, 
                JSON.stringify(categoriesData, null, 2),
                'utf8'
            );
            
            // Limpa o cache
            this.clearCategoriesCache();
            
            console.log(`Categoria ${categoryId} atualizada`);
            
            return updatedCategory;
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            throw error;
        }
    },

    /**
     * Remove uma categoria
     * @param {string} categoryId ID da categoria
     * @returns {Promise<boolean>} True se removida com sucesso, false se não encontrada
     */
    removeCategory: async function(categoryId) {
        try {
            // Lê o arquivo de categorias
            const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
            const categoriesData = JSON.parse(data);
            
            // Encontra o índice da categoria
            const categoryIndex = categoriesData.categories.findIndex(c => c.id === categoryId);
            
            if (categoryIndex === -1) {
                return false;
            }
            
            // Remove a categoria
            categoriesData.categories.splice(categoryIndex, 1);
            
            // Salva o arquivo
            await fs.writeFile(
                CATEGORIES_FILE, 
                JSON.stringify(categoriesData, null, 2),
                'utf8'
            );
            
            // Limpa o cache
            this.clearCategoriesCache();
            
            console.log(`Categoria ${categoryId} removida`);
            
            return true;
        } catch (error) {
            console.error('Erro ao remover categoria:', error);
            throw error;
        }
    },

    /**
     * Atualiza a ordem das categorias
     * @param {Array} orderedCategories Array de objetos {id, order}
     * @returns {Promise<Array>} Categorias atualizadas
     */
    updateCategoriesOrder: async function(orderedCategories) {
        try {
            // Lê o arquivo de categorias
            const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
            const categoriesData = JSON.parse(data);
            
            // Atualiza a ordem das categorias
            for (const item of orderedCategories) {
                const category = categoriesData.categories.find(c => c.id === item.id);
                if (category) {
                    category.order = item.order;
                }
            }
            
            // Salva o arquivo
            await fs.writeFile(
                CATEGORIES_FILE, 
                JSON.stringify(categoriesData, null, 2),
                'utf8'
            );
            
            // Limpa o cache
            this.clearCategoriesCache();
            
            console.log('Ordem das categorias atualizada');
            
            return await this.getCategories();
        } catch (error) {
            console.error('Erro ao atualizar ordem das categorias:', error);
            throw error;
        }
    }
};

module.exports = categoryCatalogService;