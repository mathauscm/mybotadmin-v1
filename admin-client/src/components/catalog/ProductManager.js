// // Parte da atualização para src/components/catalog/ProductManager.js

// import React, { useState, useEffect } from 'react';
// import ProductForm from './ProductForm'; // Novo componente que criamos

// function ProductManager({ onBack }) {
//   const [products, setProducts] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categories, setCategories] = useState([]);
//   const [pizzaSizes, setPizzaSizes] = useState([]);
  
//   // Estado para o formulário de produto
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
  
//   // Buscar catálogo de produtos e categorias
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         setIsLoading(true);
        
//         // Buscar produtos
//         const productResponse = await fetch('/api/catalog');
        
//         if (!productResponse.ok) {
//           throw new Error('Falha ao buscar catálogo');
//         }
        
//         const productData = await productResponse.json();
//         setProducts(productData || []);
        
//         // Buscar categorias
//         const categoryResponse = await fetch('/api/categories');
        
//         if (categoryResponse.ok) {
//           const categoryData = await categoryResponse.json();
//           setCategories(categoryData || []);
//         }
        
//         // Buscar tamanhos de pizza
//         const sizesResponse = await fetch('/api/pizza-sizes');
        
//         if (sizesResponse.ok) {
//           const sizesData = await sizesResponse.json();
//           setPizzaSizes(sizesData || []);
//         }
        
//         setError(null);
//       } catch (err) {
//         console.error('Erro ao buscar dados:', err);
//         setError('Falha ao carregar produtos. Por favor, tente novamente.');
//       } finally {
//         setIsLoading(false);
//       }
//     }
    
//     fetchData();
//   }, []);
  
//   // Filtrar produtos
//   const filteredProducts = products.filter(product => {
//     const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
//     const matchesSearch = searchTerm === '' || 
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
//     return matchesCategory && matchesSearch;
//   });
  
//   // Adicionar ou atualizar produto
//   const handleSubmit = async (productData) => {
//     try {
//       let url = '/api/catalog';
//       let method = 'POST';
      
//       // Se estiver editando, use PUT
//       if (editingProduct) {
//         url = `/api/catalog/${editingProduct.id}`;
//         method = 'PUT';
//       }
      
//       const response = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(productData)
//       });
      
//       if (!response.ok) {
//         throw new Error('Falha ao salvar produto');
//       }
      
//       const savedProduct = await response.json();
      
//       // Atualiza a lista de produtos
//       if (editingProduct) {
//         setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
//       } else {
//         setProducts([...products, savedProduct]);
//       }
      
//       // Limpa o formulário
//       setEditingProduct(null);
//       setIsFormOpen(false);
      
//     } catch (err) {
//       console.error('Erro ao salvar produto:', err);
//       alert('Erro ao salvar produto. Tente novamente.');
//     }
//   };
  
//   // Remover produto
//   const handleDeleteProduct = async (productId) => {
//     if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
//       return;
//     }
    
//     try {
//       const response = await fetch(`/api/catalog/${productId}`, {
//         method: 'DELETE'
//       });
      
//       if (!response.ok) {
//         throw new Error('Falha ao excluir produto');
//       }
      
//       // Atualiza a lista removendo o produto
//       setProducts(products.filter(p => p.id !== productId));
      
//     } catch (err) {
//       console.error('Erro ao excluir produto:', err);
//       alert('Erro ao excluir produto. Tente novamente.');
//     }
//   };
  
//   // Editar produto
//   const handleEditProduct = (product) => {
//     setEditingProduct(product);
//     setIsFormOpen(true);
    
//     // Rolar para o topo da página
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };
  
//   // Atualizar disponibilidade rapidamente
//   const handleToggleAvailability = async (product) => {
//     try {
//       const updatedProduct = { ...product, available: !product.available };
      
//       const response = await fetch(`/api/catalog/${product.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(updatedProduct)
//       });
      
//       if (!response.ok) {
//         throw new Error('Falha ao atualizar disponibilidade');
//       }
      
//       const savedProduct = await response.json();
      
//       // Atualiza a lista de produtos
//       setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
      
//     } catch (err) {
//       console.error('Erro ao atualizar disponibilidade:', err);
//       alert('Erro ao atualizar disponibilidade. Tente novamente.');
//     }
//   };
  
