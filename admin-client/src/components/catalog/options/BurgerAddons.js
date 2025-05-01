// // admin-client/src/components/catalog/options/BurgerAddons.js
// import React, { useState, useEffect } from 'react';

// function BurgerAddons() {
//   const [addons, setAddons] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Estado para o formulário de novo adicional
//   const [newAddon, setNewAddon] = useState({
//     name: '',
//     description: '',
//     price: '',
//     maxQuantity: '15',
//     imageUrl: ''
//   });
  
//   // Estado para edição
//   const [editMode, setEditMode] = useState(false);
//   const [editingId, setEditingId] = useState(null);
  
//   // Função mock para simular a API - em produção, substituir por chamadas reais à API
//   const fetchAddons = async () => {
//     try {
//       // Simulação de dados - em produção, substituir pela chamada à API real
//       const mockAddons = [
//         { 
//           id: '1', 
//           name: 'Adicional Maionese Tradicional', 
//           description: 'Maionese Tradicional',
//           price: 2.97, 
//           maxQuantity: 15,
//           imageUrl: '' 
//         },
//         { 
//           id: '2', 
//           name: 'Adicional Maionese Picante Com Sriracha', 
//           description: 'Maionese Picante Com Sriracha',
//           price: 2.97, 
//           maxQuantity: 15,
//           imageUrl: '' 
//         },
//         { 
//           id: '3', 
//           name: 'Adicional Molho Barbecue', 
//           description: 'Adicional Molho Barbecue',
//           price: 3.00, 
//           maxQuantity: 15,
//           imageUrl: '' 
//         },
//         { 
//           id: '4', 
//           name: 'Bacon Extra', 
//           description: 'Porção extra de bacon crocante',
//           price: 4.50, 
//           maxQuantity: 5,
//           imageUrl: '' 
//         },
//         { 
//           id: '5', 
//           name: 'Queijo Cheddar Extra', 
//           description: 'Fatia extra de queijo cheddar',
//           price: 3.50, 
//           maxQuantity: 3,
//           imageUrl: '' 
//         }
//       ];
      
//       // Simula tempo de carregamento
//       await new Promise(resolve => setTimeout(resolve, 300));
      
//       return mockAddons;
//     } catch (error) {
//       throw new Error('Erro ao buscar adicionais de hambúrguer');
//     }
//   };
  
//   // Carrega dados iniciais
//   useEffect(() => {
//     const loadAddons = async () => {
//       try {
//         setIsLoading(true);
//         const data = await fetchAddons();
//         setAddons(data);
//         setError(null);
//       } catch (err) {
//         setError('Falha ao carregar adicionais de hambúrguer. Por favor, tente novamente.');
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     loadAddons();
//   }, []);
  
