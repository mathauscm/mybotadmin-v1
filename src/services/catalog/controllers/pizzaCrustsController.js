// src/services/catalog/controllers/pizzaCrustsController.js
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../../utils/logger');

// Caminho para o arquivo de dados
const PIZZA_CRUSTS_FILE = path.join(__dirname, '../../../data/pizzaCrusts.json');

// Garantir que o diretório e arquivo existam
const initializeDataFile = async () => {
  try {
    // Verificar se o diretório existe
    const dataDir = path.dirname(PIZZA_CRUSTS_FILE);
    try {
      await fs.access(dataDir);
    } catch (error) {
      // Se não existir, cria o diretório
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Verificar se o arquivo existe
    try {
      await fs.access(PIZZA_CRUSTS_FILE);
    } catch (error) {
      // Se não existir, cria o arquivo com dados iniciais
      const initialData = {
        crusts: [
          { id: '1', name: 'Sem borda recheada', price: 0.00 },
          { id: '2', name: 'Borda com Catupiry', price: 8.90 },
          { id: '3', name: 'Borda com Cheddar', price: 8.90 },
          { id: '4', name: 'Borda com Chocolate', price: 10.90 }
        ]
      };
      
      await fs.writeFile(PIZZA_CRUSTS_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    }
  } catch (error) {
    logger.error('Erro ao inicializar arquivo de bordas de pizza:', error);
    throw error;
  }
};

// Inicializa o arquivo na carga do módulo
initializeDataFile().catch(console.error);

// Controlador para bordas de pizza
const pizzaCrustsController = {
  // Obter todas as bordas
  getAllCrusts: async (req, res) => {
    try {
      await initializeDataFile();
      
      const data = await fs.readFile(PIZZA_CRUSTS_FILE, 'utf8');
      const { crusts } = JSON.parse(data);
      
      res.json(crusts);
    } catch (error) {
      logger.error('Erro ao buscar bordas de pizza:', error);
      res.status(500).json({ error: 'Erro ao buscar bordas de pizza' });
    }
  },
  
  // Obter uma borda específica
  getCrustById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const data = await fs.readFile(PIZZA_CRUSTS_FILE, 'utf8');
      const { crusts } = JSON.parse(data);
      
      const crust = crusts.find(crust => crust.id === id);
      
      if (!crust) {
        return res.status(404).json({ error: 'Borda não encontrada' });
      }
      
      res.json(crust);
    } catch (error) {
      logger.error('Erro ao buscar borda de pizza:', error);
      res.status(500).json({ error: 'Erro ao buscar borda de pizza' });
    }
  },
  
  // Criar uma nova borda
  createCrust: async (req, res) => {
    try {
      const { name, price } = req.body;
      
      // Validação simples
      if (!name || typeof price !== 'number') {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }
      
      const data = await fs.readFile(PIZZA_CRUSTS_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      // Gerar ID único
      const id = Date.now().toString();
      
      const newCrust = {
        id,
        name,
        price
      };
      
      jsonData.crusts.push(newCrust);
      
      await fs.writeFile(PIZZA_CRUSTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.status(201).json(newCrust);
    } catch (error) {
      logger.error('Erro ao criar borda de pizza:', error);
      res.status(500).json({ error: 'Erro ao criar borda de pizza' });
    }
  },
  
  // Atualizar uma borda existente
  updateCrust: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price } = req.body;
      
      // Validação simples
      if (!name || typeof price !== 'number') {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }
      
      const data = await fs.readFile(PIZZA_CRUSTS_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      const crustIndex = jsonData.crusts.findIndex(crust => crust.id === id);
      
      if (crustIndex === -1) {
        return res.status(404).json({ error: 'Borda não encontrada' });
      }
      
      // Atualizar a borda
      jsonData.crusts[crustIndex] = {
        ...jsonData.crusts[crustIndex],
        name,
        price
      };
      
      await fs.writeFile(PIZZA_CRUSTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.json(jsonData.crusts[crustIndex]);
    } catch (error) {
      logger.error('Erro ao atualizar borda de pizza:', error);
      res.status(500).json({ error: 'Erro ao atualizar borda de pizza' });
    }
  },
  
  // Excluir uma borda
  deleteCrust: async (req, res) => {
    try {
      const { id } = req.params;
      
      const data = await fs.readFile(PIZZA_CRUSTS_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      const crustIndex = jsonData.crusts.findIndex(crust => crust.id === id);
      
      if (crustIndex === -1) {
        return res.status(404).json({ error: 'Borda não encontrada' });
      }
      
      // Remover a borda
      jsonData.crusts.splice(crustIndex, 1);
      
      await fs.writeFile(PIZZA_CRUSTS_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.json({ success: true, message: 'Borda removida com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir borda de pizza:', error);
      res.status(500).json({ error: 'Erro ao excluir borda de pizza' });
    }
  }
};

module.exports = pizzaCrustsController;