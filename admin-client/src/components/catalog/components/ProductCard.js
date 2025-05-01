// admin-client/src/components/catalog/components/ProductCard.js
import React from 'react';

const ProductCard = ({ product, onEdit, onDelete }) => {
  // Formatar exibição do tipo de produto
  const formatProductType = (type) => {
    const types = {
      'standard': 'Padrão',
      'pizza': 'Pizza',
      'hamburger': 'Hambúrguer'
    };
    return types[type] || 'Padrão';
  };

  // Formatar exibição do preço (considerando pizzas)
  const formatPrice = (product) => {
    try {
      // Se o produto for do tipo pizza e tiver preços por tamanho
      if (product.productType === 'pizza' && product.sizesPrices && product.sizesPrices.length > 0) {
        // Encontrar o menor e o maior preço
        const prices = product.sizesPrices
          .map(sp => {
            // Garantir que price seja tratado como número
            if (typeof sp.price === 'string') return parseFloat(sp.price);
            return sp.price;
          })
          .filter(p => !isNaN(p));
        
        if (prices.length === 0) return 'A partir de R$ 0,00';
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (minPrice === maxPrice) {
          return `R$ ${minPrice.toFixed(2)}`;
        }
        
        return `A partir de R$ ${minPrice.toFixed(2)}`;
      }
      
      // Para outros tipos de produto, garante que o preço seja número
      let price = 0;
      
      if (product.price !== undefined && product.price !== null) {
        if (typeof product.price === 'number') {
          price = product.price;
        } else if (typeof product.price === 'string') {
          price = parseFloat(product.price);
          if (isNaN(price)) price = 0;
        }
      }
      
      return `R$ ${price.toFixed(2)}`;
    } catch (error) {
      console.error('Erro ao formatar preço:', error);
      return 'R$ 0,00'; // Fallback seguro
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {product.image && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300x200?text=Imagem+não+disponível";
            }} 
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              product.available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.available ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs mb-1">{formatProductType(product.productType)}</p>
            <p className="font-bold text-lg">{formatPrice(product)}</p>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
        
        {product.productType === 'pizza' && product.sizesPrices && product.sizesPrices.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Tamanhos disponíveis:</p>
            <div className="flex flex-wrap gap-1">
              {product.sizesPrices.map(size => (
                <span key={size.sizeId} className="inline-block px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded">
                  {size.sizeName}: R$ {parseFloat(size.price).toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;