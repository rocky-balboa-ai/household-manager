'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import {
  Plus,
  Check,
  ShoppingCart,
  Pill,
  Trash2,
  X,
  User,
  CheckCircle2,
  Minus,
  MoreVertical,
  ListPlus,
} from 'lucide-react';

// Item categories for auto-categorization
const CATEGORIES: Record<string, { label: string; keywords: string[]; icon: string }> = {
  produce: { label: 'Produce', icon: '🥬', keywords: ['apple', 'banana', 'orange', 'lettuce', 'tomato', 'onion', 'potato', 'carrot', 'broccoli', 'spinach', 'cucumber', 'pepper', 'garlic', 'lemon', 'avocado', 'fruit', 'vegetable', 'salad'] },
  dairy: { label: 'Dairy & Eggs', icon: '🥛', keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'eggs', 'mozzarella', 'cheddar'] },
  meat: { label: 'Meat & Seafood', icon: '🥩', keywords: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'turkey', 'bacon', 'sausage', 'steak', 'meat'] },
  bakery: { label: 'Bakery', icon: '🍞', keywords: ['bread', 'bagel', 'muffin', 'croissant', 'tortilla', 'pita', 'cake', 'cookie'] },
  frozen: { label: 'Frozen', icon: '🧊', keywords: ['frozen', 'ice cream', 'pizza', 'popsicle'] },
  pantry: { label: 'Pantry', icon: '🥫', keywords: ['rice', 'pasta', 'cereal', 'flour', 'sugar', 'oil', 'sauce', 'can', 'bean', 'soup', 'noodle'] },
  beverages: { label: 'Beverages', icon: '🥤', keywords: ['water', 'juice', 'soda', 'coffee', 'tea', 'wine', 'beer', 'drink'] },
  snacks: { label: 'Snacks', icon: '🍿', keywords: ['chip', 'cracker', 'popcorn', 'nut', 'candy', 'chocolate', 'snack'] },
  household: { label: 'Household', icon: '🧹', keywords: ['paper towel', 'toilet paper', 'soap', 'detergent', 'cleaner', 'trash bag'] },
  pharmacy: { label: 'Pharmacy', icon: '💊', keywords: ['medicine', 'vitamin', 'bandage', 'aspirin', 'prescription'] },
  other: { label: 'Other', icon: '📦', keywords: [] },
};

function categorizeItem(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [category, { keywords }] of Object.entries(CATEGORIES)) {
    if (category === 'other') continue;
    if (keywords.some((kw) => lowerName.includes(kw))) return category;
  }
  return 'other';
}

function capitalizeListType(type: string): string {
  if (!type) return 'Shopping List';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  category?: string;
}