//   // Formatar exibição do tipo de produto
//   const formatProductType = (type) => {
//     const types = {
//       'standard': 'Padrão',
//       'pizza': 'Pizza',
//       'hamburger': 'Hambúrguer'
//     };
//     return types[type] || 'Padrão';
//   };
  
//   // Formatar exibição do preço (considerando pizzas)
//   const formatPrice = (product) => {
//     // Se o produto for do tipo pizza e tiver preços por tamanho
//     if (product.productType === 'pizza' && product.sizesPrices && product.sizesPrices.length > 0) {
//       // Encontrar o menor e o maior preço
//       const prices = product.sizesPrices
//         .map(sp => {
//           // Garantir que price seja tratado como número
//           if (typeof sp.price === 'string') return parseFloat(sp.price);
//           return sp.price;
//         })
//         .filter(p => !isNaN(p));
      
//       if (prices.length === 0) return 'A partir de R$ 0,00';
      
//       const minPrice = Math.min(...prices);
//       const maxPrice = Math.max(...prices);
      
//       if (minPrice === maxPrice) {
//         return `R$ ${minPrice.toFixed(2)}`;
//       }
      
//       return `A partir de R$ ${minPrice.toFixed(2)}`;
//     }
    
//     // Para outros tipos de produto, garante que o preço seja número
//     let price = 0;
    
//     if (product.price !== undefined && product.price !== null) {
//       if (typeof product.price === 'number') {
//         price = product.price;
//       } else if (typeof product.price === 'string') {
//         price = parseFloat(product.price);
//         if (isNaN(price)) price = 0;
//       }
//     }
    
//     return `R$ ${price.toFixed(2)}`;
//   };
  
