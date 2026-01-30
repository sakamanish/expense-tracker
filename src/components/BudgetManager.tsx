import React, { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, Target, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../hooks/useExpenses';

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  alert_threshold: number;
  month: number;
  year: number;
}

interface BudgetStatus {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
  isAlert: boolean;
  color: string;
}

export const BudgetManager: React.FC = () => {
  const { user } = useAuth();
  const { categories, expenses, getStats } = useExpenses();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  useEffect(() => {
    calculateBudgetStatus();
  }, [budgets, expenses, categories]);

  const fetchBudgets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear);

    if (error) {
      console.error('Error fetching budgets:', error);
      setLoading(false);
      return;
    }

    setBudgets(data || []);
    setLoading(false);
  };

  const calculateBudgetStatus = () => {
    const stats = getStats();
    const currentMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        exp.type === 'expense' &&
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    const statuses = budgets.map((budget) => {
      const category = categories.find((c) => c.id === budget.category_id);
      const spent = currentMonthExpenses
        .filter((exp) => exp.category === budget.category_id)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const percentage = (spent / budget.amount) * 100;
      const isAlert = percentage >= budget.alert_threshold;

      return {
        category: category?.name || 'Unknown',
        budget: budget.amount,
        spent,
        percentage: Math.round(percentage),
        isAlert,
        color: category?.color || '#6B7280',
      };
    });

    setBudgetStatuses(statuses);
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCategory || !budgetAmount) return;

    const { error } = await supabase.from('budgets').insert({
      user_id: user.id,
      category_id: selectedCategory,
      amount: parseFloat(budgetAmount),
      alert_threshold: parseInt(alertThreshold),
      month: currentMonth,
      year: currentYear,
    });

    if (error) {
      console.error('Error adding budget:', error);
      return;
    }

    setBudgetAmount('');
    setSelectedCategory('');
    setAlertThreshold('80');
    setShowForm(false);
    fetchBudgets();
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting budget:', error);
      return;
    }

    fetchBudgets();
  };

  if (loading) {
    return <div className="text-center py-8">Loading budgets...</div>;
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetStatuses.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Target className="w-6 h-6 text-blue-600" />
            <span>Monthly Budgets</span>
          </h2>
          <p className="text-gray-600 mt-1">
            {new Date(currentYear, currentMonth).toLocaleDateString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Budget'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddBudget} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert at (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Set Budget
            </button>
          </div>
        </form>
      )}

      {budgetStatuses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStatuses.map((status, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl border-2 ${
                status.isAlert ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{status.category}</h3>
                  {status.isAlert && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Budget alert!</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    const budget = budgets[idx];
                    if (budget) handleDeleteBudget(budget.id);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Spent: ${status.spent.toFixed(2)}</span>
                    <span className="font-medium text-gray-900">
                      of ${status.budget.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status.percentage > 100
                          ? 'bg-red-600'
                          : status.percentage > 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(status.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Used</span>
                  <span
                    className={`font-bold ${
                      status.percentage > 100
                        ? 'text-red-600'
                        : status.percentage > 80
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {status.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {budgetStatuses.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No budgets set yet. Create one to track your spending!</p>
        </div>
      )}

      {budgetStatuses.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold text-blue-600">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
