import React from 'react';

function Navigation({ activeTab, onTabChange, pendingCount }) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4">
          <button 
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-4 text-sm font-medium ${activeTab === 'dashboard' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => onTabChange('orders')}
            className={`px-3 py-4 text-sm font-medium ${activeTab === 'orders' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'} relative`}
          >
            Pedidos
            {pendingCount > 0 && (
              <span className="absolute top-2 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => onTabChange('kitchen')}
            className={`px-3 py-4 text-sm font-medium ${activeTab === 'kitchen' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Display de Pedidos
          </button>
          <button 
            onClick={() => onTabChange('conversations')}
            className={`px-3 py-4 text-sm font-medium ${activeTab === 'conversations' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Conversas
          </button>
          <button 
            onClick={() => onTabChange('catalog')}
            className={`px-3 py-4 text-sm font-medium ${activeTab === 'catalog' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Catálogo
          </button>
          <button 
            onClick={() => onTabChange('customers')}
            className={`px-3 py-4 text-sm font-medium ${activeTab === 'customers' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Clientes
          </button>
          <button 
            onClick={() => onTabChange('marketing')}
            className={`px-3 py-4 text-sm font-medium ${activeTab === 'marketing' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Promoções
          </button>
          <button 
            onClick={() => onTabChange('reports')}
            className={`px-3 py-4 text-sm font-medium ${activeTab === 'reports' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Relatórios
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;