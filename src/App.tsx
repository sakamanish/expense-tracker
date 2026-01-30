import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Statistics } from './components/Statistics';
import { BudgetManager } from './components/BudgetManager';
import { RecurringExpenses } from './components/RecurringExpenses';
import { Analytics } from './components/Analytics';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'add':
        return <ExpenseForm />;
      case 'list':
        return <ExpenseList />;
      case 'stats':
        return <Statistics />;
      case 'budget':
        return <BudgetManager />;
      case 'recurring':
        return <RecurringExpenses />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 md:ml-0">
        <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;