//   // Manipuladores de formulário
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewAddon(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!newAddon.name || !newAddon.price) {
//       alert('Por favor, preencha os campos obrigatórios');
//       return;
//     }
    
//     if (editMode) {
//       // Atualiza um adicional existente
//       const updatedAddons = addons.map(addon => {
//         if (addon.id === editingId) {
//           return {
//             ...addon,
//             name: newAddon.name,
//             description: newAddon.description,
//             price: parseFloat(newAddon.price),
//             maxQuantity: parseInt(newAddon.maxQuantity, 10) || 15,
//             imageUrl: newAddon.imageUrl
//           };
//         }
//         return addon;
//       });
      
//       setAddons(updatedAddons);
//       setEditMode(false);
//       setEditingId(null);
//     } else {
//       // Cria um novo adicional
//       const newId = (addons.length + 1).toString();
//       const createdAddon = {
//         id: newId,
//         name: newAddon.name,
//         description: newAddon.description,
//         price: parseFloat(newAddon.price),
//         maxQuantity: parseInt(newAddon.maxQuantity, 10) || 15,
//         imageUrl: newAddon.imageUrl
//       };
      
//       setAddons([...addons, createdAddon]);
//     }
    
//     // Resetar o formulário
//     setNewAddon({
//       name: '',
//       description: '',
//       price: '',
//       maxQuantity: '15',
//       imageUrl: ''
//     });
//   };
  
//   const handleCancelEdit = () => {
//     setNewAddon({
//       name: '',
//       description: '',
//       price: '',
//       maxQuantity: '15',
//       imageUrl: ''
//     });
//     setEditMode(false);
//     setEditingId(null);
//   };
  
//   const handleDeleteAddon = (id) => {
//     if (window.confirm('Tem certeza que deseja excluir este adicional?')) {
//       // Em produção, substituir por uma chamada à API para deletar o adicional
//       setAddons(addons.filter(addon => addon.id !== id));
//     }
//   };
  
//   const handleEditAddon = (id) => {
//     const addonToEdit = addons.find(addon => addon.id === id);
//     if (addonToEdit) {
//       setNewAddon({
//         name: addonToEdit.name,
//         description: addonToEdit.description,
//         price: addonToEdit.price.toString(),
//         maxQuantity: addonToEdit.maxQuantity.toString(),
//         imageUrl: addonToEdit.imageUrl
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
//     return <div className="text-center py-8">Carregando adicionais de hambúrguer...</div>;
//   }
  
//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Adicionais de Hambúrguer</h2>
      
//       {/* Formulário para adicionar novo adicional */}
//       <div className="bg-white rounded-lg shadow p-6 mb-6">
//         <h3 className="text-lg font-medium mb-4">{editMode ? 'Editar Adicional' : 'Adicionar Novo Adicional'}</h3>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//               Nome do Adicional
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={newAddon.name}
//               onChange={handleInputChange}
//               placeholder="Ex: Bacon Extra"
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
//               value={newAddon.price}
//               onChange={handleInputChange}
//               placeholder="Ex: 4.50"
//               className="w-full p-2 border border-gray-300 rounded"
//               step="0.01"
//               min="0"
//               required
//             />
//           </div>
          
//           <div className="md:col-span-2">
//             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//               Descrição
//             </label>
//             <input
//               type="text"
//               id="description"
//               name="description"
//               value={newAddon.description}
//               onChange={handleInputChange}
//               placeholder="Ex: Porção extra de bacon crocante"
//               className="w-full p-2 border border-gray-300 rounded"
//             />
//           </div>
          
//           <div>
//             <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700 mb-1">
//               Quantidade Máxima
//             </label>
//             <input
//               type="number"
//               id="maxQuantity"
//               name="maxQuantity"
//               value={newAddon.maxQuantity}
//               onChange={handleInputChange}
//               placeholder="15"
//               className="w-full p-2 border border-gray-300 rounded"
//               min="1"
//             />
//           </div>
          
//           <div>
//             <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
//               URL da Imagem (opcional)
//             </label>
//             <input
//               type="text"
//               id="imageUrl"
//               name="imageUrl"
//               value={newAddon.imageUrl}
//               onChange={handleInputChange}
//               placeholder="https://exemplo.com/imagem.jpg"
//               className="w-full p-2 border border-gray-300 rounded"
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
      
//       {/* Lista de adicionais atuais */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="p-6 border-b border-gray-200">
//           <h3 className="text-lg font-medium">Adicionais Atuais</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   ADICIONAL
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   PREÇO (R$)
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   MAX.
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   AÇÕES
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {addons.length > 0 ? (
//                 addons.map((addon) => (
//                   <tr key={addon.id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         {addon.imageUrl && (
//                           <img
//                             src={addon.imageUrl}
//                             alt={addon.name}
//                             className="h-10 w-10 rounded-full mr-3"
//                             onError={(e) => {
//                               e.target.onerror = null;
//                               e.target.src = 'https://via.placeholder.com/40';
//                             }}
//                           />
//                         )}
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">{addon.name}</div>
//                           <div className="text-sm text-gray-500">{addon.description}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       R$ {addon.price.toFixed(2)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {addon.maxQuantity}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <button
//                         onClick={() => handleEditAddon(addon.id)}
//                         className="text-indigo-600 hover:text-indigo-900 mr-4"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                         </svg>
//                       </button>
//                       <button
//                         onClick={() => handleDeleteAddon(addon.id)}
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
//                   <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
//                     Nenhum adicional encontrado.
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

// export default BurgerAddons;
// admin-client/src/components/catalog/options/BurgerAddons.js
import React, { useState, useEffect } from 'react';

function BurgerAddons() {
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para o formulário de novo adicional
  const [newAddon, setNewAddon] = useState({
    name: '',
    description: '',
    price: '',
    maxQuantity: '15',
    imageUrl: ''
  });
  
  // Estado para edição
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Carregar adicionais de hambúrguer da API
  const fetchAddons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/burger-addons');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar adicionais: ${response.status}`);
      }
      
      const data = await response.json();
      setAddons(data);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar adicionais de hambúrguer. Por favor, tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carrega dados iniciais
  useEffect(() => {
    fetchAddons();
  }, []);
  
  // Manipuladores de formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddon(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newAddon.name || !newAddon.price) {
      alert('Por favor, preencha os campos obrigatórios');
      return;
    }
    
    try {
      const addonData = {
        name: newAddon.name,
        description: newAddon.description,
        price: parseFloat(newAddon.price),
        maxQuantity: parseInt(newAddon.maxQuantity, 10) || 15,
        imageUrl: newAddon.imageUrl
      };
      
      let response;
      
      if (editMode) {
        // Atualizar adicional existente
        response = await fetch(`/api/burger-addons/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(addonData)
        });
      } else {
        // Criar novo adicional
        response = await fetch('/api/burger-addons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(addonData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Erro ao salvar: ${response.status}`);
      }
      
      // Recarregar a lista de adicionais
      fetchAddons();
      
      // Resetar o formulário
      setNewAddon({
        name: '',
        description: '',
        price: '',
        maxQuantity: '15',
        imageUrl: ''
      });
      setEditMode(false);
      setEditingId(null);
      
    } catch (err) {
      console.error('Erro ao salvar adicional:', err);
      alert('Erro ao salvar adicional. Tente novamente.');
    }
  };
  
  const handleCancelEdit = () => {
    setNewAddon({
      name: '',
      description: '',
      price: '',
      maxQuantity: '15',
      imageUrl: ''
    });
    setEditMode(false);
    setEditingId(null);
  };
  
  const handleDeleteAddon = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este adicional?')) {
      try {
        const response = await fetch(`/api/burger-addons/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao excluir: ${response.status}`);
        }
        
        // Recarregar a lista de adicionais
        fetchAddons();
        
      } catch (err) {
        console.error('Erro ao excluir adicional:', err);
        alert('Erro ao excluir adicional. Tente novamente.');
      }
    }
  };
  
  const handleEditAddon = (id) => {
    const addonToEdit = addons.find(addon => addon.id === id);
    if (addonToEdit) {
      setNewAddon({
        name: addonToEdit.name,
        description: addonToEdit.description || '',
        price: addonToEdit.price.toString(),
        maxQuantity: addonToEdit.maxQuantity.toString(),
        imageUrl: addonToEdit.imageUrl || ''
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
    return <div className="text-center py-8">Carregando adicionais de hambúrguer...</div>;
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Adicionais de Hambúrguer</h2>
      
      {/* Formulário para adicionar novo adicional */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">{editMode ? 'Editar Adicional' : 'Adicionar Novo Adicional'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Adicional
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newAddon.name}
              onChange={handleInputChange}
              placeholder="Ex: Bacon Extra"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={newAddon.price}
              onChange={handleInputChange}
              placeholder="Ex: 4.50"
              className="w-full p-2 border border-gray-300 rounded"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={newAddon.description}
              onChange={handleInputChange}
              placeholder="Ex: Porção extra de bacon crocante"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade Máxima
            </label>
            <input
              type="number"
              id="maxQuantity"
              name="maxQuantity"
              value={newAddon.maxQuantity}
              onChange={handleInputChange}
              placeholder="15"
              className="w-full p-2 border border-gray-300 rounded"
              min="1"
            />
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem (opcional)
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={newAddon.imageUrl}
              onChange={handleInputChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full p-2 border border-gray-300 rounded"
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
      
      {/* Lista de adicionais atuais */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium">Adicionais Atuais</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ADICIONAL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PREÇO (R$)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MAX.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {addons.length > 0 ? (
                addons.map((addon) => (
                  <tr key={addon.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {addon.imageUrl && (
                          <img
                            src={addon.imageUrl}
                            alt={addon.name}
                            className="h-10 w-10 rounded-full mr-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{addon.name}</div>
                          <div className="text-sm text-gray-500">{addon.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {addon.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {addon.maxQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditAddon(addon.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAddon(addon.id)}
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
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum adicional encontrado.
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

export default BurgerAddons;