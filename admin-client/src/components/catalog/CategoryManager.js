// // admin-client/src/components/catalog/CategoryManager.js
// import React, { useState, useEffect } from 'react';

// function CategoryManager({ onBack }) {
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   // Estado para o formulário de categoria
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [newCategory, setNewCategory] = useState({
//     name: '',
//     slug: '',
//     description: '',
//     order: 0,
//     active: true
//   });
  
//   // Simula a inicialização com categorias padrão se a API falhar
//   const defaultCategories = [
//     { id: '1', name: 'Tradicional', slug: 'tradicional', description: 'Produtos tradicionais da loja', order: 1, active: true },
//     { id: '2', name: 'Especial', slug: 'especial', description: 'Produtos especiais com sabores diferenciados', order: 2, active: true },
//     { id: '3', name: 'Vegano', slug: 'vegano', description: 'Produtos veganos sem ingredientes de origem animal', order: 3, active: true },
//     { id: '4', name: 'Sem Glúten', slug: 'sem-gluten', description: 'Produtos sem glúten para intolerantes', order: 4, active: true }
//   ];
  
//   // Buscar categorias
//   useEffect(() => {
//     async function fetchCategories() {
//       try {
//         setIsLoading(true);
//         const response = await fetch('/api/categories');
        
//         if (!response.ok) {
//           // Se o endpoint não existir, use as categorias padrão
//           setCategories(defaultCategories);
//           console.warn('Endpoint de categorias não disponível, usando dados padrão');
//           setError(null);
//           return;
//         }
        
//         const data = await response.json();
//         setCategories(data || []);
//         setError(null);
//       } catch (err) {
//         console.error('Erro ao buscar categorias:', err);
//         // Em caso de erro, usa as categorias padrão
//         setCategories(defaultCategories);
//         setError('Falha ao carregar categorias. Usando dados padrão.');
//       } finally {
//         setIsLoading(false);
//       }
//     }
    
//     fetchCategories();
//   }, []);
  
//   // Filtrar categorias por nome
//   const filteredCategories = categories.filter(category => 
//     searchTerm === '' || 
//     category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
//   );
  
//   // Manipulador para mudanças no formulário
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setNewCategory(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };
  
//   // Auto-gerar slug a partir do nome
//   const handleNameChange = (e) => {
//     const name = e.target.value;
//     setNewCategory(prev => ({
//       ...prev,
//       name,
//       slug: name.toLowerCase()
//         .normalize('NFD')
//         .replace(/[\u0300-\u036f]/g, '')
//         .replace(/[^\w\s-]/g, '')
//         .replace(/\s+/g, '-')
//     }));
//   };
  
//   // Adicionar ou atualizar categoria
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       // Em um app real, isso seria uma chamada à API
//       // Aqui estamos simulando localmente
//       const categoryData = {
//         ...newCategory
//       };
      
//       if (editingCategory) {
//         // Atualizar categoria existente
//         const updatedCategory = {
//           ...editingCategory,
//           ...categoryData
//         };
        
//         setCategories(prev => prev.map(cat => 
//           cat.id === editingCategory.id ? updatedCategory : cat
//         ));
//       } else {
//         // Adicionar nova categoria
//         const newCategoryWithId = {
//           ...categoryData,
//           id: `new-${Date.now()}`,
//           order: categories.length + 1
//         };
        
//         setCategories(prev => [...prev, newCategoryWithId]);
//       }
      
//       // Limpa o formulário
//       resetForm();
      
//     } catch (err) {
//       console.error('Erro ao salvar categoria:', err);
//       alert('Erro ao salvar categoria. Tente novamente.');
//     }
//   };
  
//   // Remover categoria
//   const handleDeleteCategory = (categoryId) => {
//     if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
//       return;
//     }
    
//     try {
//       // Em um app real, isso seria uma chamada à API
//       // Aqui estamos simulando localmente
//       setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
//     } catch (err) {
//       console.error('Erro ao excluir categoria:', err);
//       alert('Erro ao excluir categoria. Tente novamente.');
//     }
//   };
  
//   // Editar categoria
//   const handleEditCategory = (category) => {
//     setEditingCategory(category);
//     setNewCategory({
//       name: category.name,
//       slug: category.slug,
//       description: category.description || '',
//       order: category.order || 0,
//       active: category.active !== false
//     });
//     setIsFormOpen(true);
//   };
  
//   // Resetar formulário
//   const resetForm = () => {
//     setNewCategory({
//       name: '',
//       slug: '',
//       description: '',
//       order: 0,
//       active: true
//     });
//     setEditingCategory(null);
//     setIsFormOpen(false);
//   };
  
//   // Atualizar visibilidade rapidamente
//   const handleToggleActive = (category) => {
//     const updatedCategory = {
//       ...category,
//       active: !category.active
//     };
    
//     setCategories(prev => prev.map(cat => 
//       cat.id === category.id ? updatedCategory : cat
//     ));
//   };
  
//   // Ordenar categorias (mover para cima)
//   const handleMoveUp = (index) => {
//     if (index === 0) return;
    
//     const newCategories = [...categories];
//     const temp = newCategories[index];
//     newCategories[index] = newCategories[index - 1];
//     newCategories[index - 1] = temp;
    
//     // Atualizar a ordem
//     newCategories.forEach((cat, idx) => {
//       cat.order = idx + 1;
//     });
    
//     setCategories(newCategories);
//   };
  
//   // Ordenar categorias (mover para baixo)
//   const handleMoveDown = (index) => {
//     if (index === categories.length - 1) return;
    
//     const newCategories = [...categories];
//     const temp = newCategories[index];
//     newCategories[index] = newCategories[index + 1];
//     newCategories[index + 1] = temp;
    
//     // Atualizar a ordem
//     newCategories.forEach((cat, idx) => {
//       cat.order = idx + 1;
//     });
    
//     setCategories(newCategories);
//   };
  
//   // Formatar slug para exibição
//   const formatSlug = (slug) => {
//     return slug ? `/${slug}` : '';
//   };
  
//   return (
//     <div>
//       <div className="flex flex-col md:flex-row justify-between items-start mb-6">
//         <div>
//           <p className="text-gray-600 mt-1">Organize suas categorias de produtos</p>
//         </div>
//         <button 
//           onClick={() => setIsFormOpen(!isFormOpen)} 
//           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium mt-2 md:mt-0"
//         >
//           {isFormOpen ? 'Cancelar' : 'Adicionar Categoria'}
//         </button>
//       </div>
      
//       {/* Estatísticas */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-gray-500 text-sm mb-1">Total de Categorias</h3>
//           <p className="text-2xl font-bold">{categories.length}</p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-gray-500 text-sm mb-1">Categorias Ativas</h3>
//           <p className="text-2xl font-bold text-green-600">
//             {categories.filter(cat => cat.active !== false).length}
//           </p>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-gray-500 text-sm mb-1">Categorias Inativas</h3>
//           <p className="text-2xl font-bold text-red-600">
//             {categories.filter(cat => cat.active === false).length}
//           </p>
//         </div>
//       </div>
      
//       {/* Formulário de categoria */}
//       {isFormOpen && (
//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <h3 className="text-lg font-semibold mb-4">
//             {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
//           </h3>
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nome da Categoria
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={newCategory.name}
//                   onChange={handleNameChange}
//                   className="w-full p-2 border border-gray-300 rounded"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Slug (URL)
//                 </label>
//                 <div className="flex">
//                   <span className="inline-flex items-center px-3 bg-gray-100 text-gray-500 rounded-l border border-r-0 border-gray-300">
//                     /categoria
//                   </span>
//                   <input
//                     type="text"
//                     name="slug"
//                     value={newCategory.slug}
//                     onChange={handleInputChange}
//                     className="w-full p-2 border border-gray-300 rounded-r"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>
            
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Descrição
//               </label>
//               <textarea
//                 name="description"
//                 value={newCategory.description}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border border-gray-300 rounded"
//                 rows="2"
//               />
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Ordem de Exibição
//                 </label>
//                 <input
//                   type="number"
//                   name="order"
//                   value={newCategory.order}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border border-gray-300 rounded"
//                   min="0"
//                 />
//               </div>
//               <div className="flex items-center mt-6">
//                 <input
//                   type="checkbox"
//                   name="active"
//                   checked={newCategory.active}
//                   onChange={handleInputChange}
//                   className="h-4 w-4 text-blue-600"
//                 />
//                 <label className="ml-2 text-sm text-gray-700">
//                   Categoria Ativa
//                 </label>
//               </div>
//             </div>
            
//             <div className="flex justify-end space-x-2">
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
//               >
//                 Cancelar
//               </button>
//               <button
//                 type="submit"
//                 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//               >
//                 {editingCategory ? 'Atualizar' : 'Adicionar'}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
      
//       {/* Busca */}
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-semibold">Lista de Categorias</h3>
//         <div className="w-64">
//           <input
//             type="text"
//             placeholder="Buscar categoria..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full p-2 border border-gray-300 rounded"
//           />
//         </div>
//       </div>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
      
//       {isLoading ? (
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-2 text-gray-600">Carregando categorias...</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Ordem
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Categoria
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Slug
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Ações
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredCategories.length > 0 ? (
//                 filteredCategories.map((category, index) => (
//                   <tr key={category.id}>
//                     <td className="px-4 py-4 whitespace-nowrap">
//                       <div className="flex items-center space-x-1">
//                         <span className="text-sm text-gray-900 font-medium w-5 text-center">
//                           {category.order || index + 1}
//                         </span>
//                         <div>
//                           <button 
//                             onClick={() => handleMoveUp(index)}
//                             disabled={index === 0}
//                             className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
//                             </svg>
//                           </button>
//                           <button 
//                             onClick={() => handleMoveDown(index)}
//                             disabled={index === filteredCategories.length - 1}
//                             className={`p-1 rounded ${index === filteredCategories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </button>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-medium text-gray-900">{category.name}</div>
//                       <div className="text-sm text-gray-500">{category.description}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-500 font-mono">
//                         {formatSlug(category.slug)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <button 
//                         onClick={() => handleToggleActive(category)}
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
//                           category.active !== false
//                             ? 'bg-green-100 text-green-800 hover:bg-green-200' 
//                             : 'bg-red-100 text-red-800 hover:bg-red-200'
//                         }`}
//                       >
//                         {category.active !== false ? 'Ativa' : 'Inativa'}
//                       </button>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <button
//                         onClick={() => handleEditCategory(category)}
//                         className="text-indigo-600 hover:text-indigo-900 mr-4"
//                       >
//                         Editar
//                       </button>
//                       <button
//                         onClick={() => handleDeleteCategory(category.id)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         Excluir
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
//                     {searchTerm
//                       ? 'Nenhuma categoria encontrada com os termos pesquisados.'
//                       : 'Nenhuma categoria encontrada.'}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CategoryManager;
// admin-client/src/components/catalog/CategoryManager.js
import React, { useState, useEffect } from 'react';

function CategoryManager({ onBack }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para o formulário de categoria
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    order: 0,
    active: true
  });
  
  // Simula a inicialização com categorias padrão se a API falhar
  const defaultCategories = [
    { id: '1', name: 'Tradicional', slug: 'tradicional', description: 'Produtos tradicionais da loja', order: 1, active: true },
    { id: '2', name: 'Especial', slug: 'especial', description: 'Produtos especiais com sabores diferenciados', order: 2, active: true },
    { id: '3', name: 'Vegano', slug: 'vegano', description: 'Produtos veganos sem ingredientes de origem animal', order: 3, active: true },
    { id: '4', name: 'Sem Glúten', slug: 'sem-gluten', description: 'Produtos sem glúten para intolerantes', order: 4, active: true }
  ];
  
  // Buscar categorias
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          // Se o endpoint não existir, use as categorias padrão
          setCategories(defaultCategories);
          console.warn('Endpoint de categorias não disponível, usando dados padrão');
          setError(null);
          return;
        }
        
        const data = await response.json();
        // Ordenar categorias por ordem
        const sortedData = Array.isArray(data) ? 
          [...data].sort((a, b) => (a.order || 0) - (b.order || 0)) : 
          data;
        setCategories(sortedData || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        // Em caso de erro, usa as categorias padrão
        setCategories(defaultCategories);
        setError('Falha ao carregar categorias. Usando dados padrão.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCategories();
  }, []);
  
  // Filtrar categorias por nome
  const filteredCategories = categories.filter(category => 
    searchTerm === '' || 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Manipulador para mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Auto-gerar slug a partir do nome
  const handleNameChange = (e) => {
    const name = e.target.value;
    setNewCategory(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    }));
  };
  
  // Adicionar ou atualizar categoria
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...newCategory
      };
      
      let response;
      
      if (editingCategory) {
        // Atualizar categoria existente via API
        response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
          // Fallback para atualização local se a API falhar
          const updatedCategory = {
            ...editingCategory,
            ...categoryData
          };
          
          setCategories(prev => prev.map(cat => 
            cat.id === editingCategory.id ? updatedCategory : cat
          ));
        } else {
          // Se a API responder corretamente, use os dados retornados
          const updatedData = await response.json();
          setCategories(prev => prev.map(cat => 
            cat.id === editingCategory.id ? updatedData : cat
          ));
        }
      } else {
        // Adicionar nova categoria via API
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
          // Fallback para adição local se a API falhar
          const newCategoryWithId = {
            ...categoryData,
            id: `new-${Date.now()}`,
            order: categories.length + 1
          };
          
          setCategories(prev => [...prev, newCategoryWithId]);
        } else {
          // Se a API responder corretamente, use os dados retornados
          const newData = await response.json();
          setCategories(prev => [...prev, newData]);
        }
      }
      
      // Limpa o formulário
      resetForm();
      
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
      alert('Erro ao salvar categoria. Tente novamente.');
    }
  };
  
  // Remover categoria
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }
    
    try {
      // Tentar excluir via API
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      // Independente do resultado da API, atualiza a UI removendo a categoria
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      alert('Erro ao excluir categoria. Tente novamente.');
    }
  };
  
  // Editar categoria
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      order: category.order || 0,
      active: category.active !== false
    });
    setIsFormOpen(true);
    
    // Rolar para o formulário
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Resetar formulário
  const resetForm = () => {
    setNewCategory({
      name: '',
      slug: '',
      description: '',
      order: 0,
      active: true
    });
    setEditingCategory(null);
    setIsFormOpen(false);
  };
  
  // Atualizar visibilidade rapidamente
  const handleToggleActive = async (category) => {
    const updatedCategory = {
      ...category,
      active: !category.active
    };
    
    try {
      // Tenta atualizar via API
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedCategory)
      });
      
      // Atualiza a UI independentemente da resposta da API
      setCategories(prev => prev.map(cat => 
        cat.id === category.id ? updatedCategory : cat
      ));
      
    } catch (err) {
      console.error('Erro ao atualizar visibilidade da categoria:', err);
      // Mesmo com erro, atualizamos a UI para feedback imediato ao usuário
      setCategories(prev => prev.map(cat => 
        cat.id === category.id ? updatedCategory : cat
      ));
    }
  };
  
  // Ordenar categorias (mover para cima)
  const handleMoveUp = async (index) => {
    if (index === 0) return;
    
    try {
      const newCategories = [...categories];
      
      // Troca a posição das categorias
      const temp = newCategories[index];
      newCategories[index] = newCategories[index - 1];
      newCategories[index - 1] = temp;
      
      // Atualiza a ordem
      newCategories.forEach((cat, idx) => {
        cat.order = idx + 1;
      });
      
      // Atualiza a UI imediatamente
      setCategories(newCategories);
      
      // Tenta enviar a nova ordem para a API
      try {
        const orderedData = newCategories.map(cat => ({
          id: cat.id,
          order: cat.order
        }));
        
        await fetch('/api/categories/order', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderedData)
        });
      } catch (apiError) {
        console.error('Erro ao atualizar ordem na API:', apiError);
        // UI já foi atualizada, então não precisamos fazer nada aqui
      }
      
    } catch (err) {
      console.error('Erro ao reordenar categorias:', err);
      alert('Erro ao reordenar categorias. Por favor, tente novamente.');
    }
  };
  
  // Ordenar categorias (mover para baixo)
  const handleMoveDown = async (index) => {
    if (index === categories.length - 1) return;
    
    try {
      const newCategories = [...categories];
      
      // Troca a posição das categorias
      const temp = newCategories[index];
      newCategories[index] = newCategories[index + 1];
      newCategories[index + 1] = temp;
      
      // Atualiza a ordem
      newCategories.forEach((cat, idx) => {
        cat.order = idx + 1;
      });
      
      // Atualiza a UI imediatamente
      setCategories(newCategories);
      
      // Tenta enviar a nova ordem para a API
      try {
        const orderedData = newCategories.map(cat => ({
          id: cat.id,
          order: cat.order
        }));
        
        await fetch('/api/categories/order', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderedData)
        });
      } catch (apiError) {
        console.error('Erro ao atualizar ordem na API:', apiError);
        // UI já foi atualizada, então não precisamos fazer nada aqui
      }
      
    } catch (err) {
      console.error('Erro ao reordenar categorias:', err);
      alert('Erro ao reordenar categorias. Por favor, tente novamente.');
    }
  };
  
  // Formatar slug para exibição
  const formatSlug = (slug) => {
    return slug ? `/${slug}` : '';
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <p className="text-gray-600 mt-1">Organize suas categorias de produtos</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium mt-2 md:mt-0"
        >
          {isFormOpen ? 'Cancelar' : 'Adicionar Categoria'}
        </button>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm mb-1">Total de Categorias</h3>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm mb-1">Categorias Ativas</h3>
          <p className="text-2xl font-bold text-green-600">
            {categories.filter(cat => cat.active !== false).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm mb-1">Categorias Inativas</h3>
          <p className="text-2xl font-bold text-red-600">
            {categories.filter(cat => cat.active === false).length}
          </p>
        </div>
      </div>
      
      {/* Formulário de categoria */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleNameChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 text-gray-500 rounded-l border border-r-0 border-gray-300">
                    /categoria
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={newCategory.slug}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-r"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                value={newCategory.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="2"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  name="order"
                  value={newCategory.order}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  min="0"
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  name="active"
                  checked={newCategory.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Categoria Ativa
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
                {editingCategory ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Busca */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Lista de Categorias</h3>
        <div className="w-64">
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando categorias...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
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
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  <tr key={category.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-900 font-medium w-5 text-center">
                          {category.order || index + 1}
                        </span>
                        <div>
                          <button 
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleMoveDown(index)}
                            disabled={index === filteredCategories.length - 1}
                            className={`p-1 rounded ${index === filteredCategories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {formatSlug(category.slug)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleToggleActive(category)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                          category.active !== false
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {category.active !== false ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm
                      ? 'Nenhuma categoria encontrada com os termos pesquisados.'
                      : 'Nenhuma categoria encontrada.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CategoryManager;