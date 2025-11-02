"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./auth-context";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
  category?: string;
  month: string; // Format: "YYYY-MM"
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  type: "owed" | "lent"; // "owed" = men qarz bergan, "lent" = men qarz olgan
  description: string;
  date: string;
  month: string; // Format: "YYYY-MM"
  paid?: boolean;
  paidDate?: string;
}

export interface RecurringTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category?: string;
  frequency: "monthly" | "weekly" | "yearly"; // Har oy, har hafta, har yil
  dayOfMonth?: number; // 1-31
  dayOfWeek?: number; // 0-6 (0 = yakshanba)
  lastExecuted?: string; // Oxirgi qachon bajarilgan
  nextDue?: string; // Keyingi muddat
  isActive: boolean;
  reminderDays?: number; // Necha kun oldin eslatish
}

export interface MonthlyReport {
  month: string; // Format: "YYYY-MM"
  income: number; // Faqat bu oyning kirimi
  expenses: number; // Faqat bu oyning chiqimi
  debtsOwed: number; // Men kimlargadir qarz bergan (yopilmaganlar, barcha vaqt)
  debtsLent: number; // Men kimlardan qarz olgan (yopilmaganlar, barcha vaqt)
  transactions: Transaction[];
}

interface FinanceContextType {
  transactions: Transaction[];
  debts: Debt[];
  recurringTransactions: RecurringTransaction[];
  monthlyReports: MonthlyReport[];
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, "id" | "month">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, "id" | "month">) => Promise<void>;
  updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, "id" | "nextDue">) => Promise<void>;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  executeRecurringTransaction: (id: string) => Promise<void>;
  getUpcomingRecurringTransactions: () => RecurringTransaction[];
  getCurrentMonthData: () => MonthlyReport;
  getMonthData: (month: string) => MonthlyReport;
  getAvailableMonths: () => string[];
  getTotalBalance: () => number; // Umumiy balans (barcha tranzaksiyalar bo'yicha)
  getTotalIncome: () => number; // Jami kirim (barcha vaqt)
  getTotalExpenses: () => number; // Jami chiqim (barcha vaqt)
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setTransactions([]);
      setDebts([]);
      setRecurringTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("finance_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (transactionsError) throw transactionsError;

      const loadedTransactions: Transaction[] = (transactionsData || []).map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        date: t.date,
        category: t.category,
        month: t.month,
      }));

      // Load debts
      const { data: debtsData, error: debtsError } = await supabase
        .from("finance_debts")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (debtsError) throw debtsError;

      const loadedDebts: Debt[] = (debtsData || []).map((d: any) => ({
        id: d.id,
        person: d.person,
        amount: Number(d.amount),
        type: d.type,
        description: d.description,
        date: d.date,
        month: d.month,
        paid: d.paid,
        paidDate: d.paid_date,
      }));

      // Load recurring transactions
      const { data: recurringData, error: recurringError } = await supabase
        .from("finance_recurring_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (recurringError) throw recurringError;

      const loadedRecurring: RecurringTransaction[] = (recurringData || []).map((r: any) => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount),
        description: r.description,
        category: r.category,
        frequency: r.frequency,
        dayOfMonth: r.day_of_month,
        dayOfWeek: r.day_of_week,
        lastExecuted: r.last_executed,
        nextDue: r.next_due,
        isActive: r.is_active,
        reminderDays: r.reminder_days,
      }));

      setTransactions(loadedTransactions);
      setDebts(loadedDebts);
      setRecurringTransactions(loadedRecurring);
    } catch (error) {
      console.error("Error loading finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthFromDate = (date: string): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const addTransaction = async (transaction: Omit<Transaction, "id" | "month">) => {
    if (!user) throw new Error("User not authenticated");

    const month = getMonthFromDate(transaction.date);
    const { data, error } = await supabase
      .from("finance_transactions")
      .insert({
        user_id: user.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        category: transaction.category || null,
        month,
      })
      .select()
      .single();

    if (error) throw error;

    const newTransaction: Transaction = {
      id: data.id,
      type: data.type,
      amount: Number(data.amount),
      description: data.description,
      date: data.date,
      category: data.category,
      month: data.month,
    };

    setTransactions([newTransaction, ...transactions]);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) throw new Error("User not authenticated");

    const updateData: any = {};
    if (updates.type) updateData.type = updates.type;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date) {
      updateData.date = updates.date;
      updateData.month = getMonthFromDate(updates.date);
    }
    if (updates.category !== undefined) updateData.category = updates.category || null;

    const { data, error } = await supabase
      .from("finance_transactions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    setTransactions(
      transactions.map((t) => {
        if (t.id === id) {
          return {
            id: data.id,
            type: data.type,
            amount: Number(data.amount),
            description: data.description,
            date: data.date,
            category: data.category,
            month: data.month,
          };
        }
        return t;
      })
    );
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const addDebt = async (debt: Omit<Debt, "id" | "month">) => {
    if (!user) throw new Error("User not authenticated");

    const month = getMonthFromDate(debt.date);
    const { data, error } = await supabase
      .from("finance_debts")
      .insert({
        user_id: user.id,
        person: debt.person,
        amount: debt.amount,
        type: debt.type,
        description: debt.description,
        date: debt.date,
        month,
        paid: debt.paid || false,
        paid_date: debt.paidDate || null,
      })
      .select()
      .single();

    if (error) throw error;

    const newDebt: Debt = {
      id: data.id,
      person: data.person,
      amount: Number(data.amount),
      type: data.type,
      description: data.description,
      date: data.date,
      month: data.month,
      paid: data.paid,
      paidDate: data.paid_date,
    };

    setDebts([newDebt, ...debts]);
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    if (!user) throw new Error("User not authenticated");

    const updateData: any = {};
    if (updates.person) updateData.person = updates.person;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.type) updateData.type = updates.type;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date) {
      updateData.date = updates.date;
      updateData.month = getMonthFromDate(updates.date);
    }
    if (updates.paid !== undefined) updateData.paid = updates.paid;
    if (updates.paidDate !== undefined) updateData.paid_date = updates.paidDate || null;

    const { data, error } = await supabase
      .from("finance_debts")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    setDebts(
      debts.map((d) => {
        if (d.id === id) {
          return {
            id: data.id,
            person: data.person,
            amount: Number(data.amount),
            type: data.type,
            description: data.description,
            date: data.date,
            month: data.month,
            paid: data.paid,
            paidDate: data.paid_date,
          };
        }
        return d;
      })
    );
  };

  const deleteDebt = async (id: string) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("finance_debts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    setDebts(debts.filter((d) => d.id !== id));
  };

  const getMonthData = (month: string): MonthlyReport => {
    const monthTransactions = transactions.filter((t) => t.month === month);

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Qarzlar oylik emas, barcha yopilmagan qarzlar hisoblanadi
    const debtsOwed = debts
      .filter((d) => d.type === "owed" && !d.paid)
      .reduce((sum, d) => sum + d.amount, 0);

    const debtsLent = debts
      .filter((d) => d.type === "lent" && !d.paid)
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      month,
      income,
      expenses,
      debtsOwed,
      debtsLent,
      transactions: monthTransactions,
    };
  };

  const getCurrentMonthData = (): MonthlyReport => {
    return getMonthData(currentMonth);
  };

  const calculateNextDue = (recurring: RecurringTransaction): string => {
    const now = new Date();
    let nextDate = new Date();

    if (recurring.frequency === "monthly") {
      nextDate = new Date(now.getFullYear(), now.getMonth(), recurring.dayOfMonth || 1);
      if (nextDate <= now) {
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, recurring.dayOfMonth || 1);
      }
    } else if (recurring.frequency === "weekly") {
      const dayOfWeek = recurring.dayOfWeek || 0;
      const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7 || 7;
      nextDate = new Date(now);
      nextDate.setDate(now.getDate() + daysUntilNext);
    } else if (recurring.frequency === "yearly") {
      nextDate = new Date(now.getFullYear() + 1, now.getMonth(), recurring.dayOfMonth || 1);
      if (nextDate <= now) {
        nextDate = new Date(now.getFullYear() + 2, now.getMonth(), recurring.dayOfMonth || 1);
      }
    }

    return nextDate.toISOString().split("T")[0];
  };

  const addRecurringTransaction = async (recurring: Omit<RecurringTransaction, "id" | "nextDue">) => {
    if (!user) throw new Error("User not authenticated");

    const nextDue = calculateNextDue(recurring as RecurringTransaction);
    const { data, error } = await supabase
      .from("finance_recurring_transactions")
      .insert({
        user_id: user.id,
        type: recurring.type,
        amount: recurring.amount,
        description: recurring.description,
        category: recurring.category || null,
        frequency: recurring.frequency,
        day_of_month: recurring.dayOfMonth || null,
        day_of_week: recurring.dayOfWeek || null,
        is_active: recurring.isActive !== false,
        reminder_days: recurring.reminderDays || 3,
        next_due: nextDue,
      })
      .select()
      .single();

    if (error) throw error;

    const newRecurring: RecurringTransaction = {
      id: data.id,
      type: data.type,
      amount: Number(data.amount),
      description: data.description,
      category: data.category,
      frequency: data.frequency,
      dayOfMonth: data.day_of_month,
      dayOfWeek: data.day_of_week,
      lastExecuted: data.last_executed,
      nextDue: data.next_due,
      isActive: data.is_active,
      reminderDays: data.reminder_days,
    };

    setRecurringTransactions([newRecurring, ...recurringTransactions]);
  };

  const updateRecurringTransaction = async (id: string, updates: Partial<RecurringTransaction>) => {
    if (!user) throw new Error("User not authenticated");

    const updateData: any = {};
    if (updates.type) updateData.type = updates.type;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category || null;
    if (updates.frequency) updateData.frequency = updates.frequency;
    if (updates.dayOfMonth !== undefined) updateData.day_of_month = updates.dayOfMonth || null;
    if (updates.dayOfWeek !== undefined) updateData.day_of_week = updates.dayOfWeek || null;
    if (updates.lastExecuted !== undefined) updateData.last_executed = updates.lastExecuted || null;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.reminderDays !== undefined) updateData.reminder_days = updates.reminderDays;

    // Recalculate nextDue if frequency or day changed
    const existing = recurringTransactions.find((r) => r.id === id);
    if (existing && (updates.frequency || updates.dayOfMonth || updates.dayOfWeek)) {
      const updated = { ...existing, ...updates };
      updateData.next_due = calculateNextDue(updated);
    }

    const { data, error } = await supabase
      .from("finance_recurring_transactions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    setRecurringTransactions(
      recurringTransactions.map((r) => {
        if (r.id === id) {
          return {
            id: data.id,
            type: data.type,
            amount: Number(data.amount),
            description: data.description,
            category: data.category,
            frequency: data.frequency,
            dayOfMonth: data.day_of_month,
            dayOfWeek: data.day_of_week,
            lastExecuted: data.last_executed,
            nextDue: data.next_due,
            isActive: data.is_active,
            reminderDays: data.reminder_days,
          };
        }
        return r;
      })
    );
  };

  const deleteRecurringTransaction = async (id: string) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("finance_recurring_transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    setRecurringTransactions(recurringTransactions.filter((r) => r.id !== id));
  };

  const executeRecurringTransaction = async (id: string) => {
    const recurring = recurringTransactions.find((r) => r.id === id);
    if (!recurring || !recurring.isActive) {
      throw new Error("Tranzaksiya topilmadi yoki faol emas");
    }

    // Check if already executed this month
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    
    if (recurring.lastExecuted) {
      const lastExecutedDate = new Date(recurring.lastExecuted);
      const lastExecutedMonth = `${lastExecutedDate.getFullYear()}-${String(lastExecutedDate.getMonth() + 1).padStart(2, "0")}`;
      
      if (lastExecutedMonth === currentMonth) {
        throw new Error("Bu to'lov bu oyda allaqachon bajarilgan");
      }
    }

    const todayStr = today.toISOString().split("T")[0];
    await addTransaction({
      type: recurring.type,
      amount: recurring.amount,
      description: recurring.description,
      date: todayStr,
      category: recurring.category,
    });

    // Update lastExecuted and nextDue
    const nextDue = calculateNextDue({ ...recurring, lastExecuted: todayStr });
    await updateRecurringTransaction(id, {
      lastExecuted: todayStr,
      nextDue,
    });
  };

  const getUpcomingRecurringTransactions = (): RecurringTransaction[] => {
    const today = new Date();
    const reminderDays = 3; // Default 3 days before
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + reminderDays);
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    return recurringTransactions
      .filter((r) => {
        if (!r.isActive || !r.nextDue) return false;
        
        // Check if already executed this month - if yes, don't show notification
        if (r.lastExecuted) {
          const lastExecutedDate = new Date(r.lastExecuted);
          const lastExecutedMonth = `${lastExecutedDate.getFullYear()}-${String(lastExecutedDate.getMonth() + 1).padStart(2, "0")}`;
          if (lastExecutedMonth === currentMonth) {
            return false; // Don't show notification if already executed this month
          }
        }
        
        const dueDate = new Date(r.nextDue);
        return dueDate <= reminderDate && dueDate >= today;
      })
      .sort((a, b) => {
        if (!a.nextDue || !b.nextDue) return 0;
        return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
      });
  };

  const getAvailableMonths = (): string[] => {
    const months = new Set<string>();
    transactions.forEach((t) => months.add(t.month));
    debts.forEach((d) => months.add(d.month));
    return Array.from(months).sort().reverse();
  };

  const getTotalBalance = (): number => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return totalIncome - totalExpenses;
  };

  const getTotalIncome = (): number => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = (): number => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        debts,
        recurringTransactions,
        monthlyReports: getAvailableMonths().map((m) => getMonthData(m)),
        currentMonth,
        setCurrentMonth,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addDebt,
        updateDebt,
        deleteDebt,
        addRecurringTransaction,
        updateRecurringTransaction,
        deleteRecurringTransaction,
        executeRecurringTransaction,
        getUpcomingRecurringTransactions,
        getCurrentMonthData,
        getMonthData,
        getAvailableMonths,
        getTotalBalance,
        getTotalIncome,
        getTotalExpenses,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return context;
}

