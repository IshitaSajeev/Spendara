import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import api from '../api/axios';

const AddTransactionModal = ({ isOpen, onClose, onCreated }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    transaction_type: 'EXPENSE',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/api/categories/').then((res) => setCategories(res.data)).catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const { data } = await api.post('/api/categories/', { name: newCategory.trim() });
      setCategories([...categories, data]);
      setForm({ ...form, category: data.id });
      setNewCategory('');
    } catch {
      setError('Could not create category.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        category: form.category || null,
      };
      await api.post('/api/transactions/', payload);
      setForm({
        title: '',
        amount: '',
        transaction_type: 'EXPENSE',
        category: '',
        date: new Date().toISOString().slice(0, 10),
        description: '',
      });
      onCreated();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.amount?.[0] || data?.title?.[0] || 'Could not save transaction.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-8 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Add Transaction</h2>

            {error && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, transaction_type: 'EXPENSE' })}
                  className={`py-2 rounded-xl text-sm font-bold transition-colors ${
                    form.transaction_type === 'EXPENSE'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, transaction_type: 'INCOME' })}
                  className={`py-2 rounded-xl text-sm font-bold transition-colors ${
                    form.transaction_type === 'INCOME'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  Income
                </button>
              </div>

              <input
                name="title"
                placeholder="Title (e.g. Groceries)"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount (₹)"
                value={form.amount}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="New category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 bg-slate-800/40 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-slate-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <textarea
                name="description"
                placeholder="Notes (optional)"
                value={form.description}
                onChange={handleChange}
                rows={2}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold py-2.5 rounded-xl disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {loading ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;
