// admin-client/src/services/reportService.js

/**
 * Obtém todos os pedidos
 * @returns {Promise<Array>} Lista de pedidos
 */
export const getOrders = async () => {
  try {
    const response = await fetch('/api/orders');
    
    if (!response.ok) {
      throw new Error('Falha ao buscar dados de pedidos');
    }
    
    const data = await response.json();
    
    if (!data || !data.orders) {
      return [];
    }
    
    return data.orders;
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

/**
 * Filtra pedidos por intervalo de datas
 * @param {Array} orders Lista de pedidos
 * @param {string} range Intervalo (week, month, year)
 * @returns {Array} Pedidos filtrados
 */
export const filterOrdersByDateRange = (orders, range) => {
  const now = new Date();
  let cutoffDate;
  
  switch (range) {
    case 'week':
      cutoffDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'year':
      cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case 'month':
    default:
      cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
  }
  
  return orders.filter(order => new Date(order.createdAt) >= cutoffDate);
};

/**
 * Processa dados de vendas por data
 * @param {Array} orders Lista de pedidos
 * @returns {Array} Dados de vendas agrupados por data
 */
export const processSalesByDate = (orders) => {
  // Agrupa pedidos por data
  const salesMap = {};
  
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const dateKey = orderDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    
    if (!salesMap[dateKey]) {
      salesMap[dateKey] = {
        date: dateKey,
        sales: 0,
        orders: 0
      };
    }
    
    salesMap[dateKey].sales += order.total || 0;
    salesMap[dateKey].orders += 1;
  });
  
  // Converte para array e ordena por data
  return Object.values(salesMap).sort((a, b) => {
    const [dayA, monthA] = a.date.split('/');
    const [dayB, monthB] = b.date.split('/');
    return new Date(2023, parseInt(monthA) - 1, parseInt(dayA)) - 
           new Date(2023, parseInt(monthB) - 1, parseInt(dayB));
  });
};

/**
 * Processa dados de popularidade de produtos
 * @param {Array} orders Lista de pedidos
 * @returns {Array} Dados de popularidade de produtos
 */
export const processProductPopularity = (orders) => {
  // Conta frequência de produtos
  const productCount = {};
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        if (!productCount[item.flavor]) {
          productCount[item.flavor] = 0;
        }
        productCount[item.flavor] += item.quantity;
      });
    }
  });
  
  // Converte para array e ordena por popularidade
  const productArray = Object.entries(productCount).map(([name, value]) => ({
    name,
    value
  }));
  
  productArray.sort((a, b) => b.value - a.value);
  
  // Retorna top 6 produtos
  return productArray.slice(0, 6);
};

/**
 * Processa estatísticas por dia da semana
 * @param {Array} orders Lista de pedidos
 * @returns {Array} Estatísticas por dia da semana
 */
export const processDailyStats = (orders) => {
  // Dias da semana
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  // Inicializa contagens
  const dailyCounts = daysOfWeek.map(day => ({
    name: day,
    orders: 0,
    sales: 0
  }));
  
  // Conta pedidos por dia da semana
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const dayIndex = orderDate.getDay(); // 0 = Domingo, 6 = Sábado
    
    dailyCounts[dayIndex].orders += 1;
    dailyCounts[dayIndex].sales += order.total || 0;
  });
  
  return dailyCounts;
};

/**
 * Processa estatísticas de métodos de pagamento
 * @param {Array} orders Lista de pedidos
 * @returns {Array} Estatísticas de métodos de pagamento
 */
export const processPaymentMethods = (orders) => {
  // Inicializa métodos de pagamento
  const paymentMethods = {
    'pix': { name: 'PIX', value: 0 },
    'credit-card': { name: 'Cartão de Crédito', value: 0 },
    'cash': { name: 'Dinheiro', value: 0 }
  };
  
  // Conta métodos de pagamento
  orders.forEach(order => {
    if (order.paymentMethod && paymentMethods[order.paymentMethod]) {
      paymentMethods[order.paymentMethod].value += 1;
    }
  });
  
  // Converte para array e filtra métodos não utilizados
  return Object.values(paymentMethods).filter(method => method.value > 0);
};

/**
 * Calcula estatísticas de vendas
 * @param {Array} orders Lista de pedidos
 * @returns {Object} Estatísticas de vendas
 */
export const calculateSalesStats = (orders) => {
  if (!orders.length) {
    return {
      totalSales: 0,
      totalOrders: 0,
      averageTicket: 0,
      completedOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0
    };
  }
  
  // Total de vendas (apenas pedidos concluídos)
  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalSales = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // Total de pedidos
  const totalOrders = orders.length;
  
  // Ticket médio
  const averageTicket = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;
  
  // Contagem por status
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  
  return {
    totalSales,
    totalOrders,
    averageTicket,
    completedOrders: completedOrders.length,
    pendingOrders,
    cancelledOrders
  };
};

/**
 * Processa estatísticas por horário do dia
 * @param {Array} orders Lista de pedidos
 * @returns {Array} Estatísticas por horário
 */
export const processHourlyStats = (orders) => {
  // Inicializa contagens por hora (formato 24h)
  const hourlyData = {};
  for (let i = 0; i < 24; i++) {
    const hourLabel = `${String(i).padStart(2, '0')}:00`;
    hourlyData[hourLabel] = { hour: hourLabel, orders: 0, sales: 0 };
  }
  
  // Conta pedidos por hora do dia
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const hour = orderDate.getHours();
    const hourLabel = `${String(hour).padStart(2, '0')}:00`;
    
    hourlyData[hourLabel].orders += 1;
    hourlyData[hourLabel].sales += order.total || 0;
  });
  
  // Converte para array e ordena por hora
  return Object.values(hourlyData);
};

/**
 * Obtém relatório completo
 * @param {string} dateRange Intervalo de datas (week, month, year)
 * @returns {Promise<Object>} Dados do relatório
 */
export const getFullReport = async (dateRange = 'month') => {
  try {
    const allOrders = await getOrders();
    const filteredOrders = filterOrdersByDateRange(allOrders, dateRange);
    
    const salesByDate = processSalesByDate(filteredOrders);
    const productPopularity = processProductPopularity(filteredOrders);
    const dailyStats = processDailyStats(filteredOrders);
    const paymentStats = processPaymentMethods(filteredOrders);
    const salesStats = calculateSalesStats(filteredOrders);
    const hourlyStats = processHourlyStats(filteredOrders);
    
    return {
      salesByDate,
      productPopularity,
      dailyStats,
      paymentStats,
      salesStats,
      hourlyStats
    };
  } catch (error) {
    console.error('Erro ao gerar relatório completo:', error);
    throw error;
  }
};