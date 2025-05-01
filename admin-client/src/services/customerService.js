// admin-client/src/services/customerService.js

/**
 * Obtém a lista de clientes a partir dos dados de pedidos
 * @returns {Promise<Array>} Lista de clientes
 */
export const getCustomers = async () => {
    try {
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados');
      }
      
      const data = await response.json();
      
      if (!data || !data.orders) {
        return [];
      }
      
      // Extrai clientes únicos dos pedidos
      return extractUniqueCustomers(data.orders);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  };
  
  /**
   * Obtém os pedidos de um cliente específico
   * @param {string} phone Número de telefone do cliente
   * @returns {Promise<Array>} Lista de pedidos do cliente
   */
  export const getCustomerOrders = async (phone) => {
    try {
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Falha ao buscar pedidos');
      }
      
      const data = await response.json();
      
      if (!data || !data.orders) {
        return [];
      }
      
      // Filtra os pedidos do cliente
      const customerOrders = data.orders.filter(order => order.phone === phone);
      
      // Ordena por data (mais recente primeiro)
      customerOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return customerOrders;
    } catch (error) {
      console.error('Erro ao buscar pedidos do cliente:', error);
      throw error;
    }
  };
  
  /**
   * Extrai clientes únicos da lista de pedidos
   * @param {Array} orders Lista de pedidos
   * @returns {Array} Lista de clientes únicos
   */
  const extractUniqueCustomers = (orders) => {
    const customerMap = new Map();
    
    orders.forEach(order => {
      if (order.phone && order.customer) {
        if (!customerMap.has(order.phone)) {
          customerMap.set(order.phone, {
            phone: order.phone,
            name: order.customer,
            address: order.deliveryAddress || '',
            totalOrders: 1,
            totalSpent: order.total || 0,
            lastOrderDate: order.createdAt
          });
        } else {
          const customer = customerMap.get(order.phone);
          customer.totalOrders += 1;
          customer.totalSpent += order.total || 0;
          
          // Atualiza a data do último pedido se este for mais recente
          if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
            customer.lastOrderDate = order.createdAt;
            
            // Atualiza o endereço se disponível no pedido mais recente
            if (order.deliveryAddress) {
              customer.address = order.deliveryAddress;
            }
          }
        }
      }
    });
    
    return Array.from(customerMap.values());
  };
  
  /**
   * Obtém estatísticas dos clientes
   * @returns {Promise<Object>} Estatísticas dos clientes
   */
  export const getCustomerStats = async () => {
    try {
      const customers = await getCustomers();
      
      if (customers.length === 0) {
        return {
          totalCustomers: 0,
          activeCustomers: 0,
          averagePurchaseValue: 0,
          totalRevenue: 0
        };
      }
      
      // Total de clientes
      const totalCustomers = customers.length;
      
      // Clientes com mais de um pedido (recorrentes)
      const activeCustomers = customers.filter(customer => customer.totalOrders > 1).length;
      
      // Valor médio de compra por cliente
      const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
      const averagePurchaseValue = totalRevenue / totalCustomers;
      
      return {
        totalCustomers,
        activeCustomers,
        averagePurchaseValue,
        totalRevenue
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas de clientes:', error);
      throw error;
    }
  };
  
  /**
   * Busca clientes por termo de busca
   * @param {string} searchTerm Termo de busca
   * @returns {Promise<Array>} Lista de clientes filtrados
   */
  export const searchCustomers = async (searchTerm) => {
    try {
      const customers = await getCustomers();
      
      if (!searchTerm) {
        return customers;
      }
      
      // Filtra por nome ou telefone
      return customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  };