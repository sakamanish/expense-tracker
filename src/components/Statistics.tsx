import React from 'react';
import { PieChart, TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';

export const Statistics: React.FC = () => {
  const { expenses, categories, getStats } = useExpenses();
  const stats = getStats();

  const getMonthlyTrend = () => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthExpenses = expenses
        .filter(exp => {
          const expDate = new Date(exp.date);
          return exp.type === 'expense' &&
                 expDate.getMonth() === date.getMonth() &&
                 expDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        amount: monthExpenses,
      });
    }
    
    return last6Months;
  };

  const getCategoryStats = () => {
    return Object.entries(stats.categoryBreakdown)
      .map(([categoryId, amount]) => {
        const category = categories.find(cat => cat.id === categoryId);
        const percentage = (amount / stats.totalExpenses) * 100;
        return { category, amount, percentage };
      })
      .sort((a, b) => b.amount - a.amount);
  };

  const monthlyTrend = getMonthlyTrend();
  const categoryStats = getCategoryStats();
  const maxMonthlyAmount = Math.max(...monthlyTrend.map(m => m.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-white/10 rounded-full p-2">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold">Statistics</h1>
        </div>
        <p className="text-orange-200">Analyze your spending patterns</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-2">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Average Daily Spending</p>
            <p className="text-2xl font-bold text-gray-900">
              ${expenses.length > 0 ? (stats.totalExpenses / Math.max(expenses.length, 1)).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-2">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-2">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Categories Used</p>
            <p className="text-2xl font-bold text-gray-900">{categoryStats.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 rounded-lg p-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Highest Expense</p>
            <p className="text-2xl font-bold text-gray-900">
              ${expenses.length > 0 ? Math.max(...expenses.filter(e => e.type === 'expense').map(e => e.amount)).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Spending Trend</h3>
        
        {monthlyTrend.some(m => m.amount > 0) ? (
          <div className="space-y-4">
            {monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium text-gray-600">
                  {month.month}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: maxMonthlyAmount > 0 ? `${(month.amount / maxMonthlyAmount) * 100}%` : '0%'
                        }}
                      />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      ${month.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No expense data available yet.</p>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
        
        {categoryStats.length > 0 ? (
          <div className="space-y-4">
            {categoryStats.map(({ category, amount, percentage }) => {
              if (!category) return null;
              
              return (
                <div key={category.id} className="flex items-center space-x-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <div className="text-right">
                        <span className="text-gray-900 font-semibold">${amount.toFixed(2)}</span>
                        <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No expense categories to show yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};