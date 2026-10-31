import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Layers,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  ArrowRight,
  Search,
  ExternalLink
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';

export const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct, plans } = useData();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'Core Service',
    status: 'active'
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'Core Service',
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      code: prod.code,
      description: prod.description,
      category: prod.category || 'Core Service',
      status: prod.status
    });
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    addProduct(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      setEditingProduct(null);
    }
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Core commercial software offerings, add-on features, and platform services.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/plans')}
            icon={Layers}
          >
            Manage Plans
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products by title, code or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Listed
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Create your first SaaS product to start configuring subscription pricing tiers."
          actionLabel="Add Product"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => {
            const productPlans = plans.filter(p => p.productId === prod.id);
            return (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs border border-blue-100">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Badge status={prod.status} />
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingProduct(prod)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3">{prod.name}</h3>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 mt-1">
                    {prod.code}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Tiers</span>
                      <span className="text-xs font-bold text-slate-800">{productPlans.length || prod.plansCount}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Subscribers</span>
                      <span className="text-xs font-bold text-slate-800">{prod.activeSubscribers}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">MRR</span>
                      <span className="text-xs font-bold text-emerald-700">${(prod.monthlyRevenue || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">
                    Category: <span className="text-slate-700 font-medium">{prod.category}</span>
                  </span>
                  <button
                    onClick={() => navigate('/plans')}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                  >
                    <span>View Pricing Plans</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Product"
        subtitle="Define a software offering to package into subscription tiers."
      >
        <form onSubmit={handleSaveAdd} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="e.g. SubscriptIQ Metered Billing Engine"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">SKU / Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                placeholder="SIQ-METER"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="Core Platform">Core Platform</option>
                <option value="Revenue Protection">Revenue Protection</option>
                <option value="Add-on Module">Add-on Module</option>
                <option value="Enterprise Integration">Enterprise Integration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="High throughput automated billing features and customer entitlements..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        subtitle={`Update configuration for ${editingProduct?.name}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">SKU / Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="active">Active</option>
                <option value="paused">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Update Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Archive Product"
        subtitle="Confirm decommissioning this product catalog entry."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to remove <span className="font-semibold text-slate-900">{deletingProduct?.name}</span>? Existing subscriptions will remain active until canceled, but no new purchases can be made.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Confirm Archive
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

