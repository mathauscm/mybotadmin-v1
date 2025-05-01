// admin-client/src/components/catalog/ProductOptions.js
import React, { useState, useEffect } from 'react';
import PizzaSizes from './options/PizzaSizes';
import PizzaCrusts from './options/PizzaCrusts';
import BurgerAddons from './options/BurgerAddons';

function ProductOptions({ onBack }) {
  const [activeTab, setActiveTab] = useState('sizes');
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <p className="text-gray-600 mt-1">Configure tamanhos de pizza, bordas e adicionais</p>
        </div>
      </div>
      
      {/* Tabs de navegação */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('sizes')}
              className={`inline-block py-4 px-4 text-sm font-medium text-center ${
                activeTab === 'sizes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-600 border-b-2 border-transparent hover:border-gray-300'
              }`}
            >
              Tamanhos de Pizza
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('crusts')}
              className={`inline-block py-4 px-4 text-sm font-medium text-center ${
                activeTab === 'crusts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-600 border-b-2 border-transparent hover:border-gray-300'
              }`}
            >
              Bordas de Pizza
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('addons')}
              className={`inline-block py-4 px-4 text-sm font-medium text-center ${
                activeTab === 'addons'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-600 border-b-2 border-transparent hover:border-gray-300'
              }`}
            >
              Adicionais de Hambúrguer
            </button>
          </li>
        </ul>
      </div>
      
      {/* Conteúdo da tab ativa */}
      <div className="mt-4">
        {activeTab === 'sizes' && <PizzaSizes />}
        {activeTab === 'crusts' && <PizzaCrusts />}
        {activeTab === 'addons' && <BurgerAddons />}
      </div>
    </div>
  );
}

export default ProductOptions;