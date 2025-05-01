import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar dados de pedidos
 * @param {Object} options Opções de configuração
 * @returns {Object} Retorna objeto com dados e funções de pedidos
 */
function useOrders(options = {}) {
  const { initialData = [], useMockData = true } = options;
  const [orders, setOrders] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchOrders() {
      if (useMockData) {
        // Use dados de exemplo em desenvolvimento
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/orders?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Falha ao buscar pedidos');
        }
        
        const data = await response.json();
        
        setOrders(data.orders);
        setTotalPages(data.totalPages || 1);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [page, limit, useMockData]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (useMockData) {
        // Simula atualização local para desenvolvimento
        const updatedOrders = orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
        return updatedOrders.find(order => order.id === orderId);
      }

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status');
      }

      const updatedOrder = await response.json();
      
      // Atualiza o pedido na lista local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );

      return updatedOrder;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    updateOrderStatus,
    setOrders
  };
}

export default useOrders;