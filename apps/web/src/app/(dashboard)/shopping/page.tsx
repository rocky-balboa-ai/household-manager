'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Plus, Check, ShoppingCart, Pill, Trash2 } from 'lucide-react';

export default function ShoppingPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [activeList, setActiveList] = useState<any>(null);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const data = await api.getShoppingLists();
      setLists(data.filter((l: any) => l.status === 'active'));
      if (data.length > 0 && !activeList) {
        setActiveList(data.find((l: any) => l.status === 'active'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (type: string) => {
    try {
      const list = await api.createShoppingList({ type });
      setLists([...lists, list]);
      setActiveList(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim() || !activeList) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { id: tempId, name: newItem.trim(), purchased: false, quantity: 1 };

    // Optimistic update - add item immediately
    const previousLists = [...lists];
    setLists(lists.map(list =>
      list.id === activeList.id
        ? { ...list, items: [...(list.items || []), optimisticItem] }
        : list
    ));
    setNewItem('');

    try {
      await api.addShoppingItem(activeList.id, { name: optimisticItem.name });
      // Reload to get the real ID from server
      loadLists();
    } catch (err) {
      console.error(err);
      // Revert on error
      setLists(previousLists);
    }
  };

  const handleToggleItem = async (itemId: string, purchased: boolean) => {
    if (!activeList) return;

    // Optimistic update - toggle immediately
    const previousLists = [...lists];
    setLists(lists.map(list =>
      list.id === activeList.id
        ? {
            ...list,
            items: list.items?.map((item: any) =>
              item.id === itemId ? { ...item, purchased: !purchased } : item
            ),
          }
        : list
    ));

    try {
      await api.updateShoppingItem(activeList.id, itemId, { purchased: !purchased });
    } catch (err) {
      console.error(err);
      // Revert on error
      setLists(previousLists);
    }
  };

  const handleCompleteList = async () => {
    if (!activeList) return;
    try {
      await api.completeShoppingList(activeList.id);
      setActiveList(null);
      loadLists();
    } catch (err) {
      console.error(err);
    }
  };

  const currentList = lists.find((l) => l.id === activeList?.id);

  return (
    <>
      <Header title="Shopping" />

      <div className="space-y-4 pt-2">
        <div className="flex gap-2">
          {lists.length === 0 ? (
            <>
              <Button onClick={() => handleCreateList('grocery')} variant="outline" className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Grocery List
              </Button>
              <Button onClick={() => handleCreateList('pharmacy')} variant="outline" className="flex-1">
                <Pill className="w-4 h-4 mr-2" />
                New Pharmacy List
              </Button>
            </>
          ) : (
            lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveList(list)}
                className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  activeList?.id === list.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border'
                }`}
              >
                {list.type === 'grocery' ? <ShoppingCart className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
                {list.type}
              </button>
            ))
          )}
        </div>

        {currentList && (
          <>
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add item..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {currentList.items?.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item.id, item.purchased)}
                  className={`bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 cursor-pointer ${
                    item.purchased ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    item.purchased ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                  }`}>
                    {item.purchased && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`flex-1 ${item.purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.name}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                  )}
                </div>
              ))}
            </div>

            {currentList.items?.length > 0 && (
              <Button onClick={handleCompleteList} className="w-full">
                Complete List
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
}
