// admin-client/src/components/Catalog.js
import React, { useState, useEffect } from 'react';

function Catalog() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para o formulário de produto
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'tradicional',
    available: true
  });
  
  // Estado para edição de produto
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Buscar catálogo de produtos
  useEffect(() => {
    async function fetchCatalog() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/catalog');
        
        if (!response.ok) {
          throw new Error('Falha ao buscar catálogo');
        }
        
        const data = await response.json();
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar catálogo:', err);
        setError('Falha ao carregar produtos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCatalog();
  }, []);
  
  // Manipulador para mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Adicionar ou atualizar produto
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price)
      };
      
      let url = '/api/catalog';
      let method = 'POST';
      
      // Se estiver editando, use PUT
      if (editingProduct) {
        url = `/api/catalog/${editingProduct.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar produto');
      }
      
      const savedProduct = await response.json();
      
      // Atualiza a lista de produtos
      if (editingProduct) {
        setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
      } else {
        setProducts([...products, savedProduct]);
      }
      
      // Limpa o formulário
      resetForm();
      
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      alert('Erro ao salvar produto. Tente novamente.');
    }
  };
  
  // Remover produto
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/catalog/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir produto');
      }
      
      // Atualiza a lista removendo o produto
      setProducts(products.filter(p => p.id !== productId));
      
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro ao excluir produto. Tente novamente.');
    }
  };
  
  // Editar produto
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category || 'tradicional',
      available: product.available
    });
    setIsFormOpen(true);
  };
  
  // Resetar formulário
  const resetForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: 'tradicional',
      available: true
    });
    setEditingProduct(null);
    setIsFormOpen(false);
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Carregando produtos...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Catálogo de Produtos</h2>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          {isFormOpen ? 'Cancelar' : 'Adicionar Produto'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="tradicional">Tradicional</option>
                  <option value="especial">Especial</option>
                  <option value="vegano">Vegano</option>
                  <option value="sem-gluten">Sem Glúten</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="available"
                  checked={newProduct.available}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Disponível para venda
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editingProduct ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length > 0 ? (
              products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">R$ {product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.category === 'tradicional' ? 'Tradicional' :
                       product.category === 'especial' ? 'Especial' :
                       product.category === 'vegano' ? 'Vegano' :
                       product.category === 'sem-gluten' ? 'Sem Glúten' :
                       product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${product.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Nenhum produto encontrado no catálogo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Catalog;