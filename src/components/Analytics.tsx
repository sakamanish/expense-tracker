import React, { useEffect, useState } from 'react';
import { Download, TrendingDown, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../contexts/AuthContext';

interface MonthlyData {
  month: string;
  expenses: number;
  income: number;
}

export const Analytics: React.FC = () => {
  const { expenses, categories } = useExpenses();
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topCategories, setTopCategories] = useState<Array<{ name: string; amount: number; color: string }>>([]);

  useEffect(() => {
    calculateMonthlyData();
    calculateTopCategories();
  }, [expenses]);

  const calculateMonthlyData = () => {
    const monthlyMap = new Map<string, { expenses: number; income: number }>();

    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { expenses: 0, income: 0 });
      }

      const data = monthlyMap.get(key)!;
      if (exp.type === 'expense') {
        data.expenses += exp.amount;
      } else {
        data.income += exp.amount;
      }
    });

    const sorted = Array.from(monthlyMap.entries())
      .sort()
      .slice(-6)
      .map(([key, data]) => ({
        month: key,
        ...data,
      }));

    setMonthlyData(sorted);
  };

  const calculateTopCategories = () => {
    const categoryMap = new Map<string, number>();

    expenses
      .filter((exp) => exp.type === 'expense')
      .forEach((exp) => {
        categoryMap.set(
          exp.category,
          (categoryMap.get(exp.category) || 0) + exp.amount
        );
      });

    const sorted = Array.from(categoryMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([categoryId, amount]) => {
        const cat = categories.find((c) => c.id === categoryId);
        return {
          name: cat?.name || 'Unknown',
          amount,
          color: cat?.color || '#6B7280',
        };
      });

    setTopCategories(sorted);
  };

  const exportToCSV = () => {
    if (!user) return;

    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
    const rows = expenses.map((exp) => {
      const cat = categories.find((c) => c.id === exp.category);
      return [
        exp.date,
        exp.description,
        cat?.name || 'Unknown',
        exp.amount,
        exp.type,
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalExpenses = expenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <TrendingDown className="w-6 h-6 text-purple-600" />
          <span>Analytics & Insights</span>
        </h2>
        <button
          onClick={exportToCSV}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Income</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Total Expenses</p>
          <p className="text-3xl font-bold text-red-900 mt-2">${totalExpenses.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Savings Rate</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{savingsRate.toFixed(1)}%</p>
        </div>
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Last 6 Months Trend</span>
          </h3>

          <div className="space-y-4">
            {monthlyData.map((data) => {
              const maxValue = Math.max(
                ...monthlyData.map((m) => Math.max(m.expenses, m.income))
              );
              const expensePercent = (data.expenses / maxValue) * 100;
              const incomePercent = (data.income / maxValue) * 100;

              return (
                <div key={data.month}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(data.month + '-01').toLocaleDateString('default', {
                        month: 'short',
                        year: '2-digit',
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      Net: ${(data.income - data.expenses).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <div className="bg-red-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${expensePercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Exp: ${data.expenses.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex-1">
                      <div className="bg-green-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${incomePercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Inc: ${data.income.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topCategories.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            <span>Top Spending Categories</span>
          </h3>

          <div className="space-y-3">
            {topCategories.map((cat) => {
              const percent = (cat.amount / (totalExpenses || 1)) * 100;
              return (
                <div key={cat.name}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${cat.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ backgroundColor: cat.color, width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1">{percent.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No data yet. Start adding expenses to see analytics!</p>
        </div>
      )}
    </div>
  );
};
