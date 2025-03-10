import { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCompleteSale: () => void;
}

export function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteSale,
}: ShoppingCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Current Order</h3>
      
      {items.length === 0 ? (
        <p className="text-gray-500 text-center">No items in cart</p>
      ) : (
        <>
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-200 rounded"
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={onCompleteSale}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Sale
          </button>
        </>
      )}
    </div>
  );
} 