interface ShoppingList {
  id: string;
  type: string;
  status: string;
  assignedTo?: string;
  assignedUser?: { id: string; name: string };
  items: ShoppingItem[];
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export default function ShoppingPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListType, setNewListType] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLists();
    loadUsers();
  }, []);

  const loadLists = async () => {
    try {
      const data = await api.getShoppingLists();
      setLists(data);
      if (!activeList) {
        const firstActive = data.find((l: ShoppingList) => l.status === 'active');
        if (firstActive) setActiveList(firstActive);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.filter((u: User) => ['DRIVER', 'ADMIN', 'MANAGER'].includes(u.role)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateList = async () => {
    if (!newListType.trim()) return;
    try {
      const list = await api.createShoppingList({ type: newListType.trim().toLowerCase() });
      setLists([list, ...lists]);
      setActiveList(list);
      setShowNewListModal(false);
      setNewListType('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickCreateList = async (type: string) => {
    try {
      const list = await api.createShoppingList({ type });
      setLists([list, ...lists]);
      setActiveList(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim() || !activeList) return;
    const itemName = newItem.trim();
    const category = activeList.type === 'pharmacy' ? 'pharmacy' : categorizeItem(itemName);
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: ShoppingItem = { id: tempId, name: itemName, purchased: false, quantity: 1, category };

    const previousLists = [...lists];
    setLists(lists.map((l) => l.id === activeList.id ? { ...l, items: [...(l.items || []), optimisticItem] } : l));
    setNewItem('');
    inputRef.current?.focus();

    try {
      await api.addShoppingItem(activeList.id, { name: itemName });
      loadLists();
    } catch (err) {
      console.error(err);
      setLists(previousLists);
    }
  };

  const handleToggleItem = async (itemId: string, purchased: boolean) => {
    if (!activeList) return;
    const previousLists = [...lists];
    setLists(lists.map((l) => l.id === activeList.id ? { ...l, items: l.items?.map((i) => i.id === itemId ? { ...i, purchased: !purchased } : i) } : l));
    try {
      await api.updateShoppingItem(activeList.id, itemId, { purchased: !purchased });
    } catch (err) {
      console.error(err);
      setLists(previousLists);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!activeList) return;
    const previousLists = [...lists];
    setLists(lists.map((l) => l.id === activeList.id ? { ...l, items: l.items?.filter((i) => i.id !== itemId) } : l));
    try {
      await api.deleteShoppingItem(activeList.id, itemId);
    } catch (err) {
      console.error(err);
      setLists(previousLists);
    }
  };

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    if (!activeList) return;
    // Use items from lists state (not activeList which can be stale)
    const currentItems = lists.find((l) => l.id === activeList.id)?.items;
    const item = currentItems?.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    const previousLists = [...lists];
    setLists(lists.map((l) => l.id === activeList.id ? { ...l, items: l.items?.map((i) => i.id === itemId ? { ...i, quantity: newQty } : i) } : l));
    try {
      await api.updateShoppingItem(activeList.id, itemId, { quantity: newQty });
    } catch (err) {
      console.error(err);
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
  const filteredLists = lists.filter((l) => {
    if (filter === 'active') return l.status === 'active';
    if (filter === 'completed') return l.status === 'completed';
    return true;
  });

  const groupedItems = useCallback(() => {
    if (!currentList?.items) return {};
    const groups: Record<string, ShoppingItem[]> = {};
    currentList.items.forEach((item) => {
      const cat = item.category || categorizeItem(item.name);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => (a.purchased === b.purchased ? 0 : a.purchased ? 1 : -1));
    });
    return groups;
  }, [currentList?.items]);

  const progress = currentList?.items ? { total: currentList.items.length, done: currentList.items.filter((i) => i.purchased).length } : { total: 0, done: 0 };
  const progressPct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  if (loading) {
    return <><Header title="Shopping" /><div className="flex items-center justify-center h-64"><div className="animate-spin text-2xl">🛒</div></div></>;
  }

  return (
    <>
      <Header title="Shopping" />
      <div className="space-y-4 pt-2">
        {/* List tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {filteredLists.map((list) => (
            <button key={list.id} onClick={() => setActiveList(list)} className={`flex-shrink-0 px-4 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all ${activeList?.id === list.id ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
              {list.type === 'pharmacy' ? <Pill className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              <span>{capitalizeListType(list.type)}</span>
              {list.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </button>
          ))}
          <button onClick={() => setShowNewListModal(true)} className="flex-shrink-0 px-4 py-2.5 rounded-full font-medium flex items-center gap-2 bg-gray-50 text-gray-500 border border-dashed border-gray-300 hover:border-primary-400 hover:text-primary-600 transition-all">
            <Plus className="w-4 h-4" /><span>New List</span>
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['active', 'completed', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredLists.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No shopping lists</h3>
            <p className="text-gray-500 mb-6">Create your first list to get started</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => handleQuickCreateList('grocery')} variant="outline"><ShoppingCart className="w-4 h-4 mr-2" />Grocery List</Button>
              <Button onClick={() => handleQuickCreateList('pharmacy')} variant="outline"><Pill className="w-4 h-4 mr-2" />Pharmacy List</Button>
            </div>
          </div>
        )}

        {/* Active list */}
        {currentList && (
          <div className="space-y-4">
            {/* Header with progress */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{currentList.type === 'pharmacy' ? '💊' : '🛒'}</div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{capitalizeListType(currentList.type)}</h2>
                    {currentList.assignedUser && <p className="text-sm text-gray-500 flex items-center gap-1"><User className="w-3 h-3" />Assigned to {currentList.assignedUser.name}</p>}
                  </div>
                </div>
                <button onClick={() => setShowAssignModal(true)} className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5 text-gray-400" /></button>
              </div>
              {progress.total > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Progress</span><span className="font-medium text-gray-900">{progress.done}/{progress.total} items</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} /></div>
                </div>
              )}
            </div>

            {/* Add item */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input ref={inputRef} value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item... (press Enter)" onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} />
                {newItem && <button onClick={() => setNewItem('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>}
              </div>
              <Button onClick={handleAddItem} disabled={!newItem.trim()}><Plus className="w-5 h-5" /></Button>
            </div>

            {/* Items by category */}
            <div className="space-y-4">
              {Object.entries(groupedItems()).map(([cat, items]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-lg">{CATEGORIES[cat]?.icon || '📦'}</span>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{CATEGORIES[cat]?.label || 'Other'}</span>
                    <span className="text-xs text-gray-400">({items.length})</span>
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className={`bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 transition-all ${item.purchased ? 'opacity-60' : ''}`}>
                      <div onClick={() => handleToggleItem(item.id, item.purchased)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${item.purchased ? 'bg-primary-600 border-primary-600' : 'border-gray-300 hover:border-primary-400'}`}>
                        {item.purchased && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span onClick={() => handleToggleItem(item.id, item.purchased)} className={`flex-1 cursor-pointer ${item.purchased ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center" disabled={item.quantity <= 1}><Minus className="w-4 h-4 text-gray-600" /></button>
                        <span className="w-8 text-center font-medium text-gray-700">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Plus className="w-4 h-4 text-gray-600" /></button>
                      </div>
                      <button onClick={() => handleDeleteItem(item.id)} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Empty items */}
            {(!currentList.items || currentList.items.length === 0) && (
              <div className="bg-gray-50 rounded-2xl p-8 text-center"><div className="text-4xl mb-3">📝</div><p className="text-gray-500">No items yet. Add your first item above!</p></div>
            )}

            {/* Complete button */}
            {currentList.items && currentList.items.length > 0 && currentList.status === 'active' && (
              <Button onClick={handleCompleteList} className="w-full" variant={progress.done === progress.total ? 'primary' : 'outline'}>
                <CheckCircle2 className="w-5 h-5 mr-2" />{progress.done === progress.total ? 'Complete List' : `Complete List (${progress.total - progress.done} remaining)`}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* New List Modal */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-xl font-semibold">Create New List</h3><button onClick={() => setShowNewListModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Quick create:</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { handleQuickCreateList('grocery'); setShowNewListModal(false); }} className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-400 text-center"><ShoppingCart className="w-8 h-8 mx-auto mb-2 text-primary-600" /><span className="font-medium">Grocery</span></button>
                <button onClick={() => { handleQuickCreateList('pharmacy'); setShowNewListModal(false); }} className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-400 text-center"><Pill className="w-8 h-8 mx-auto mb-2 text-primary-600" /><span className="font-medium">Pharmacy</span></button>
              </div>
            </div>
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-500">or custom</span></div></div>
            <div className="space-y-3">
              <Input value={newListType} onChange={(e) => setNewListType(e.target.value)} placeholder="List name (e.g., Costco, Party Supplies)" onKeyDown={(e) => e.key === 'Enter' && handleCreateList()} />
              <Button onClick={handleCreateList} className="w-full" disabled={!newListType.trim()}><ListPlus className="w-5 h-5 mr-2" />Create List</Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-xl font-semibold">Assign Shopper</h3><button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button></div>
            <p className="text-sm text-gray-500">Assign this list to someone who will do the shopping</p>
            <div className="space-y-2">
              <button onClick={() => setShowAssignModal(false)} className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-primary-400 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-5 h-5 text-gray-400" /></div><span className="font-medium text-gray-600">Unassigned</span>
              </button>
              {users.map((user) => (
                <button key={user.id} onClick={() => setShowAssignModal(false)} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${currentList?.assignedTo === user.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400'}`}>
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"><span className="text-primary-600 font-medium">{user.name.charAt(0).toUpperCase()}</span></div>
                  <div className="text-left"><span className="font-medium text-gray-900">{user.name}</span><p className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</p></div>
                  {currentList?.assignedTo === user.id && <Check className="w-5 h-5 text-primary-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
