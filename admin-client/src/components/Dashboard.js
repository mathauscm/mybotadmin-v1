// admin-client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard({ dashboardStats, isLoadingStats }) {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Obter dados da API
        const response = await fetch('/api/orders');
        const data = await response.json();
        
        if (!data || !data.orders) {
          setStats([]);
          return;
        }

        // Processar dados para o gráfico
        const orders = data.orders;
        
        // Agrupar por data
        const ordersByDate = {};
        const revenueByDate = {};
        
        orders.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          });
          
          // Incrementar contagem de pedidos
          if (!ordersByDate[date]) {
            ordersByDate[date] = 0;
          }
          ordersByDate[date]++;
          
          // Somar faturamento
          if (!revenueByDate[date]) {
            revenueByDate[date] = 0;
          }
          revenueByDate[date] += order.total || 0;
        });
        
        // Criar array para o gráfico
        const chartData = Object.keys(ordersByDate).map(date => ({
          name: date,
          pedidos: ordersByDate[date],
          faturamento: revenueByDate[date]
        }));
        
        // Ordenar por data
        chartData.sort((a, b) => {
          const [dayA, monthA] = a.name.split('/');
          const [dayB, monthB] = b.name.split('/');
          return new Date(2025, parseInt(monthA) - 1, parseInt(dayA)) - 
                 new Date(2025, parseInt(monthB) - 1, parseInt(dayB));
        });
        
        // Usar apenas os últimos 7 dias
        setStats(chartData.slice(-7));
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setStats([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchStats();
    
    // Atualiza a cada minuto
    const intervalId = setInterval(fetchStats, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Stats Cards Section
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm mb-1">Total de Pedidos</h3>
        {isLoadingStats ? (
          <p className="text-3xl font-bold">...</p>
        ) : (
          <p className="text-3xl font-bold">{dashboardStats.totalOrders}</p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm mb-1">Pendentes</h3>
        {isLoadingStats ? (
          <p className="text-3xl font-bold">...</p>
        ) : (
          <p className="text-3xl font-bold text-yellow-600 relative">
            {dashboardStats.pendingOrders}
            {dashboardStats.pendingOrders > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
              </span>
            )}
          </p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm mb-1">Em Andamento</h3>
        {isLoadingStats ? (
          <p className="text-3xl font-bold">...</p>
        ) : (
          <p className="text-3xl font-bold text-blue-600">{dashboardStats.inProgressOrders}</p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-500 text-sm mb-1">Faturamento</h3>
        {isLoadingStats ? (
          <p className="text-3xl font-bold">...</p>
        ) : (
          <p className="text-3xl font-bold text-green-600">R$ {dashboardStats.revenue.toFixed(2)}</p>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <StatsCards />
        <div className="text-center py-8">Carregando dados...</div>
      </>
    );
  }

  if (stats.length === 0) {
    return (
      <>
        <StatsCards />
        <div className="text-center py-8">Não há dados suficientes para exibir os gráficos.</div>
      </>
    );
  }

  return (
    <>
      <StatsCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-4">Pedidos por Dia</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pedidos" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-4">Faturamento (R$)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="faturamento" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;