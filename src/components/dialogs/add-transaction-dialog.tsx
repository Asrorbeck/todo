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

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({ open, onOpenChange }: AddTransactionDialogProps) {
  const { addTransaction } = useFinance();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        type: "income",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
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
      await addTransaction({
        type: formData.type,
        amount,
        description: formData.description,
        date: formData.date,
        category: formData.category || undefined,
      });

      toast({
        title: "Muvaffaqiyatli",
        description: "Tranzaksiya qo'shildi",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Xato",
        description: error.message || "Tranzaksiya qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi Tranzaksiya</DialogTitle>
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
              placeholder="Tranzaksiya haqida ma'lumot"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sana</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

