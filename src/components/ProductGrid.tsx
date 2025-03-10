import { useState } from 'react';
import { Product } from '../types';

interface ProductGridProps {
  onProductSelect: (product: Product) => void;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Product 1',
    price: 9.99,
    category: 'Category A',
    stock: 100,
  },
  {
    id: '2',
    name: 'Product 2',
    price: 19.99,
    category: 'Category B',
    stock: 50,
  },
  {
    id: '3',
    name: 'Product 3',
    price: 29.99,
    category: 'Category A',
    stock: 75,
  },
  {
    id: '4',
    name: 'Product 4',
    price: 39.99,
    category: 'Category C',
    stock: 25,
  },
  {
    id: '5',
    name: 'Product 5',
    price: 49.99,
    category: 'Category B',
    stock: 60,
  },
  {
    id: '6',
    name: 'Product 6',
    price: 59.99,
    category: 'Category A',
    stock: 40,
  },
  {
    id: '7',
    name: 'Product 7',
    price: 69.99,
    category: 'Category C',
    stock: 30,
  },
  {
    id: '8',
    name: 'Product 8',
    price: 79.99,
    category: 'Category B',
    stock: 45,
  },
];

export function ProductGrid({ onProductSelect }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(sampleProducts.map(p => p.category))];

  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onProductSelect(product)}
          >
            <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-400 text-4xl">📦</span>
              )}
            </div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 