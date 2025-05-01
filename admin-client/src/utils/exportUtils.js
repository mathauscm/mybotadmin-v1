// admin-client/src/utils/exportUtils.js

/**
 * Exporta dados para CSV
 * @param {Array} data Array de objetos a serem exportados
 * @param {string} filename Nome do arquivo para download
 */
export const exportToCSV = (data, filename = 'dados_exportados') => {
    if (!data || !data.length) {
      alert('Não há dados para exportar.');
      return;
    }
    
    try {
      // Obter cabeçalhos das propriedades do primeiro objeto
      const headers = Object.keys(data[0]);
      
      // Criar linhas de dados
      const csvRows = [];
      
      // Adiciona cabeçalhos
      csvRows.push(headers.join(','));
      
      // Adiciona linhas de dados
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          // Formatar valores para CSV (escapar aspas e valores com vírgulas)
          return `"${val !== undefined && val !== null ? String(val).replace(/"/g, '""') : ''}"`;
        });
        csvRows.push(values.join(','));
      }
      
      // Combinar em uma string CSV
      const csvString = csvRows.join('\\n');
      
      // Criar um blob com o CSV
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      
      // Criar URL do blob para download
      const url = URL.createObjectURL(blob);
      
      // Criar elemento temporário para download
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar para CSV:', error);
      alert('Ocorreu um erro ao exportar os dados. Por favor, tente novamente.');
    }
  };
  
  /**
   * Exporta dados para PDF (simulado - na prática usaria uma biblioteca como jsPDF)
   * @param {Array} data Array de dados para exportar
   * @param {string} title Título do relatório
   */
  export const exportToPDF = (data, title = 'Relatório') => {
    // Na implementação real, aqui seria usado jsPDF ou outra biblioteca para gerar PDFs
    // Por enquanto, apenas mostramos uma mensagem
    alert('Funcionalidade de exportação para PDF em implementação. Em breve estará disponível!');
    
    // Mosatramos uma mensagem de log com os dados que seriam exportados
    console.log('Dados para exportação em PDF:', { title, data });
  };
  
  /**
   * Formata dados para exportação de relatório
   * @param {Object} reportData Dados do relatório
   * @returns {Array} Dados formatados para exportação
   */
  export const formatReportDataForExport = (reportData) => {
    const { salesByDate, productPopularity, salesStats } = reportData;
    
    // Formatar dados de vendas por data
    const formattedSalesData = salesByDate.map(item => ({
      Data: item.date,
      Vendas: item.sales.toFixed(2),
      Pedidos: item.orders
    }));
    
    // Adicionar linha de resumo
    formattedSalesData.push({
      Data: 'TOTAL',
      Vendas: salesStats.totalSales.toFixed(2),
      Pedidos: salesStats.totalOrders
    });
    
    return formattedSalesData;
  };
  
  /**
   * Formata dados de clientes para exportação
   * @param {Array} customers Lista de clientes
   * @returns {Array} Dados formatados para exportação
   */
  export const formatCustomerDataForExport = (customers) => {
    return customers.map(customer => ({
      Nome: customer.name,
      Telefone: customer.phone,
      Endereco: customer.address,
      TotalPedidos: customer.totalOrders,
      TotalGasto: customer.totalSpent.toFixed(2),
      UltimoPedido: new Date(customer.lastOrderDate).toLocaleDateString('pt-BR')
    }));
  };