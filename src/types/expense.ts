export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface ExpenseStats {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  monthlyExpenses: number;
  categoryBreakdown: { [key: string]: number };
}