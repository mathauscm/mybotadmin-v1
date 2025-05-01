// src/services/catalog/controllers/burgerAddonsController.js
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../../utils/logger');

// Caminho para o arquivo de dados
const BURGER_ADDONS_FILE = path.join(__dirname, '../../../data/burgerAddons.json');

// Garantir que o diretório e arquivo existam
const initializeDataFile = async () => {
  try {
    // Verificar se o diretório existe
    const dataDir = path.dirname(BURGER_ADDONS_FILE);
    try {
      await fs.access(dataDir);
    } catch (error) {
      // Se não existir, cria o diretório
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Verificar se o arquivo existe
    try {
      await fs.access(BURGER_ADDONS_FILE);
    } catch (error) {
      // Se não existir, cria o arquivo com dados iniciais
      const initialData = {
        addons: [
          { 
            id: '1', 
            name: 'Adicional Maionese Tradicional', 
            description: 'Maionese Tradicional',
            price: 2.97, 
            maxQuantity: 15,
            imageUrl: '' 
          },
          { 
            id: '2', 
            name: 'Adicional Maionese Picante Com Sriracha', 
            description: 'Maionese Picante Com Sriracha',
            price: 2.97, 
            maxQuantity: 15,
            imageUrl: '' 
          },
          { 
            id: '3', 
            name: 'Adicional Molho Barbecue', 
            description: 'Adicional Molho Barbecue',
            price: 3.00, 
            maxQuantity: 15,
            imageUrl: '' 
          },
          { 
            id: '4', 
            name: 'Bacon Extra', 
            description: 'Porção extra de bacon crocante',
            price: 4.50, 
            maxQuantity: 5,
            imageUrl: '' 
          },
          { 
            id: '5', 
            name: 'Queijo Cheddar Extra', 
            description: 'Fatia extra de queijo cheddar',
            price: 3.50, 
            maxQuantity: 3,
            imageUrl: '' 
          }
        ]
      };
      
      await fs.writeFile(BURGER_ADDONS_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    }
  } catch (error) {
    logger.error('Erro ao inicializar arquivo de adicionais de hambúrguer:', error);
    throw error;
  }
};

// Inicializa o arquivo na carga do módulo
initializeDataFile().catch(console.error);

// Controlador para adicionais de hambúrguer
const burgerAddonsController = {
  // Obter todos os adicionais
  getAllAddons: async (req, res) => {
    try {
      await initializeDataFile();
      
      const data = await fs.readFile(BURGER_ADDONS_FILE, 'utf8');
      const { addons } = JSON.parse(data);
      
      res.json(addons);
    } catch (error) {
      logger.error('Erro ao buscar adicionais de hambúrguer:', error);
      res.status(500).json({ error: 'Erro ao buscar adicionais de hambúrguer' });
    }
  },
  
  // Obter um adicional específico
  getAddonById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const data = await fs.readFile(BURGER_ADDONS_FILE, 'utf8');
      const { addons } = JSON.parse(data);
      
      const addon = addons.find(addon => addon.id === id);
      
      if (!addon) {
        return res.status(404).json({ error: 'Adicional não encontrado' });
      }
      
      res.json(addon);
    } catch (error) {
      logger.error('Erro ao buscar adicional de hambúrguer:', error);
      res.status(500).json({ error: 'Erro ao buscar adicional de hambúrguer' });
    }
  },
  
  // Criar um novo adicional
  createAddon: async (req, res) => {
    try {
      const { name, description, price, maxQuantity, imageUrl } = req.body;
      
      // Validação simples
      if (!name || typeof price !== 'number') {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }
      
      const data = await fs.readFile(BURGER_ADDONS_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      // Gerar ID único
      const id = Date.now().toString();
      
      const newAddon = {
        id,
        name,
        description: description || '',
        price,
        maxQuantity: maxQuantity || 15,
        imageUrl: imageUrl || ''
      };
      
      jsonData.addons.push(newAddon);
      
      await fs.writeFile(BURGER_ADDONS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.status(201).json(newAddon);
    } catch (error) {
      logger.error('Erro ao criar adicional de hambúrguer:', error);
      res.status(500).json({ error: 'Erro ao criar adicional de hambúrguer' });
    }
  },
  
  // Atualizar um adicional existente
  updateAddon: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, maxQuantity, imageUrl } = req.body;
      
      // Validação simples
      if (!name || typeof price !== 'number') {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }
      
      const data = await fs.readFile(BURGER_ADDONS_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      const addonIndex = jsonData.addons.findIndex(addon => addon.id === id);
      
      if (addonIndex === -1) {
        return res.status(404).json({ error: 'Adicional não encontrado' });
      }
      
      // Atualizar o adicional
      jsonData.addons[addonIndex] = {
        ...jsonData.addons[addonIndex],
        name,
        description: description || '',
        price,
        maxQuantity: maxQuantity || 15,
        imageUrl: imageUrl || ''
      };
      
      await fs.writeFile(BURGER_ADDONS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.json(jsonData.addons[addonIndex]);
    } catch (error) {
      logger.error('Erro ao atualizar adicional de hambúrguer:', error);
      res.status(500).json({ error: 'Erro ao atualizar adicional de hambúrguer' });
    }
  },
  
  // Excluir um adicional
  deleteAddon: async (req, res) => {
    try {
      const { id } = req.params;
      
      const data = await fs.readFile(BURGER_ADDONS_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      const addonIndex = jsonData.addons.findIndex(addon => addon.id === id);
      
      if (addonIndex === -1) {
        return res.status(404).json({ error: 'Adicional não encontrado' });
      }
      
      // Remover o adicional
      jsonData.addons.splice(addonIndex, 1);
      
      await fs.writeFile(BURGER_ADDONS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.json({ success: true, message: 'Adicional removido com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir adicional de hambúrguer:', error);
      res.status(500).json({ error: 'Erro ao excluir adicional de hambúrguer' });
    }
  }
};

module.exports = burgerAddonsController;