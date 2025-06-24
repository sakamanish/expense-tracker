import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';

export const Dashboard: React.FC = () => {
  const { getStats, categories } = useExpenses();
  const stats = getStats();

  const getTopCategories = () => {
    return Object.entries(stats.categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([categoryId, amount]) => {
        const category = categories.find(cat => cat.id === categoryId);
        return { category, amount };
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-purple-200">Here's your financial overview</p>
          </div>
          <div className="bg-white/10 rounded-full p-3">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Net Balance</p>
              <p className="text-3xl font-bold">
                ${Math.abs(stats.netAmount).toFixed(2)}
              </p>
            </div>
            <div className={`flex items-center space-x-1 ${
              stats.netAmount >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {stats.netAmount >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">
                {stats.netAmount >= 0 ? 'Positive' : 'Negative'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-100 rounded-lg p-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Income</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-100 rounded-lg p-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Expenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 rounded-lg p-2">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${stats.monthlyExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
        
        {getTopCategories().length > 0 ? (
          <div className="space-y-4">
            {getTopCategories().map(({ category, amount }, index) => {
              if (!category) return null;
              
              const percentage = (amount / stats.totalExpenses) * 100;
              
              return (
                <div key={category.id} className="flex items-center space-x-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: category.color }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="text-gray-900 font-semibold">${amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
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
            <p className="text-gray-500">No expenses yet. Start tracking your spending!</p>
          </div>
        )}
      </div>
    </div>
  );
};