// admin-client/src/components/KitchenDisplay.js
import React, { useState, useEffect } from 'react';
import { orderStatusColors, statusLabels } from './StatusBadge';

function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos

  // Função para buscar pedidos confirmados
  const fetchConfirmedOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filtra apenas pedidos confirmados, em preparo e em entrega
      // Os pedidos só sairão do display quando forem concluídos ou cancelados
      const kitchenOrders = data.orders ? data.orders.filter(
        order => order.status === 'confirmed' || 
                order.status === 'preparing' || 
                order.status === 'delivering'
      ) : [];
      
      // Ordena do mais antigo para o mais recente
      kitchenOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setOrders(kitchenOrders);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar pedidos confirmados:', error);
      setError('Falha ao carregar pedidos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar pedidos inicialmente e configurar timer de atualização
  useEffect(() => {
    fetchConfirmedOrders();
    
    // Configurar atualização periódica
    const intervalId = setInterval(fetchConfirmedOrders, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Função para atualizar o status de um pedido
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar status: ${response.status}`);
      }
      
      // Atualize apenas o status do pedido localmente, sem removê-lo
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido. Por favor, tente novamente.');
    }
  };

  // Componente de ordem individual para a cozinha
  const KitchenOrderCard = ({ order }) => {
    // Calcula o tempo desde a criação do pedido
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const minutesElapsed = Math.floor((now - orderTime) / (1000 * 60));
    
    // Determinar os botões e cores com base no status
    const renderActionButton = () => {
      switch(order.status) {
        case 'confirmed':
          return (
            <button 
              onClick={() => handleUpdateStatus(order.id, 'preparing')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Iniciar Preparo
            </button>
          );
        case 'preparing':
          return (
            <button 
              onClick={() => handleUpdateStatus(order.id, 'delivering')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
            >
              Pronto p/ Entrega
            </button>
          );
        case 'delivering':
          return (
            <button 
              onClick={() => handleUpdateStatus(order.id, 'completed')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
            >
              Finalizar Pedido
            </button>
          );
        default:
          return null;
      }
    };
    
    return (
      <div className={`bg-white rounded-lg shadow-lg p-4 mb-6 ${
        order.status === 'confirmed' ? 'border-l-4 border-yellow-500' :
        order.status === 'preparing' ? 'border-l-4 border-blue-500' :
        'border-l-4 border-green-500'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center">
              <h3 className="text-xl font-bold">{order.id}</h3>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${orderStatusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Cliente:</span> {order.customer}
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Tempo:</span> {minutesElapsed} min
            </p>
          </div>
          <div>
            {renderActionButton()}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3 mt-3">
          <h4 className="font-semibold mb-2">Itens:</h4>
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <div className="flex items-center">
                  <span className="bg-gray-200 text-gray-800 w-8 h-8 rounded-full flex items-center justify-center mr-2 font-bold">
                    {item.quantity}
                  </span>
                  <span className="font-medium">{item.flavor}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {order.notes && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm font-medium text-yellow-800">Observações:</p>
            <p className="text-sm text-yellow-700">{order.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Display de Pedidos para Cozinha</h2>
        <div className="flex items-center">
          <label htmlFor="refresh-interval" className="mr-2 text-sm">
            Atualizar a cada:
          </label>
          <select
            id="refresh-interval"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="border rounded p-1"
          >
            <option value={10}>10 seg</option>
            <option value={30}>30 seg</option>
            <option value={60}>1 min</option>
            <option value={300}>5 min</option>
          </select>
          <button
            onClick={fetchConfirmedOrders}
            className="ml-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
            title="Atualizar agora"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      {isLoading && orders.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando pedidos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-500">Não há pedidos a serem preparados no momento.</p>
          <p className="text-gray-400 mt-2">Novos pedidos aparecerão automaticamente aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <KitchenOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
      
      {/* Modo para Full Screen */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
              elem.requestFullscreen().catch(err => {
                alert(`Erro ao entrar em modo de tela cheia: ${err.message}`);
              });
            } else {
              document.exitFullscreen();
            }
          }}
          className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full"
          title="Tela Cheia"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default KitchenDisplay;