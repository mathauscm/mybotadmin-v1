// // admin-client/src/components/CatalogManager.js
// import React, { useState, useEffect } from 'react';
// import ProductManager from './catalog/ProductManager';
// import CategoryManager from './catalog/CategoryManager';
// import ProductOptions from './catalog/ProductOptions';

// function CatalogManager() {
//   const [activeSection, setActiveSection] = useState(null);
  
//   // Voltar à visualização principal
//   const handleBackToMain = () => {
//     setActiveSection(null);
//   };
  
//   // Renderizar a seção ativa
//   const renderActiveSection = () => {
//     switch (activeSection) {
//       case 'products':
//         return <ProductManager onBack={handleBackToMain} />;
//       case 'categories':
//         return <CategoryManager onBack={handleBackToMain} />;
//       case 'options':
//         return <ProductOptions onBack={handleBackToMain} />;
//       default:
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Card para Produtos */}
//             <div 
//               onClick={() => setActiveSection('products')}
//               className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
//             >
//               <div className="flex items-start mb-4">
//                 <div className="p-3 bg-blue-100 rounded-lg mr-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">Produtos</h3>
//                   <p className="text-gray-600 mt-1">Gerenciar produtos, pizzas, hamburgers e outros itens</p>
//                 </div>
//               </div>
//             </div>
            
//             {/* Card para Categorias */}
//             <div 
//               onClick={() => setActiveSection('categories')}
//               className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
//             >
//               <div className="flex items-start mb-4">
//                 <div className="p-3 bg-green-100 rounded-lg mr-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">Categorias</h3>
//                   <p className="text-gray-600 mt-1">Organizar categorias e sua ordem no menu</p>
//                 </div>
//               </div>
//             </div>
            
//             {/* Card para Opções de Produtos */}
//             <div 
//               onClick={() => setActiveSection('options')}
//               className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
//             >
//               <div className="flex items-start mb-4">
//                 <div className="p-3 bg-purple-100 rounded-lg mr-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">Opções de Produtos</h3>
//                   <p className="text-gray-600 mt-1">Configurar tamanhos de pizza, bordas e adicionais</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//     }
//   };
  
//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="mb-6">
//         {activeSection ? (
//           <div className="flex items-center mb-6">
//             <button 
//               onClick={handleBackToMain}
//               className="mr-4 text-gray-500 hover:text-gray-700"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//             </button>
//             <h2 className="text-2xl font-bold">
//               {activeSection === 'products' ? 'Gerenciar Produtos' : 
//                activeSection === 'categories' ? 'Gerenciar Categorias' : 
//                'Opções de Produtos'}
//             </h2>
//           </div>
//         ) : (
//           <h2 className="text-2xl font-bold mb-6">Catálogo</h2>
//         )}
//       </div>
      
//       {renderActiveSection()}
//     </div>
//   );
// }

// export default CatalogManager;
// admin-client/src/components/CatalogManager.js
import React, { useState, useEffect } from 'react';
import ProductManager from './catalog/ProductManager';
import CategoryManager from './catalog/CategoryManager';
import ProductOptions from './catalog/ProductOptions';

function CatalogManager() {
  const [activeSection, setActiveSection] = useState(null);
  const [statsData, setStatsData] = useState({
    totalProducts: 0,
    categories: 0,
    availableProducts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Carrega os dados estatísticos
  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        
        // Buscar produtos para estatísticas
        const productsResponse = await fetch('/api/catalog');
        const products = await productsResponse.json();
        
        // Buscar categorias
        const categoriesResponse = await fetch('/api/categories');
        const categories = await categoriesResponse.json();
        
        // Calcula estatísticas
        const totalProducts = products?.length || 0;
        const availableProducts = products?.filter(p => p.available)?.length || 0;
        const totalCategories = categories?.length || 0;
        
        setStatsData({
          totalProducts,
          categories: totalCategories,
          availableProducts
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStats();
  }, []);
  
  // Voltar à visualização principal
  const handleBackToMain = () => {
    setActiveSection(null);
  };
  
  // Renderizar a seção ativa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'products':
        return <ProductManager onBack={handleBackToMain} />;
      case 'categories':
        return <CategoryManager onBack={handleBackToMain} />;
      case 'options':
        return <ProductOptions onBack={handleBackToMain} />;
      default:
        return (
          <>
            {/* Estatísticas principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-500 text-sm">Total de Produtos</p>
                    <h3 className="text-2xl font-bold">{isLoading ? '...' : statsData.totalProducts}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-500 text-sm">Categorias</p>
                    <h3 className="text-2xl font-bold">{isLoading ? '...' : statsData.categories}</h3>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-500 text-sm">Produtos Disponíveis</p>
                    <h3 className="text-2xl font-bold">{isLoading ? '...' : statsData.availableProducts}</h3>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cards de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card para Produtos */}
              <div 
                onClick={() => setActiveSection('products')}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-start mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Produtos</h3>
                    <p className="text-gray-600 mt-1">Gerenciar produtos, pizzas, hamburgers e outros itens</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                    Gerenciar Produtos →
                  </button>
                </div>
              </div>
              
              {/* Card para Categorias */}
              <div 
                onClick={() => setActiveSection('categories')}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-start mb-4">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Categorias</h3>
                    <p className="text-gray-600 mt-1">Organizar categorias e sua ordem no menu</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button className="text-green-500 hover:text-green-700 text-sm font-medium">
                    Gerenciar Categorias →
                  </button>
                </div>
              </div>
              
              {/* Card para Opções de Produtos */}
              <div 
                onClick={() => setActiveSection('options')}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-start mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Opções de Produtos</h3>
                    <p className="text-gray-600 mt-1">Configurar tamanhos de pizza, bordas e adicionais</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <button className="text-purple-500 hover:text-purple-700 text-sm font-medium">
                    Gerenciar Opções →
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        {activeSection ? (
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBackToMain}
              className="mr-4 text-gray-500 hover:text-gray-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </button>
            <h2 className="text-2xl font-bold">
              {activeSection === 'products' ? 'Gerenciar Produtos' : 
               activeSection === 'categories' ? 'Gerenciar Categorias' : 
               'Opções de Produtos'}
            </h2>
          </div>
        ) : (
          <h2 className="text-2xl font-bold mb-6">Gerenciar Catálogo</h2>
        )}
      </div>
      
      {renderActiveSection()}
    </div>
  );
}

export default CatalogManager;