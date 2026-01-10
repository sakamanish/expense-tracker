/*
  # Fix Category Trigger RLS Issue

  The previous trigger was failing because RLS policies were blocking the insertion
  of default categories. The function needs SECURITY DEFINER to bypass RLS, and we
  need to add a specific RLS policy that allows the trigger function to insert.

  Changes:
  - Add RLS policy for the trigger to insert categories
  - Update trigger to handle errors gracefully
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function
DROP FUNCTION IF EXISTS create_default_categories();

-- Create RLS policy for trigger function to bypass restrictions
CREATE POLICY "Service role can insert default categories"
  ON categories FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Recreate function with improved error handling
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, icon) VALUES
    (NEW.id, 'Food & Dining', '#F59E0B', 'UtensilsCrossed'),
    (NEW.id, 'Transportation', '#3B82F6', 'Car'),
    (NEW.id, 'Shopping', '#EF4444', 'ShoppingBag'),
    (NEW.id, 'Entertainment', '#8B5CF6', 'Gamepad2'),
    (NEW.id, 'Bills & Utilities', '#06B6D4', 'Receipt'),
    (NEW.id, 'Healthcare', '#10B981', 'Heart'),
    (NEW.id, 'Education', '#F97316', 'GraduationCap'),
    (NEW.id, 'Salary', '#22C55E', 'DollarSign'),
    (NEW.id, 'Other', '#6B7280', 'MoreHorizontal');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating default categories for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger with AFTER INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();