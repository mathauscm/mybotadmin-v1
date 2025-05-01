// admin-client/src/components/Customers.js
import React, { useState, useEffect } from 'react';
import { getCustomers, getCustomerOrders, searchCustomers, getCustomerStats } from '../services/customerService';
import { exportToCSV, formatCustomerDataForExport } from '../utils/exportUtils';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    averagePurchaseValue: 0,
    totalRevenue: 0
  });

  // Buscar lista de clientes
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setIsLoading(true);
        
        // Obtém a lista de clientes usando o serviço
        const customersData = await getCustomers();
        setCustomers(customersData);
        
        // Obtém estatísticas dos clientes
        const statsData = await getCustomerStats();
        setStats(statsData);
        
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        setError('Falha ao carregar clientes. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCustomers();
  }, []);

  // Buscar pedidos de um cliente específico
  const fetchCustomerOrders = async (phone) => {
    try {
      setIsOrdersLoading(true);
      
      // Obtém os pedidos do cliente usando o serviço
      const ordersData = await getCustomerOrders(phone);
      setCustomerOrders(ordersData);
      
    } catch (err) {
      console.error('Erro ao buscar pedidos do cliente:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Ver detalhes do cliente
  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.phone);
  };

  // Filtrar clientes usando o serviço
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length > 0) {
        try {
          const results = await searchCustomers(searchTerm);
          setCustomers(results);
        } catch (error) {
          console.error('Erro ao buscar clientes:', error);
        }
      } else {
        // Se a busca estiver vazia, recarregar todos os clientes
        const allCustomers = await getCustomers();
        setCustomers(allCustomers);
      }
    };

    // Usando um debounce simples para evitar muitas requisições
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Formatar data para exibição
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Formatar valores monetários
  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2)}`;
  };

  // Formatar status do pedido
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'preparing': 'Em Preparo',
      'delivering': 'Em Entrega',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    
    return statusMap[status] || status;
  };

  // Envia mensagem para o cliente
  const handleSendMessage = async (phone) => {
    try {
      // Formulário simples para a mensagem
      const message = prompt('Digite a mensagem para o cliente:');
      
      if (!message) return;
      
      const response = await fetch('/api/bot/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, message })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('Mensagem enviada com sucesso!');
      } else {
        alert('Falha ao enviar mensagem. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clientes</h2>
        
        <button 
          onClick={() => {
            const exportData = formatCustomerDataForExport(customers);
            exportToCSV(exportData, 'lista_clientes');
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          disabled={isLoading || customers.length === 0}
        >
          Exportar Lista
        </button>
      </div>
      
      {/* Estatísticas de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-1">Total de Clientes</h3>
          <p className="text-3xl font-bold">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-1">Clientes Recorrentes</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.activeCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-1">Valor Médio por Cliente</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.averagePurchaseValue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-1">Faturamento Total</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de Clientes */}
        <div className="md:col-span-1">
          <h3 className="font-semibold text-lg mb-4">Lista de Clientes</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando clientes...</p>
            </div>
          ) : customers.length > 0 ? (
            <div className="space-y-4 max-h-screen overflow-y-auto pr-2">
              {customers.map(customer => (
                <div 
                  key={customer.phone} 
                  className="bg-white rounded-lg shadow p-4 mb-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewCustomerDetails(customer)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm"><span className="font-medium">Telefone:</span> {customer.phone}</p>
                  <p className="text-gray-600 text-sm"><span className="font-medium">Total de Pedidos:</span> {customer.totalOrders}</p>
                  <p className="text-gray-600 text-sm"><span className="font-medium">Total Gasto:</span> R$ {customer.totalSpent.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm"><span className="font-medium">Último Pedido:</span> {formatDate(customer.lastOrderDate)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
        
        {/* Detalhes do Cliente e Histórico de Pedidos */}
        <div className="md:col-span-2">
          {selectedCustomer ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold mb-2">{selectedCustomer.name}</h3>
                <p className="text-gray-600"><span className="font-medium">Telefone:</span> {selectedCustomer.phone}</p>
                {selectedCustomer.address && (
                  <p className="text-gray-600"><span className="font-medium">Endereço:</span> {selectedCustomer.address}</p>
                )}
                <p className="text-gray-600"><span className="font-medium">Total de Pedidos:</span> {selectedCustomer.totalOrders}</p>
                <p className="text-gray-600"><span className="font-medium">Total Gasto:</span> R$ {selectedCustomer.totalSpent.toFixed(2)}</p>
                <p className="text-gray-600"><span className="font-medium">Último Pedido:</span> {formatDate(selectedCustomer.lastOrderDate)}</p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Histórico de Pedidos</h3>
                
                {isOrdersLoading ? (
                  <div className="text-center py-4">
                    <p>Carregando pedidos...</p>
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customerOrders.map(order => (
                          <tr key={order.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{order.id}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(order.createdAt)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">R$ {order.total.toFixed(2)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatStatus(order.status)}</td>
                            <td className="px-4 py-2 text-sm">
                              {order.items.map(item => `${item.quantity}x ${item.flavor}`).join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Nenhum pedido encontrado para este cliente</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <button
                    onClick={() => handleSendMessage(selectedCustomer.phone)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
                  >
                    Enviar Mensagem
                  </button>
                  <button
                    onClick={() => window.location.href = `/conversations?phone=${selectedCustomer.phone}`}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
                  >
                    Ver Conversas
                  </button>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center h-64 flex items-center justify-center">
              <p className="text-gray-500">Selecione um cliente para visualizar detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Customers;