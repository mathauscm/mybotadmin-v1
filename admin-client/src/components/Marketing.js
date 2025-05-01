// admin-client/src/components/Marketing.js
import React, { useState, useEffect } from 'react';
import { getCustomers, getCustomerStats } from '../services/customerService';
import { sendPromotion, getCustomersBySegment, getPromotionTemplate } from '../services/marketingService';

function Marketing() {
  const [isLoading, setIsLoading] = useState(true);
  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    averagePurchaseValue: 0,
    totalRevenue: 0
  });
  const [customers, setCustomers] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('recurrent');
  const [isPromoSending, setIsPromoSending] = useState(false);
  const [promoType, setPromoType] = useState('daily');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [isEditingTemplates, setIsEditingTemplates] = useState(false);
  
  // Estado para armazenar os templates personalizáveis
  const [templates, setTemplates] = useState({
    daily: `🍪 Promoção do Dia! 🍪

Estamos com uma super promoção hoje! Na compra de 2 dúzias ou mais, ganhe frete grátis!

Sugestões de Cookies:
- Nutella 100g
- ChocoNutella 100g

Para fazer seu pedido, basta enviar 1 e aproveitar nossas delícias!`,
    
    weekend: `🍪 Promoção de Fim de Semana! 🍪

Aproveite nossa promoção especial de fim de semana! Compre uma dúzia, leve outra pela metade do preço!

Sugestões de Cookies:
- Cookie Red Velvet 100g
- ChocoCaramelo 100g

Para fazer seu pedido, basta enviar 1 e aproveitar nossas delícias!`,
    
    special: `✨ Promoção Especial! ✨

Cliente especial merece desconto especial! Use o cupom COOKIE20 e ganhe 20% de desconto em qualquer pedido!

Sugestões de Cookies:
- Churros 100g
- Red Ninho 100g

Para fazer seu pedido, basta enviar 1 e aproveitar nossas delícias!`
  });

  // Buscar estatísticas e clientes
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Buscar estatísticas
        const stats = await getCustomerStats();
        setCustomerStats(stats);
        
        // Buscar lista de clientes
        const clientList = await getCustomers();
        setCustomers(clientList);
        
      } catch (error) {
        console.error('Erro ao buscar dados de marketing:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Carregar clientes filtrados quando o segmento muda
  useEffect(() => {
    async function loadSegmentedCustomers() {
      try {
        setIsLoading(true);
        const filteredCustomers = await getCustomersBySegment(selectedSegment);
        setCustomers(filteredCustomers);
      } catch (error) {
        console.error('Erro ao carregar clientes do segmento:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSegmentedCustomers();
  }, [selectedSegment]);

  // Carregar template quando o tipo de promoção muda
  useEffect(() => {
    // Só limpa a mensagem se não estiver editando os templates
    if (!isEditingTemplates) {
      setPromoMessage(''); // Limpa a mensagem personalizada quando o tipo muda
    }
  }, [promoType, isEditingTemplates]);
  
  // Persistir os templates personalizados no localStorage
  useEffect(() => {
    // Carregar templates salvos do localStorage quando o componente inicializa
    const savedTemplates = localStorage.getItem('promotionTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (error) {
        console.error('Erro ao carregar templates salvos:', error);
      }
    }
  }, []);
  
  // Salvar templates quando o usuário clica em "Salvar Templates"
  useEffect(() => {
    if (!isEditingTemplates) {
      // Salvar os templates atualizados no localStorage
      localStorage.setItem('promotionTemplates', JSON.stringify(templates));
    }
  }, [isEditingTemplates, templates]);

  // Enviar promoção para o segmento selecionado
  const handleSendPromotion = async () => {
    try {
      setIsPromoSending(true);
      
      // Enviar promoção usando o serviço
      const result = await sendPromotion(promoType, selectedSegment, promoMessage);
      
      setPromoResult({
        success: true,
        message: `Promoção enviada com sucesso para ${result.sentCount} clientes.`
      });
      
    } catch (error) {
      console.error('Erro ao enviar promoção:', error);
      setPromoResult({
        success: false,
        message: 'Erro ao enviar promoção. Por favor, tente novamente.'
      });
    } finally {
      setIsPromoSending(false);
      
      // Limpar mensagem de status após 5 segundos
      setTimeout(() => {
        setPromoResult(null);
      }, 5000);
    }
  };

  // Formatar valores monetários
  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2)}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Promoções</h2>
      </div>
      
      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-1">Total de Clientes</h3>
          <p className="text-3xl font-bold">{customerStats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-1">Clientes Recorrentes</h3>
          <p className="text-3xl font-bold text-blue-600">{customerStats.activeCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-1">Valor Médio por Cliente</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(customerStats.averagePurchaseValue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm mb-1">Total Recebido</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(customerStats.totalRevenue)}</p>
        </div>
      </div>
      
      {/* Painel de Promoções */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Enviar Promoções</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">1. Escolha o Segmento</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => setSelectedSegment('recurrent')}
                className={`px-3 py-2 rounded ${selectedSegment === 'recurrent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Clientes Recorrentes
              </button>
              <button 
                onClick={() => setSelectedSegment('highvalue')}
                className={`px-3 py-2 rounded ${selectedSegment === 'highvalue' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Clientes de Alto Valor
              </button>
              <button 
                onClick={() => setSelectedSegment('inactive')}
                className={`px-3 py-2 rounded ${selectedSegment === 'inactive' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Clientes Inativos
              </button>
              <button 
                onClick={() => setSelectedSegment('new')}
                className={`px-3 py-2 rounded ${selectedSegment === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Novos Clientes
              </button>
              <button 
                onClick={() => setSelectedSegment('all')}
                className={`px-3 py-2 rounded ${selectedSegment === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Todos os Clientes
              </button>
            </div>
            
            <h4 className="font-medium mb-2">2. Escolha o Tipo de Promoção</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => setPromoType('daily')}
                className={`px-3 py-2 rounded ${promoType === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Promoção do Dia
              </button>
              <button 
                onClick={() => setPromoType('weekend')}
                className={`px-3 py-2 rounded ${promoType === 'weekend' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Promoção de Fim de Semana
              </button>
              <button 
                onClick={() => setPromoType('special')}
                className={`px-3 py-2 rounded ${promoType === 'special' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Promoção Especial
              </button>
            </div>
            
            <h4 className="font-medium mb-2">3. Mensagem Personalizada (opcional)</h4>
            <textarea 
              value={promoMessage}
              onChange={(e) => setPromoMessage(e.target.value)}
              placeholder="Deixe em branco para usar a mensagem padrão do tipo de promoção selecionado"
              className="w-full p-2 border border-gray-300 rounded mb-4 h-32"
            ></textarea>
            
            <div className="flex justify-between mb-4">
              <span className="text-sm text-gray-500">
                {promoMessage ? 'Usando mensagem personalizada' : 'Usando template padrão'}
              </span>
              <button
                type="button"
                onClick={() => {
                  // Preenche o campo com o template correspondente ao tipo selecionado
                  setPromoMessage(templates[promoType]);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Usar template {promoType === 'daily' ? 'do dia' : promoType === 'weekend' ? 'de fim de semana' : 'especial'}
              </button>
            </div>
            
            <button
              onClick={handleSendPromotion}
              disabled={isPromoSending || customers.length === 0}
              className={`px-4 py-2 rounded ${
                isPromoSending || customers.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white font-medium`}
            >
              {isPromoSending ? 'Enviando...' : 'Enviar Promoção'}
            </button>
            
            {promoResult && (
              <div className={`mt-4 p-3 rounded ${
                promoResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {promoResult.message}
              </div>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Prévia do Segmento: {customers.length} clientes</h4>
            <div className="border border-gray-200 rounded-lg h-96 overflow-y-auto p-4">
              {isLoading ? (
                <p className="text-center py-4">Carregando clientes...</p>
              ) : customers.length > 0 ? (
                <ul className="space-y-2">
                  {customers.map(customer => (
                    <li key={customer.phone} className="border-b border-gray-100 pb-2">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Pedidos:</span> {customer.totalOrders} | 
                        <span className="font-medium"> Total Gasto:</span> {formatCurrency(customer.totalSpent)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  Nenhum cliente encontrado neste segmento.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Exemplos de Promoções */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Exemplos de Promoções</h3>
          <button 
            onClick={() => setIsEditingTemplates(!isEditingTemplates)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            {isEditingTemplates ? 'Salvar Templates' : 'Editar Templates'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Template de Promoção do Dia */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-lg mb-2">Promoção do Dia</h4>
            {isEditingTemplates ? (
              <textarea
                value={templates.daily}
                onChange={(e) => setTemplates({...templates, daily: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded mb-2 h-60 text-sm"
              />
            ) : (
              <div className="text-gray-700 mb-2 whitespace-pre-wrap text-sm h-60 overflow-y-auto">
                {templates.daily}
              </div>
            )}
            {!isEditingTemplates && (
              <button 
                onClick={() => {
                  setPromoType('daily');
                  setPromoMessage(templates.daily);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Usar este template
              </button>
            )}
          </div>
          
          {/* Template de Promoção de Fim de Semana */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-lg mb-2">Promoção de Fim de Semana</h4>
            {isEditingTemplates ? (
              <textarea
                value={templates.weekend}
                onChange={(e) => setTemplates({...templates, weekend: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded mb-2 h-60 text-sm"
              />
            ) : (
              <div className="text-gray-700 mb-2 whitespace-pre-wrap text-sm h-60 overflow-y-auto">
                {templates.weekend}
              </div>
            )}
            {!isEditingTemplates && (
              <button 
                onClick={() => {
                  setPromoType('weekend');
                  setPromoMessage(templates.weekend);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Usar este template
              </button>
            )}
          </div>
          
          {/* Template de Promoção Especial */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-lg mb-2">Promoção Especial</h4>
            {isEditingTemplates ? (
              <textarea
                value={templates.special}
                onChange={(e) => setTemplates({...templates, special: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded mb-2 h-60 text-sm"
              />
            ) : (
              <div className="text-gray-700 mb-2 whitespace-pre-wrap text-sm h-60 overflow-y-auto">
                {templates.special}
              </div>
            )}
            {!isEditingTemplates && (
              <button 
                onClick={() => {
                  setPromoType('special');
                  setPromoMessage(templates.special);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Usar este template
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Marketing;