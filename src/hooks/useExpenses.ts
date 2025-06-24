import { useState, useEffect } from 'react';
import { Expense, Category, ExpenseStats } from '../types/expense';

const STORAGE_KEY = 'expense_manager_data';
const CATEGORIES_KEY = 'expense_manager_categories';

const defaultCategories: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#F59E0B', icon: 'UtensilsCrossed' },
  { id: '2', name: 'Transportation', color: '#3B82F6', icon: 'Car' },
  { id: '3', name: 'Shopping', color: '#EF4444', icon: 'ShoppingBag' },
  { id: '4', name: 'Entertainment', color: '#8B5CF6', icon: 'Gamepad2' },
  { id: '5', name: 'Bills & Utilities', color: '#06B6D4', icon: 'Receipt' },
  { id: '6', name: 'Healthcare', color: '#10B981', icon: 'Heart' },
  { id: '7', name: 'Education', color: '#F97316', icon: 'GraduationCap' },
  { id: '8', name: 'Salary', color: '#22C55E', icon: 'DollarSign' },
  { id: '9', name: 'Other', color: '#6B7280', icon: 'MoreHorizontal' },
];

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    const savedExpenses = localStorage.getItem(STORAGE_KEY);
    const savedCategories = localStorage.getItem(CATEGORIES_KEY);
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    saveExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    const newExpenses = expenses.map(exp => 
      exp.id === id ? { ...exp, ...updatedExpense } : exp
    );
    saveExpenses(newExpenses);
  };

  const deleteExpense = (id: string) => {
    const newExpenses = expenses.filter(exp => exp.id !== id);
    saveExpenses(newExpenses);
  };

  const getStats = (): ExpenseStats => {
    const totalIncome = expenses
      .filter(exp => exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const totalExpenses = expenses
      .filter(exp => exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return exp.type === 'expense' && 
               expDate.getMonth() === currentMonth && 
               expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown = expenses
      .filter(exp => exp.type === 'expense')
      .reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as { [key: string]: number });

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      monthlyExpenses,
      categoryBreakdown,
    };
  };

  return {
    expenses,
    categories,
    addExpense,
    updateExpense,
    deleteExpense,
    getStats,
  };
};