// import React, { useState, useEffect, useMemo } from 'react';
// import Dashboard from './components/Dashboard';
// import OrdersList from './components/OrdersList';
// import Conversations from './components/Conversations';
// import Catalog from './components/Catalog';
// import Customers from './components/Customers';
// import Marketing from './components/Marketing';
// import Reports from './components/Reports';
// import Navigation from './components/Navigation';

// function App() {
//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [dashboardStats, setDashboardStats] = useState({
//     totalOrders: 0,
//     pendingOrders: 0,
//     inProgressOrders: 0,
//     revenue: 0
//   });
//   const [isLoadingStats, setIsLoadingStats] = useState(true);
//   const [pendingCount, setPendingCount] = useState(0);
//   const [lastPendingCount, setLastPendingCount] = useState(0);
  
//   // Inicializar o som de notificação
//   const notificationSound = useMemo(() => new Audio('/notification.mp3'), []);

//   // Função para alterar a aba ativa
//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//   };

//   // Carregar estatísticas para o dashboard e atualizar contagem de pedidos pendentes
//   useEffect(() => {
//     async function fetchStats() {
//       try {
//         const response = await fetch('/api/orders');
        
//         if (!response.ok) {
//           throw new Error('Falha ao buscar dados');
//         }
        
//         const data = await response.json();
        
//         if (!data || !data.orders) {
//           return;
//         }
        
//         const orders = data.orders;
        
//         // Calcular estatísticas
//         const totalOrders = orders.length;
//         const pendingOrders = orders.filter(order => order.status === 'pending').length;
//         const inProgressOrders = orders.filter(order => 
//           order.status === 'confirmed' || 
//           order.status === 'preparing' || 
//           order.status === 'delivering'
//         ).length;
        
//         // Calcular faturamento total (apenas pedidos concluídos)
//         const revenue = orders
//           .filter(order => order.status === 'completed')
//           .reduce((sum, order) => sum + (order.total || 0), 0);
        
//         setDashboardStats({
//           totalOrders,
//           pendingOrders,
//           inProgressOrders,
//           revenue
//         });
        
//         // Atualizar contagem de pedidos pendentes para notificação
//         setPendingCount(pendingOrders);
        
//         // Reproduzir som se há novos pedidos pendentes
//         if (pendingOrders > lastPendingCount) {
//           try {
//             await notificationSound.play();
//           } catch (error) {
//             console.error('Erro ao reproduzir som:', error);
//           }
//         }
        
//         setLastPendingCount(pendingOrders);
//       } catch (error) {
//         console.error('Erro ao buscar estatísticas:', error);
//       } finally {
//         setIsLoadingStats(false);
//       }
//     }
    
//     fetchStats();
    
//     // Atualizar a cada 5 segundos para tempo real
//     const intervalId = setInterval(fetchStats, 5000);
    
//     return () => clearInterval(intervalId);
//   }, [lastPendingCount, notificationSound]);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <h1 className="text-xl font-bold text-gray-900">MyBot Admin</h1>
//             <div>
//               <button 
//                 onClick={() => window.location.href = 'http://localhost:3030/api-docs/'} 
//                 className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
//               >
//                 API Docs
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>
      
//       <Navigation 
//         activeTab={activeTab} 
//         onTabChange={handleTabChange}
//         pendingCount={pendingCount}
//       />
      
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {activeTab === 'dashboard' && (
//           <>
//             <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
//             <Dashboard 
//               dashboardStats={dashboardStats}
//               isLoadingStats={isLoadingStats}
//             />
//           </>
//         )}
        
//         {activeTab === 'orders' && (
//           <>
//             <h2 className="text-2xl font-bold mb-6">Pedidos</h2>
//             <OrdersList />
//           </>
//         )}
        
//         {activeTab === 'conversations' && (
//           <Conversations />
//         )}
        
//         {activeTab === 'catalog' && (
//           <Catalog />
//         )}
        
//         {activeTab === 'customers' && (
//           <Customers />
//         )}

//         {activeTab === 'marketing' && (
//           <Marketing />
//         )}
        
//         {activeTab === 'reports' && (
//           <Reports />
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import OrdersList from './components/OrdersList';
import Conversations from './components/Conversations';
import CatalogManager from './components/CatalogManager'; // Atualizado para usar o novo componente
import Customers from './components/Customers';
import Marketing from './components/Marketing';
import Reports from './components/Reports';
import Navigation from './components/Navigation';
import KitchenDisplay from './components/KitchenDisplay';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    revenue: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastPendingCount, setLastPendingCount] = useState(0);
  
  // Inicializar o som de notificação
  const notificationSound = useMemo(() => new Audio('/notification.mp3'), []);

  // Função para alterar a aba ativa
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Carregar estatísticas para o dashboard e atualizar contagem de pedidos pendentes
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/orders');
        
        if (!response.ok) {
          throw new Error('Falha ao buscar dados');
        }
        
        const data = await response.json();
        
        if (!data || !data.orders) {
          return;
        }
        
        const orders = data.orders;
        
        // Calcular estatísticas
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const inProgressOrders = orders.filter(order => 
          order.status === 'confirmed' || 
          order.status === 'preparing' || 
          order.status === 'delivering'
        ).length;
        
        // Calcular faturamento total (apenas pedidos concluídos)
        const revenue = orders
          .filter(order => order.status === 'completed')
          .reduce((sum, order) => sum + (order.total || 0), 0);
        
        setDashboardStats({
          totalOrders,
          pendingOrders,
          inProgressOrders,
          revenue
        });
        
        // Atualizar contagem de pedidos pendentes para notificação
        setPendingCount(pendingOrders);
        
        // Reproduzir som se há novos pedidos pendentes
        if (pendingOrders > lastPendingCount) {
          try {
            await notificationSound.play();
          } catch (error) {
            console.error('Erro ao reproduzir som:', error);
          }
        }
        
        setLastPendingCount(pendingOrders);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }
    
    fetchStats();
    
    // Atualizar a cada 5 segundos para tempo real
    const intervalId = setInterval(fetchStats, 5000);
    
    return () => clearInterval(intervalId);
  }, [lastPendingCount, notificationSound]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">MyBot Admin🤖</h1>
            <div>
              <button 
                onClick={() => window.location.href = 'http://localhost:3030/api-docs/'} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                API Docs
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        pendingCount={pendingCount}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <Dashboard 
              dashboardStats={dashboardStats}
              isLoadingStats={isLoadingStats}
            />
          </>
        )}
        
        {activeTab === 'orders' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Pedidos</h2>
            <OrdersList />
          </>
        )}
        
        {activeTab === 'kitchen' && (
          <KitchenDisplay />
        )}
        
        {activeTab === 'conversations' && (
          <Conversations />
        )}
        
        {activeTab === 'catalog' && (
          <CatalogManager /> // Mudança aqui: agora usando CatalogManager em vez de Catalog
        )}
        
        {activeTab === 'customers' && (
          <Customers />
        )}

        {activeTab === 'marketing' && (
          <Marketing />
        )}
        
        {activeTab === 'reports' && (
          <Reports />
        )}
      </main>
    </div>
  );
}

export default App;