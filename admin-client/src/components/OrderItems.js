// admin-client/src/components/OrderItem.js
import React from 'react';
import { StatusBadge } from './StatusBadge';

function OrderItem({ order, onViewDetails }) {
  // Determinar se o pedido foi criado nos últimos 5 minutos (para animação de novidade)
  const isNew = () => {
    const orderTime = new Date(order.createdAt).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return orderTime > fiveMinutesAgo;
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-4 hover:shadow-md transition-shadow ${
      order.status === 'pending' ? 'border-l-4 border-yellow-500' : ''
    } ${isNew() ? 'animate-pulse' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{order.id}</h3>
        <StatusBadge status={order.status} />
      </div>
      <div className="text-gray-600 mb-2">
        <p><span className="font-medium">Cliente:</span> {order.customer}</p>
        <p><span className="font-medium">Data:</span> {new Date(order.createdAt).toLocaleString()}</p>
        <p><span className="font-medium">Total:</span> R$ {order.total.toFixed(2)}</p>
      </div>
      <button 
        onClick={() => onViewDetails(order)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
      >
        Ver Detalhes
      </button>
    </div>
  );
}

export default OrderItem;