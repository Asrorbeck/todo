"use client";

import { useFinance } from "@/context/finance-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddDebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDebtDialog({ open, onOpenChange }: AddDebtDialogProps) {
  const { addDebt } = useFinance();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "owed" as "owed" | "lent",
    amount: "",
    person: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (open) {
      setFormData({
        type: "owed",
        amount: "",
        person: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.person.trim()) {
      toast({
        title: "Xato",
        description: "Kimga yoki kimdan ekanligini kiriting",
        variant: "destructive",
      });
      return;
    }

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
      await addDebt({
        type: formData.type,
        amount,
        person: formData.person,
        description: formData.description,
        date: formData.date,
      });

      toast({
        title: "Muvaffaqiyatli",
        description: "Qarz qo'shildi",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Xato",
        description: error.message || "Qarz qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi Qarz</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Qarz turi</label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as "owed" | "lent" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owed">Men bergan (qarz berdim)</SelectItem>
                <SelectItem value="lent">Men olgan (qarz oldim)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {formData.type === "owed" ? "Kimga bergan?" : "Kimdan olgan?"}
            </label>
            <Input
              placeholder="Ism kiriting"
              value={formData.person}
              onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            />
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
              placeholder="Qarz haqida ma'lumot"
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

