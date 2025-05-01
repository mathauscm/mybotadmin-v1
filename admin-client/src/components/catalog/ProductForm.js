// Componente para exibir o formulário de produto com preços por tamanho
import React, { useState, useEffect } from 'react';

function ProductForm({ initialData, onSubmit, onCancel, isEditing = false }) {
  // Estados para o formulário principal
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    available: true,
    image: '',
    productType: 'standard', // novo campo: standard, pizza, hamburger
    ...initialData
  });

  // Estado para categorias
  const [categories, setCategories] = useState([]);
  
  // Estado para tamanhos de pizza disponíveis
  const [pizzaSizes, setPizzaSizes] = useState([]);
  
  // Estado para os preços por tamanho (para produtos do tipo pizza)
  const [sizesPrices, setSizesPrices] = useState([]);

  // Carrega as categorias ao montar
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    }
    
    fetchCategories();
  }, []);

  // Carrega os tamanhos de pizza disponíveis ao montar
  useEffect(() => {
    async function fetchPizzaSizes() {
      try {
        const response = await fetch('/api/pizza-sizes');
        if (response.ok) {
          const data = await response.json();
          setPizzaSizes(data);
          
          // Se estamos editando um produto do tipo pizza, carregamos os preços dos tamanhos
          if (initialData && initialData.productType === 'pizza' && initialData.sizesPrices) {
            setSizesPrices(initialData.sizesPrices);
          } else {
            // Inicializa os preços vazios para os tamanhos
            const initialPrices = data.map(size => ({
              sizeId: size.id,
              sizeName: size.name,
              price: ''
            }));
            setSizesPrices(initialPrices);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tamanhos de pizza:', error);
      }
    }
    
    fetchPizzaSizes();
  }, [initialData]);

  // Atualizamos os valores do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Manipulador para mudança de tipo de produto
  const handleProductTypeChange = (e) => {
    const newType = e.target.value;
    setProduct({
      ...product,
      productType: newType
    });
  };

  // Atualizamos os preços dos tamanhos
  const handleSizePriceChange = (sizeId, price) => {
    const updatedPrices = sizesPrices.map(item => 
      item.sizeId === sizeId ? { ...item, price } : item
    );
    setSizesPrices(updatedPrices);
  };

  // Preparamos os dados e enviamos o formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Criamos o objeto final com base no tipo de produto
    const productData = { ...product };
    
    // Se for pizza, adicionamos os preços por tamanho
    if (product.productType === 'pizza') {
      productData.sizesPrices = sizesPrices.filter(item => item.price && item.price.trim() !== '');
      
      // Definimos o preço base como o menor tamanho disponível com preço
      if (productData.sizesPrices.length > 0) {
        const validPrices = productData.sizesPrices
          .filter(item => !isNaN(parseFloat(item.price)))
          .map(item => parseFloat(item.price));
        
        if (validPrices.length > 0) {
          productData.price = Math.min(...validPrices);
        }
      }
    }
    
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Produto */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-md font-medium mb-3">Tipo de Produto</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className={`border rounded-lg p-4 cursor-pointer text-center ${
            product.productType === 'standard' ? 'bg-blue-100 border-blue-500' : 'bg-white'
          }`} onClick={() => setProduct({...product, productType: 'standard'})}>
            <input
              type="radio"
              name="productType"
              value="standard"
              checked={product.productType === 'standard'}
              onChange={handleProductTypeChange}
              className="mr-2"
            />
            <label className="cursor-pointer">Produto Padrão</label>
          </div>
          
          <div className={`border rounded-lg p-4 cursor-pointer text-center ${
            product.productType === 'pizza' ? 'bg-blue-100 border-blue-500' : 'bg-white'
          }`} onClick={() => setProduct({...product, productType: 'pizza'})}>
            <input
              type="radio"
              name="productType"
              value="pizza"
              checked={product.productType === 'pizza'}
              onChange={handleProductTypeChange}
              className="mr-2"
            />
            <label className="cursor-pointer">Pizza</label>
          </div>
          
          <div className={`border rounded-lg p-4 cursor-pointer text-center ${
            product.productType === 'hamburger' ? 'bg-blue-100 border-blue-500' : 'bg-white'
          }`} onClick={() => setProduct({...product, productType: 'hamburger'})}>
            <input
              type="radio"
              name="productType"
              value="hamburger"
              checked={product.productType === 'hamburger'}
              onChange={handleProductTypeChange}
              className="mr-2"
            />
            <label className="cursor-pointer">Hambúrguer</label>
          </div>
        </div>
      </div>
      
      {/* Campos principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Produto
          </label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        {/* Campo de preço padrão (apenas visível se não for pizza) */}
        {product.productType !== 'pizza' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        )}
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(category => (
              <option key={category.id || category.slug} value={category.id || category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL da Imagem (opcional)
          </label>
          <input
            type="text"
            name="image"
            value={product.image}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="URL da imagem"
          />
        </div>
        
        <div className="md:col-span-2 flex items-center">
          <input
            type="checkbox"
            id="available"
            name="available"
            checked={product.available}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="available" className="ml-2 text-sm text-gray-700">
            Disponível para venda
          </label>
        </div>
      </div>
      
      {/* Preços por tamanho (apenas para pizza) */}
      {product.productType === 'pizza' && pizzaSizes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Preços por Tamanho</h3>
          <p className="text-sm text-gray-600 mb-4">
            Defina o preço para cada tamanho disponível de pizza. Os tamanhos podem ser gerenciados na seção "Opções de Pizza".
          </p>
          
          <div className="bg-white p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              {sizesPrices.map((sizePrice) => (
                <div key={sizePrice.sizeId} className="border rounded p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {sizePrice.sizeName}
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">R$</span>
                    <input
                      type="number"
                      value={sizePrice.price}
                      onChange={(e) => handleSizePriceChange(sizePrice.sizeId, e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          {isEditing ? 'Atualizar Produto' : 'Adicionar Produto'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;