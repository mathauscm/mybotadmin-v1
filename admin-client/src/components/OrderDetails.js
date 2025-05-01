import React, { useState, useRef, useCallback } from 'react';
import { orderStatusColors, statusLabels } from './StatusBadge';

function OrderDetails({ order, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const printRef = useRef(null);

  // Função de impressão alternativa
  const handlePrint = () => {
    // Verifica se o elemento ref existe
    if (!printRef.current) {
      console.error('Elemento para impressão não encontrado');
      return;
    }

    // Cria uma nova janela de impressão
    const printWindow = window.open('', '', 'width=800,height=600');
    
    // Gera conteúdo HTML para impressão
    const htmlContent = `
      <html>
        <head>
          <title>Comanda do Pedido ${order.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 300px; 
              margin: 0 auto; 
              padding: 20px;
            }
            .order-header { 
              text-align: center; 
              border-bottom: 1px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 10px; 
            }
            .order-details { 
              margin-bottom: 10px; 
            }
            .order-items { 
              width: 100%; 
              border-collapse: collapse; 
            }
            .order-items th, .order-items td { 
              border: 1px solid #000; 
              padding: 5px; 
              text-align: left; 
            }
          </style>
        </head>
        <body>
          <div class="order-header">
            <h2>Cookier Shop</h2>
            <p>Comanda do Pedido: ${order.id}</p>
            <p>Data: ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div class="order-details">
            <h3>Informações do Cliente</h3>
            <p>Nome: ${order.customer}</p>
            <p>Telefone: ${order.phone}</p>
            <p>Endereço: ${order.deliveryAddress}</p>
          </div>
          
          <div class="order-details">
            <h3>Itens do Pedido</h3>
            <table class="order-items">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantidade</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.flavor}</td>
                    <td>${item.quantity}</td>
                    <td>R$ ${(item.quantity * item.unitPrice || item.quantity * 6).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2"><strong>Total</strong></td>
                  <td><strong>R$ ${order.total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="order-details">
            <h3>Pagamento</h3>
            <p>Método: ${
              order.paymentMethod === 'pix' ? 'PIX' : 
              order.paymentMethod === 'credit-card' ? 'Cartão de Crédito' : 
              order.paymentMethod === 'cash' ? 'Dinheiro' : 
              order.paymentMethod
            }</p>
            ${order.changeFor > 0 && order.paymentMethod === 'cash' 
              ? `<p>Troco para: R$ ${order.changeFor.toFixed(2)}</p>` 
              : ''
            }
          </div>
        </body>
      </html>
    `;
    
    // Escreve o conteúdo na janela de impressão
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Abre a janela de impressão
    printWindow.print();
    
    // Fecha a janela após a impressão
    printWindow.close();
  };

  const handleStatusChange = () => {
    if (newStatus && newStatus !== order.status) {
      onUpdateStatus(order.id, newStatus);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={printRef} 
        className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Detalhes do Pedido</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{order.id}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${orderStatusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
          </div>
          <p className="text-gray-600">Criado em: {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Cliente</h3>
          <p><span className="font-medium">Nome:</span> {order.customer}</p>
          <p><span className="font-medium">Telefone:</span> {order.phone}</p>
          <p><span className="font-medium">Endereço:</span> {order.deliveryAddress}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Itens</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                <span>{item.quantity}x {item.flavor}</span>
                <span>R$ {(item.quantity * item.unitPrice || item.quantity * 6).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 mt-2 font-bold">
              <span>Total</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Pagamento</h3>
          <p>Método: {
            order.paymentMethod === 'pix' ? 'PIX' : 
            order.paymentMethod === 'credit-card' ? 'Cartão de Crédito' : 
            order.paymentMethod === 'cash' ? 'Dinheiro' : 
            order.paymentMethod
          }</p>
          {order.changeFor > 0 && order.paymentMethod === 'cash' && (
            <p>Troco para: R$ {order.changeFor.toFixed(2)}</p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Atualizar Status</h3>
          <div className="flex">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mr-2 p-2 border border-gray-300 rounded"
            >
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="preparing">Em Preparo</option>
              <option value="delivering">Em Entrega</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <button
              onClick={handleStatusChange}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Atualizar
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Ações</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => window.open(`/conversations?phone=${order.phone}`, '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Enviar Mensagem
            </button>
            <button 
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Cancelar Pedido
            </button>
            <button 
              onClick={handlePrint}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Imprimir Comanda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;