import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface Transaction {
  id: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria_id: string | null;
  data: string;
  descricao: string;
  virtual?: boolean;
}

export const SALARY_TX_PREFIX = "salary-";
export const isVirtualTx = (id: string) => id.startsWith(SALARY_TX_PREFIX);

export interface Category {
  id: string;
  nome: string;
}

export interface Goal {
  id: string;
  nome: string;
  valor_objetivo: number;
  valor_atual: number;
  prazo: string;
}

export interface Profile {
  idade: number | null;
  salario: number | null;
  plano: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  profile: Profile;
  loading: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (nome: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, g: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProfile: (p: Partial<Profile>) => Promise<void>;
  refresh: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile>({ idade: null, salario: null, plano: "gratuito" });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const [txRes, catRes, goalRes, profRes] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id).order("data", { ascending: false }),
      supabase.from("categories").select("*").eq("user_id", user.id).order("nome"),
      supabase.from("goals").select("*").eq("user_id", user.id).order("prazo"),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);
    if (txRes.data) setTransactions(txRes.data as unknown as Transaction[]);
    if (catRes.data) setCategories(catRes.data);
    if (goalRes.data) setGoals(goalRes.data);
    if (profRes.data) setProfile({ idade: profRes.data.idade, salario: profRes.data.salario, plano: profRes.data.plano });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addTransaction = async (t: Omit<Transaction, "id">) => {
    const { virtual: _v, ...rest } = t as Omit<Transaction, "id"> & { virtual?: boolean };
    await supabase.from("transactions").insert({ ...rest, user_id: user!.id });
    fetchAll();
  };

  const updateTransaction = async (id: string, t: Partial<Transaction>) => {
    if (isVirtualTx(id)) return;
    const { virtual: _v, ...rest } = t as Partial<Transaction> & { virtual?: boolean };
    await supabase.from("transactions").update(rest).eq("id", id);
    fetchAll();
  };

  const deleteTransaction = async (id: string) => {
    if (isVirtualTx(id)) return;
    await supabase.from("transactions").delete().eq("id", id);
    fetchAll();
  };

  const addCategory = async (nome: string) => {
    await supabase.from("categories").insert({ nome, user_id: user!.id });
    fetchAll();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    fetchAll();
  };

  const addGoal = async (g: Omit<Goal, "id">) => {
    await supabase.from("goals").insert({ ...g, user_id: user!.id });
    fetchAll();
  };

  const updateGoal = async (id: string, g: Partial<Goal>) => {
    await supabase.from("goals").update(g).eq("id", id);
    fetchAll();
  };

  const deleteGoal = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    fetchAll();
  };

  const updateProfile = async (p: Partial<Profile>) => {
    await supabase.from("profiles").update(p).eq("id", user!.id);
    fetchAll();
  };

  return (
    <FinanceContext.Provider value={{
      transactions, categories, goals, profile, loading,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, deleteCategory,
      addGoal, updateGoal, deleteGoal,
      updateProfile, refresh: fetchAll,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
