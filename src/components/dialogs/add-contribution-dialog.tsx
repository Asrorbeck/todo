"use client";

import { useSavings } from "@/context/savings-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
}

export function AddContributionDialog({ open, onOpenChange, goalId }: AddContributionDialogProps) {
  const { addContribution } = useSavings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
    }
  }, [open]);

  const handleSubmit = async () => {
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
      await addContribution(goalId, amount, formData.date, formData.note || undefined);

      toast({
        title: "Muvaffaqiyatli",
        description: "Jamg'arma qo'shildi",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Xato",
        description: error.message || "Jamg'arma qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jamg'arma Qo'shish</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Summa</label>
            <Input
              type="number"
              placeholder="Qancha qo'shmoqchisiz?"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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

          <div>
            <label className="text-sm font-medium mb-2 block">Eslatma (ixtiyoriy)</label>
            <Textarea
              placeholder="Qo'shimcha ma'lumot"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
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

