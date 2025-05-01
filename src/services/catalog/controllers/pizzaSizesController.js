// // src/services/catalog/controllers/pizzaSizesController.js
// const fs = require('fs').promises;
// const path = require('path');
// const logger = require('../../../utils/logger');

// // Caminho para o arquivo de dados
// const PIZZA_SIZES_FILE = path.join(__dirname, '../../../data/pizzaSizes.json');

// // Garantir que o diretório e arquivo existam
// const initializeDataFile = async () => {
//   try {
//     // Verificar se o diretório existe
//     const dataDir = path.dirname(PIZZA_SIZES_FILE);
//     try {
//       await fs.access(dataDir);
//     } catch (error) {
//       // Se não existir, cria o diretório
//       await fs.mkdir(dataDir, { recursive: true });
//     }
    
//     // Verificar se o arquivo existe
//     try {
//       await fs.access(PIZZA_SIZES_FILE);
//     } catch (error) {
//       // Se não existir, cria o arquivo com dados iniciais
//       const initialData = {
//         sizes: [
//           { id: '1', name: 'Broto 4 fatias', price: 25.90 },
//           { id: '2', name: 'Pequena (6 fatias)', price: 34.90 },
//           { id: '3', name: 'Média (8 fatias)', price: 44.90 },
//           { id: '4', name: 'Grande (10 fatias)', price: 54.90 },
//           { id: '5', name: 'GG (12 fatias)', price: 64.90 }
//         ]
//       };
      
//       await fs.writeFile(PIZZA_SIZES_FILE, JSON.stringify(initialData, null, 2), 'utf8');
//     }
//   } catch (error) {
//     logger.error('Erro ao inicializar arquivo de tamanhos de pizza:', error);
//     throw error;
//   }
// };

// // Inicializa o arquivo na carga do módulo
// initializeDataFile().catch(console.error);

// // Controlador para tamanhos de pizza
// const pizzaSizesController = {
//   // Obter todos os tamanhos
//   getAllSizes: async (req, res) => {
//     try {
//       await initializeDataFile();
      
//       const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
//       const { sizes } = JSON.parse(data);
      
//       res.json(sizes);
//     } catch (error) {
//       logger.error('Erro ao buscar tamanhos de pizza:', error);
//       res.status(500).json({ error: 'Erro ao buscar tamanhos de pizza' });
//     }
//   },
  
//   // Obter um tamanho específico
//   getSizeById: async (req, res) => {
//     try {
//       const { id } = req.params;
      
//       const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
//       const { sizes } = JSON.parse(data);
      
//       const size = sizes.find(size => size.id === id);
      
//       if (!size) {
//         return res.status(404).json({ error: 'Tamanho não encontrado' });
//       }
      
//       res.json(size);
//     } catch (error) {
//       logger.error('Erro ao buscar tamanho de pizza:', error);
//       res.status(500).json({ error: 'Erro ao buscar tamanho de pizza' });
//     }
//   },
  
//   // Criar um novo tamanho
//   createSize: async (req, res) => {
//     try {
//       const { name, price } = req.body;
      
//       // Validação simples
//       if (!name || typeof price !== 'number') {
//         return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
//       }
      
//       const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
//       const jsonData = JSON.parse(data);
      
//       // Gerar ID único
//       const id = Date.now().toString();
      
//       const newSize = {
//         id,
//         name,
//         price
//       };
      
//       jsonData.sizes.push(newSize);
      
//       await fs.writeFile(PIZZA_SIZES_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
//       res.status(201).json(newSize);
//     } catch (error) {
//       logger.error('Erro ao criar tamanho de pizza:', error);
//       res.status(500).json({ error: 'Erro ao criar tamanho de pizza' });
//     }
//   },
  
//   // Atualizar um tamanho existente
//   updateSize: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { name, price } = req.body;
      
//       // Validação simples
//       if (!name || typeof price !== 'number') {
//         return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
//       }
      
//       const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
//       const jsonData = JSON.parse(data);
      
//       const sizeIndex = jsonData.sizes.findIndex(size => size.id === id);
      
//       if (sizeIndex === -1) {
//         return res.status(404).json({ error: 'Tamanho não encontrado' });
//       }
      
//       // Atualizar o tamanho
//       jsonData.sizes[sizeIndex] = {
//         ...jsonData.sizes[sizeIndex],
//         name,
//         price
//       };
      
//       await fs.writeFile(PIZZA_SIZES_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
//       res.json(jsonData.sizes[sizeIndex]);
//     } catch (error) {
//       logger.error('Erro ao atualizar tamanho de pizza:', error);
//       res.status(500).json({ error: 'Erro ao atualizar tamanho de pizza' });
//     }
//   },
  
//   // Excluir um tamanho
//   deleteSize: async (req, res) => {
//     try {
//       const { id } = req.params;
      
//       const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
//       const jsonData = JSON.parse(data);
      
//       const sizeIndex = jsonData.sizes.findIndex(size => size.id === id);
      
//       if (sizeIndex === -1) {
//         return res.status(404).json({ error: 'Tamanho não encontrado' });
//       }
      
//       // Remover o tamanho
//       jsonData.sizes.splice(sizeIndex, 1);
      
