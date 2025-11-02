"use client";

import { useSavings } from "@/context/savings-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddSavingsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSavingsGoalDialog({ open, onOpenChange }: AddSavingsGoalDialogProps) {
  const { addGoal } = useSavings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    description: "",
    targetDate: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        targetAmount: "",
        description: "",
        targetDate: "",
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Xato",
        description: "Maqsad nomini kiriting",
        variant: "destructive",
      });
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Xato",
        description: "To'g'ri maqsad summasini kiriting",
        variant: "destructive",
      });
      return;
    }

    try {
      await addGoal({
        title: formData.title,
        targetAmount,
        description: formData.description || undefined,
        targetDate: formData.targetDate || undefined,
      });

      toast({
        title: "Muvaffaqiyatli",
        description: "Jamg'arma maqsadi qo'shildi",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Xato",
        description: error.message || "Jamg'arma maqsadi qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi Jamg'arma Maqsadi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Maqsad nomi</label>
            <Input
              placeholder="Masalan: Avtomobil sotib olish"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Maqsad summa</label>
            <Input
              type="number"
              placeholder="Qancha yig'moqchisiz?"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tavsif (ixtiyoriy)</label>
            <Textarea
              placeholder="Maqsad haqida qo'shimcha ma'lumot"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Maqsad sanasi (ixtiyoriy)</label>
            <Input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
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

