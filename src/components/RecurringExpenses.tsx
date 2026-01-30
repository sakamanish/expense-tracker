import React, { useEffect, useState } from 'react';
import { Plus, X, RotateCcw, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../hooks/useExpenses';

interface RecurringExpense {
  id: string;
  amount: number;
  description: string;
  category_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  last_executed: string | null;
}

export const RecurringExpenses: React.FC = () => {
  const { user } = useAuth();
  const { categories } = useExpenses();
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category_id: '',
    frequency: 'monthly' as const,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  useEffect(() => {
    fetchRecurringExpenses();
  }, [user]);

  const fetchRecurringExpenses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recurring expenses:', error);
      setLoading(false);
      return;
    }

    setRecurring(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.description || !form.amount || !form.category_id) return;

    try {
      if (editingId) {
        const { error } = await supabase
          .from('recurring_expenses')
          .update({
            description: form.description,
            amount: parseFloat(form.amount),
            category_id: form.category_id,
            frequency: form.frequency,
            start_date: form.start_date,
            end_date: form.end_date || null,
          })
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('recurring_expenses').insert({
          user_id: user.id,
          description: form.description,
          amount: parseFloat(form.amount),
          category_id: form.category_id,
          frequency: form.frequency,
          start_date: form.start_date,
          end_date: form.end_date || null,
        });

        if (error) throw error;
      }

      setForm({
        description: '',
        amount: '',
        category_id: '',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
      });
      setEditingId(null);
      setShowForm(false);
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Error saving recurring expense:', error);
    }
  };

  const handleEdit = (expense: RecurringExpense) => {
    setForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category_id: expense.category_id || '',
      frequency: expense.frequency,
      start_date: expense.start_date,
      end_date: expense.end_date || '',
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting recurring expense:', error);
      return;
    }

    fetchRecurringExpenses();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('recurring_expenses')
      .update({ is_active: !isActive })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating recurring expense:', error);
      return;
    }

    fetchRecurringExpenses();
  };

  const getFrequencyLabel = (freq: string) => {
    const labels = {
      daily: 'Every day',
      weekly: 'Every week',
      monthly: 'Every month',
      yearly: 'Every year',
    };
    return labels[freq as keyof typeof labels] || freq;
  };

  const getMonthlyTotal = () => {
    return recurring
      .filter((r) => r.is_active)
      .reduce((sum, r) => {
        if (r.frequency === 'monthly' || r.frequency === 'yearly') {
          return sum + r.amount;
        }
        return sum;
      }, 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading recurring expenses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <RotateCcw className="w-6 h-6 text-green-600" />
            <span>Recurring Expenses</span>
          </h2>
          <p className="text-gray-600 mt-1">Automatically tracked fixed expenses</p>
        </div>
        <button
          onClick={() => {
            if (editingId) {
              setEditingId(null);
              setForm({
                description: '',
                amount: '',
                category_id: '',
                frequency: 'monthly',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
              });
            }
            setShowForm(!showForm);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{showForm ? 'Cancel' : 'Add Recurring'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g., Rent, Internet Bill, Gym Membership"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {editingId ? 'Update Recurring Expense' : 'Add Recurring Expense'}
            </button>
          </div>
        </form>
      )}

      {recurring.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3">
            {recurring.map((expense) => {
              const category = categories.find((c) => c.id === expense.category_id);
              return (
                <div
                  key={expense.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    expense.is_active
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      <RotateCcw className="w-6 h-6" style={{ color: category?.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-600">
                        {category?.name} • {getFrequencyLabel(expense.frequency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Started {new Date(expense.start_date).toLocaleDateString()}
                        {expense.end_date && ` • Ends ${new Date(expense.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{getFrequencyLabel(expense.frequency)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(expense.id, expense.is_active)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          expense.is_active
                            ? 'bg-green-200 text-green-800 hover:bg-green-300'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {expense.is_active ? 'Active' : 'Inactive'}
                      </button>

                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estimated Monthly Fixed Expenses</p>
                <p className="text-3xl font-bold text-green-600">${getMonthlyTotal().toFixed(2)}</p>
              </div>
              <RotateCcw className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
        </>
      )}

      {recurring.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No recurring expenses yet. Add fixed expenses like rent, subscriptions, or EMI.
          </p>
        </div>
      )}
    </div>
  );
};
