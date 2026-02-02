'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { Plus, Minus, Package, AlertTriangle } from 'lucide-react';

const categories = [
  { id: 'pantry', label: 'Pantry', icon: '🥫' },
  { id: 'fridge', label: 'Fridge', icon: '🧊' },
  { id: 'freezer', label: 'Freezer', icon: '❄️' },
  { id: 'shisha', label: 'Shisha', icon: '💨' },
];

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState('pantry');
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getInventory(category);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadItems();

    // Listen for real-time inventory updates
    const handleInventoryUpdated = (updatedItem: any) => {
      if (updatedItem.category === category) {
        loadItems();
      }
    };

    socketClient.on('inventory:updated', handleInventoryUpdated);

    return () => {
      socketClient.off('inventory:updated', handleInventoryUpdated);
    };
  }, [category, loadItems]);

  const handleAdjust = async (id: string, amount: number) => {
    try {
      await api.adjustInventory(id, amount);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Header title="Inventory" />

      <div className="space-y-4 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                category === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No items in {category}</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isLow = item.lowThreshold && item.quantity <= item.lowThreshold;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-4 shadow-sm ${isLow ? 'border-2 border-amber-400' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {isLow && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      </div>
                      {item.subCategory && (
                        <p className="text-sm text-gray-500">{item.subCategory}</p>
                      )}
                      {item.brand && (
                        <p className="text-sm text-gray-500">{item.brand} - {item.flavor}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAdjust(item.id, -1)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        disabled={item.quantity <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="text-center min-w-[60px]">
                        <span className="text-xl font-bold text-gray-900">{item.quantity}</span>
                        {item.unit && <span className="text-sm text-gray-500 ml-1">{item.unit}</span>}
                      </div>

                      <button
                        onClick={() => handleAdjust(item.id, 1)}
                        className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 text-primary-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
