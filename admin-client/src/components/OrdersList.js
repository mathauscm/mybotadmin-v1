// admin-client/src/components/OrdersList.js (versão atualizada)
import React, { useState, useEffect } from 'react';
import { orderStatusColors, statusLabels } from './StatusBadge';
import OrderItem from './OrderItem';
import OrderDetails from './OrderDetails';
import OrderStatusFilter from './OrderStatusFilter';
import { orderService } from '../services/apiService';
import { getApiUrl, getApiHeaders } from '../utils/apiConfig'; // Importação do utilitário

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [notificationSound] = useState(() => new Audio('/notification.mp3'));
  
  // Configuração de paginação
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Função para buscar pedidos pela primeira vez - usando o serviço apiService
  const fetchInitialOrders = async () => {
    try {
      setIsInitialLoading(true);
      
      const data = await orderService.getOrders(page, limit);
      
      // Verifica se temos dados de pedidos
      const ordersData = data.orders || [];
      setLastOrderCount(ordersData.length);
      setOrders(ordersData);
      
      // Atualiza informações de paginação
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
      }
      
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError('Falha ao carregar pedidos. Por favor, tente novamente.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Função para atualizar pedidos sem mostrar o indicador de carregamento principal
  const refreshOrders = async () => {
    if (isRefreshing) return; // Evita múltiplas requisições simultâneas
    
    try {
      setIsRefreshing(true);
      
      const data = await orderService.getOrders(page, limit);
      
      // Verifica se temos dados de pedidos
      const ordersData = data.orders || [];
      
      // Verificar se há novos pedidos pendentes
      const currentOrdersCount = ordersData.length;
      
      // Se há mais pedidos do que antes, reproduz o som
      if (currentOrdersCount > lastOrderCount) {
        setNewOrdersCount(currentOrdersCount - lastOrderCount);
        try {
          await notificationSound.play();
        } catch (audioError) {
          console.log('Erro ao reproduzir som:', audioError);
        }
      }
      
      setLastOrderCount(currentOrdersCount);
      setOrders(ordersData);
      
      // Atualiza informações de paginação
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (error) {
      // Silenciosamente registra o erro, mas não mostra para o usuário
      // durante atualizações em segundo plano para evitar confusão
      console.error('Erro ao atualizar pedidos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Carregar pedidos inicialmente
  useEffect(() => {
    fetchInitialOrders();
    
    // Configurar atualização periódica
    const intervalId = setInterval(refreshOrders, 30000); // Atualizar a cada 30 segundos
    
    return () => clearInterval(intervalId);
  }, [page]); // Recarrega quando a página muda

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      
      // Atualizar a lista de pedidos
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === orderId ? updatedOrder : order)
      );
      
      // Atualizar o pedido selecionado
      setSelectedOrder(updatedOrder);
      
      // Mostrar mensagem de sucesso
      alert(`Status do pedido atualizado para ${statusLabels[newStatus]}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido. Por favor, tente novamente.');
    }
  };

  // Função para alterar a página
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const matchesSearch = searchTerm 
      ? (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer && order.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.phone && order.phone.includes(searchTerm))
      : true;
    return matchesStatus && matchesSearch;
  });

  // Se houver novos pedidos, mostra uma mensagem
  const NewOrderAlert = () => {
    if (newOrdersCount > 0) {
      return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>
            <strong>{newOrdersCount} {newOrdersCount === 1 ? 'novo pedido' : 'novos pedidos'}</strong> recebido(s)!
          </span>
          <button 
            onClick={() => setNewOrdersCount(0)} 
            className="text-green-700 hover:text-green-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      );
    }
    return null;
  };

  // Componente de paginação
  const Pagination = () => {
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`mr-2 px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Anterior
        </button>
        <span className="px-3 py-1">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={`ml-2 px-3 py-1 rounded ${page === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          Próxima
        </button>
      </div>
    );
  };

  return (
    <div>
      <NewOrderAlert />
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por ID, cliente ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>
      
      <OrderStatusFilter
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={fetchInitialOrders}
            className="bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {isInitialLoading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Carregando pedidos...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
          {filteredOrders.map(order => (
            <OrderItem 
              key={order.id} 
              order={order} 
              onViewDetails={setSelectedOrder} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nenhum pedido encontrado com os filtros atuais.</p>
        </div>
      )}
      
      {/* Paginação */}
      {orders.length > 0 && <Pagination />}
      
      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      
      {/* Indicador sutil de atualização em segundo plano */}
      {isRefreshing && !isInitialLoading && orders.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          Atualizando...
        </div>
      )}
    </div>
  );
}

export default OrdersList;