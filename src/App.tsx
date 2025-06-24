import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Statistics } from './components/Statistics';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        <div className="p-4 md:p-6 pb-20 md:pb-6 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;