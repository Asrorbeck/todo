"use client";

import { useFinance } from "@/context/finance-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/categories";

interface AddRecurringTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRecurringTransactionDialog({ open, onOpenChange }: AddRecurringTransactionDialogProps) {
  const { addRecurringTransaction } = useFinance();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    frequency: "monthly" as "monthly" | "weekly" | "yearly",
    dayOfMonth: "1",
    dayOfWeek: "0",
    reminderDays: "3",
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      const today = new Date();
      setFormData({
        type: "expense",
        amount: "",
        description: "",
        category: "",
        frequency: "monthly",
        dayOfMonth: String(today.getDate()),
        dayOfWeek: "0",
        reminderDays: "3",
        isActive: true,
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "Xato",
        description: "Tavsifni kiriting",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Xato",
        description: "To'g'ri summani kiriting",
        variant: "destructive",
      });
      return;
    }

    try {
      await addRecurringTransaction({
        type: formData.type,
        amount,
        description: formData.description,
        category: formData.category || undefined,
        frequency: formData.frequency,
        dayOfMonth: formData.frequency === "monthly" || formData.frequency === "yearly" ? parseInt(formData.dayOfMonth) : undefined,
        dayOfWeek: formData.frequency === "weekly" ? parseInt(formData.dayOfWeek) : undefined,
        reminderDays: parseInt(formData.reminderDays),
        isActive: formData.isActive,
      });

      toast({
        title: "Muvaffaqiyatli",
        description: "Takrorlanuvchi tranzaksiya qo'shildi",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Xato",
        description: error.message || "Takrorlanuvchi tranzaksiya qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const dayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yangi Takrorlanuvchi Tranzaksiya</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Turi</label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as "income" | "expense" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Kirim</SelectItem>
                <SelectItem value="expense">Chiqim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Summa</label>
            <Input
              type="number"
              placeholder="Summani kiriting"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tavsif</label>
            <Textarea
              placeholder="Masalan: Telefon to'lovi, Kredit yopish"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {formData.type === "expense" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Kategoriya</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriyani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.type === "income" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Kategoriya</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriyani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Takrorlanish</label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value as "monthly" | "weekly" | "yearly" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Har hafta</SelectItem>
                <SelectItem value="monthly">Har oy</SelectItem>
                <SelectItem value="yearly">Har yil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.frequency === "monthly" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Oyning qaysi kuni</label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
              />
            </div>
          )}

          {formData.frequency === "weekly" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Haftaning qaysi kuni</label>
              <Select
                value={formData.dayOfWeek}
                onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.frequency === "yearly" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Oyning qaysi kuni</label>
              <Input
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth}
                onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Eslatma (necha kun oldin)</label>
            <Input
              type="number"
              min="0"
              max="30"
              value={formData.reminderDays}
              onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tranzaksiya sanasidan {formData.reminderDays} kun oldin eslatish
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit}>Qo'shish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

