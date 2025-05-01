// admin-client/src/components/catalog/options/PizzaCrusts.js
import React, { useState, useEffect } from 'react';

function PizzaCrusts() {
  const [crusts, setCrusts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para o formulário de nova borda
  const [newCrust, setNewCrust] = useState({
    name: '',
    price: ''
  });
  
  // Estado para edição
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Carregar bordas de pizza da API
  const fetchCrusts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pizza-crusts');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar bordas: ${response.status}`);
      }
      
      const data = await response.json();
      setCrusts(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar bordas de pizza. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carrega dados iniciais
  useEffect(() => {
    fetchCrusts();
  }, []);
  
  // Manipuladores de formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCrust(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newCrust.name) {
      alert('Por favor, preencha o nome da borda');
      return;
    }
    
    try {
      const crustData = {
        name: newCrust.name,
        price: parseFloat(newCrust.price) || 0
      };
      
      let response;
      
      if (editMode) {
        // Atualizar borda existente
        response = await fetch(`/api/pizza-crusts/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(crustData)
        });
      } else {
        // Criar nova borda
        response = await fetch('/api/pizza-crusts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(crustData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Erro ao salvar: ${response.status}`);
      }
      
      // Recarregar a lista de bordas
      fetchCrusts();
      
      // Resetar o formulário
      setNewCrust({
        name: '',
        price: ''
      });
      setEditMode(false);
      setEditingId(null);
      
    } catch (err) {
      console.error('Erro ao salvar borda:', err);
      alert('Erro ao salvar borda. Tente novamente.');
    }
  };
  
  const handleCancelEdit = () => {
    setNewCrust({
      name: '',
      price: ''
    });
    setEditMode(false);
    setEditingId(null);
  };
  
  const handleDeleteCrust = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta borda?')) {
      try {
        const response = await fetch(`/api/pizza-crusts/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao excluir: ${response.status}`);
        }
        
        // Recarregar a lista de bordas
        fetchCrusts();
        
      } catch (err) {
        console.error('Erro ao excluir borda:', err);
        alert('Erro ao excluir borda. Tente novamente.');
      }
    }
  };
  
  const handleEditCrust = (id) => {
    const crustToEdit = crusts.find(crust => crust.id === id);
    if (crustToEdit) {
      setNewCrust({
        name: crustToEdit.name,
        price: crustToEdit.price.toString()
      });
      setEditingId(id);
      setEditMode(true);
      
      // Rolar para o formulário
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Carregando bordas de pizza...</div>;
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bordas de Pizza</h2>
      
      {/* Formulário para adicionar nova borda */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">{editMode ? 'Editar Borda' : 'Adicionar Nova Borda'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Borda
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newCrust.name}
              onChange={handleInputChange}
              placeholder="Ex: Borda com Catupiry"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Preço Adicional (R$)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={newCrust.price}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full p-2 border border-gray-300 rounded"
              step="0.01"
              min="0"
            />
          </div>
          <div className="md:col-span-2">
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
            >
              {editMode ? 'Salvar Alterações' : 'Adicionar'}
            </button>
            
            {editMode && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Lista de bordas atuais */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Bordas Atuais</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PREÇO (R$)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crusts.length > 0 ? (
                crusts.map((crust) => (
                  <tr key={crust.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {crust.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {crust.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCrust(crust.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCrust(crust.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhuma borda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PizzaCrusts;