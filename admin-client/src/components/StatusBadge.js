// import React from 'react';

// const orderStatusColors = {
//   pending: 'bg-yellow-200 text-yellow-800',
//   confirmed: 'bg-blue-200 text-blue-800',
//   preparing: 'bg-purple-200 text-purple-800',
//   delivering: 'bg-orange-200 text-orange-800',
//   completed: 'bg-green-200 text-green-800',
//   cancelled: 'bg-red-200 text-red-800'
// };

// const statusLabels = {
//   pending: 'Pendente',
//   confirmed: 'Confirmado',
//   preparing: 'Em Preparo',
//   delivering: 'Em Entrega',
//   completed: 'Concluído',
//   cancelled: 'Cancelado'
// };

// const StatusBadge = ({ status }) => (
//   <span className={`px-3 py-1 rounded-full text-sm font-medium ${orderStatusColors[status]}`}>
//     {statusLabels[status]}
//   </span>
// );

// export { StatusBadge, statusLabels, orderStatusColors };

// admin-client/src/components/StatusBadge.js
import React from 'react';

export const orderStatusColors = {
  pending: 'bg-yellow-200 text-yellow-800',
  confirmed: 'bg-blue-200 text-blue-800',
  preparing: 'bg-purple-200 text-purple-800',
  delivering: 'bg-orange-200 text-orange-800',
  completed: 'bg-green-200 text-green-800',
  cancelled: 'bg-red-200 text-red-800'
};

export const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Em Preparo',
  delivering: 'Em Entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};

export const StatusBadge = ({ status }) => {
  // Adiciona animação de pulso ao status pendente
  const isPending = status === 'pending';
  
  return (
    <div className="relative">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${orderStatusColors[status]}`}>
        {statusLabels[status]}
      </span>
      
      {/* Animação de indicador para pedidos pendentes */}
      {isPending && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
        </span>
      )}
    </div>
  );
};