//       await fs.writeFile(PIZZA_SIZES_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
//       res.json({ success: true, message: 'Tamanho removido com sucesso' });
//     } catch (error) {
//       logger.error('Erro ao excluir tamanho de pizza:', error);
//       res.status(500).json({ error: 'Erro ao excluir tamanho de pizza' });
//     }
//   }
// };

// module.exports = pizzaSizesController;
// src/services/catalog/controllers/pizzaSizesController.js - Versão Corrigida
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../../utils/logger');

// Caminho para o arquivo de dados
const PIZZA_SIZES_FILE = path.join(__dirname, '../../../data/pizzaSizes.json');

// Garantir que o diretório e arquivo existam
const initializeDataFile = async () => {
  try {
    // Verificar se o diretório existe
    const dataDir = path.dirname(PIZZA_SIZES_FILE);
    try {
      await fs.access(dataDir);
    } catch (error) {
      // Se não existir, cria o diretório
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Verificar se o arquivo existe
    try {
      await fs.access(PIZZA_SIZES_FILE);
    } catch (error) {
      // Se não existir, cria o arquivo com dados iniciais
      const initialData = {
        sizes: [
          { id: '1', name: 'Broto', slices: 4 },
          { id: '2', name: 'Pequena', slices: 6 },
          { id: '3', name: 'Média', slices: 8 },
          { id: '4', name: 'Grande', slices: 10 },
          { id: '5', name: 'GG', slices: 12 }
        ]
      };
      
      await fs.writeFile(PIZZA_SIZES_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    }
  } catch (error) {
    logger.error('Erro ao inicializar arquivo de tamanhos de pizza:', error);
    throw error;
  }
};

// Inicializa o arquivo na carga do módulo
initializeDataFile().catch(console.error);

// Controlador para tamanhos de pizza
const pizzaSizesController = {
  // Obter todos os tamanhos
  getAllSizes: async (req, res) => {
    try {
      await initializeDataFile();
      
      const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
      const { sizes } = JSON.parse(data);
      
      res.json(sizes);
    } catch (error) {
      logger.error('Erro ao buscar tamanhos de pizza:', error);
      res.status(500).json({ error: 'Erro ao buscar tamanhos de pizza' });
    }
  },
  
  // Obter um tamanho específico
  getSizeById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
      const { sizes } = JSON.parse(data);
      
      const size = sizes.find(size => size.id === id);
      
      if (!size) {
        return res.status(404).json({ error: 'Tamanho não encontrado' });
      }
      
      res.json(size);
    } catch (error) {
      logger.error('Erro ao buscar tamanho de pizza:', error);
      res.status(500).json({ error: 'Erro ao buscar tamanho de pizza' });
    }
  },
  
  // Criar um novo tamanho
  createSize: async (req, res) => {
    try {
      const { name, slices } = req.body;
      
      // Validação simples
      if (!name || typeof slices !== 'number') {
        return res.status(400).json({ error: 'Nome e número de fatias são obrigatórios' });
      }
      
      const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      // Gerar ID único
      const id = Date.now().toString();
      
      const newSize = {
        id,
        name,
        slices
      };
      
      jsonData.sizes.push(newSize);
      
      await fs.writeFile(PIZZA_SIZES_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.status(201).json(newSize);
    } catch (error) {
      logger.error('Erro ao criar tamanho de pizza:', error);
      res.status(500).json({ error: 'Erro ao criar tamanho de pizza' });
    }
  },
  
  // Atualizar um tamanho existente
  updateSize: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, slices } = req.body;
      
      // Validação simples
      if (!name || typeof slices !== 'number') {
        return res.status(400).json({ error: 'Nome e número de fatias são obrigatórios' });
      }
      
      const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      const sizeIndex = jsonData.sizes.findIndex(size => size.id === id);
      
      if (sizeIndex === -1) {
        return res.status(404).json({ error: 'Tamanho não encontrado' });
      }
      
      // Atualizar o tamanho
      jsonData.sizes[sizeIndex] = {
        ...jsonData.sizes[sizeIndex],
        name,
        slices
      };
      
      await fs.writeFile(PIZZA_SIZES_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.json(jsonData.sizes[sizeIndex]);
    } catch (error) {
      logger.error('Erro ao atualizar tamanho de pizza:', error);
      res.status(500).json({ error: 'Erro ao atualizar tamanho de pizza' });
    }
  },
  
  // Excluir um tamanho
  deleteSize: async (req, res) => {
    try {
      const { id } = req.params;
      
      const data = await fs.readFile(PIZZA_SIZES_FILE, 'utf8');
      const jsonData = JSON.parse(data);
      
      const sizeIndex = jsonData.sizes.findIndex(size => size.id === id);
      
      if (sizeIndex === -1) {
        return res.status(404).json({ error: 'Tamanho não encontrado' });
      }
      
      // Remover o tamanho
      jsonData.sizes.splice(sizeIndex, 1);
      
      await fs.writeFile(PIZZA_SIZES_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
      
      res.json({ success: true, message: 'Tamanho removido com sucesso' });
    } catch (error) {
      logger.error('Erro ao excluir tamanho de pizza:', error);
      res.status(500).json({ error: 'Erro ao excluir tamanho de pizza' });
    }
  }
};

module.exports = pizzaSizesController;