//   // Componente de card para visualização rápida dos produtos
//   const ProductCard = ({ product }) => {
//     return (
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         {product.image && (
//           <div className="h-48 w-full overflow-hidden">
//             <img 
//               src={product.image} 
//               alt={product.name} 
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = "https://via.placeholder.com/300x200?text=Imagem+não+disponível";
//               }} 
//             />
//           </div>
//         )}
//         <div className="p-4">
//           <div className="flex justify-between items-start">
//             <div>
//               <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
//               <span className={`px-2 py-1 text-xs rounded-full ${
//                 product.available 
//                   ? 'bg-green-100 text-green-800' 
//                   : 'bg-red-100 text-red-800'
//               }`}>
//                 {product.available ? 'Disponível' : 'Indisponível'}
//               </span>
//             </div>
//             <div className="text-right">
//               <p className="text-gray-500 text-xs mb-1">{formatProductType(product.productType)}</p>
//               <p className="font-bold text-lg">{formatPrice(product)}</p>
//             </div>
//           </div>
          
//           <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
          
//           {product.productType === 'pizza' && product.sizesPrices && product.sizesPrices.length > 0 && (
//             <div className="mt-2">
//               <p className="text-xs text-gray-500 mb-1">Tamanhos disponíveis:</p>
//               <div className="flex flex-wrap gap-1">
//                 {product.sizesPrices.map(size => (
//                   <span key={size.sizeId} className="inline-block px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded">
//                     {size.sizeName}: R$ {parseFloat(size.price).toFixed(2)}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           <div className="mt-4 flex justify-end space-x-2">
//             <button
//               onClick={() => handleEditProduct(product)}
//               className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
//             >
//               Editar
//             </button>
//             <button
//               onClick={() => handleDeleteProduct(product.id)}
//               className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
//             >
//               Excluir
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (isLoading) {
//     return <div className="text-center py-8">Carregando produtos...</div>;
//   }
  
//   return (
//     <div>
//       <div className="flex flex-col md:flex-row justify-between items-start mb-6">
//         <div>
//           <p className="text-gray-600 mt-1">Gerencie os produtos disponíveis na loja</p>
//         </div>
//         <button 
//           onClick={() => setIsFormOpen(!isFormOpen)} 
//           className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium mt-2 md:mt-0"
//         >
//           {isFormOpen ? 'Cancelar' : 'Adicionar Produto'}
//         </button>
//       </div>
      
//       {/* Formulário de produto usando nosso novo componente */}
//       {isFormOpen && (
//         <div className="bg-white rounded-lg shadow p-6 mb-6">
//           <h3 className="text-lg font-semibold mb-4">
//             {editingProduct ? 'Editar Produto' : 'Novo Produto'}
//           </h3>
//           <ProductForm 
//             initialData={editingProduct} 
//             onSubmit={handleSubmit} 
//             onCancel={() => {
//               setIsFormOpen(false);
//               setEditingProduct(null);
//             }}
//             isEditing={!!editingProduct}
//           />
//         </div>
//       )}
      
//       {/* Filtros e busca */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
//         <div className="flex flex-wrap space-x-2 w-full md:w-auto overflow-x-auto pb-2">
//           <button 
//             onClick={() => setCategoryFilter('all')}
//             className={`px-3 py-1 rounded ${categoryFilter === 'all' 
//               ? 'bg-blue-500 text-white' 
//               : 'bg-gray-200 hover:bg-gray-300'}`}
//           >
//             Todos
//           </button>
          
//           {categories.map(category => (
//             <button 
//               key={category.id || category.slug}
//               onClick={() => setCategoryFilter(category.id || category.slug)}
//               className={`px-3 py-1 rounded whitespace-nowrap ${
//                 categoryFilter === (category.id || category.slug)
//                   ? 'bg-blue-500 text-white' 
//                   : 'bg-gray-200 hover:bg-gray-300'
//               }`}
//             >
//               {category.name}
//             </button>
//           ))}
//         </div>
//         <div className="w-full md:w-64">
//           <input
//             type="text"
//             placeholder="Buscar produto..."
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
      
//       {/* Grade de produtos */}
//       {filteredProducts.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow p-6 text-center">
//           <p className="text-gray-500">
//             {searchTerm || categoryFilter !== 'all'
//               ? 'Nenhum produto encontrado com os filtros selecionados.'
//               : 'Nenhum produto encontrado no catálogo.'}
//           </p>
//         </div>
//       )}
      
//       {/* Exibição de contagem */}
//       <div className="mt-4 text-gray-500 text-sm">
//         Exibindo {filteredProducts.length} de {products.length} produtos.
//       </div>
//     </div>
//   );
// }

// export default ProductManager;
// admin-client/src/components/catalog/ProductManager.js
import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import ProductCard from './components/ProductCard'; // Importação do componente ProductCard

function ProductManager({ onBack }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Estado para o formulário de produto
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Buscar catálogo de produtos e categorias
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Buscar produtos
        const productResponse = await fetch('/api/catalog');
        
        if (!productResponse.ok) {
          throw new Error('Falha ao buscar catálogo');
        }
        
        const productData = await productResponse.json();
        setProducts(productData || []);
        
        // Buscar categorias
        const categoryResponse = await fetch('/api/categories');
        
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setCategories(categoryData || []);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Falha ao carregar produtos. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });
  
  // Adicionar ou atualizar produto
  const handleSubmit = async (productData) => {
    try {
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
      setEditingProduct(null);
      setIsFormOpen(false);
      
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
    setIsFormOpen(true);
    
    // Rolar para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando produtos...</div>;
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <p className="text-gray-600 mt-1">Gerencie os produtos disponíveis na loja</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium mt-2 md:mt-0"
        >
          {isFormOpen ? 'Cancelar' : 'Adicionar Produto'}
        </button>
      </div>
      
      {/* Formulário de produto usando nosso novo componente */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <ProductForm 
            initialData={editingProduct} 
            onSubmit={handleSubmit} 
            onCancel={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
            isEditing={!!editingProduct}
          />
        </div>
      )}
      
      {/* Filtros e busca */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex flex-wrap space-x-2 w-full md:w-auto overflow-x-auto pb-2">
          <button 
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded ${categoryFilter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Todos
          </button>
          
          {categories.map(category => (
            <button 
              key={category.id || category.slug}
              onClick={() => setCategoryFilter(category.id || category.slug)}
              className={`px-3 py-1 rounded whitespace-nowrap ${
                categoryFilter === (category.id || category.slug)
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar produto..."
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
      
      {/* Grade de produtos */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={handleEditProduct} 
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all'
              ? 'Nenhum produto encontrado com os filtros selecionados.'
              : 'Nenhum produto encontrado no catálogo.'}
          </p>
        </div>
      )}
      
      {/* Exibição de contagem */}
      <div className="mt-4 text-gray-500 text-sm">
        Exibindo {filteredProducts.length} de {products.length} produtos.
      </div>
    </div>
  );
}

export default ProductManager;