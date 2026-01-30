/*
  # Add Budgets, Recurring Expenses, and Tags

  1. New Tables
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category_id` (uuid, references categories)
      - `amount` (decimal, monthly budget limit)
      - `month` (integer, 0-11)
      - `year` (integer)
      - `alert_threshold` (integer, percentage to trigger alert, default 80)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `recurring_expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (decimal)
      - `description` (text)
      - `category_id` (uuid, references categories)
      - `frequency` (text: 'daily', 'weekly', 'monthly', 'yearly')
      - `start_date` (date)
      - `end_date` (date, nullable)
      - `last_executed` (date, tracks last auto-creation)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
    
    - `expense_tags`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `color` (text, hex color)
      - `created_at` (timestamptz)
    
    - `expense_tag_relations`
      - `id` (uuid, primary key)
      - `expense_id` (uuid, references expenses)
      - `tag_id` (uuid, references expense_tags)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    
  3. Indexes
    - Added indexes for performance-critical queries
*/

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount decimal NOT NULL CHECK (amount > 0),
  month integer NOT NULL CHECK (month >= 0 AND month <= 11),
  year integer NOT NULL CHECK (year > 1900),
  alert_threshold integer DEFAULT 80 CHECK (alert_threshold > 0 AND alert_threshold <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id, month, year)
);

-- Create recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount decimal NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date,
  last_executed date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create expense tags table
CREATE TABLE IF NOT EXISTS expense_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create expense tag relations table
CREATE TABLE IF NOT EXISTS expense_tag_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES expense_tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(expense_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month_year ON budgets(user_id, month, year);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_active ON recurring_expenses(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_expense_tags_user_id ON expense_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_tag_relations_expense_id ON expense_tag_relations(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_tag_relations_tag_id ON expense_tag_relations(tag_id);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_tag_relations ENABLE ROW LEVEL SECURITY;

-- Budgets RLS Policies
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recurring Expenses RLS Policies
CREATE POLICY "Users can view own recurring expenses"
  ON recurring_expenses FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own recurring expenses"
  ON recurring_expenses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own recurring expenses"
  ON recurring_expenses FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own recurring expenses"
  ON recurring_expenses FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Expense Tags RLS Policies
CREATE POLICY "Users can view own tags"
  ON expense_tags FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own tags"
  ON expense_tags FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own tags"
  ON expense_tags FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own tags"
  ON expense_tags FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Expense Tag Relations RLS Policies
CREATE POLICY "Users can view own tag relations"
  ON expense_tag_relations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_id
      AND expenses.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own tag relations"
  ON expense_tag_relations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_id
      AND expenses.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own tag relations"
  ON expense_tag_relations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM expenses
      WHERE expenses.id = expense_id
      AND expenses.user_id = (select auth.uid())
    )
  );