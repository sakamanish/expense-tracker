import { useState, useEffect } from 'react';
import { Expense, Category, ExpenseStats } from '../types/expense';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useExpenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchCategories();
    fetchExpenses();

    const expensesSubscription = supabase
      .channel('expenses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchExpenses();
        }
      )
      .subscribe();

    return () => {
      expensesSubscription.unsubscribe();
    };
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  };

  const fetchExpenses = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
      return;
    }

    const mappedExpenses: Expense[] = (data || []).map((exp) => ({
      id: exp.id,
      amount: parseFloat(exp.amount),
      description: exp.description,
      category: exp.category_id || '',
      date: exp.date,
      type: exp.type as 'income' | 'expense',
      createdAt: exp.created_at,
    }));

    setExpenses(mappedExpenses);
    setLoading(false);
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) return;

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount: expense.amount,
      description: expense.description,
      category_id: expense.category || null,
      date: expense.date,
      type: expense.type,
    });

    if (error) {
      console.error('Error adding expense:', error);
      return;
    }

    fetchExpenses();
  };

  const updateExpense = async (id: string, updatedExpense: Partial<Expense>) => {
    if (!user) return;

    const updateData: any = {};

    if (updatedExpense.amount !== undefined) updateData.amount = updatedExpense.amount;
    if (updatedExpense.description !== undefined) updateData.description = updatedExpense.description;
    if (updatedExpense.category !== undefined) updateData.category_id = updatedExpense.category || null;
    if (updatedExpense.date !== undefined) updateData.date = updatedExpense.date;
    if (updatedExpense.type !== undefined) updateData.type = updatedExpense.type;

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating expense:', error);
      return;
    }

    fetchExpenses();
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }

    fetchExpenses();
  };

  const getStats = (): ExpenseStats => {
    const totalIncome = expenses
      .filter((exp) => exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const totalExpenses = expenses
      .filter((exp) => exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = expenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        return (
          exp.type === 'expense' &&
          expDate.getMonth() === currentMonth &&
          expDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown = expenses
      .filter((exp) => exp.type === 'expense')
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
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    getStats,
  };
};