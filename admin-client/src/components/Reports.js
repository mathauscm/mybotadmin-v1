// admin-client/src/components/Reports.js
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { getFullReport } from '../services/reportService';
import { exportToCSV, formatReportDataForExport } from '../utils/exportUtils';

function Reports() {
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0
  });
  // Estado para armazenar dados de horário de pico
  const [hourlyStats, setHourlyStats] = useState([]);
  const [peakHours, setPeakHours] = useState({
    peakHour: '',
    orderCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Obter relatório completo usando o serviço
        const report = await getFullReport(dateRange);
        
        // Atualizar estados com os dados do relatório
        setSalesData(report.salesByDate);
        setProductData(report.productPopularity);
        setDailyStats(report.dailyStats);
        setPaymentStats(report.paymentStats);
        setSalesStats(report.salesStats);
        
        // Processar dados de horário de pico
        if (report.hourlyStats) {
          setHourlyStats(report.hourlyStats);
          
          // Encontrar o horário com maior número de pedidos
          let maxOrders = 0;
          let peakHourValue = '';
          
          report.hourlyStats.forEach(stat => {
            if (stat.orders > maxOrders) {
              maxOrders = stat.orders;
              peakHourValue = stat.hour;
            }
          });
          
          setPeakHours({
            peakHour: peakHourValue,
            orderCount: maxOrders
          });
        }
        
      } catch (err) {
        console.error('Erro ao buscar dados para relatórios:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [dateRange]);

  // Format currency
  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2)}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Relatórios</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setDateRange('week')} 
            className={`px-4 py-2 rounded-lg ${dateRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Semana
          </button>
          <button 
            onClick={() => setDateRange('month')} 
            className={`px-4 py-2 rounded-lg ${dateRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Mês
          </button>
          <button 
            onClick={() => setDateRange('year')} 
            className={`px-4 py-2 rounded-lg ${dateRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Ano
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Carregando dados...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm mb-1">Vendas Totais</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(salesStats.totalSales)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm mb-1">Pedidos</h3>
              <p className="text-3xl font-bold">{salesStats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm mb-1">Ticket Médio</h3>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(salesStats.averageTicket)}</p>
            </div>
          </div>
          
          {/* Sales Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Vendas por Dia</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Vendas (R$)" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Produtos Mais Vendidos</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Quantidade" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* More Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Vendas por Dia da Semana</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [name === 'sales' ? formatCurrency(value) : value, name === 'sales' ? 'Vendas' : 'Pedidos']} />
                    <Legend />
                    <Bar dataKey="orders" name="Pedidos" fill="#8884d8" />
                    <Bar dataKey="sales" name="Vendas (R$)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Métodos de Pagamento</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Horários de Pico */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4">Horários de Pico</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [name === 'sales' ? formatCurrency(value) : value, name === 'sales' ? 'Vendas (R$)' : 'Quantidade de Pedidos']} />
                    <Legend />
                    <Bar dataKey="orders" name="Quantidade de Pedidos" fill="#8884d8" />
                    <Bar dataKey="sales" name="Vendas (R$)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {peakHours.peakHour && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="font-medium">
                    Horário de maior movimento: <span className="text-blue-600 font-bold">{peakHours.peakHour}</span> com {peakHours.orderCount} pedidos
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Data Export Buttons */}
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => {
                try {
                  // Preparar dados para exportação
                  const exportData = [];
                  
                  // Adicionar cabeçalho
                  exportData.push({
                    Data: 'Data',
                    Vendas: 'Vendas (R$)',
                    Pedidos: 'Quantidade de Pedidos'
                  });
                  
                  // Adicionar dados de vendas por dia
                  salesData.forEach(item => {
                    exportData.push({
                      Data: item.date,
                      Vendas: item.sales.toFixed(2),
                      Pedidos: item.orders
                    });
                  });
                  
                  // Adicionar linha de separação
                  exportData.push({
                    Data: '-------------',
                    Vendas: '-------------',
                    Pedidos: '-------------'
                  });
                  
                  // Adicionar dados de horários de pico
                  exportData.push({
                    Data: 'Horário',
                    Vendas: 'Vendas (R$)',
                    Pedidos: 'Quantidade de Pedidos'
                  });
                  
                  hourlyStats.forEach(item => {
                    if (item.orders > 0) {  // Só exporta horários com pedidos
                      exportData.push({
                        Data: item.hour,
                        Vendas: item.sales.toFixed(2),
                        Pedidos: item.orders
                      });
                    }
                  });
                  
                  // Adicionar linha de separação
                  exportData.push({
                    Data: '-------------',
                    Vendas: '-------------',
                    Pedidos: '-------------'
                  });
                  
                  // Adicionar resumo
                  exportData.push({
                    Data: 'RESUMO',
                    Vendas: '',
                    Pedidos: ''
                  });
                  
                  exportData.push({
                    Data: 'Total de Vendas:',
                    Vendas: salesStats.totalSales.toFixed(2),
                    Pedidos: ''
                  });
                  
                  exportData.push({
                    Data: 'Total de Pedidos:',
                    Vendas: '',
                    Pedidos: salesStats.totalOrders
                  });
                  
                  exportData.push({
                    Data: 'Ticket Médio:',
                    Vendas: salesStats.averageTicket.toFixed(2),
                    Pedidos: ''
                  });
                  
                  // Exportar para CSV
                  const csvContent = exportData.map(row => {
                    return Object.values(row).map(value => 
                      typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value
                    ).join(',');
                  }).join('\n');
                  
                  // Criar blob e download
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', `relatorio_vendas_${dateRange}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                } catch (error) {
                  console.error('Erro ao exportar relatório:', error);
                  alert('Erro ao exportar relatório. Por favor, tente novamente.');
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
            >
              Exportar para CSV
            </button>
            <button
              onClick={() => window.print()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Imprimir Relatório
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;