'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { Plus, Minus, AlertTriangle, Trash2, X, Check, Edit2 } from 'lucide-react';

const categories = [
  { id: 'pantry', label: 'Pantry', icon: '🥫' },
  { id: 'fridge', label: 'Fridge', icon: '🧊' },
  { id: 'freezer', label: 'Freezer', icon: '❄️' },
  { id: 'shisha', label: 'Shisha', icon: '💨' },
];

const unitOptions = [
  { value: '', label: 'No unit' },
  { value: 'pcs', label: 'Pieces' },
  { value: 'packs', label: 'Packs' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'cans', label: 'Cans' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'g', label: 'Grams' },
  { value: 'L', label: 'Liters' },
  { value: 'ml', label: 'Milliliters' },
];

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  quantity: number;
  unit?: string;
  lowThreshold?: number;
  brand?: string;
  flavor?: string;
}

interface ItemFormData {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lowThreshold: string;
  subCategory: string;
  brand: string;
  flavor: string;
}

const emptyFormData: ItemFormData = {
  name: '',
  category: 'pantry',
  quantity: 0,
  unit: '',
  lowThreshold: '',
  subCategory: '',
  brand: '',
  flavor: '',
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [category, setCategory] = useState('pantry');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);

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

    const handleInventoryUpdated = (updatedItem: InventoryItem) => {
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
    const previousItems = [...items];
    setItems(items.map(item =>
      item.id === id
        ? { ...item, quantity: Math.max(0, item.quantity + amount) }
        : item
    ));

    try {
      await api.adjustInventory(id, amount);
    } catch (err) {
      console.error(err);
      setItems(previousItems);
    }
  };

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const amount = newQuantity - item.quantity;
    if (amount === 0) return;

    await handleAdjust(id, amount);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from inventory?`)) return;

    const previousItems = [...items];
    setItems(items.filter(item => item.id !== id));

    try {
      await api.deleteInventoryItem(id);
    } catch (err) {
      console.error(err);
      setItems(previousItems);
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyFormData, category });
    setShowAddForm(false);
    setEditingItem(null);
  };

  const handleAddItem = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      await api.createInventoryItem({
        name: formData.name.trim(),
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit || undefined,
        lowThreshold: formData.lowThreshold ? parseInt(formData.lowThreshold) : undefined,
        subCategory: formData.subCategory.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        flavor: formData.flavor.trim() || undefined,
      });
      resetForm();
      loadItems();
    } catch (err) {
      console.error(err);
      alert('Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !formData.name.trim()) return;

    setSaving(true);
    try {
      await api.updateInventoryItem(editingItem, {
        name: formData.name.trim(),
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit || undefined,
        lowThreshold: formData.lowThreshold ? parseInt(formData.lowThreshold) : undefined,
        subCategory: formData.subCategory.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        flavor: formData.flavor.trim() || undefined,
      });
      resetForm();
      loadItems();
    } catch (err) {
      console.error(err);
      alert('Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit || '',
      lowThreshold: item.lowThreshold?.toString() || '',
      subCategory: item.subCategory || '',
      brand: item.brand || '',
      flavor: item.flavor || '',
    });
    setEditingItem(item.id);
    setShowAddForm(false);
  };

  const openAddForm = () => {
    setFormData({ ...emptyFormData, category });
    setShowAddForm(true);
    setEditingItem(null);
  };

  const isFormOpen = showAddForm || editingItem !== null;

  return (
    <>
      <Header title="Inventory" />

      <div className="space-y-4 pt-2">
        {/* Category tabs + Add button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
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
          <Button onClick={openAddForm} size="sm" className="shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Add/Edit Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Item name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Low Stock Threshold"
                  type="number"
                  min="0"
                  value={formData.lowThreshold}
                  onChange={(e) => setFormData({ ...formData, lowThreshold: e.target.value })}
                  placeholder="Alert when below this"
                />

                <Input
                  label="Sub-category"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="e.g., Canned goods"
                />

                <Input
                  label="Brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Optional"
                />

                <Input
                  label="Flavor/Variant"
                  value={formData.flavor}
                  onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  onClick={editingItem ? handleEditItem : handleAddItem}
                  disabled={!formData.name.trim() || saving}
                >
                  {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Items list */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items in {category}
            <button
              onClick={openAddForm}
              className="block mx-auto mt-2 text-primary-600 hover:underline"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
            {items.map((item) => {
              const isLow = item.lowThreshold && item.quantity <= item.lowThreshold;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-4 shadow-sm ${isLow ? 'border-2 border-amber-400' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        {isLow && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                      </div>
                      {item.subCategory && (
                        <p className="text-sm text-gray-500">{item.subCategory}</p>
                      )}
                      {item.brand && (
                        <p className="text-sm text-gray-500">
                          {item.brand}{item.flavor ? ` - ${item.flavor}` : ''}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditing(item)}
                        className="w-8 h-8 rounded-full text-gray-400 hover:text-primary-600 hover:bg-primary-50 flex items-center justify-center"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjust(item.id, -1)}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                        disabled={item.quantity <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setItems(items.map(i =>
                              i.id === item.id ? { ...i, quantity: Math.max(0, val) } : i
                            ));
                          }}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            handleQuantityChange(item.id, Math.max(0, val));
                          }}
                          className="w-16 text-center text-xl font-bold text-gray-900 border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {item.unit && (
                          <span className="text-sm text-gray-500">{item.unit}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAdjust(item.id, 1)}
                        className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 text-primary-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {item.lowThreshold && (
                      <span className="text-xs text-gray-400">
                        Low: {item.lowThreshold}
                      </span>
                    )}
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
