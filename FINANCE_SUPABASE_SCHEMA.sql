-- Finance Module Supabase Schema
-- Bu SQL faylni Supabase Dashboard → SQL Editor da bajarish kerak

-- 1. Transactions table
CREATE TABLE IF NOT EXISTS finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  month TEXT NOT NULL, -- Format: "YYYY-MM"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Debts table
CREATE TABLE IF NOT EXISTS finance_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('owed', 'lent')), -- "owed" = men qarz bergan, "lent" = men qarz olgan
  description TEXT NOT NULL,
  date DATE NOT NULL,
  month TEXT NOT NULL, -- Format: "YYYY-MM"
  paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Recurring Transactions table
CREATE TABLE IF NOT EXISTS finance_recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  last_executed DATE,
  next_due DATE,
  is_active BOOLEAN DEFAULT TRUE,
  reminder_days INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Savings Goals table
CREATE TABLE IF NOT EXISTS finance_savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15, 2) DEFAULT 0 CHECK (current_amount >= 0),
  description TEXT,
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Savings Contributions table
CREATE TABLE IF NOT EXISTS finance_savings_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES finance_savings_goals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_finance_transactions_user_month ON finance_transactions(user_id, month);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_user_date ON finance_transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_finance_debts_user_month ON finance_debts(user_id, month);
CREATE INDEX IF NOT EXISTS idx_finance_recurring_user_active ON finance_recurring_transactions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_finance_savings_user ON finance_savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_contributions_goal ON finance_savings_contributions(goal_id);

-- Enable Row Level Security
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_savings_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for finance_transactions
CREATE POLICY "Users can view their own transactions"
  ON finance_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON finance_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON finance_transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON finance_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for finance_debts
CREATE POLICY "Users can view their own debts"
  ON finance_debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts"
  ON finance_debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
  ON finance_debts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
  ON finance_debts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for finance_recurring_transactions
CREATE POLICY "Users can view their own recurring transactions"
  ON finance_recurring_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transactions"
  ON finance_recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
  ON finance_recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
  ON finance_recurring_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for finance_savings_goals
CREATE POLICY "Users can view their own savings goals"
  ON finance_savings_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings goals"
  ON finance_savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals"
  ON finance_savings_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals"
  ON finance_savings_goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for finance_savings_contributions
CREATE POLICY "Users can view their own contributions"
  ON finance_savings_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contributions"
  ON finance_savings_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions"
  ON finance_savings_contributions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contributions"
  ON finance_savings_contributions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_finance_transactions_updated_at BEFORE UPDATE ON finance_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_debts_updated_at BEFORE UPDATE ON finance_debts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_recurring_transactions_updated_at BEFORE UPDATE ON finance_recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_savings_goals_updated_at BEFORE UPDATE ON finance_savings_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

