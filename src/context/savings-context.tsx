"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./auth-context";

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  description?: string;
  targetDate?: string; // Optional target date
  createdAt: string;
  contributions: Array<{
    id: string;
    amount: number;
    date: string;
    note?: string;
  }>;
}

interface SavingsContextType {
  goals: SavingsGoal[];
  loading: boolean;
  addGoal: (goal: Omit<SavingsGoal, "id" | "createdAt" | "currentAmount" | "contributions">) => Promise<void>;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, amount: number, date: string, note?: string) => Promise<void>;
  removeContribution: (goalId: string, contributionId: string) => Promise<void>;
  getGoalProgress: (goalId: string) => number; // Returns percentage 0-100
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export function SavingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("finance_savings_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (goalsError) throw goalsError;

      // Load contributions for each goal
      const goalsWithContributions = await Promise.all(
        (goalsData || []).map(async (goal: any) => {
          const { data: contributionsData, error: contributionsError } = await supabase
            .from("finance_savings_contributions")
            .select("*")
            .eq("goal_id", goal.id)
            .order("date", { ascending: false });

          if (contributionsError) throw contributionsError;

          return {
            id: goal.id,
            title: goal.title,
            targetAmount: Number(goal.target_amount),
            currentAmount: Number(goal.current_amount),
            description: goal.description,
            targetDate: goal.target_date,
            createdAt: goal.created_at,
            contributions: (contributionsData || []).map((c: any) => ({
              id: c.id,
              amount: Number(c.amount),
              date: c.date,
              note: c.note,
            })),
          };
        })
      );

      setGoals(goalsWithContributions);
    } catch (error) {
      console.error("Error loading savings goals:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load from Supabase
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [user, loadData]);

  const addGoal = async (goal: Omit<SavingsGoal, "id" | "createdAt" | "currentAmount" | "contributions">) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("finance_savings_goals")
      .insert({
        user_id: user.id,
        title: goal.title,
        target_amount: goal.targetAmount,
        current_amount: 0,
        description: goal.description || null,
        target_date: goal.targetDate || null,
      })
      .select()
      .single();

    if (error) throw error;

    const newGoal: SavingsGoal = {
      id: data.id,
      title: data.title,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      description: data.description,
      targetDate: data.target_date,
      createdAt: data.created_at,
      contributions: [],
    };

    setGoals([newGoal, ...goals]);
  };

  const updateGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    if (!user) throw new Error("User not authenticated");

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate || null;

    const { data, error } = await supabase
      .from("finance_savings_goals")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    // Reload to get contributions
    await loadData();
  };

  const deleteGoal = async (id: string) => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("finance_savings_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    setGoals(goals.filter((g) => g.id !== id));
  };

  const addContribution = async (goalId: string, amount: number, date: string, note?: string) => {
    if (!user) throw new Error("User not authenticated");

    // Insert contribution
    const { data: contributionData, error: contributionError } = await supabase
      .from("finance_savings_contributions")
      .insert({
        goal_id: goalId,
        user_id: user.id,
        amount,
        date,
        note: note || null,
      })
      .select()
      .single();

    if (contributionError) throw contributionError;

    // Update goal current_amount
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      const newCurrentAmount = goal.currentAmount + amount;
      const { error: updateError } = await supabase
        .from("finance_savings_goals")
        .update({ current_amount: newCurrentAmount })
        .eq("id", goalId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    }

    // Reload data
    await loadData();
  };

  const removeContribution = async (goalId: string, contributionId: string) => {
    if (!user) throw new Error("User not authenticated");

    // Get contribution amount before deleting
    const goal = goals.find((g) => g.id === goalId);
    const contribution = goal?.contributions.find((c) => c.id === contributionId);
    if (!contribution) return;

    // Delete contribution
    const { error: deleteError } = await supabase
      .from("finance_savings_contributions")
      .delete()
      .eq("id", contributionId)
      .eq("user_id", user.id);

    if (deleteError) throw deleteError;

    // Update goal current_amount
    if (goal) {
      const newCurrentAmount = goal.currentAmount - contribution.amount;
      const { error: updateError } = await supabase
        .from("finance_savings_goals")
        .update({ current_amount: newCurrentAmount })
        .eq("id", goalId)
        .eq("user_id", user.id);

      if (updateError) throw updateError;
    }

    // Reload data
    await loadData();
  };

  const getGoalProgress = (goalId: string): number => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || goal.targetAmount === 0) return 0;
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <SavingsContext.Provider
      value={{
        goals,
        loading,
        addGoal,
        updateGoal,
        deleteGoal,
        addContribution,
        removeContribution,
        getGoalProgress,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error("useSavings must be used within SavingsProvider");
  }
  return context;
}

