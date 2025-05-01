// admin-client/src/components/OrderStatusFilter.js
import React from 'react';
import { orderStatusColors, statusLabels } from './StatusBadge';

function OrderStatusFilter({ selectedStatus, onStatusChange }) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStatusChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${!selectedStatus ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Todos
        </button>
        {Object.entries(statusLabels).map(([status, label]) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${selectedStatus === status ? orderStatusColors[status] : 'bg-gray-200 text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default OrderStatusFilter;