// ==============================================================================
// SCREEN 6: OWNER MENU MANAGER & METRICS (ROUTE: /admin)
// 4 Business KPI cards, real-time stock toggles, price updates, and CRUD modal
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  PackageCheck,
  Award,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { menuService } from '../api/menuService';
import { orderService } from '../api/orderService';
import { formatINR } from '../utils/formatters';
import { FallbackImage } from '../components/common/FallbackImage';
import { VegNonVegBadge } from '../components/common/Badge';
import { CANTEEN_RULES } from '../utils/constants';

export function AdminManager() {
  const { menuItems, refetchMenu } = useMenu();
  const [metrics, setMetrics] = useState({
    todayOrders: 0,
    grossSales: 0,
    itemsPrepared: 0,
    topSeller: 'Loading...',
  });

  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [adminSearch, setAdminSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = creating new
  const [saving, setSaving] = useState(false);

  // Load KPI Metrics
  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      try {
        setLoadingMetrics(true);
        const data = await orderService.getDailyMetrics();
        if (isMounted) setMetrics(data);
      } catch (e) {
        console.error('Failed to load daily metrics', e);
      } finally {
        if (isMounted) setLoadingMetrics(false);
      }
    }
    loadMetrics();

    // Re-calculate metrics on order events
    const unsub = orderService.subscribeToOrders(() => {
      loadMetrics();
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Stock availability toggle handler
  const handleToggleStock = async (item) => {
    try {
      await menuService.toggleItemAvailability(item.id, !item.is_available);
    } catch (err) {
      alert(`Failed to update stock: ${err.message}`);
    }
  };

  // Delete item handler
  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
      try {
        await menuService.deleteMenuItem(item.id);
      } catch (err) {
        alert(`Failed to delete item: ${err.message}`);
      }
    }
  };

  // Open Add/Edit Modal
  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filteredCatalog = menuItems.filter(item => {
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-surface-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Owner Menu & Sales Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage live canteen inventory, pricing, and inspect today's sales metrics.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-canteen-500 hover:bg-canteen-600 text-white font-bold text-sm shadow-md shadow-canteen-500/25 active:scale-95 transition-all self-start sm:self-auto min-h-[44px]"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Food Item</span>
          </button>
        </div>

        {/* 1. 4 KPI METRICS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Today's Orders</span>
              <span className="text-2xl font-black text-slate-900">{metrics.todayOrders}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Today's Gross Sales</span>
              <span className="text-2xl font-black text-slate-900">{formatINR(metrics.grossSales)}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-semibold block">Total Items Sold</span>
              <span className="text-2xl font-black text-slate-900">{metrics.itemsPrepared}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-stone-500 font-semibold block">Top-Selling Dish</span>
              <span className="text-sm font-bold text-slate-900 truncate block" title={metrics.topSeller}>
                {metrics.topSeller}
              </span>
            </div>
          </div>
        </div>

        {/* 2. CATALOG MANAGEMENT TABLE */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
          {/* Table Header Filter */}
          <div className="p-4 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">
              Food Catalog Items ({filteredCatalog.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-canteen-500/20 focus:border-canteen-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200/80 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCatalog.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <FallbackImage
                          src={item.image_url}
                          alt={item.name}
                          category={item.category}
                          className="w-12 h-12 rounded-lg flex-shrink-0 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {formatINR(item.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <VegNonVegBadge isVeg={item.is_veg} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStock(item)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-colors ${
                          item.is_available
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {item.is_available ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{item.is_available ? 'Available' : 'Sold Out'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-stone-500 hover:text-canteen-600 hover:bg-stone-100 rounded-lg transition-colors"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 text-stone-500 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 3. ADD / EDIT FOOD ITEM MODAL */}
      {isModalOpen && (
        <ItemModal
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            refetchMenu();
          }}
        />
      )}
    </div>
  );
}

/**
 * ADD / EDIT FOOD MODAL FORM
 */
function ItemModal({ item, onClose, onSaved }) {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || 'Snacks');
  const [price, setPrice] = useState(item?.price || '');
  const [isVeg, setIsVeg] = useState(item ? item.is_veg : true);
  const [description, setDescription] = useState(item?.description || '');
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        category,
        price: Number(price),
        is_veg: isVeg,
        description: description.trim(),
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      };

      if (item && item.id) {
        await menuService.updateMenuItem(item.id, payload);
      } else {
        await menuService.createMenuItem(payload);
      }

      onSaved();
    } catch (err) {
      alert(`Error saving item: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
          <h2 className="text-lg font-black text-slate-900">
            {item ? 'Edit Food Item' : 'Add New Food Item'}
          </h2>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Food Item Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Masala Dosa"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-canteen-500/20 focus:border-canteen-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-canteen-500/20 focus:border-canteen-500 bg-white"
              >
                <option value="Snacks">Snacks</option>
                <option value="Meals">Meals</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="60"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-canteen-500/20 focus:border-canteen-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dietary Type *</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="dietary"
                  checked={isVeg === true}
                  onChange={() => setIsVeg(true)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-800">Vegetarian</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="dietary"
                  checked={isVeg === false}
                  onChange={() => setIsVeg(false)}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="font-semibold text-red-800">Non-Vegetarian</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short appetizing description of the dish..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-canteen-500/20 focus:border-canteen-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Image URL (Unsplash or direct image)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-canteen-500/20 focus:border-canteen-500"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-canteen-500 hover:bg-canteen-600 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-canteen-500/20"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{item ? 'Update Item' : 'Add to Menu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
