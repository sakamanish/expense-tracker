import React from 'react';
import { Home, Plus, List, BarChart3, Wallet, LogOut, Target, TrendingDown, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { signOut, user } = useAuth();
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add', label: 'Add Transaction', icon: Plus },
    { id: 'list', label: 'Transaction History', icon: List },
    { id: 'budget', label: 'Budgets', icon: Target },
    { id: 'recurring', label: 'Recurring Expenses', icon: RotateCcw },
    { id: 'analytics', label: 'Analytics', icon: TrendingDown },
  ];

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r md:border-gray-200 md:min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-2">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ExpenseTracker</h1>
            <p className="text-sm text-gray-500">Manage your finances</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4">
          <p className="text-sm text-emerald-700">
            Logged in as <span className="font-medium">{user?.email}</span>
          </p>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all text-red-600 hover:bg-red-50 border border-red-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};