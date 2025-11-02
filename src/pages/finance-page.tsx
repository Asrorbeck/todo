"use client";

import { useState, useEffect } from "react";
import { useFinance } from "@/context/finance-context";
import { useSavings } from "@/context/savings-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { AddTransactionDialog } from "@/components/dialogs/add-transaction-dialog";
import { AddDebtDialog } from "@/components/dialogs/add-debt-dialog";
import { AddRecurringTransactionDialog } from "@/components/dialogs/add-recurring-transaction-dialog";
import { AddSavingsGoalDialog } from "@/components/dialogs/add-savings-goal-dialog";
import { AddContributionDialog } from "@/components/dialogs/add-contribution-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel } from "@/lib/categories";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function FinancePage() {
  const {
    currentMonth,
    setCurrentMonth,
    getCurrentMonthData,
    getMonthData,
    getAvailableMonths,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    deleteTransaction,
    deleteDebt,
    updateDebt,
    debts,
    recurringTransactions,
    executeRecurringTransaction,
    getUpcomingRecurringTransactions,
    deleteRecurringTransaction,
    updateRecurringTransaction,
  } = useFinance();

  const {
    goals,
    deleteGoal,
    removeContribution,
    getGoalProgress,
  } = useSavings();

  const { toast } = useToast();

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "transactions" | "debts" | "history" | "recurring" | "savings">("overview");
  
  // Confirmation dialogs state
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
  const [deleteDebtId, setDeleteDebtId] = useState<string | null>(null);
  const [deleteRecurringId, setDeleteRecurringId] = useState<string | null>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [deleteContributionId, setDeleteContributionId] = useState<{ goalId: string; contributionId: string } | null>(null);

  const upcomingRecurring = getUpcomingRecurringTransactions();

  const monthData = getCurrentMonthData();
  const availableMonths = getAvailableMonths();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const monthIndex = parseInt(monthNum) - 1;
    const monthNames = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
      "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];
    return `${monthNames[monthIndex]} ${year}`;
  };

  const getMonthOptions = () => {
    const options: string[] = [];
    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      options.push(`${year}-${month}`);
      current.setMonth(current.getMonth() - 1);
    }
    
    return options;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Moliyaviy Hisobot</h1>
          <p className="text-muted-foreground">Kirim-chiqim va qarzlarini kuzatib boring</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={currentMonth} onValueChange={setCurrentMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Oyni tanlang" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddTransactionOpen(true)} className="gap-2">
            <Icons.plus className="h-4 w-4" />
            Kirim/Chiqim
          </Button>
          <Button onClick={() => setIsAddDebtOpen(true)} variant="outline" className="gap-2">
            <Icons.plus className="h-4 w-4" />
            Qarz
          </Button>
          <Button onClick={() => setIsAddRecurringOpen(true)} variant="outline" className="gap-2">
            <Icons.plus className="h-4 w-4" />
            Takrorlanuvchi
          </Button>
          <Button onClick={() => setIsAddSavingsOpen(true)} variant="outline" className="gap-2">
            <Icons.plus className="h-4 w-4" />
            Jamg'arma
          </Button>
        </div>
      </div>

      {/* Notifications for upcoming recurring transactions */}
      {upcomingRecurring.length > 0 && (
        <div className="mb-6 space-y-2">
          {upcomingRecurring.map((recurring) => {
            const daysUntil = Math.ceil(
              (new Date(recurring.nextDue!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <Card key={recurring.id} className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icons.bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="font-medium">{recurring.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {daysUntil === 0
                          ? "Bugun"
                          : daysUntil === 1
                          ? "Ertaga"
                          : `${daysUntil} kun qoldi`} - {formatCurrency(recurring.amount)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(() => {
                      const today = new Date();
                      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
                      const alreadyExecutedThisMonth = recurring.lastExecuted && (() => {
                        const lastExecutedDate = new Date(recurring.lastExecuted);
                        const lastExecutedMonth = `${lastExecutedDate.getFullYear()}-${String(lastExecutedDate.getMonth() + 1).padStart(2, "0")}`;
                        return lastExecutedMonth === currentMonth;
                      })();

                      return (
                        <Button
                          size="sm"
                          disabled={!!alreadyExecutedThisMonth}
                          onClick={async () => {
                            try {
                              await executeRecurringTransaction(recurring.id);
                              toast({
                                title: "Muvaffaqiyatli",
                                description: "Tranzaksiya qo'shildi",
                              });
                            } catch (error: any) {
                              toast({
                                title: "Xato",
                                description: error.message || "Xatolik yuz berdi",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          {alreadyExecutedThisMonth ? "Bu oy bajarildi" : "Bajarildi"}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Joriy oy kirim</div>
            <Icons.arrowUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-500">{formatCurrency(monthData.income)}</div>
          <div className="text-xs text-muted-foreground mt-1">Jami: {formatCurrency(getTotalIncome())}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Joriy oy chiqim</div>
            <Icons.arrowDown className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-500">{formatCurrency(monthData.expenses)}</div>
          <div className="text-xs text-muted-foreground mt-1">Jami: {formatCurrency(getTotalExpenses())}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Umumiy Balans</div>
          </div>
          <div className={`text-3xl font-bold ${getTotalBalance() >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(getTotalBalance())}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Joriy oy: {formatCurrency(monthData.income - monthData.expenses)}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Qarzlar</div>
          </div>
          <div className="text-3xl font-bold">
            {formatCurrency(monthData.debtsOwed + monthData.debtsLent)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Berilgan: {formatCurrency(monthData.debtsOwed)} | Olgan: {formatCurrency(monthData.debtsLent)}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <Button
          variant={selectedTab === "overview" ? "default" : "ghost"}
          onClick={() => setSelectedTab("overview")}
          className="rounded-b-none"
        >
          Umumiy ko'rinish
        </Button>
        <Button
          variant={selectedTab === "transactions" ? "default" : "ghost"}
          onClick={() => setSelectedTab("transactions")}
          className="rounded-b-none"
        >
          Tranzaksiyalar ({monthData.transactions.length})
        </Button>
        <Button
          variant={selectedTab === "debts" ? "default" : "ghost"}
          onClick={() => setSelectedTab("debts")}
          className="rounded-b-none"
        >
          Qarzlar ({debts.filter((d) => !d.paid).length})
        </Button>
        <Button
          variant={selectedTab === "history" ? "default" : "ghost"}
          onClick={() => setSelectedTab("history")}
          className="rounded-b-none"
        >
          Oylik Hisobotlar
        </Button>
        <Button
          variant={selectedTab === "recurring" ? "default" : "ghost"}
          onClick={() => setSelectedTab("recurring")}
          className="rounded-b-none"
        >
          Takrorlanuvchi ({recurringTransactions.filter((r) => r.isActive).length})
        </Button>
        <Button
          variant={selectedTab === "savings" ? "default" : "ghost"}
          onClick={() => setSelectedTab("savings")}
          className="rounded-b-none"
        >
          Jamg'arma ({goals.length})
        </Button>
      </div>

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">So'nggi Tranzaksiyalar</h3>
            {monthData.transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">Tranzaksiyalar mavjud emas</p>
            ) : (
              <div className="space-y-3">
                {monthData.transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === "income" ? (
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <Icons.arrowUp className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-500/10 rounded-full">
                          <Icons.arrowDown className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("uz-UZ")}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Debts */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Faol Qarzlar</h3>
            {debts.filter((d) => !d.paid).length === 0 ? (
              <p className="text-muted-foreground text-sm">Faol qarzlar mavjud emas</p>
            ) : (
              <div className="space-y-3">
                {debts.filter((d) => !d.paid)
                  .slice(0, 5)
                  .map((debt) => (
                    <div
                      key={debt.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{debt.person}</div>
                        <div className="text-xs text-muted-foreground">{debt.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={debt.type === "owed" ? "default" : "secondary"}>
                          {debt.type === "owed" ? "Berilgan" : "Olgan"}
                        </Badge>
                        <div className="font-bold">{formatCurrency(debt.amount)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {selectedTab === "transactions" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Barcha Tranzaksiyalar</h3>
          {monthData.transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Tranzaksiyalar mavjud emas</p>
              <Button onClick={() => setIsAddTransactionOpen(true)}>Birinchisini qo'shing</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {monthData.transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {transaction.type === "income" ? (
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <Icons.arrowUp className="h-5 w-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-500/10 rounded-full">
                          <Icons.arrowDown className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("uz-UZ", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {transaction.category && ` • ${getCategoryLabel(transaction.category)}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`font-bold text-lg ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await deleteTransaction(transaction.id);
                            toast({
                              title: "Muvaffaqiyatli",
                              description: "Tranzaksiya o'chirildi",
                            });
                          } catch (error: any) {
                            toast({
                              title: "Xato",
                              description: error.message || "O'chirishda xatolik",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}

      {/* Debts Tab */}
      {selectedTab === "debts" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Barcha Qarzlar</h3>
          {debts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Qarzlar mavjud emas</p>
              <Button onClick={() => setIsAddDebtOpen(true)}>Birinchisini qo'shing</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {debts
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((debt) => (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-full ${debt.type === "owed" ? "bg-blue-500/10" : "bg-orange-500/10"}`}>
                        {debt.type === "owed" ? (
                          <Icons.arrowUp className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Icons.arrowDown className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{debt.person}</div>
                        <div className="text-sm text-muted-foreground">
                          {debt.description}
                          {debt.paid && debt.paidDate && (
                            <span className="ml-2 text-green-500">
                              • To'langan: {new Date(debt.paidDate).toLocaleDateString("uz-UZ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={debt.type === "owed" ? "default" : "secondary"}>
                        {debt.type === "owed" ? "Men bergan" : "Men olgan"}
                      </Badge>
                      <div className={`font-bold text-lg ${debt.paid ? "line-through text-muted-foreground" : ""}`}>
                        {formatCurrency(debt.amount)}
                      </div>
                      {!debt.paid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await updateDebt(debt.id, { paid: true, paidDate: new Date().toISOString() });
                              toast({
                                title: "Muvaffaqiyatli",
                                description: "Qarz to'langan deb belgilandi",
                              });
                            } catch (error: any) {
                              toast({
                                title: "Xato",
                                description: error.message || "Xatolik yuz berdi",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="text-green-500 hover:text-green-600"
                        >
                          To'landi
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDebtId(debt.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}

      {/* History Tab */}
      {selectedTab === "history" && (
        <div className="space-y-4">
          {availableMonths.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center py-8">Hisobotlar mavjud emas</p>
            </Card>
          ) : (
            availableMonths.map((month) => {
              const monthReport = getMonthData(month);
              
              return (
                <Card key={month} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{formatMonth(month)}</h3>
                    {month === currentMonth && (
                      <Badge variant="default">Joriy oy</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Kirim</div>
                      <div className="text-lg font-bold text-green-500">{formatCurrency(monthReport.income)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Chiqim</div>
                      <div className="text-lg font-bold text-red-500">{formatCurrency(monthReport.expenses)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Oy farqi</div>
                      <div className={`text-lg font-bold ${(monthReport.income - monthReport.expenses) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatCurrency(monthReport.income - monthReport.expenses)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Tranzaksiyalar</div>
                      <div className="text-lg font-bold">{monthReport.transactions.length}</div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Recurring Transactions Tab */}
      {selectedTab === "recurring" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Takrorlanuvchi Tranzaksiyalar</h3>
          {recurringTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Takrorlanuvchi tranzaksiyalar mavjud emas</p>
              <Button onClick={() => setIsAddRecurringOpen(true)}>Birinchisini qo'shing</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringTransactions.map((recurring) => {
                const daysUntil = recurring.nextDue
                  ? Math.ceil((new Date(recurring.nextDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                const frequencyLabels = {
                  weekly: "Har hafta",
                  monthly: "Har oy",
                  yearly: "Har yil",
                };
                return (
                  <div
                    key={recurring.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-full ${recurring.type === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        {recurring.type === "income" ? (
                          <Icons.arrowUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <Icons.arrowDown className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{recurring.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {frequencyLabels[recurring.frequency]}
                          {recurring.category && ` • ${getCategoryLabel(recurring.category)}`}
                          {recurring.nextDue && (
                            <span className="ml-2">
                              • Keyingi: {new Date(recurring.nextDue).toLocaleDateString("uz-UZ")}
                              {daysUntil !== null && daysUntil >= 0 && ` (${daysUntil} kun qoldi)`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`font-bold text-lg ${recurring.type === "income" ? "text-green-500" : "text-red-500"}`}>
                        {formatCurrency(recurring.amount)}
                      </div>
                      <Badge variant={recurring.isActive ? "default" : "secondary"}>
                        {recurring.isActive ? "Faol" : "Nofaol"}
                      </Badge>
                      {recurring.isActive && recurring.nextDue && (() => {
                        const today = new Date();
                        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
                        const alreadyExecutedThisMonth = recurring.lastExecuted && (() => {
                          const lastExecutedDate = new Date(recurring.lastExecuted);
                          const lastExecutedMonth = `${lastExecutedDate.getFullYear()}-${String(lastExecutedDate.getMonth() + 1).padStart(2, "0")}`;
                          return lastExecutedMonth === currentMonth;
                        })();

                        return (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!!alreadyExecutedThisMonth}
                            onClick={async () => {
                              try {
                                await executeRecurringTransaction(recurring.id);
                                toast({
                                  title: "Muvaffaqiyatli",
                                  description: "Tranzaksiya qo'shildi",
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Xato",
                                  description: error.message || "Xatolik yuz berdi",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            {alreadyExecutedThisMonth ? "Bu oy bajarildi" : "Bajarildi"}
                          </Button>
                        );
                      })()}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await updateRecurringTransaction(recurring.id, { isActive: !recurring.isActive });
                          } catch (error: any) {
                            toast({
                              title: "Xato",
                              description: error.message || "Xatolik yuz berdi",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="text-muted-foreground"
                      >
                        {recurring.isActive ? "To'xtatish" : "Aktivlashtirish"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteRecurringId(recurring.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Savings Tab */}
      {selectedTab === "savings" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Jamg'arma Maqsadlari</h3>
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Jamg'arma maqsadlari mavjud emas</p>
              <Button onClick={() => setIsAddSavingsOpen(true)}>Birinchisini qo'shing</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal.id);
                const remaining = goal.targetAmount - goal.currentAmount;
                return (
                  <Card key={goal.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold mb-2">{goal.title}</h4>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Joriy: </span>
                            <span className="font-bold text-lg">{formatCurrency(goal.currentAmount)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Maqsad: </span>
                            <span className="font-bold text-lg">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Qolgan: </span>
                            <span className="font-bold text-lg text-green-500">{formatCurrency(remaining)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedGoalId(goal.id);
                            setIsAddContributionOpen(true);
                          }}
                        >
                          Qo'shish
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteGoalId(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-bold">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Contributions List */}
                    {goal.contributions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="text-sm font-semibold mb-3">Yig'ilmalar</h5>
                        <div className="space-y-2">
                          {goal.contributions.slice(0, 5).map((contribution) => (
                            <div
                              key={contribution.id}
                              className="flex items-center justify-between p-2 bg-secondary/50 rounded"
                            >
                              <div>
                                <span className="font-medium">{formatCurrency(contribution.amount)}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {new Date(contribution.date).toLocaleDateString("uz-UZ")}
                                </span>
                                {contribution.note && (
                                  <span className="text-xs text-muted-foreground ml-2">• {contribution.note}</span>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteContributionId({ goalId: goal.id, contributionId: contribution.id })}
                                className="text-destructive hover:text-destructive h-6 w-6 p-0"
                              >
                                <Icons.x className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {goal.contributions.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center">
                              Va yana {goal.contributions.length - 5} ta yig'ilma
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <AddTransactionDialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen} />
      <AddDebtDialog open={isAddDebtOpen} onOpenChange={setIsAddDebtOpen} />
      <AddRecurringTransactionDialog open={isAddRecurringOpen} onOpenChange={setIsAddRecurringOpen} />
      <AddSavingsGoalDialog open={isAddSavingsOpen} onOpenChange={setIsAddSavingsOpen} />
      <AddContributionDialog
        open={isAddContributionOpen}
        onOpenChange={setIsAddContributionOpen}
        goalId={selectedGoalId || ""}
      />

      {/* Delete Transaction Confirmation */}
      <AlertDialog open={deleteTransactionId !== null} onOpenChange={(open) => !open && setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tranzaksiyani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu tranzaksiyani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteTransactionId) {
                  try {
                    await deleteTransaction(deleteTransactionId);
                    toast({
                      title: "Muvaffaqiyatli",
                      description: "Tranzaksiya o'chirildi",
                    });
                  } catch (error: any) {
                    toast({
                      title: "Xato",
                      description: error.message || "O'chirishda xatolik",
                      variant: "destructive",
                    });
                  }
                  setDeleteTransactionId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Debt Confirmation */}
      <AlertDialog open={deleteDebtId !== null} onOpenChange={(open) => !open && setDeleteDebtId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Qarzni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu qarzni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteDebtId) {
                  try {
                    await deleteDebt(deleteDebtId);
                    toast({
                      title: "Muvaffaqiyatli",
                      description: "Qarz o'chirildi",
                    });
                  } catch (error: any) {
                    toast({
                      title: "Xato",
                      description: error.message || "O'chirishda xatolik",
                      variant: "destructive",
                    });
                  }
                  setDeleteDebtId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Recurring Transaction Confirmation */}
      <AlertDialog open={deleteRecurringId !== null} onOpenChange={(open) => !open && setDeleteRecurringId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Takrorlanuvchi tranzaksiyani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu takrorlanuvchi tranzaksiyani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteRecurringId) {
                  try {
                    await deleteRecurringTransaction(deleteRecurringId);
                    toast({
                      title: "Muvaffaqiyatli",
                      description: "Takrorlanuvchi tranzaksiya o'chirildi",
                    });
                  } catch (error: any) {
                    toast({
                      title: "Xato",
                      description: error.message || "O'chirishda xatolik",
                      variant: "destructive",
                    });
                  }
                  setDeleteRecurringId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Goal Confirmation */}
      <AlertDialog open={deleteGoalId !== null} onOpenChange={(open) => !open && setDeleteGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jamg'arma maqsadini o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu maqsadni o'chirmoqchimisiz? Barcha yig'ilmalar ham o'chib ketadi. Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteGoalId) {
                  try {
                    await deleteGoal(deleteGoalId);
                    toast({
                      title: "Muvaffaqiyatli",
                      description: "Maqsad o'chirildi",
                    });
                  } catch (error: any) {
                    toast({
                      title: "Xato",
                      description: error.message || "O'chirishda xatolik",
                      variant: "destructive",
                    });
                  }
                  setDeleteGoalId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Contribution Confirmation */}
      <AlertDialog open={deleteContributionId !== null} onOpenChange={(open) => !open && setDeleteContributionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yig'ilmani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu yig'ilmani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteContributionId) {
                  try {
                    await removeContribution(deleteContributionId.goalId, deleteContributionId.contributionId);
                    toast({
                      title: "Muvaffaqiyatli",
                      description: "Yig'ilma o'chirildi",
                    });
                  } catch (error: any) {
                    toast({
                      title: "Xato",
                      description: error.message || "O'chirishda xatolik",
                      variant: "destructive",
                    });
                  }
                  setDeleteContributionId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

