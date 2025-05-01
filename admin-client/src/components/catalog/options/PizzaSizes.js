// admin-client/src/components/catalog/options/PizzaSizes.js
// import React, { useState, useEffect } from 'react';

// function PizzaSizes() {
//   const [sizes, setSizes] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Estado para o formulário de novo tamanho
//   const [newSize, setNewSize] = useState({
//     name: '',
//     price: ''
//   });
  
//   // Estado para edição
//   const [editMode, setEditMode] = useState(false);
//   const [editingId, setEditingId] = useState(null);
  
//   // Carregar tamanhos de pizza da API
//   const fetchSizes = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch('/api/pizza-sizes');
      
//       if (!response.ok) {
//         throw new Error(`Erro ao carregar tamanhos: ${response.status}`);
//       }
      
//       const data = await response.json();
//       setSizes(data);
//       setError(null);
//     } catch (err) {
//       setError('Falha ao carregar tamanhos de pizza. Por favor, tente novamente.');
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Carrega dados iniciais
//   useEffect(() => {
//     fetchSizes();
//   }, []);
  
//   // Manipuladores de formulário
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewSize(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!newSize.name || !newSize.price) {
//       alert('Por favor, preencha todos os campos');
//       return;
//     }
    
//     try {
//       const sizeData = {
//         name: newSize.name,
//         price: parseFloat(newSize.price)
//       };
      
//       let response;
      
//       if (editMode) {
//         // Atualizar tamanho existente
//         response = await fetch(`/api/pizza-sizes/${editingId}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(sizeData)
//         });
//       } else {
//         // Criar novo tamanho
//         response = await fetch('/api/pizza-sizes', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(sizeData)
//         });
//       }
      
//       if (!response.ok) {
//         throw new Error(`Erro ao salvar: ${response.status}`);
//       }
      
//       // Recarregar a lista de tamanhos
//       fetchSizes();
      
//       // Resetar o formulário
//       setNewSize({
//         name: '',
//         price: ''
//       });
//       setEditMode(false);
//       setEditingId(null);
      
//     } catch (err) {
//       console.error('Erro ao salvar tamanho:', err);
//       alert('Erro ao salvar tamanho. Tente novamente.');
//     }
//   };
  
//   const handleCancelEdit = () => {
//     setNewSize({
//       name: '',
//       price: ''
//     });
//     setEditMode(false);
//     setEditingId(null);
//   };
  
//   const handleDeleteSize = async (id) => {
//     if (window.confirm('Tem certeza que deseja excluir este tamanho?')) {
//       try {
//         const response = await fetch(`/api/pizza-sizes/${id}`, {
//           method: 'DELETE'
//         });
        
//         if (!response.ok) {
//           throw new Error(`Erro ao excluir: ${response.status}`);
//         }
        
//         // Recarregar a lista de tamanhos
//         fetchSizes();
        
//       } catch (err) {
//         console.error('Erro ao excluir tamanho:', err);
//         alert('Erro ao excluir tamanho. Tente novamente.');
//       }
//     }
//   };
  
//   const handleEditSize = (id) => {
//     const sizeToEdit = sizes.find(size => size.id === id);
//     if (sizeToEdit) {
//       setNewSize({
//         name: sizeToEdit.name,
//         price: sizeToEdit.price.toString()
//       });
//       setEditingId(id);
//       setEditMode(true);
      
//       // Rolar para o formulário
//       window.scrollTo({
//         top: 0,
//         behavior: 'smooth'
//       });
//     }
//   };
  
//   if (isLoading) {
//     return <div className="text-center py-8">Carregando tamanhos de pizza...</div>;
//   }
  
//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Tamanhos de Pizza</h2>
      
//       {/* Formulário para adicionar novo tamanho */}
//       <div className="bg-white rounded-lg shadow p-6 mb-6">
//         <h3 className="text-lg font-medium mb-4">{editMode ? 'Editar Tamanho' : 'Adicionar Novo Tamanho'}</h3>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//               Nome do Tamanho
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={newSize.name}
//               onChange={handleInputChange}
//               placeholder="Ex: Pequena (6 fatias)"
//               className="w-full p-2 border border-gray-300 rounded"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
//               Preço (R$)
//             </label>
//             <input
//               type="number"
//               id="price"
//               name="price"
//               value={newSize.price}
//               onChange={handleInputChange}
//               placeholder="Ex: 29.90"
//               className="w-full p-2 border border-gray-300 rounded"
//               step="0.01"
//               min="0"
//               required
//             />
//           </div>
//           <div className="md:col-span-2">
//             <button 
//               type="submit" 
//               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
//             >
//               {editMode ? 'Salvar Alterações' : 'Adicionar'}
//             </button>
            
//             {editMode && (
//               <button 
//                 type="button" 
//                 onClick={handleCancelEdit}
//                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
//               >
//                 Cancelar
//               </button>
//             )}
//           </div>
//         </form>
//       </div>
      
//       {/* Lista de tamanhos atuais */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="p-6 border-b border-gray-200">
//           <h3 className="text-lg font-medium">Tamanhos Atuais</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   NOME
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Preço (R$)
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   AÇÕES
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sizes.length > 0 ? (
//                 sizes.map((size) => (
//                   <tr key={size.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {size.name}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       R$ {size.price.toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <button
//                         onClick={() => handleEditSize(size.id)}
//                         className="text-indigo-600 hover:text-indigo-900 mr-4"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                         </svg>
//                       </button>
//                       <button
//                         onClick={() => handleDeleteSize(size.id)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                         </svg>
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
//                     Nenhum tamanho encontrado.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PizzaSizes;

// src/components/catalog/options/PizzaSizes.js - Versão Corrigida
import React, { useState, useEffect } from 'react';

function PizzaSizes() {
  const [sizes, setSizes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para o formulário de novo tamanho
  const [newSize, setNewSize] = useState({
    name: '',
    slices: ''  // Agora armazenamos apenas o nome e número de fatias, sem preço
  });
  
  // Estado para edição
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Carregar tamanhos de pizza da API
  const fetchSizes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pizza-sizes');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar tamanhos: ${response.status}`);
      }
      
      const data = await response.json();
      setSizes(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar tamanhos de pizza. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carrega dados iniciais
  useEffect(() => {
    fetchSizes();
  }, []);
  
  // Manipuladores de formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSize(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newSize.name || !newSize.slices) {
      alert('Por favor, preencha o nome e o número de fatias');
      return;
    }
    
    try {
      const sizeData = {
        name: newSize.name,
        slices: parseInt(newSize.slices) || 0
      };
      
      let response;
      
      if (editMode) {
        // Atualizar tamanho existente
        response = await fetch(`/api/pizza-sizes/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sizeData)
        });
      } else {
        // Criar novo tamanho
        response = await fetch('/api/pizza-sizes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sizeData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Erro ao salvar: ${response.status}`);
      }
      
      // Recarregar a lista de tamanhos
      fetchSizes();
      
      // Resetar o formulário
      setNewSize({
        name: '',
        slices: ''
      });
      setEditMode(false);
      setEditingId(null);
      
    } catch (err) {
      console.error('Erro ao salvar tamanho:', err);
      alert('Erro ao salvar tamanho. Tente novamente.');
    }
  };
  
  const handleCancelEdit = () => {
    setNewSize({
      name: '',
      slices: ''
    });
    setEditMode(false);
    setEditingId(null);
  };
  
  const handleDeleteSize = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este tamanho?')) {
      try {
        const response = await fetch(`/api/pizza-sizes/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao excluir: ${response.status}`);
        }
        
        // Recarregar a lista de tamanhos
        fetchSizes();
        
      } catch (err) {
        console.error('Erro ao excluir tamanho:', err);
        alert('Erro ao excluir tamanho. Tente novamente.');
      }
    }
  };
  
  const handleEditSize = (id) => {
    const sizeToEdit = sizes.find(size => size.id === id);
    if (sizeToEdit) {
      setNewSize({
        name: sizeToEdit.name,
        slices: sizeToEdit.slices?.toString() || ''
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
    return <div className="text-center py-8">Carregando tamanhos de pizza...</div>;
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tamanhos de Pizza</h2>
      <p className="mb-6 text-gray-600">
        Defina os tamanhos disponíveis para as pizzas. Os preços serão definidos individualmente para cada sabor no cadastro de produtos.
      </p>
      
      {/* Formulário para adicionar novo tamanho */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">{editMode ? 'Editar Tamanho' : 'Adicionar Novo Tamanho'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Tamanho
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newSize.name}
              onChange={handleInputChange}
              placeholder="Ex: Pequena (6 fatias)"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="slices" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Fatias
            </label>
            <input
              type="number"
              id="slices"
              name="slices"
              value={newSize.slices}
              onChange={handleInputChange}
              placeholder="Ex: 6"
              className="w-full p-2 border border-gray-300 rounded"
              min="1"
              required
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
      
      {/* Lista de tamanhos atuais */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Tamanhos Disponíveis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NOME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FATIAS
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sizes.length > 0 ? (
                sizes.map((size) => (
                  <tr key={size.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {size.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {size.slices}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditSize(size.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSize(size.id)}
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
                    Nenhum tamanho encontrado.
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

export default PizzaSizes;